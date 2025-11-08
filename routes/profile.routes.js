// routes/profile.routes.js
import express from "express";
import {
  getProfile,
  updateProfile
} from "../controller/profile.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Route pour consulter le profil utilisateur
router.get("/", getProfile);

// Route pour modifier les informations du profil
router.put("/", updateProfile);

export default router;

