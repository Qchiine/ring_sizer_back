// models/goldPrice.model.js
import mongoose from "mongoose";

const goldPriceSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  price24k: Number,
  price22k: Number,
  price18k: Number
});

const GoldPrice = mongoose.model("GoldPrice", goldPriceSchema);
export default GoldPrice;
