import mongoose from "mongoose";
import logger from "../utils/logger";

const mongoOptions = {
  maxPoolSize: 50,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    logger.info("MongoDB connected successfully");

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err}`);
    process.exit(1);
  }
};

export { connectDB, mongoose };
