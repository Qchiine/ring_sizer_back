// routes/profile.routes.js
import express from "express";
import {
  getProfile,
  updateProfile,
  // Commandes
  createOrder,
  getMyOrders,
  getOrderById
} from "../controller/profile.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Route pour consulter le profil utilisateur
router.get("/", getProfile);

// Route pour modifier les informations du profil
router.put("/", updateProfile);

// ============================================
// ROUTES COMMANDES (ACHETEURS)
// ============================================

// Créer une nouvelle commande
router.post("/orders", createOrder);

// Récupérer toutes les commandes de l'acheteur
router.get("/orders", getMyOrders);

// Récupérer une commande spécifique
router.get("/orders/:orderId", getOrderById);

export default router;

