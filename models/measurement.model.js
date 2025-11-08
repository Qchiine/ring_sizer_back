// models/measurement.model.js
import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["bague", "bracelet"], required: true },
  valueMm: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

measurementSchema.methods.convertToStandardSize = function() {
  const mm = this.valueMm;
  if (this.type === "bague") return Math.round((mm - 40) / 0.8);
  return mm; // bracelet
};

const Measurement = mongoose.model("Measurement", measurementSchema);
export default Measurement;
