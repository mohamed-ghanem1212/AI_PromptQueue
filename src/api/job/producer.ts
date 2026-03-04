import { Queue } from "bullmq";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../../utils/errorFastify";
import { batchSchema } from "../../db/models/batch.model";
import { jobSchema } from "../../db/models/job.model";
import { resultSchema } from "../../db/models/result.model";

const myQueue = new Queue("AI", {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});
export const createBatch = asyncHandler(async (req: Request, res: Response) => {
  const { model, prompts } = req.body;

  if (!prompts || !model) {
    throw new BadRequestError("Please provide the essential data");
  }
  if (
    !Array.isArray(prompts) ||
    !prompts.every((p: any) => typeof p === "string")
  ) {
    throw new BadRequestError("prompts must be a list of strings");
  }
  if (prompts.length === 0) {
    throw new BadRequestError("prompt cannot be empty");
  }
  const batch = await batchSchema.create({
    totalCount: prompts.length,
    completedCount: 0,
    failedCount: 0,
    status: "PENDING",
  });
  for (const prompt of prompts) {
    const jobBull = await myQueue.add("send_prompts", {
      batchId: batch._id,
      prompt,
      model,
    });

    await jobSchema.create({
      batchId: batch._id,
      bullJobId: jobBull.id,
      prompt,
      model,
      status: "QUEUED",
      attemptes: 0,
    });
  }
  res.status(201).json({
    message: "Worked out",
    success: true,
    batch,
  });
});

export const getBatchById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError("please provide the essential data");
    }
    const findBatch = await resultSchema.findById({ _id: id });
    if (!findBatch) {
      throw new NotFoundError("batch not found");
    }
    return res
      .status(200)
      .json({ message: "batch found", success: true, findBatch });
  },
);
