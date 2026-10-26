// Local helper: creates an admin user in the LOCAL database and prints a
// snippet to paste into the browser console to be logged in (skips the email OTP).
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModels.js";

const emails = [
  process.env.ADMIN_EMAIL,
  ...(process.env.ADMIN_EXTRA_EMAILS || "").split(","),
].map((e) => (e || "").trim()).filter(Boolean);
if (!/127\.0\.0\.1|localhost/.test(process.env.MONGO_URI || "")) {
  console.error("Refusing to run: MONGO_URI is not a local database.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

let phone = 9999999990;
for (const email of emails) {
  let user = await userModel.findOne({ email });
  if (!user) {
    user = await userModel.create({
      name: "Local Admin",
      email,
      password: await bcrypt.hash("Admin@123", 10),
      phoneNumber: String(phone++),
      role: "admin",
      isVerified: true,
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  const safeUser = { _id: user._id, name: user.name, email: user.email };

  console.log(`\nAdmin: ${email}  (password: Admin@123 - local DB only)`);
  console.log("Browser console snippet (on http://localhost:5173, then refresh):");
  console.log(
    `localStorage.setItem("aqua_token","${token}");localStorage.setItem("aqua_user",JSON.stringify(${JSON.stringify(safeUser)}));`,
  );
}
await mongoose.disconnect();
