import { mongoose } from "../db/connectors";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, default: "" },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    password: { type: String, required: true },
    is_superuser: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["superAdmin", "admin", "masterAgent", "agent", "user"],
      default: "user",
    },
    phone: { type: String },
    credit: { type: Number, default: 0 }, // main wallet balance
    bonus: { type: Number, default: 0 }, // bonus credit
    exposure: { type: Number, default: 0 }, // total exposure (negative values)
    exposureTime: { type: Date, default: null }, // last exposure time
    exposureLimit: { type: Number, default: -200000 }, // exposure limit
    wagering: { type: Number, default: 0 }, // total wagering amount
    ip: { type: String },
    user_agent: { type: String, default: "na" },
    is_active: { type: Boolean, default: false },
    is_verified: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false }, // soft delete
    is_banned: { type: Boolean, default: false },
    last_login: { type: Date },
    token: { type: String, default: null },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    timezone: { type: String, default: "india" },
    lastActive: { type: Date, default: null },
    access: {
      type: {
        dashboard: Boolean,
        users: Boolean,
        games: Boolean,
        team: Boolean,
        deposits: Boolean,
        withdrawals: Boolean,
        bankAccounts: Boolean,
        transactions: Boolean,
        offers: Boolean,
        settings: Boolean,
        reports: Boolean,
      },
      default: {
        dashboard: false,
        users: false,
        games: false,
        team: false,
        deposits: false,
        withdrawals: false,
        bankAccounts: false,
        transactions: false,
        offers: false,
        settings: false,
        reports: false,
      },
    },
    referralCode: { type: String, unique: true }, // For agent referral system
    managedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ], // For agent-user relationships
    commissionRate: { type: Number, default: 0 }, // For agents
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // Always remove password and token
        delete ret.password;
        delete ret.token;
        return ret;
      },
    },
  }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to generate referral code
userSchema.statics.generateReferralCode = function () {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Set referral code for agents before save
userSchema.pre("save", function (next) {
  if (this.role === "agent" && !this.referralCode) {
    this.referralCode = User.generateReferralCode();
  }
  next();
});

// Virtual for full user status
userSchema.virtual("status").get(function () {
  if (this.is_banned) return "banned";
  if (!this.is_active) return "inactive";
  if (!this.is_verified) return "unverified";
  return "active";
});

const User = mongoose.model("User", userSchema);

export default User;
