// Before Save (equivalent to Sequelize's beforeCreate)
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

// Before Update (findOneAndUpdate doesn't trigger `save`, so use this)
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
