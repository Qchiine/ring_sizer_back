// models/order.model.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: Number,
  totalPrice: Number,
  date: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
