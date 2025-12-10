// models/product.model.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  carat: { type: Number, required: true },
  weight: { type: Number, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0, required: true },
  imageUrl: { type: [String], required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  goldPriceId: { type: mongoose.Schema.Types.ObjectId, ref: "GoldPrice" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model("Product", productSchema);
export default Product;
