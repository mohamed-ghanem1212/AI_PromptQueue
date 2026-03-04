import { Schema } from "mongoose";
import mongoose from "mongoose";
const BatchSchema = new Schema({
  totalCount: {
    type: Number,
    required: true,
  },
  completedCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "PARTIALLY_FAILED"],
    default: "PENDING",
  },
  completedAt: { type: Date },
});

export const batchSchema = mongoose.model("Batch", BatchSchema);
