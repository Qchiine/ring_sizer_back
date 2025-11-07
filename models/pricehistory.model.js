// models/priceHistory.model.js
import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema({
  goldPriceId: { type: mongoose.Schema.Types.ObjectId, ref: "GoldPrice" },
  date: Date,
  price24k: Number,
  price22k: Number,
  price18k: Number
});

const PriceHistory = mongoose.model("PriceHistory", priceHistorySchema);
export default PriceHistory;
