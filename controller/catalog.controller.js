// controllers/catalogue.controller.js
import Product from "../models/product.model.js";

export const getCatalogue = async (req, res) => {
  const { name, carat, priceMin, priceMax } = req.query;
  let filter = {};
  if (name) filter.title = { $regex: name, $options: "i" };
  if (carat) filter.carat = carat;
  if (priceMin || priceMax) filter.price = {};
  if (priceMin) filter.price.$gte = Number(priceMin);
  if (priceMax) filter.price.$lte = Number(priceMax);

  const products = await Product.find(filter).populate("sellerId", "name boutique");
  res.json(products);
};
