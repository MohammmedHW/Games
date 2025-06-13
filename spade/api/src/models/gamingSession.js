import mongoose from "mongoose";

const gamingSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameProvider",
      required: true,
    },
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
    },
    session_id: {
      type: String,
      required: true,
      unique: true,
    },
    launch_url: {
      type: String,
      required: true,
    },
    ip_address: String,
    device_info: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ["active", "ended", "timeout"],
      default: "active",
    },
    ended_at: Date,
    duration: Number, // in seconds
  },
  { timestamps: true }
);

// Indexes
gamingSessionSchema.index({ user: 1, status: 1 });
gamingSessionSchema.index({ session_id: 1 }, { unique: true });

const GamingSession = mongoose.model("GamingSession", gamingSessionSchema);
export default GamingSession;
