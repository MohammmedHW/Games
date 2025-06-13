import { mongoose } from "../db/connectors";

const offerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "cashback", "referral", "other"],
      required: true,
    },
    value: { type: Number, required: true },
    is_percentage: { type: Boolean, default: false },
    min_deposit: { type: Number, default: 0 },
    max_credit: { type: Number, default: 10000 },
    games_cutoff: { type: Number, default: 0 },
    code: { type: String, unique: true },
    valid_till: { type: Date },
    is_bonus: { type: Boolean, default: false },
    is_reusable: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    applicableUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
