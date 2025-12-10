// controller/seller.controller.js
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import GoldPrice from "../models/goldprice.model.js"; // Import pour enregistrer le modèle

// ============================================
// Utilitaires
// ============================================

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

const buildRelativeImagePath = filename => `/uploads/products/${filename}`;

/**
 * Nettoie et valide une URL d'image depuis le body de la requête
 * @param {string} imageUrlFromBody - L'URL d'image brute du body
 * @returns {string|null} - L'URL nettoyée et validée, ou null si invalide
 */
const cleanAndValidateImageUrl = (imageUrlFromBody) => {
  if (!imageUrlFromBody) return null;
  
  let cleanedImageUrl = String(imageUrlFromBody).trim();
  
  // Enlever les guillemets en trop au début et à la fin
  cleanedImageUrl = cleanedImageUrl.replace(/^["']+|["']+$/g, '');
  
  // Patterns de logs à filtrer (Flutter, Android, nodemon, etc.)
  const logPatterns = [
    'ImeTracker',
    'Exception caught',
    'RenderFlex overflowed',
    'InputConnectionAdaptor',
    'InsetsController',
    'WindowOnBackDispatcher',
    'AssetManager',
    '[nodemon]',
    'nodemon',
    'starting `',
    'watching path',
    'watching extensions',
    'to restart at any time'
  ];
  
  // Vérifier si la chaîne contient des patterns de logs
  const containsLogs = logPatterns.some(pattern => 
    cleanedImageUrl.includes(pattern)
  );
  
  // Vérifier que ce n'est pas une chaîne vide ou des logs d'erreur
  if (!cleanedImageUrl || 
      cleanedImageUrl.length === 0 || 
      cleanedImageUrl.length >= 5000 || // Limite de longueur raisonnable
      containsLogs) {
    // Afficher seulement les premiers caractères pour le debug
    const preview = cleanedImageUrl?.substring(0, 150) || '';
    console.warn(`⚠️  imageUrl invalide ou contient des logs (${cleanedImageUrl?.length || 0} caractères):`, preview);
    return null;
  }
  
  // Valider que c'est une URL valide (http/https)
  const isUrl = /^https?:\/\/.+/.test(cleanedImageUrl);
  const isFilePath = /^[A-Za-z]:\\/.test(cleanedImageUrl) || /^\/.+/.test(cleanedImageUrl);
  
  if (isUrl) {
    // URL externe valide
    return cleanedImageUrl;
  } else if (isFilePath) {
    // Chemin de fichier local - ne pas l'accepter tel quel
    console.warn("⚠️  Chemin de fichier local ignoré:", cleanedImageUrl.substring(0, 100));
    console.warn("   💡 Solutions: 1) Uploadez le fichier via multipart/form-data (champ 'image')");
    console.warn("                2) Utilisez une URL externe (http:// ou https://)");
    return null;
  } else {
    // Format non reconnu, ignorer
    console.warn("⚠️  Format d'imageUrl non reconnu (attendu: URL http/https):", cleanedImageUrl.substring(0, 100));
    return null;
  }
};

/**
 * Détermine l'URL d'image à utiliser : priorité au fichier uploadé, sinon imageUrl du body
 * @param {Object} req - L'objet de requête Express
 * @param {string} imageUrlFromBody - L'URL d'image du body (optionnel)
 * @returns {string|null} - L'URL d'image à utiliser
 */
const resolveImageUrl = (req, imageUrlFromBody) => {
  if (req.file) {
    // Si un fichier est uploadé, utiliser le chemin relatif
    return buildRelativeImagePath(req.file.filename);
  } else if (imageUrlFromBody !== undefined) {
    // Nettoyer et valider l'URL d'image du body
    return cleanAndValidateImageUrl(imageUrlFromBody);
  }
  return null;
};

const formatProductResponse = (productDoc, req) => {
  if (!productDoc) return null;
  const product = productDoc.toObject ? productDoc.toObject() : { ...productDoc };
  if (product.imageUrl) {
    const hasAbsoluteUrl = /^https?:\/\//i.test(product.imageUrl);
    if (!hasAbsoluteUrl) {
      product.imageUrl = `${buildBaseUrl(req)}${product.imageUrl}`;
    }
    product.imageLink = product.imageUrl;
  } else {
    product.imageLink = null;
  }
  return product;
};

const formatOrderResponse = (orderDoc, req) => {
  if (!orderDoc) return null;
  const order = orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };
  if (order.productId) {
    order.productId = formatProductResponse(order.productId, req);
  }
  return order;
};

// ============================================
// GESTION DU PROFIL BOUTIQUE
// ============================================

// Récupérer le profil boutique du vendeur
export const getShopProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");

    if (!user || user.role !== "Vendeur") {
      return res.status(403).json({
        message: "Accès refusé. Vous n'êtes pas un vendeur."
      });
    }

    res.json({
      message: "Profil boutique récupéré avec succès",
      shopProfile: {
        shopName: user.boutique?.shopName || "",
        description: user.boutique?.description || "",
        sellerName: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du profil boutique.",
      error: error.message
    });
  }
};

// Mettre à jour le profil boutique
export const updateShopProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Vérifier que req.body existe
    if (!req.body) {
      return res.status(400).json({
        message: "Le corps de la requête est vide. Veuillez envoyer les données en JSON."
      });
    }
    
    const { shopName, description } = req.body;

    // Vérifier que au moins un champ est fourni
    if (!shopName && !description) {
      return res.status(400).json({
        message: "Au moins un champ (shopName ou description) doit être fourni."
      });
    }

    const updateData = {};
    if (shopName) updateData["boutique.shopName"] = shopName;
    if (description !== undefined) updateData["boutique.description"] = description;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user || user.role !== "Vendeur") {
      return res.status(403).json({
        message: "Accès refusé. Vous n'êtes pas un vendeur."
      });
    }

    res.json({
      message: "Profil boutique mis à jour avec succès",
      shopProfile: {
        shopName: user.boutique?.shopName || "",
        description: user.boutique?.description || "",
        sellerName: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du profil boutique.",
      error: error.message
    });
  }
};

// ============================================
// GESTION DES PRODUITS (CRUD)
// ============================================

// Créer un nouveau produit
export const createProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Debug: Afficher ce qui est reçu (seulement si imageUrl est présent pour éviter le bruit)
    if (req.body?.imageUrl || req.file) {
      console.log("📦 Création produit - imageUrl fourni:", !!req.body?.imageUrl, "fichier uploadé:", !!req.file);
    }
    
    // Nettoyer les clés du body (enlever les deux-points et espaces en fin)
    const cleanedBody = {};
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        // Enlever les deux-points et espaces en fin de clé
        const cleanKey = key.replace(/[: ]+$/, '');
        cleanedBody[cleanKey] = req.body[key];
      });
    }
    
    // Récupérer les données du body nettoyé
    const { title, description, carat, weight, price, stock, goldPriceId, imageUrl: imageUrlFromBody } = cleanedBody;

    // Validation des champs requis
    if (!title || !carat || !weight || !price || stock === undefined) {
      return res.status(400).json({
        message: "Les champs title, carat, weight, price et stock sont requis.",
        received: {
          title: title || "manquant",
          carat: carat || "manquant",
          weight: weight || "manquant",
          price: price || "manquant",
          stock: stock !== undefined ? stock : "manquant"
        },
        debug: {
          bodyKeys: Object.keys(req.body || {}),
          bodyValues: req.body,
          cleanedBody: cleanedBody,
          hasFile: !!req.file
        }
      });
    }

    // Convertir les valeurs en nombres
    const caratNum = Number(carat);
    const weightNum = Number(weight);
    const priceNum = Number(price);
    const stockNum = Number(stock);

    // Validation des valeurs numériques
    if (isNaN(caratNum) || isNaN(weightNum) || isNaN(priceNum) || isNaN(stockNum)) {
      return res.status(400).json({
        message: "Les champs carat, weight, price et stock doivent être des nombres valides."
      });
    }

    if (caratNum <= 0 || weightNum <= 0 || priceNum <= 0 || stockNum < 0) {
      return res.status(400).json({
        message: "Les valeurs de carat, weight, price doivent être positives et stock doit être >= 0."
      });
    }

    // Validation du carat (24k, 22k, 18k sont les plus courants)
    if (![18, 22, 24].includes(caratNum)) {
      return res.status(400).json({
        message: "Le carat doit être 18, 22 ou 24.",
        received: caratNum
      });
    }

    // Gérer l'image : priorité au fichier uploadé, sinon utiliser imageUrl du body
    const imageUrl = resolveImageUrl(req, imageUrlFromBody);

    // Créer le produit
    const product = new Product({
      title,
      description: description || "",
      carat: caratNum,
      weight: weightNum,
      price: priceNum,
      stock: stockNum,
      imageUrl,
      sellerId: userId,
      goldPriceId: goldPriceId || null
    });

    await product.save();

    // Populate pour retourner les détails complets
    const populatedProduct = await Product.findById(product._id)
      .populate("sellerId", "name boutique")
      .populate("goldPriceId");

    res.status(201).json({
      message: "Produit créé avec succès",
      product: formatProductResponse(populatedProduct, req)
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création du produit.",
      error: error.message
    });
  }
};

// Récupérer tous les produits du vendeur
export const getMyProducts = async (req, res) => {
  try {
    const userId = req.user._id;

    const products = await Product.find({ sellerId: userId })
      .populate("sellerId", "name boutique")
      .populate("goldPriceId")
      .sort({ createdAt: -1 });

    res.json({
      message: "Produits récupérés avec succès",
      count: products.length,
      products: products.map(product => formatProductResponse(product, req))
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des produits.",
      error: error.message
    });
  }
};

// Récupérer un produit spécifique du vendeur
export const getMyProductById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      sellerId: userId
    })
      .populate("sellerId", "name boutique")
      .populate("goldPriceId");

    if (!product) {
      return res.status(404).json({
        message: "Produit non trouvé ou vous n'avez pas l'autorisation d'y accéder."
      });
    }

    res.json({
      message: "Produit récupéré avec succès",
      product: formatProductResponse(product, req)
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "ID de produit invalide."
      });
    }
    res.status(500).json({
      message: "Erreur lors de la récupération du produit.",
      error: error.message
    });
  }
};

// Modifier un produit
export const updateProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    
    // Nettoyer les clés du body (enlever les deux-points et espaces en fin)
    const cleanedBody = {};
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        // Enlever les deux-points et espaces en fin de clé
        const cleanKey = key.replace(/[: ]+$/, '');
        cleanedBody[cleanKey] = req.body[key];
      });
    }
    
    const { title, description, carat, weight, price, stock, goldPriceId, imageUrl: imageUrlFromBody } = cleanedBody;

    // Vérifier que le produit existe et appartient au vendeur
    const product = await Product.findOne({
      _id: productId,
      sellerId: userId
    });

    if (!product) {
      return res.status(404).json({
        message: "Produit non trouvé ou vous n'avez pas l'autorisation de le modifier."
      });
    }

    // Construire l'objet de mise à jour
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (carat) {
      if (carat <= 0 || ![18, 22, 24].includes(carat)) {
        return res.status(400).json({
          message: "Le carat doit être 18, 22 ou 24."
        });
      }
      updateData.carat = Number(carat);
    }
    if (weight) {
      if (weight <= 0) {
        return res.status(400).json({
          message: "Le poids doit être positif."
        });
      }
      updateData.weight = Number(weight);
    }
    if (price) {
      if (price <= 0) {
        return res.status(400).json({
          message: "Le prix doit être positif."
        });
      }
      updateData.price = Number(price);
    }
    if (stock !== undefined) {
      if (stock < 0) {
        return res.status(400).json({
          message: "Le stock ne peut pas être négatif."
        });
      }
      updateData.stock = Number(stock);
    }
    if (goldPriceId !== undefined) updateData.goldPriceId = goldPriceId || null;

    // Gérer l'image : priorité au fichier uploadé, sinon utiliser imageUrl du body
    const resolvedImageUrl = resolveImageUrl(req, imageUrlFromBody);
    if (resolvedImageUrl !== null) {
      // Mettre à jour seulement si on a une valeur valide
      updateData.imageUrl = resolvedImageUrl;
    } else if (imageUrlFromBody === "" || imageUrlFromBody === null) {
      // Permettre de mettre imageUrl à null explicitement
      updateData.imageUrl = null;
    }

    updateData.updatedAt = new Date();

    // Mettre à jour le produit
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("sellerId", "name boutique")
      .populate("goldPriceId");

    res.json({
      message: "Produit mis à jour avec succès",
      product: formatProductResponse(updatedProduct, req)
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "ID de produit invalide."
      });
    }
    res.status(500).json({
      message: "Erreur lors de la mise à jour du produit.",
      error: error.message
    });
  }
};

// Supprimer un produit
export const deleteProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    // Vérifier que le produit existe et appartient au vendeur
    const product = await Product.findOne({
      _id: productId,
      sellerId: userId
    });

    if (!product) {
      return res.status(404).json({
        message: "Produit non trouvé ou vous n'avez pas l'autorisation de le supprimer."
      });
    }

    // Supprimer le produit
    await Product.findByIdAndDelete(productId);

    res.json({
      message: "Produit supprimé avec succès"
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "ID de produit invalide."
      });
    }
    res.status(500).json({
      message: "Erreur lors de la suppression du produit.",
      error: error.message
    });
  }
};

// Mettre à jour le stock d'un produit
export const updateStock = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        message: "Le stock est requis et doit être >= 0."
      });
    }

    // Vérifier que le produit existe et appartient au vendeur
    const product = await Product.findOne({
      _id: productId,
      sellerId: userId
    });

    if (!product) {
      return res.status(404).json({
        message: "Produit non trouvé ou vous n'avez pas l'autorisation de le modifier."
      });
    }

    // Mettre à jour le stock
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: { stock: Number(stock), updatedAt: new Date() } },
      { new: true, runValidators: true }
    )
      .populate("sellerId", "name boutique")
      .populate("goldPriceId");

    res.json({
      message: "Stock mis à jour avec succès",
      product: formatProductResponse(updatedProduct, req)
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "ID de produit invalide."
      });
    }
    res.status(500).json({
      message: "Erreur lors de la mise à jour du stock.",
      error: error.message
    });
  }
};

// ============================================
// GESTION DES COMMANDES
// ============================================

// Récupérer toutes les commandes des produits du vendeur
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // Récupérer tous les produits du vendeur
    const myProducts = await Product.find({ sellerId: userId }).select("_id");

    const productIds = myProducts.map(p => p._id);

    // Récupérer toutes les commandes pour ces produits
    const orders = await Order.find({ productId: { $in: productIds } })
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

// Récupérer une commande spécifique
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    // Récupérer la commande
    const order = await Order.findById(orderId)
      .populate("userId", "name email")
      .populate("productId");

    if (!order) {
      return res.status(404).json({
        message: "Commande non trouvée."
      });
    }

    // Vérifier que le produit de la commande appartient au vendeur
    const product = await Product.findById(order.productId);
    if (!product || product.sellerId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Vous n'avez pas l'autorisation d'accéder à cette commande."
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

// Mettre à jour le statut d'une commande
export const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;
    const { status } = req.body;

    // Validation du statut
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Le statut doit être l'un des suivants: ${validStatuses.join(", ")}.`
      });
    }

    // Récupérer la commande
    const order = await Order.findById(orderId).populate("productId");

    if (!order) {
      return res.status(404).json({
        message: "Commande non trouvée."
      });
    }

    // Vérifier que le produit de la commande appartient au vendeur
    const product = await Product.findById(order.productId);
    if (!product || product.sellerId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Vous n'avez pas l'autorisation de modifier cette commande."
      });
    }

    // Mettre à jour le statut
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status, updatedAt: new Date() } },
      { new: true, runValidators: true }
    )
      .populate("userId", "name email")
      .populate("productId");

    res.json({
      message: "Statut de la commande mis à jour avec succès",
      order: formatOrderResponse(updatedOrder, req)
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "ID de commande invalide."
      });
    }
    res.status(500).json({
      message: "Erreur lors de la mise à jour du statut de la commande.",
      error: error.message
    });
  }
};

// ============================================
// STATISTIQUES (OPTIONNEL)
// ============================================

// Récupérer les statistiques du vendeur
export const getStatistics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Compter les produits
    const productCount = await Product.countDocuments({ sellerId: userId });

    // Récupérer tous les produits pour calculer le prix moyen
    const products = await Product.find({ sellerId: userId }).select("price");
    const averagePrice = products.length > 0
      ? products.reduce((sum, p) => sum + p.price, 0) / products.length
      : 0;

    // Récupérer les produits du vendeur
    const myProducts = await Product.find({ sellerId: userId }).select("_id");
    const productIds = myProducts.map(p => p._id);

    // Compter les commandes
    const orderCount = await Order.countDocuments({ productId: { $in: productIds } });

    // Calculer le chiffre d'affaires total
    const orders = await Order.find({ productId: { $in: productIds } }).select("totalPrice");
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    res.json({
      message: "Statistiques récupérées avec succès",
      statistics: {
        productCount,
        averagePrice: Math.round(averagePrice * 100) / 100,
        orderCount,
        totalRevenue: Math.round(totalRevenue * 100) / 100
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques.",
      error: error.message
    });
  }
};

