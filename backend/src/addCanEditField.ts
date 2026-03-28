import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ Connected to MongoDB");

    const res = await mongoose.connection
      .collection("children")   // ⭐ children collection
      .updateMany(
        {},
        {
          $set: {
            hasEditRequest: false,
            editRequestedAt: null,
          },
        }
      );

    console.log("Children matched:", res.matchedCount);
    console.log("Children modified:", res.modifiedCount);

    await mongoose.disconnect();
    console.log("✅ Edit request fields added to all children");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

run();