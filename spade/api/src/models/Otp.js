import { mongoose } from "../db/connectors";

const otpSchema = new mongoose.Schema(
  {
    otp: { type: String, required: true },
    is_active: { type: Boolean, default: false },
    phone_number: { type: String, required: true },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
      index: { expires: "5m" }, // Auto-delete after 5 minutes
    },
  },
  { timestamps: true }
);

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
