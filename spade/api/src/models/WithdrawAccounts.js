import { mongoose } from "../db/connectors";

const withdrawAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ifsc: { type: String, required: true },
    bank_name: { type: String, required: true },
    name: { type: String, required: true },
    account: { type: String, required: true },
    is_verified: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    last_used: { type: Date, default: Date.now },
    verification_documents: [
      {
        type: { type: String }, // 'aadhar', 'pan', etc.
        url: String,
        verified: Boolean,
      },
    ],
  },
  { timestamps: true }
);

const WithdrawAccount = mongoose.model(
  "WithdrawAccount",
  withdrawAccountSchema
);

export default WithdrawAccount;
