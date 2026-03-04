import Groq from "groq-sdk";
import { Worker, Job } from "bullmq";
import { jobSchema } from "../../db/models/job.model";
import { resultSchema } from "../../db/models/result.model";
import { InternalServerError, NotFoundError } from "../../utils/errorFastify";
import { batchSchema } from "../../db/models/batch.model";
import "dotenv/config";
import mongoose from "mongoose";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY as string });
mongoose
  .connect(process.env.DB_URL as string)
  .then(() => console.log("Worker DB connected"))
  .catch((err) => console.log("Worker DB error", err));

interface JobData {
  batchId: string;
  prompt: string;
  model: string;
}

const worker = new Worker<JobData>(
  "AI",
  async (job: Job<JobData>) => {
    const { batchId, prompt, model } = job.data;
    const jobUpdateState = await jobSchema.findOneAndUpdate(
      { bullJobId: job.id },
      {
        status: "PROCESSING",
        attemptes: job.attemptsMade,
      },
    );

    const startTime = Date.now();
    try {
      const response = await groq.chat.completions.create({
        model: model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });
      console.log(batchId);
      const responseMsg = response.choices[0].message.content;
      if (!responseMsg) {
        throw new InternalServerError(
          "an error has occured while generationg the reponse",
        );
      }
      await resultSchema.create({
        batchId,
        response: responseMsg,
        bullJobId: job.id,
        model,
        tokensUsed: response.usage?.total_tokens,
        latencyMs: Date.now() - startTime,
      });
      await jobSchema.findOneAndUpdate(
        { bullJobId: job.id },
        {
          status: "COMPLETED",
        },
      );
      await batchSchema.findByIdAndUpdate(
        { _id: batchId },
        {
          $inc: { completedCount: 1 },
        },
      );
      const batch = await batchSchema.findById(batchId);
      if (!batch) {
        throw new NotFoundError("Batch not found");
      }
      if (batch.completedCount + batch.failedCount === batch.totalCount) {
        await batchSchema.findByIdAndUpdate(
          { _id: batchId },
          {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        );
      }
    } catch (err: any) {
      console.log("❌ Groq error:", err.message);
      console.log("❌ Groq status:", err.status);
      throw err;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  },
);

worker.on("failed", async (job, err) => {
  await jobSchema.findOneAndUpdate(
    { bullJobId: job?.id },
    { status: "FAILED" },
  );
  await batchSchema.findByIdAndUpdate(
    { _id: job?.data.batchId },
    {
      $inc: { failedCount: 1 },
    },
  );
});
