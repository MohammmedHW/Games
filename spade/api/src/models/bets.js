import mongoose from "mongoose";
const { Schema } = mongoose;
import User from "./User.js"; // ✅ Make sure User model is imported correctly

const betSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User" },
  category: {
    type: String,
    enum: ["sports", "sports_fancy", "wacs", "fawk"],
  },
  status: {
    type: String,
    enum: ["OPEN", "VOID", "WON", "LOST"],
    default: "OPEN",
  },
  pnl: Number,
  bet_type: { type: String, enum: ["back", "lay"] },
  user_balance: { type: Number, default: 0 },
  user_balance_after: { type: Number, default: 0 },
  bonus_used: { type: Number, default: 0 },
  stake: Number,
  liability: Number,
  event_id: String,
  sport_id: String,
  bookmaker: String,
  region: String,
  market: Schema.Types.Mixed,
  commence_time: Date,
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
  exposureTime: { type: Date, default: null },
}, { timestamps: true });

/** ✅ Add the middleware code here */
betSchema.pre("save", async function (next) {
  if (this.isNew && this.status === "OPEN") {
    const user = await User.findById(this.user_id);
    const isSportsBet = ["sports", "sports_fancy"].includes(this.category);

    this.user_balance = parseInt(user.credit);

    if (isSportsBet) {
      if (this.stake >= 0) {
        this.user_balance_after = parseInt(user.credit) - Math.abs(parseInt(this.liability));
      }
    } else {
      if (this.stake >= 0) {
        this.user_balance_after = parseInt(user.credit) - Math.abs(parseInt(this.stake));
      }
    }

    user.wagering = parseInt(user.wagering) + parseInt(this.stake || 0);
    await user.save();
  }
  next();
});

betSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const bet = await this.model.findOne(this.getQuery());

  const user = await User.findById(bet.user_id);
  const isSportsBet = ["sports", "sports_fancy"].includes(bet.category);

  let user_balance = 0;

  if (isSportsBet) {
    user_balance = parseInt(user.credit) + parseInt(bet.liability);
    update.user_balance = user_balance;

    switch (update.status) {
      case "VOID":
        update.user_balance_after = user_balance;
        break;
      case "LOST":
        update.user_balance_after = user_balance - Math.abs(parseInt(bet.liability));
        break;
      case "WON":
        update.user_balance_after = user_balance + Math.abs(parseInt(update.pnl));
        break;
    }
  } else {
    user_balance = parseInt(user.credit) + parseInt(bet.stake);
    update.user_balance = user_balance;

    switch (update.status) {
      case "VOID":
        update.user_balance_after = user_balance;
        break;
      case "LOST":
        update.user_balance_after = user_balance - Math.abs(parseInt(update.pnl));
        break;
      case "WON":
        update.user_balance_after = user_balance + Math.abs(parseInt(update.pnl));
        break;
    }
  }

  this.setUpdate(update);
  next();
});

/** ✅ Export the model */
const Bet = mongoose.model("Bet", betSchema);
export default Bet;
