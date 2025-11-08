// routes/catalog.routes.js
import express from "express";
import {
  getProducts,
  getProductById,
  searchProductsByName,
  filterByCarat,
  filterByPrice
} from "../controller/catalog.controller.js";

const router = express.Router();

// Route pour récupérer la liste des produits disponibles (avec filtres)
router.get("/", getProducts);

// Route pour rechercher des produits par nom
router.get("/search", searchProductsByName);

// Route pour filtrer par carat
router.get("/filter/carat", filterByCarat);

// Route pour filtrer par prix
router.get("/filter/price", filterByPrice);

// Route pour consulter les détails d'un produit
router.get("/:productId", getProductById);

export default router;

