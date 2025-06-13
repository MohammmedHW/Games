import mongoose from "mongoose";

const gameProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
    api_key: String,
    secret: String,
    base_url: String,
    ip_whitelist: [String],
    lastAccess: Date,
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
    supported_games: [
      {
        type: String,
        enum: ["sports", "casino", "live_casino", "poker", "lottery"],
      },
    ],
    config: mongoose.Schema.Types.Mixed,
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const GameProvider = mongoose.model("GameProvider", gameProviderSchema);
export default GameProvider;
