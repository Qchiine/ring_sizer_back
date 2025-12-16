// controller/profile.controller.js
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import Measurement from "../models/measurement.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

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

// ============================================
// GESTION DES COMMANDES (ACHETEURS)
// ============================================

// Fonction utilitaire pour formater une réponse de commande
const getPublicBaseUrl = () => {
  if (!process.env.PUBLIC_BASE_URL) return null;
  return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
};

const buildBaseUrl = req => {
  const envBase = getPublicBaseUrl();
  if (envBase) return envBase;
  const host = req.get("host");
  return `${req.protocol}://${host}`;
};

const formatProductResponse = (productDoc, req) => {
  if (!productDoc) return null;
  const productObj = productDoc.toObject ? productDoc.toObject() : { ...productDoc };
  
  let imageUrlValue = productObj.imageUrl;
  
  if (imageUrlValue === undefined || imageUrlValue === null) {
    imageUrlValue = '';
  } else {
    if (Array.isArray(imageUrlValue)) {
      imageUrlValue = imageUrlValue.length > 0 ? imageUrlValue[0] : '';
    }
    imageUrlValue = imageUrlValue ? String(imageUrlValue) : '';
    
    if (imageUrlValue && imageUrlValue.trim() !== '') {
      const isDataUri = /^data:image\//i.test(imageUrlValue);
      const hasAbsoluteUrl = /^https?:\/\//i.test(imageUrlValue);
      
      if (!isDataUri && !hasAbsoluteUrl) {
        imageUrlValue = `${buildBaseUrl(req)}${imageUrlValue}`;
      }
    } else {
      imageUrlValue = '';
    }
  }
  
  return {
    _id: productObj._id,
    title: productObj.title || '',
    description: productObj.description || '',
    carat: productObj.carat || 0,
    weight: productObj.weight || 0,
    price: productObj.price || 0,
    stock: productObj.stock !== undefined ? productObj.stock : 0,
    imageUrl: imageUrlValue,
    imageLink: imageUrlValue,
    sellerId: productObj.sellerId,
    goldPriceId: productObj.goldPriceId || null,
    createdAt: productObj.createdAt,
    updatedAt: productObj.updatedAt,
    __v: productObj.__v
  };
};

const formatOrderResponse = (orderDoc, req) => {
  if (!orderDoc) return null;
  const order = orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };
  if (order.productId) {
    order.productId = formatProductResponse(order.productId, req);
  }
  return order;
};

// Créer une nouvelle commande
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    // Validation des champs requis
    if (!productId || !quantity) {
      return res.status(400).json({
        message: "Les champs productId et quantity sont requis."
      });
    }

    // Vérifier que la quantité est valide
    const quantityNum = Number(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return res.status(400).json({
        message: "La quantité doit être un nombre positif."
      });
    }

    // Vérifier que le produit existe et est en stock
    const product = await Product.findById(productId)
      .populate("sellerId", "name boutique");

    if (!product) {
      return res.status(404).json({
        message: "Produit non trouvé."
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        message: "Le produit est hors stock."
      });
    }

    if (product.stock < quantityNum) {
      return res.status(400).json({
        message: `Stock insuffisant. Stock disponible: ${product.stock}, quantité demandée: ${quantityNum}.`
      });
    }

    // Calculer le prix total
    const totalPrice = product.price * quantityNum;

    // Créer la commande
    const order = new Order({
      userId,
      productId,
      quantity: quantityNum,
      totalPrice,
      status: "pending"
    });

    await order.save();

    // Réduire le stock du produit
    product.stock -= quantityNum;
    await product.save();

    // Populate pour retourner les détails complets
    const populatedOrder = await Order.findById(order._id)
      .populate("userId", "name email")
      .populate("productId");

    res.status(201).json({
      message: "Commande créée avec succès",
      order: formatOrderResponse(populatedOrder, req)
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "ID de produit invalide."
      });
    }
    res.status(500).json({
      message: "Erreur lors de la création de la commande.",
      error: error.message
    });
  }
};

// Récupérer toutes les commandes de l'acheteur
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId })
      .populate("userId", "name email")
      .populate("productId")
      .sort({ date: -1 });

    res.json({
      message: "Commandes récupérées avec succès",
      count: orders.length,
      orders: orders.map(order => formatOrderResponse(order, req))
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des commandes.",
      error: error.message
    });
  }
};

// Récupérer une commande spécifique de l'acheteur
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      userId: userId
    })
      .populate("userId", "name email")
      .populate("productId");

    if (!order) {
      return res.status(404).json({
        message: "Commande non trouvée ou vous n'avez pas l'autorisation d'y accéder."
      });
    }

    res.json({
      message: "Commande récupérée avec succès",
      order: formatOrderResponse(order, req)
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "ID de commande invalide."
      });
    }
    res.status(500).json({
      message: "Erreur lors de la récupération de la commande.",
      error: error.message
    });
  }
};

