import mongoose, { Schema, mongo } from "mongoose";

const JobSchema = new Schema({
  batchId: { type: mongoose.Types.ObjectId, ref: "Batch" },
  bullJobId: { type: String, required: true },
  prompt: { type: String, required: true },
  model: { type: String, required: true },
  status: {
    type: String,
    enum: ["QUEUED", "PROCESSING", "COMPLETED", "PARTIALLY_FAILED"],
    default: "QUEUED",
  },
  attemptes: {
    type: Number,
    default: 0,
  },
});

export const jobSchema = mongoose.model("Job", JobSchema);
