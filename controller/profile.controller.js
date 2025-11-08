// controller/profile.controller.js
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import Measurement from "../models/measurement.model.js";

// Route pour consulter le profil utilisateur
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Récupérer l'utilisateur avec ses mesures
    const user = await User.findById(userId)
      .select("-password")
      .populate("mesures", "type valueMm date");

    if (!user) {
      return res.status(404).json({ 
        message: "Utilisateur non trouvé." 
      });
    }

    // Récupérer le profil associé
    let profile = await Profile.findOne({ userId });

    // Si le profil n'existe pas, le créer avec les données de l'utilisateur
    if (!profile) {
      profile = new Profile({
        userId: user._id,
        name: user.name,
        email: user.email
      });
      await profile.save();
    }

    // Calculer les tailles standard pour chaque mesure
    const mesuresWithStandardSize = (user.mesures || []).map(measurement => {
      const tempMeasurement = new Measurement({
        type: measurement.type,
        valueMm: measurement.valueMm
      });
      return {
        measurementId: measurement._id,
        type: measurement.type,
        valueMm: measurement.valueMm,
        standardSize: tempMeasurement.convertToStandardSize(),
        date: measurement.date
      };
    });

    res.json({
      message: "Profil récupéré avec succès",
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      profile: {
        profileId: profile._id,
        name: profile.name,
        email: profile.email
      },
      mesures: mesuresWithStandardSize
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération du profil.", 
      error: error.message 
    });
  }
};

// Route pour modifier les informations du profil
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email } = req.body;

    // Vérifier si au moins un champ est fourni
    if (!name && !email) {
      return res.status(400).json({ 
        message: "Au moins un champ (name ou email) doit être fourni." 
      });
    }

    // Vérifier si l'email n'est pas déjà utilisé par un autre utilisateur
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: "Cet email est déjà utilisé par un autre utilisateur." 
        });
      }
    }

    // Mettre à jour l'utilisateur
    const updateData = {};
    if (name) updateData.name = name;
    if (email) {
      updateData.email = email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    // Mettre à jour le profil associé
    const profileUpdateData = {};
    if (name) profileUpdateData.name = name;
    if (email) profileUpdateData.email = email.toLowerCase();

    let profile = await Profile.findOne({ userId });
    
    if (profile) {
      profile = await Profile.findByIdAndUpdate(
        profile._id,
        { $set: profileUpdateData },
        { new: true }
      );
    } else {
      // Créer le profil s'il n'existe pas
      profile = new Profile({
        userId: user._id,
        name: user.name,
        email: user.email
      });
      await profile.save();
    }

    // Récupérer les mesures de l'utilisateur
    const measurements = await Measurement.find({ userId })
      .sort({ date: -1 });

    const mesuresWithStandardSize = measurements.map(measurement => {
      const tempMeasurement = new Measurement({
        type: measurement.type,
        valueMm: measurement.valueMm
      });
      return {
        measurementId: measurement._id,
        type: measurement.type,
        valueMm: measurement.valueMm,
        standardSize: tempMeasurement.convertToStandardSize(),
        date: measurement.date
      };
    });

    res.json({
      message: "Profil mis à jour avec succès",
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      profile: {
        profileId: profile._id,
        name: profile.name,
        email: profile.email
      },
      mesures: mesuresWithStandardSize
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ 
        message: "Données invalides.", 
        error: error.message 
      });
    }
    res.status(500).json({ 
      message: "Erreur lors de la mise à jour du profil.", 
      error: error.message 
    });
  }
};

