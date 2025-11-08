// controller/auth.controller.js
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import jwt from "jsonwebtoken";

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "7d" }
  );
};

// Route d'inscription avec rôle "Utilisateur"
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "Un utilisateur avec cet email existe déjà." 
      });
    }

    // Créer l'utilisateur avec le rôle "Utilisateur" par défaut
    const user = new User({
      name,
      email,
      password,
      role: "Utilisateur"
    });

    await user.save();

    // Créer le profil associé
    const profile = new Profile({
      userId: user._id,
      name: user.name,
      email: user.email
    });
    await profile.save();

    // Générer le token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Inscription réussie",
      token,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de l'inscription.", 
      error: error.message 
    });
  }
};

// Route de connexion avec génération de token
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: "Email ou mot de passe incorrect." 
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Email ou mot de passe incorrect." 
      });
    }

    // Générer le token
    const token = generateToken(user._id);

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la connexion.", 
      error: error.message 
    });
  }
};

// Route pour récupérer le profil connecté
export const getProfile = async (req, res) => {
  try {
    // L'utilisateur est disponible via req.user (ajouté par le middleware)
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("mesures", "type valueMm date");

    // Récupérer le profil associé
    const profile = await Profile.findOne({ userId: user._id });

    res.json({
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      profile: profile || {
        name: user.name,
        email: user.email
      },
      mesures: user.mesures || []
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération du profil.", 
      error: error.message 
    });
  }
};

