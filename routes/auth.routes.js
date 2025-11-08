// routes/auth.routes.js
import express from "express";
import { register, login } from "../controller/auth.controller.js";

const router = express.Router();

// Route d'inscription avec rôle "Utilisateur"
router.post("/register", register);

// Route de connexion avec génération de token
router.post("/login", login);

export default router;

