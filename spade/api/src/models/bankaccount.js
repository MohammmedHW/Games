import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["savings", "current", "upi", "wallet", "other"],
      required: true,
    },
    method: {
      type: String,
      enum: ["bank_transfer", "upi", "paytm", "phonepe", "crypto"],
      required: true,
    },
    ifsc: String,
    name: String,
    account: String,
    account_name: String,
    min_amount: { type: Number, default: 0 },
    max_amount: Number,
    image: String,
    is_verified: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    for_admin: { type: Boolean, default: false },
    verification_documents: [
      {
        doc_type: String,
        url: String,
        verified: Boolean,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for withdrawals
bankAccountSchema.virtual("withdrawals", {
  ref: "Withdrawal",
  localField: "_id",
  foreignField: "account",
});

// Virtual for deposits
bankAccountSchema.virtual("deposits", {
  ref: "Deposit",
  localField: "_id",
  foreignField: "bank_account",
});

const BankAccount = mongoose.model("BankAccount", bankAccountSchema);
export default BankAccount;
