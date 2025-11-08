// models/user.model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const boutiqueSchema = new mongoose.Schema({
  shopName: String,
  description: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Utilisateur", "Vendeur"], default: "Utilisateur" },
  mesures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Measurement" }],
  boutique: boutiqueSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash du mot de passe
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
