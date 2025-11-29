// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import measurementRoutes from "./routes/measurement.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import sellerRoutes from "./routes/seller.routes.js";

dotenv.config();

const app = express();

// Obtenir le répertoire courant (équivalent à __dirname en ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors()); // Activer CORS pour l'application mobile Flutter
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (images uploadées)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route de test
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 Backend fonctionne !",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      measurements: "/api/measurements",
      catalog: "/api/catalog",
      profile: "/api/profile",
      seller: "/api/seller"
    }
  });
});

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/seller", sellerRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route non trouvée." 
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("Erreur:", err);
  
  // Gestion spécifique des erreurs Multer (upload)
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "Le fichier est trop volumineux. Taille maximale: 5MB."
    });
  }
  
  // Gestion des erreurs Multer "Unexpected field"
  if (err.code === "LIMIT_UNEXPECTED_FILE" || err.message === "Unexpected field") {
    return res.status(400).json({
      message: "Erreur avec le champ 'image'. Si vous voulez uploader une image, le type doit être 'File' dans Postman, pas 'Text'. Si vous ne voulez pas d'image, supprimez complètement le champ 'image'."
    });
  }
  
  // Gestion des erreurs de type de fichier
  if (err.message && err.message.includes("Seuls les fichiers images")) {
    return res.status(400).json({
      message: err.message
    });
  }
  
  res.status(err.status || 500).json({ 
    message: err.message || "Erreur serveur interne.", 
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0"; // Écouter sur toutes les interfaces réseau

// Connexion à la base de données et démarrage du serveur
connectDB()
  .then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📱 API disponible sur:`);
      console.log(`   - http://localhost:${PORT}`);
      console.log(`   - http://127.0.0.1:${PORT}`);
      console.log(`   - http://10.0.2.2:${PORT} (pour émulateur Android)`);
      console.log(`   - Accessible depuis le réseau local`);
    });
  })
  .catch(err => {
    console.error("❌ Erreur de démarrage:", err);
    process.exit(1);
  });
