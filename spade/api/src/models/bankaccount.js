import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String, 
      required: true,
    },
    method: {
      type: String, 
      required: true,
    },
    ifsc: {
      type: String,
    },
    name: {
      type: String, 
    },
    account: {
      type: String, 
    },
    account_name: {
      type: String, 
    },
    min_amount: {
      type: Number, 
    },
    max_amount: {
      type: Number, // maximum amount that this account accepts
    },
    image: {
      type: String, // base64 image (e.g., for UPI QR code)
      default: null,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    for_admin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);

bankAccountSchema.virtual("withdrawAccounts", {
  ref: "WithdrawAccount",
  localField: "_id",
  foreignField: "bank_account_id",
});

bankAccountSchema.virtual("deposits", {
  ref: "Deposit",
  localField: "_id",
  foreignField: "bank_account_id",
});

bankAccountSchema.set("toObject", { virtuals: true });
bankAccountSchema.set("toJSON", { virtuals: true });

const BankAccount = mongoose.model("BankAccount", bankAccountSchema);

export default BankAccount;
