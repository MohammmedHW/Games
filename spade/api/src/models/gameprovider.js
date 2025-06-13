import mongoose from "mongoose";

const gameProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    }, 
    key: {
      type: String,
      required: true,
    }, 
    ip: {
      type: String,
      default: null,
    }, 
    lastAccess: {
      type: Date,
      default: null,
    }, 
  },
  {
    timestamps: true,
  }
);
