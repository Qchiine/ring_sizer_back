// models/product.model.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  carat: Number,
  weight: Number,
  price: Number,
  stock: Number,
  imageUrl: String,
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  goldPriceId: { type: mongoose.Schema.Types.ObjectId, ref: "GoldPrice" }
});

const Product = mongoose.model("Product", productSchema);
export default Product;
