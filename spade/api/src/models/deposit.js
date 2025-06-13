import mongoose from "mongoose";

const depositSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    utr: {
      type: String,
      unique: true,
      sparse: true,
    },
    bank_account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount",
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
    },
    bonus: {
      type: Number,
      default: 0,
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
    remark: String,
    method: {
      type: String,
      enum: ["bank_transfer", "upi", "paytm", "phonepe", "crypto", "manual"],
      required: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  },
  { timestamps: true }
);

// Post-save hook to create transaction when deposit is approved
depositSchema.post("findOneAndUpdate", async function (doc) {
  if (doc.status === "approved" && !doc.transaction) {
    const transaction = await mongoose.model("Transaction").create({
      user: doc.user,
      type: "credit",
      amount: doc.amount + (doc.bonus || 0),
      category: "deposit",
      reference: `deposit_${doc._id}`,
      status: "success",
    });

    doc.transaction = transaction._id;
    await doc.save();

    // Update user balance
    await mongoose.model("User").findByIdAndUpdate(doc.user, {
      $inc: {
        credit: doc.amount,
        bonus: doc.bonus || 0,
      },
    });
  }
});

const Deposit = mongoose.model("Deposit", depositSchema);
export default Deposit;
