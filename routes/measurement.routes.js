// routes/measurement.routes.js
import express from "express";
import {
  saveMeasurement,
  calculateStandardSize,
  getUserMeasurements
} from "../controller/measurement.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Route pour enregistrer une mesure (taille de bague ou bracelet)
router.post("/", saveMeasurement);

// Route pour calculer la taille standard à partir d'une mesure
router.post("/calculate", calculateStandardSize);

// Route pour consulter les mesures enregistrées d'un utilisateur
router.get("/", getUserMeasurements);

export default router;

