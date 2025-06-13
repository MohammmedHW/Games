import { mongoose } from "../db/connectors";

const pageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String },
    keywords: { type: String },
    page_content: { type: String, required: true },
    is_visible: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    seo: {
      title: String,
      metaDescription: String,
      canonicalUrl: String,
    },
  },
  { timestamps: true }
);

const Page = mongoose.model("Page", pageSchema);

export default Page;
