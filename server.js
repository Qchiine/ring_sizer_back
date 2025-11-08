// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import measurementRoutes from "./routes/measurement.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
import profileRoutes from "./routes/profile.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Activer CORS pour l'application mobile Flutter
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de test
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 Backend fonctionne !",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      measurements: "/api/measurements",
      catalog: "/api/catalog",
      profile: "/api/profile"
    }
  });
});

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/profile", profileRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route non trouvée." 
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("Erreur:", err);
  res.status(500).json({ 
    message: "Erreur serveur interne.", 
    error: err.message 
  });
});

const PORT = process.env.PORT || 5000;

// Connexion à la base de données et démarrage du serveur
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Serveur sur le port ${PORT}`);
      console.log(`📱 API disponible sur http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Erreur de démarrage:", err);
    process.exit(1);
  });
