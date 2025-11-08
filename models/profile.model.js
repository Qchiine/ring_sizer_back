// models/profile.model.js
import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  email: String
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
