import { mongoose } from "../db/connectors";

const siteSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    value: { type: mongoose.Schema.Types.Mixed },
    is_public: { type: Boolean, default: false },
    group: { type: String, default: "general" },
  },
  { timestamps: true }
);

const Site = mongoose.model("Site", siteSchema);

export default Site;
