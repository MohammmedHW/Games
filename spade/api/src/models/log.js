import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "error",
        "warning",
        "info",
        "debug",
        "security",
        "transaction",
        "bet",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ip: String,
    metadata: mongoose.Schema.Types.Mixed,
    stack_trace: String,
    resolved: {
      type: Boolean,
      default: false,
    },
    resolved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolved_at: Date,
  },
  { timestamps: true }
);

// Indexes for faster querying
logSchema.index({ type: 1, createdAt: -1 });
logSchema.index({ resolved: 1 });

const Log = mongoose.model("Log", logSchema);
export default Log;
