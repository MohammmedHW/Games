import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    type: {
      type: String,
    },
    message: {
      type: String, 
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
