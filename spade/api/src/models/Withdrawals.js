import { mongoose } from "../db/connectors";

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WithdrawAccount",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "rejected", "approved", "processed"],
      default: "pending",
    },
    processed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reference: { type: String },
    remark: { type: String },
    fee: { type: Number, default: 0 },
    net_amount: { type: Number },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate net amount
withdrawalSchema.pre("save", function (next) {
  if (this.isModified("amount") || this.isModified("fee")) {
    this.net_amount = this.amount - (this.fee || 0);
  }
  next();
});

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

export default Withdrawal;
