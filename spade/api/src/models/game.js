import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    api: {
      type: String,
    }, // wacs, wco, fawk
    provider: {
      type: String,
    },
    code: {
      type: String,
    }, // game code or provider game ID
    name: {
      type: String,
    },
    category: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    }, // array of tags
    image: {
      type: String,
    }, // image URL (e.g., /img/img_name.jpg)
    enabled: {
      type: Boolean,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    is_popular: {
      type: Boolean,
      default: false,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    is_new: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
