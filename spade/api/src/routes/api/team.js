// All Admin and admin panel requests will be handled here
// Admin/team route include things like: user management, site settings, site pages, site content, site bank account, site header notice, game api's etc.

import express from "express";
import { body, query, validationResult } from "express-validator";
import { compare, encrypt } from "../../utils/crypto.js";
import db from "../../db/models/index.js";
import { Op } from "sequelize";
import authorizer from "../../middleware/authorizer.js";
import { generateToken, findUserByToken } from "../../utils/jwt.js";
import { logger } from "../../utils/logger.js";
import { sendTelegramMessageAdmin } from "../../utils/telegram.js";
import { txEvent } from "../../utils/transaction.js";
import config from "../../config/index.js";
const USER = db.User;
const BET = db.Bet;
const BANKACCOUNT = db.BankAccount;
const DEPOSIT = db.Deposit;
const WITHDRAWALS = db.Withdrawals;
const WITHDRAW_ACCOUNT = db.WithdrawAccount;
const TRANSACTION = db.Transaction;

const router = express.Router();

router
  .get("/profile", authorizer, (req, res) => {
    try {
      if (
        !req.user ||
        !["admin", "subadmin", "agent"].includes(req.user.role)
      ) {
        return res.status(403).json({ message: "Forbidden: Invalid role" });
      }

      res.status(200).json(req.user);
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  })

  .post(
    "/login",
    body("password").isString().trim().escape().isLength({ min: 8, max: 32 }),
    body("username").isString().trim().escape().isLength({ min: 5, max: 80 }),
    async function (req, res) {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        const user = await USER.scope("withSecret").findOne({
          where: {
            username,
            role: { [Op.or]: ["admin", "subadmin", "agent"] },
          },
        });

        if (!user) {
          return res.status(400).send("Username or password incorrect");
        }

        const verification = await compare(password, user.password);
        if (!verification) {
          return res.status(400).send("Username or password incorrect");
        }

        await user.update({ is_active: true, last_login: new Date() });

        const token = await generateToken(user);

        // ✅ DO NOT set cookie anymore
        // res.cookie("token", token, { ... }); ← REMOVE THIS

        return res.status(200).json({
          token,
          user: {
            username: user.username,
            id: user.id,
            phone: user.phone,
            name: user.name,
            email: user.email,
            role: user.role,
            access: user.access,
          },
        });
      } catch (error) {
        logger.error(`team.login.post: ${error}`);
        return res.status(400).send("Request Failed");
      }
    }
  )

  // dashboard analytics
  .get(
    "/dashboard",
    query("from").isNumeric().isInt({ min: 1, max: 1000 }), // from is number of days to go back from today. 1 is get from last 24 hours, 2 is get from last 48 hours etc.
    authorizer,
    async function (req, res) {
      try {
        // if (req.user.role !== "admin" && req.user.role !== "subadmin")
        //   return res.sendStatus(400); // if req user not admin or subadmin, bail early

        if (!["admin", "subadmin", "agent"].includes(req.user.role))
          return res
            .status(403)
            .json({ message: "Forbidden: Invalid role for dashboard" });

        const { from } = req.query;

        const users = await USER.count();
        const bets = await BET.count();
        const deposits = await DEPOSIT.count();
        const withdrawals = await WITHDRAWALS.count();
        // new users, where created_at is within "from"
        const newUsers = await USER.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(new Date() - from * 24 * 60 * 60 * 1000),
            },
          },
        });

        // active users, where lastActive is within "from"
        const activeUsers = await USER.count({
          where: {
            lastActive: {
              [Op.gte]: new Date(new Date() - from * 24 * 60 * 60 * 1000),
            },
          },
        });

        // new bets, where created_at is within "from"
        const newBets = await BET.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(new Date() - from * 24 * 60 * 60 * 1000),
            },
          },
        });
        // new deposits, where created_at is within "from"
        const newDeposits = await DEPOSIT.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(new Date() - from * 24 * 60 * 60 * 1000),
            },
          },
        });
        // new withdrawals, where created_at is within "from"
        const newWithdrawals = await WITHDRAWALS.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(new Date() - from * 24 * 60 * 60 * 1000),
            },
          },
        });

        // get all bets where status is WON within "from"
        const wonBets = await BET.count({
          where: {
            status: "WON",
            createdAt: {
              [Op.gte]: new Date(new Date() - from * 24 * 60 * 60 * 1000),
            },
          },
        });
        // get all bets where status is LOST within "from"
        const lostBets = await BET.count({
          where: {
            status: "LOST",
            createdAt: {
              [Op.gte]: new Date(new Date() - from * 24 * 60 * 60 * 1000),
            },
          },
        });

        // get all bets where status is OPEN within "from"
        const openBets = await BET.count({
          where: {
            status: "OPEN",
            createdAt: {
              [Op.gte]: new Date(new Date() - from * 24 * 60 * 60 * 1000),
            },
          },
        });

        // get all bets where status is VOID within "from"
        const voidBets = await BET.count({
          where: {
            status: "VOID",
            createdAt: {
              [Op.gte]: new Date(new Date() - from * 24 * 60 * 60 * 1000),
            },
          },
        });

        // get all bets where category is "sports" within "from"
        const sportsBets = await BET.count({
          where: {
            category: "sports",
            createdAt: {
              [Op.gte]: new Date(new Date() - from * 24 * 60 * 60 * 1000),
            },
          },
        });

        // get all bets where category is "sports_fancy" within "from"
        const sportsFancyBets = await BET.count({
          where: {
            category: "sports_fancy",
            createdAt: {
              [Op.gte]: new Date(new Date() - from * 24 * 60 * 60 * 1000),
            },
          },
        });

        // get all bets where category is "wacs" or "fawk" within "from"
        const casinoBets = await BET.count({
          where: {
            [Op.or]: [{ category: "wacs" }, { category: "fawk" }],
            createdAt: {
              [Op.gte]: new Date(new Date() - from * 24 * 60 * 60 * 1000),
            },
          },
        });

        return res.status(200).send({
          users,
          bets,
          deposits,
          withdrawals,
          newUsers,
          activeUsers,
          newBets,
          newDeposits,
          newWithdrawals,
          wonBets,
          lostBets,
          openBets,
          voidBets,
          sportsBets,
          sportsFancyBets,
          casinoBets,
        });
      } catch (err) {
        logger.error(`team.dashboard.get: ${err}`);
        return res.sendStatus(500);
      }
    }
  )
  .get(
    // get all logs
    "/logs",
    authorizer,
    query("limit").isNumeric().optional({ checkFalsy: true }),
    query("skip").isNumeric().optional({ checkFalsy: true }),
    query("type").isString().trim().escape().optional({ checkFalsy: true }),
    query("search").isString().trim().escape().optional({ checkFalsy: true }),
    async function (req, res) {
      try {
        if (req.user.role !== "admin") return res.sendStatus(400); // if req user not admin or subadmin, bail early
        const { limit = 20, skip = 0, search = "", type = "" } = req.query;
        const logs = await db.Log.findAll({
          order: [["createdAt", "DESC"]],
          where: {
            type: { [Op.like]: `%${type}%` },
            message: { [Op.like]: `%${search}%` },
          },
          limit,
          offset: skip,
        });
        return res.status(200).send(logs);
      } catch (err) {
        logger.error(`team.logs.get: ${err}`);
        return res.sendStatus(500);
      }
    }
  )
  .get(
    "/users",
    authorizer,

    query("limit").optional().isInt({ min: 0 }),
    query("skip").optional().isInt({ min: 0 }),
    query("search").optional().isString().trim().escape(),
    query("user").optional().isInt({ min: 0 }),
    query("download")
      .optional()
      .custom((val) => {
        return val === "true" || val === "false" || typeof val === "boolean";
      }),

    async function (req, res) {
      try {
        res.setHeader("Cache-Control", "no-store");

        if (req.user.role !== "admin" && req.user.role !== "subadmin") {
          console.log("Unauthorized user");
          return res.sendStatus(400);
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.log("Validation errors:", errors.array());
          return res.status(400).json({ errors: errors.array() });
        }

        const limit = parseInt(req.query.limit) || 20;
        const skip = parseInt(req.query.skip) || 0;
        const search = req.query.search || "";
        const user_id = parseInt(req.query.user) || 0;
        const download =
          req.query.download === "true" || req.query.download === true;

        console.log("Parsed Params ->", {
          limit,
          skip,
          search,
          user_id,
          download,
        });

        let users;
        const include = !download
          ? [
              {
                model: TRANSACTION,
                as: "transactions",
                attributes: [
                  "id",
                  "amount",
                  "type",
                  "status",
                  "createdAt",
                  "remark",
                ],
                order: [["id", "DESC"]],
              },
            ]
          : [];

        if (req.user.role === "admin") {
          if (user_id > 0) {
            console.log(`Fetching specific user_id = ${user_id}`);
            users = await USER.findAll({
              where: { id: user_id, role: "user", is_deleted: false },
              include,
            });
            // console.log("Result for specific user fetch:", users.map(u => u.get({ plain: true })));
          } else {
            users = await USER.findAll({
              order: [["id", "DESC"]],
              where: {
                role: "user",
                is_deleted: false,
                [Op.or]: [
                  { name: { [Op.iLike]: `%${search}%` } },
                  { email: { [Op.iLike]: `%${search}%` } },
                  { phone: { [Op.iLike]: `%${search}%` } },
                  { id: { [Op.eq]: parseInt(search) || 0 } },
                ],
              },
              limit,
              offset: skip,
              include,
            });
          }
        } else if (req.user.role === "subadmin") {
          users = await USER.findAll({
            order: [["id", "DESC"]],
            where: {
              role: "user",
              is_deleted: false,
              // addedBy: req.user.id,
              [Op.or]: [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } },
                { id: { [Op.eq]: parseInt(search) || 0 } },
              ],
            },
            limit,
            offset: skip,
            include,
          });
        }

        if (download) {
          return res.status(200).send(users);
        }

        const result = await Promise.all(
          users.map(async (user) => {
            user = user.get({ plain: true });

            const winnings = await BET.sum("pnl", {
              where: {
                user_id: user.id,
                status: "WON",
                [Op.not]: [{ pnl: null }, { pnl: 0 }],
              },
            });

            const losses = await BET.sum("pnl", {
              where: {
                user_id: user.id,
                status: "LOST",
                [Op.not]: [{ pnl: null }, { pnl: 0 }],
              },
            });

            user.winnings = winnings || 0;
            user.losses = losses || 0;
            user.pnl = user.winnings - Math.abs(user.losses);

            const deposits = await DEPOSIT.sum("amount", {
              where: {
                user_id: user.id,
                status: "approved",
                amount: { [Op.gt]: 0 },
              },
            });

            user.deposits = deposits || 0;

            const withdrawals = await WITHDRAWALS.sum("amount", {
              where: {
                user_id: user.id,
                status: "approved",
                amount: { [Op.gt]: 0 },
              },
            });

            user.withdrawals = withdrawals || 0;

            return user;
          })
        );

        return res.status(200).send(result);
      } catch (error) {
        console.error("team.users.get ERROR:", error);
        return res.status(400).send("Request Failed");
      }
    }
  )

  // Authenticated route: Add a new user.
  .post(
    "/users",
    authorizer,
    body("name").isString().trim().escape().optional({ checkFalsy: true }),
    body("email").isEmail().normalizeEmail().optional({ checkFalsy: true }),
    body("username")
      .isString()
      .trim()
      .escape()
      .isLength({ min: 5, max: 80 })
      .optional({ checkFalsy: true }), // username optional for normal users
    body("phoneNumber").isMobilePhone(), // Not optional as we are adding a normal user here
    body("newPassword").isLength({ min: 8, max: 32 }),
    body("credit").isNumeric().optional({ checkFalsy: true }),
    body("bonus").isNumeric().optional({ checkFalsy: true }),
    body("exposure").isNumeric().optional({ checkFalsy: true }),
    body("exposureLimit").isNumeric().optional({ checkFalsy: true }),
    body("is_active").toBoolean().optional({ checkFalsy: true }),
    body("is_verified").toBoolean().optional({ checkFalsy: true }),
    body("is_deleted").toBoolean().optional({ checkFalsy: true }),
    body("is_banned").toBoolean().optional({ checkFalsy: true }),
    async function (req, res) {
      try {
        if (
          req.user.role !== "admin" &&
          req.user.role !== "subadmin" &&
          req.user.role !== "agent"
        )
          return res.sendStatus(400); // if req user not admin or subadmin, bail early
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const {
          username,
          name,
          email,
          phoneNumber,
          newPassword,
          // is_active,
          is_verified,
          is_banned = false,
          is_deleted = false,
          credit = 0,
          bonus = 0,
          exposure = 0,
          exposureLimit = 0,
        } = req.body;

        // check if any user with that phone exists
        let findUserWithPhone = await USER.findOne({
          where: { phone: phoneNumber },
        });
        if (findUserWithPhone) {
          return res.status(400).send("User with that phone already exists");
        }

        const user = await USER.create({
          username,
          name,
          email,
          phone: phoneNumber,
          password: await encrypt(newPassword),
          credit: credit,
          role: "user",
          // is_active: is_active,
          is_verified: is_verified,
          is_banned,
          is_deleted,
          addedBy: req.user.id,
          bonus: bonus,
          exposure: exposure,
          exposureLimit: exposureLimit,
        });

        if (credit > 0) {
          // create deposit with user_id=user.id, amount=credit, utr=ADDEDBYADMIN, status=approved, remark=credited by admin
          const deposit = await DEPOSIT.create({
            user_id: user.id,
            amount: Math.abs(credit),
            status: "approved",
            remark: `Credited by admin`,
          });
          const tx = {
            user_id: user.id,
            type: "credit",
            amount: Math.abs(credit),
            status: "success",
            remark: `User added and credited ₹ ${credit} by admin: ${req.user.username}`,
          };
          process.nextTick(() => {
            txEvent.emit("new_transacion", tx);
          });
        }

        sendTelegramMessageAdmin(
          `User ${user.phone} added${
            credit > 0 ? " and credited ₹ " + credit : ""
          } by admin: ${req.user.username}`
        );

        return res.status(200).send(true);
      } catch (error) {
        logger.error(`team.users.post: ${error}`);
        res.status(400).send("Request Failed");
      }
    }
  )
  // Update a user. Only admin can update all users, subadmin can update only users created by him

  // Update a user. Only admin can update all users, subadmin can update only users created by him
  .put(
    "/users/:id",
    authorizer,
    body("name").isString().trim().escape().optional({ checkFalsy: true }),
    body("email").isEmail().normalizeEmail().optional({ checkFalsy: true }),
    // body("username")
    //   .isString()
    //   .trim()
    //   .escape()
    //   .isLength({ min: 5, max: 80 }), // username optional for normal users
    body("phoneNumber").isMobilePhone(),
    body("newPassword")
      .isLength({ min: 8, max: 32 })
      .optional({ checkFalsy: true }),
    body("credit").isNumeric().optional({ checkFalsy: true }),
    body("bonus").isNumeric().optional({ checkFalsy: true }),
    body("exposure").isNumeric().optional({ checkFalsy: true }),
    body("exposureLimit").isNumeric().optional({ checkFalsy: true }),
    body("is_verified").toBoolean(),
    body("is_deleted").toBoolean().optional({ checkFalsy: true }),
    body("is_banned").toBoolean(),
    // body("role").isString().trim().escape(), // dont take role for user from request
    async function (req, res) {
      try {
        if (req.user.role !== "admin" && req.user.role !== "subadmin")
          return res.sendStatus(400); // if req user not admin or subadmin, bail early
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const {
          name,
          email,
          phoneNumber,
          newPassword,
          is_deleted = false,
          is_banned,
          is_verified,
          credit,
          bonus,
          exposure,
          exposureLimit,
        } = req.body;
        const id = parseInt(req.params.id);
        let user;
        if (req.user.role === "admin") {
          user = await USER.findOne({
            where: {
              id,
              // and role is empty or null
              [Op.or]: [{ role: null }, { role: "user" }],
            },
          });
        } else if (req.user.role === "subadmin") {
          user = await USER.findOne({
            where: {
              id,
              addedBy: req.user.id,
              // and role is empty or null
              [Op.or]: [{ role: null }, { role: "user" }],
            },
          });
        }

        // if no user found, bail
        if (!user) {
          console.log("hi45");
          res.status(400);
          return res.send("user not found");
        }

        // check if any user with that phone exists except the user being updated
        let findUserWithPhone = await USER.findOne({
          where: { phone: phoneNumber, id: { [Op.ne]: id } },
        });
        if (findUserWithPhone) {
          return res
            .status(400)
            .send("Phone number associated with another user");
        }

        user.name = name;
        user.email = email;
        user.phone = phoneNumber;
        if (newPassword) {
          user.password = await encrypt(newPassword);
        }
        // user.role = "";
        user.is_banned = is_banned;
        user.is_deleted = is_deleted;
        user.is_verified = is_verified;
        user.bonus = bonus;
        user.exposure = exposure;
        user.exposureLimit = exposureLimit;
        // user.role = role; // dont update role here

        if (user.credit !== credit) {
          // if difference is positive create deposit, if negative create withdrawal
          if (credit > (user.credit || 0)) {
            const deposit = await DEPOSIT.create({
              user_id: user.id,
              amount: Math.abs(credit - (user.credit || 0)),
              status: "approved",
              // remark: `Credited by admin: ${req.user.username}`,
              remark: `Credited by admin`,
            });
            user.wagering = 0; // update user.wagering to 0 on deposit
          } else if (credit < (user.credit || 0)) {
            const withdrawal = await WITHDRAWALS.create({
              user_id: user.id,
              amount: Math.abs((user.credit || 0) - credit),
              status: "approved",
              remark: `Debited by admin`,
            });
          }
          // if user credit changed by admin, add a transaction
          const tx = {
            user_id: user.id,
            type: credit > (user.credit || 0) ? "credit" : "debit",
            amount: Math.abs((user.credit || 0) - credit),
            status: "success",
            remark: `${
              credit > (user.credit || 0) ? "Added" : "Reduced"
            } ₹ ${Math.abs((user.credit || 0) - credit)} by ${
              req.user.username
            }`,
          };
          process.nextTick(() => {
            txEvent.emit("new_transacion", tx);
          });
          user.credit = credit;
          sendTelegramMessageAdmin(
            `User ${user.phone} credit changed to ₹ ${credit} by admin: ${req.user.username}`
          );
        }

        await user.save();
        return res.status(200).send(true);
      } catch (error) {
        logger.error(`team.users.put: ${error}`);
        res.status(400).send("Request Failed");
      }
    }
  )

  // Authenticated route: Delete a user (soft delete by setting is_deleted = true)
  .delete("/users/:id", authorizer, async function (req, res) {
    try {
      if (req.user.role !== "admin" && req.user.role !== "subadmin") {
        return res.sendStatus(400); // Only admin or subadmin allowed
      }

      const id = parseInt(req.params.id);
      let user;

      if (req.user.role === "admin") {
        user = await USER.scope("withAllAssociations").findOne({
          where: { id },
        });
      } else if (req.user.role === "subadmin") {
        user = await USER.scope("withAllAssociations").findOne({
          where: {
            id,
            addedBy: req.user.id,
            is_superuser: false,
          },
        });
      }

      if (!user) {
        return res.status(400).send("User not found");
      }

      // Prevent deleting self
      if (req.user.id === user.id) {
        return res.status(400).send("You cannot delete yourself");
      }

      // Prevent deleting superuser
      if (user.is_superuser) {
        return res.status(400).send("Cannot delete a superuser");
      }

      // Soft delete: set is_deleted = true
      user.is_deleted = true;
      await user.save();

      return res.status(200).send(true);
    } catch (error) {
      logger.error(`team.users.delete: ${error}`);
      return res.status(400).send("Request Failed");
    }
  })

  .get(
    "/",
    authorizer,
    query("limit").isNumeric(),
    query("skip").isNumeric(),
    query("search").isString().trim().escape(),
    async function (req, res) {
      try {
        if (req.user.role !== "admin" && req.user.role !== "subadmin")
          return res.sendStatus(400);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { limit, skip, search } = req.query;
        let users;

        const roleFilter = {
          role: {
            [Op.or]: ["admin", "subadmin", "agent", "user"], // include all roles
          },
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { phone: { [Op.iLike]: `%${search}%` } },
          ],
        };

        if (req.user.role === "admin") {
          users = await USER.findAll({
            order: [["id", "DESC"]],
            where: roleFilter,
            limit,
            offset: skip,
          });
        } else {
          users = await USER.findAll({
            order: [["id", "DESC"]],
            where: {
              ...roleFilter,
              addedBy: req.user.id,
            },
            limit,
            offset: skip,
          });
        }

        return res.status(200).send({ users });
      } catch (error) {
        logger.error(`team.get: ${error}`);
        res.status(400).send("Request Failed");
      }
    }
  )

  // Authenticated route: Create a new admin/team member. Only admin can add a new team member and only admin can access this route

  .post(
    "/",
    authorizer,
    body("name").isString().trim().escape().optional({ checkFalsy: true }),
    body("email").isEmail().normalizeEmail().optional({ checkFalsy: true }),
    body("phoneNumber").isMobilePhone().optional({ checkFalsy: true }),
    body("username").isString().trim().escape().isLength({ min: 5, max: 80 }),
    body("newPassword").isLength({ min: 8, max: 32 }).notEmpty(),
    body("role").isString().trim().escape(),
    body("is_verified").toBoolean(),
    body("is_banned").toBoolean(),
    body("role").custom((value) => {
      const allowedRoles = ["admin", "subadmin", "agent", "user"];
      if (!allowedRoles.includes(value)) {
        throw new Error("Invalid role");
      }
      return true;
    }),
    async function (req, res) {
      try {
        if (req.user.role !== "admin" && req.user.role !== "subadmin")
          return res.sendStatus(400);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        let {
          username,
          name,
          email,
          phoneNumber,
          newPassword,
          role,
          is_verified,
          is_banned,
          access,
        } = req.body;

        if (req.user.role === "subadmin") {
          const allowedRolesForSubadmin = ["agent", "user"];
          if (!allowedRolesForSubadmin.includes(role)) {
            return res.status(403).send("Subadmin cannot assign this role");
          }
        }

        const userExists = await USER.findOne({ where: { username } });
        if (userExists) {
          return res.status(400).send("Username already exists");
        }

        const user = await USER.create({
          username,
          name,
          email,
          phone: phoneNumber,
          password: await encrypt(newPassword),
          role,
          is_verified,
          is_banned,
          access,
          addedBy: req.user.id,
        });

        sendTelegramMessageAdmin(
          `A new team member with username: ${username} created.`
        );

        return res.status(200).send({ user });
      } catch (error) {
        logger.error(`team.post: ${error}`);
        res.status(400).send("Request Failed");
      }
    }
  )

  // Authenticated route: Update a team member. Only admin can update a team member and only admin can access this route. Superuser can't be updated by admin

  .put(
    "/:id",
    authorizer,
    body("name").isString().trim().escape().optional({ checkFalsy: true }),
    body("username").isString().trim().escape().isLength({ min: 5, max: 80 }),
    body("email").isEmail().normalizeEmail().optional({ checkFalsy: true }),
    body("phoneNumber").isMobilePhone().optional({ checkFalsy: true }),
    body("newPassword")
      .isLength({ min: 8, max: 32 })
      .optional({ checkFalsy: true }),
    body("is_verified").toBoolean(),
    body("is_banned").toBoolean(),
    body("role").isString().trim().escape(),
    async function (req, res) {
      try {
        if (req.user.role !== "admin" && req.user.role !== "subadmin")
          return res.sendStatus(400);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        let {
          username,
          name,
          email,
          phoneNumber,
          newPassword,
          is_verified,
          is_banned,
          access,
          role,
        } = req.body;

        const id = parseInt(req.params.id);
        let user;

        if (req.user.role === "subadmin") {
          user = await USER.findOne({
            where: { id, addedBy: req.user.id, is_superuser: false },
          });
          const allowedRoles = ["agent", "user"];
          if (!allowedRoles.includes(role)) {
            return res.status(403).send("Subadmin cannot assign this role");
          }
        } else if (req.user.role === "admin") {
          user = await USER.findOne({ where: { id } });
        }

        if (!user) return res.status(400).send("User not found");

        const userExists = await USER.findOne({
          where: { username, id: { [Op.ne]: id } },
        });
        if (userExists)
          return res
            .status(400)
            .send("Username already belongs to another user");

        user.username = username;
        user.name = name;
        user.email = email;
        user.phone = phoneNumber;
        user.access = access;
        user.is_banned = is_banned;
        user.is_verified = is_verified;

        // prevent non-admin from setting role to admin
        if (req.user.role !== "admin" && role === "admin") {
          user.role = "subadmin"; // downgrade
        } else {
          user.role = role;
        }

        if (newPassword) {
          user.password = await encrypt(newPassword);
        }

        await user.save();
        return res.status(200).send({ user });
      } catch (error) {
        logger.error(`team.put: ${error}`);
        res.status(400).send("Request Failed");
      }
    }
  )

  // Authenticated route: Delete a team member.
  .delete("/:id", authorizer, async function (req, res) {
    try {
      if (req.user.role !== "admin" && req.user.role !== "subadmin")
        return res.sendStatus(400); // if req user not admin or subadmin, bail early
      // find user by id, and if is_superuser or role == admin is true, then don't delete
      const id = parseInt(req.params.id);
      let user;
      console.log("Logged in Usdser:", req.user);
      console.log("Requestedsd User ID:", id);

      // only admin can delete all team members, suadmin can only delete team members added by him
      if (req.user.role === "subadmin") {
        user = await USER.findOne({
          where: { id, addedBy: req.user.id, is_superuser: false },
        });
      } else if (req.user.role === "admin") {
        user = await USER.findOne({
          where: { id },
        });
      }
      if (!user) {
        return res.status(400).send("User not found");
      }
      if (req.user.id === user.id) {
        // if req user is trying to delete himself, bail early
        return res
          .status(400)
          .send(
            "You can't delete yourself, ask another admin or superuser to delete your account"
          );
      }
      if (user.is_superuser) {
        // admins can be deleted by admin, but superusers can't be deleted by anyone
        return res
          .status(400)
          .send(
            "Superusers can't be deleted by anyone, but big balls on you to try this"
          );
      }
      // else delete
      await user.destroy();
      // }
      return res.status(200).send(true);
    } catch (error) {
      logger.error(`team.delete: ${error}`);
      res.status(400).send("Request Failed");
    }
  });

export default router;
