import mongoose from "mongoose";

const depositSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    utr: {
      type: String,
      default: null,
    },
    bank_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount",
      default: null,
    },
    offer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      default: null,
    },
    bonus: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "rejected", "approved"],
      default: "pending",
    },
    remark: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // for createdAt and updatedAt
  }
);
