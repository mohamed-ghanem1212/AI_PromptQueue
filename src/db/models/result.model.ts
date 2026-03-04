import mongoose, { Schema, mongo } from "mongoose";

const ResultSchema = new Schema({
  jobId: { type: mongoose.Types.ObjectId, ref: "Job" },
  batchId: { type: mongoose.Types.ObjectId, ref: "Batch" },
  bullJobId: { type: String, required: true },
  response: { type: String, required: true },
  model: { type: String, required: true },
  tokensUsed: { type: Number, required: true },
  latencyMs: { type: Number, required: true },
  error: { type: String },
});

export const resultSchema = mongoose.model("Result", ResultSchema);
