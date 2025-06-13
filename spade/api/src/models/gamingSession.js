import mongoose from "mongoose";

const gamingSessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameProvider",
      required: true,
    },
    session_id: {
      type: String,
      required: true,
    },
    launch_url: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // includes createdAt and updatedAt
  }
);
