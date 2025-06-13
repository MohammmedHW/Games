import mongoose from "mongoose";
import User from "./User.js";

const betSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["sports", "sports_fancy", "wacs", "fawk"],
      required: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "VOID", "WON", "LOST", "SETTLED", "CANCELLED"],
      default: "OPEN",
    },
    pnl: { type: Number, default: 0 },
    bet_type: {
      type: String,
      enum: ["back", "lay"],
      required: true,
    },
    user_balance: { type: Number, default: 0 },
    user_balance_after: { type: Number, default: 0 },
    bonus_used: { type: Number, default: 0 },
    stake: { type: Number, required: true },
    liability: { type: Number, required: true },
    event_id: { type: String, required: true },
    sport_id: { type: String, required: true },
    bookmaker: String,
    region: String,
    market: mongoose.Schema.Types.Mixed,
    commence_time: { type: Date, required: true },
    selectedTeam: String,
    selectedOdd: String,
    settlement_id: Number,
    is_deleted: { type: Boolean, default: false },
    homeTeam: String,
    awayTeam: String,
    matchName: String,
    gameId: String,
    marketId: String,
    marketType: String,
    remoteUpdate: { type: Boolean, default: false },
    runnerName: String,
    requestedOdds: String,
    gameType: String,
    gameSubType: String,
    roundId: String,
    orderId: String,
    betExposure: Number,
    exposureTime: Date,
  },
  { timestamps: true }
);

// Pre-save hook for new bets
betSchema.pre("save", async function (next) {
  if (this.isNew && this.status === "OPEN") {
    const user = await User.findById(this.user);
    const isSportsBet = ["sports", "sports_fancy"].includes(this.category);

    this.user_balance = user.credit;

    if (isSportsBet) {
      this.user_balance_after = user.credit - Math.abs(this.liability);
    } else {
      this.user_balance_after = user.credit - Math.abs(this.stake);
    }

    user.wagering += this.stake || 0;
    await user.save();
  }
  next();
});

// Pre-update hook for bet settlement
betSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const bet = await this.model.findOne(this.getQuery());

  if (update.status && ["VOID", "WON", "LOST"].includes(update.status)) {
    const user = await User.findById(bet.user);
    const isSportsBet = ["sports", "sports_fancy"].includes(bet.category);

    let balanceAdjustment = 0;

    if (isSportsBet) {
      if (update.status === "VOID") {
        balanceAdjustment = bet.liability;
      } else if (update.status === "WON") {
        balanceAdjustment = bet.liability + (update.pnl || 0);
      }
    } else {
      if (update.status === "VOID") {
        balanceAdjustment = bet.stake;
      } else if (update.status === "WON") {
        balanceAdjustment = bet.stake + (update.pnl || 0);
      }
    }

    user.credit += balanceAdjustment;
    await user.save();

    // Create transaction record
    await mongoose.model("Transaction").create({
      user: bet.user,
      type: "credit",
      amount: balanceAdjustment,
      category: "bet_settlement",
      reference: `bet_${bet._id}`,
      status: "success",
    });
  }
  next();
});

const Bet = mongoose.model("Bet", betSchema);
export default Bet;
