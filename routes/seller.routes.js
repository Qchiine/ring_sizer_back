// routes/seller.routes.js
import express from "express";
import { authenticate, isSeller } from "../middleware/auth.middleware.js";
import { uploadProductImage } from "../middleware/upload.middleware.js";
import {
  // Profil boutique
  getShopProfile,
  updateShopProfile,
  // Produits CRUD
  createProduct,
  getMyProducts,
  getMyProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  // Commandes
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  // Statistiques
  getStatistics
} from "../controller/seller.controller.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification ET d'être vendeur
router.use(authenticate);
router.use(isSeller);

// ============================================
// ROUTES PROFIL BOUTIQUE
// ============================================

// Récupérer le profil boutique
router.get("/shop-profile", getShopProfile);

// Mettre à jour le profil boutique
router.put("/shop-profile", updateShopProfile);

// ============================================
// ROUTES PRODUITS (CRUD)
// ============================================

// Créer un nouveau produit (avec upload d'image optionnel)
router.post("/products", uploadProductImage, createProduct);

// Récupérer tous les produits du vendeur
router.get("/products", getMyProducts);

// Récupérer un produit spécifique
router.get("/products/:productId", getMyProductById);

// Modifier un produit (avec upload d'image optionnel)
router.put("/products/:productId", uploadProductImage, updateProduct);

// Supprimer un produit
router.delete("/products/:productId", deleteProduct);

// Mettre à jour le stock d'un produit
router.patch("/products/:productId/stock", updateStock);

// ============================================
// ROUTES COMMANDES
// ============================================

// Récupérer toutes les commandes des produits du vendeur
router.get("/orders", getMyOrders);

// Récupérer une commande spécifique
router.get("/orders/:orderId", getOrderById);

// Mettre à jour le statut d'une commande
router.patch("/orders/:orderId/status", updateOrderStatus);

// ============================================
// ROUTES STATISTIQUES
// ============================================

// Récupérer les statistiques du vendeur
router.get("/statistics", getStatistics);

export default router;

