// routes/auth.routes.js
import express from "express";
import { register, login, getProfile } from "../controller/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Route d'inscription avec rôle "Utilisateur"
router.post("/register", register);

// Route de connexion avec génération de token
router.post("/login", login);

// Route pour récupérer le profil connecté (protégée)
router.get("/profile", authenticate, getProfile);

export default router;

