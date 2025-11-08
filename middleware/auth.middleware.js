// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authenticate = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        message: "Accès refusé. Token manquant." 
      });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    
    // Récupérer l'utilisateur
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ 
        message: "Token invalide. Utilisateur non trouvé." 
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        message: "Token invalide." 
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Token expiré." 
      });
    }
    res.status(500).json({ 
      message: "Erreur d'authentification.", 
      error: error.message 
    });
  }
};

// Middleware pour vérifier que l'utilisateur est un vendeur
export const isSeller = async (req, res, next) => {
  try {
    // Vérifier que l'utilisateur est authentifié (authenticate doit être appelé avant)
    if (!req.user) {
      return res.status(401).json({ 
        message: "Authentification requise." 
      });
    }

    // Vérifier que l'utilisateur a le rôle "Vendeur"
    if (req.user.role !== "Vendeur") {
      return res.status(403).json({ 
        message: "Accès refusé. Cette fonctionnalité est réservée aux vendeurs." 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur de vérification du rôle.", 
      error: error.message 
    });
  }
};

