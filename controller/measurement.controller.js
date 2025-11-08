// controller/measurement.controller.js
import Measurement from "../models/measurement.model.js";
import User from "../models/user.model.js";

// Route pour enregistrer une mesure (taille de bague ou bracelet)
export const saveMeasurement = async (req, res) => {
  try {
    const { type, valueMm } = req.body;
    const userId = req.user._id;

    // Vérifier les données
    if (!type || !valueMm) {
      return res.status(400).json({ 
        message: "Le type et la valeur en mm sont requis." 
      });
    }

    if (!["bague", "bracelet"].includes(type)) {
      return res.status(400).json({ 
        message: "Le type doit être 'bague' ou 'bracelet'." 
      });
    }

    // Créer la mesure
    const measurement = new Measurement({
      userId,
      type,
      valueMm: Number(valueMm),
      date: new Date()
    });

    await measurement.save();

    // Ajouter la mesure à la liste des mesures de l'utilisateur
    await User.findByIdAndUpdate(userId, {
      $push: { mesures: measurement._id }
    });

    res.status(201).json({
      message: "Mesure enregistrée avec succès",
      measurement: {
        measurementId: measurement._id,
        userId: measurement.userId,
        type: measurement.type,
        valueMm: measurement.valueMm,
        date: measurement.date
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de l'enregistrement de la mesure.", 
      error: error.message 
    });
  }
};

// Route pour calculer la taille standard à partir d'une mesure
export const calculateStandardSize = async (req, res) => {
  try {
    const { valueMm, type } = req.body;

    if (!valueMm || !type) {
      return res.status(400).json({ 
        message: "La valeur en mm et le type sont requis." 
      });
    }

    if (!["bague", "bracelet"].includes(type)) {
      return res.status(400).json({ 
        message: "Le type doit être 'bague' ou 'bracelet'." 
      });
    }

    // Créer une instance temporaire pour utiliser la méthode
    const tempMeasurement = new Measurement({
      type,
      valueMm: Number(valueMm)
    });

    const standardSize = tempMeasurement.convertToStandardSize();

    res.json({
      message: "Taille standard calculée",
      originalValue: valueMm,
      type,
      standardSize
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors du calcul de la taille standard.", 
      error: error.message 
    });
  }
};

// Route pour consulter les mesures enregistrées d'un utilisateur
export const getUserMeasurements = async (req, res) => {
  try {
    const userId = req.user._id;

    // Récupérer toutes les mesures de l'utilisateur
    const measurements = await Measurement.find({ userId })
      .sort({ date: -1 }); // Plus récentes en premier

    // Calculer la taille standard pour chaque mesure
    const measurementsWithStandardSize = measurements.map(measurement => {
      const standardSize = measurement.convertToStandardSize();
      return {
        measurementId: measurement._id,
        userId: measurement.userId,
        type: measurement.type,
        valueMm: measurement.valueMm,
        standardSize,
        date: measurement.date
      };
    });

    res.json({
      message: "Mesures récupérées avec succès",
      count: measurementsWithStandardSize.length,
      measurements: measurementsWithStandardSize
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération des mesures.", 
      error: error.message 
    });
  }
};

