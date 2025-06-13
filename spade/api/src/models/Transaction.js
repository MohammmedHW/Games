import { mongoose } from "../db/connectors";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    game_data: { type: Object },
    status: {
      type: String,
      enum: ["pending", "success", "rejected", "reverted"],
      default: "pending",
    },
    remark: { type: String },
    reference: {
      type: String,
      unique: true,
    },
    user_balance: { type: Number },
    category: {
      type: String,
      enum: [
        "deposit",
        "withdrawal",
        "bet",
        "win",
        "bonus",
        "adjustment",
        "refund",
      ],
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to get user balance
transactionSchema.pre("save", async function (next) {
  if (this.isNew) {
    const user = await mongoose.model("User").findById(this.user);
    this.user_balance = user?.credit || 0;
  }
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
