import express from "express";
import cookieParser from "cookie-parser";
import xmlparser from "express-xml-bodyparser";
// import session from "express-session";
import config from "./config/index.js";
import cors from "cors";
import db from "./db/models/index.js";
// Import the routes from the api folder
import apiRoutes from "./routes/api/index.js";
import { logger, transport } from "./utils/logger.js";
import expressLogger from "./middleware/expressLogger";
import { subscribeTransaction } from "./utils/transaction.js";
import { startJobs } from "./utils/cron/index.js";

// set default timezone
process.env.TZ = "Asia/Kolkata";

// subscribe to tx events
subscribeTransaction();
const app = express();
app.disable("x-powered-by"); // Disable the x-powered-by header to prevent tech-stack information disclosure
const port = config.port;
//const db = import("./db/models");

app.use(xmlparser({ attrkey: "key", normalizeTags: false }));
app.use(express.json({ limit: "64mb" })); // increased post size for uploading banner images
app.use(express.urlencoded({ limit: "64mb", extended: true })); // increased post size for uploading banner images
app.use(expressLogger);
app.use(cookieParser());
// app.use(cors());
app.use(cors({
  origin: ['http://localhost:3005'], // Your Next.js frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.set("trust proxy", "127.0.0.1"); // trust local as it is behind nginx proxy in production

app.use(function (req, res, next) {
  // res.header(
  //   "Access-Control-Allow-Origin",
  //   process.env.NODE_ENV !== "production"
  //     ? "http://localhost:3001/"
  //     : [process.env.PROD_URLS]
  // ); // update to match the domain requests will come from, i.e Frontend url
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With, X-Forwarded-For, x-access-token"
  );
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.get("/", (req, res) => {
  // res.send(`Server is running on port ${port}`);
  res.sendStatus(200);
});

app.get("/test-db", async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.send("Database connection successful!");
  } catch (error) {
    res.status(500).send(`Database connection failed: ${error.message}`);
  }
});

db.sequelize
  .sync({ alter: true })
  .then((data) => {
    transport.on("logged", async (info) => {
      try {
        await data.models.Log.create({
          type: info.level.replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            ""
          ),
          message: info.message.replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            ""
          ),
        });
      } catch (error) {
        console.log("error logging to db", error);
      }
    });
    logger.info("Synced and connected to database.");
  })
  .catch((err) => {
    console.error("Failed to sync db: " + err.message);
  });

// base route for API
app.use("/api", apiRoutes);

const server = app.listen(port);
server.on("listening", () =>
  console.log(`server Started at http://${config.host}:${port}`)
);

if (config.enableCronJob === "true") {
  // this enables cron jobs
  startJobs();
}
