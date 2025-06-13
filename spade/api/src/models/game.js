import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    api: {
      type: String,
      enum: ["wacs", "wco", "fawk", "custom"],
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["sports", "casino", "live_casino", "poker", "lottery", "virtual"],
      required: true,
    },
    tags: [String],
    image: String,
    enabled: {
      type: Boolean,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    is_popular: {
      type: Boolean,
      default: false,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    is_new: {
      type: Boolean,
      default: false,
    },
    min_bet: Number,
    max_bet: Number,
    volatility: {
      type: String,
      enum: ["low", "medium", "high"],
    },
    rtp: Number,
    supported_devices: {
      type: [String],
      enum: ["desktop", "mobile", "tablet"],
      default: ["desktop", "mobile"],
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
gameSchema.index({ category: 1, enabled: 1 });
gameSchema.index({ is_popular: 1, is_featured: 1, is_new: 1 });

const Game = mongoose.model("Game", gameSchema);
export default Game;
