// controller/catalog.controller.js
import Product from "../models/product.model.js";

// ============================================
// Utilitaires pour formater les réponses
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

const formatProductResponse = (productDoc, req) => {
  if (!productDoc) return null;
  const productObj = productDoc.toObject ? productDoc.toObject() : { ...productDoc };
  
  // Créer un nouvel objet propre pour la sérialisation JSON
  // Cela garantit que toutes les propriétés sont correctement sérialisables
  let imageUrlValue = productObj.imageUrl;
  
  // Toujours utiliser une chaîne vide "" au lieu de null pour éviter les erreurs Flutter
  // Si imageUrl est undefined, null, ou n'existe pas, on utilise une chaîne vide
  if (imageUrlValue === undefined || imageUrlValue === null) {
    imageUrlValue = '';
  } else {
    // Si c'est un tableau, prendre le premier élément
    if (Array.isArray(imageUrlValue)) {
      imageUrlValue = imageUrlValue.length > 0 ? imageUrlValue[0] : '';
    }
    
    // Convertir en chaîne si nécessaire
    imageUrlValue = imageUrlValue ? String(imageUrlValue) : '';
    
    // Traiter l'URL d'image
    if (imageUrlValue && imageUrlValue.trim() !== '') {
      // Vérifier si c'est une data URI (ne pas la convertir)
      const isDataUri = /^data:image\//i.test(imageUrlValue);
      const hasAbsoluteUrl = /^https?:\/\//i.test(imageUrlValue);
      
      if (!isDataUri && !hasAbsoluteUrl) {
        // Chemin relatif : le convertir en URL absolue
        imageUrlValue = `${buildBaseUrl(req)}${imageUrlValue}`;
      }
      // Sinon, garder la valeur telle quelle (data URI ou URL absolue)
    } else {
      // Utiliser une chaîne vide au lieu de null
      imageUrlValue = '';
    }
  }
  
  // Créer un nouvel objet avec toutes les propriétés, garantissant imageUrl et imageLink
  // S'assurer que tous les champs requis sont présents avec des valeurs valides
  // Utiliser une chaîne vide "" au lieu de null pour imageUrl pour éviter les erreurs Flutter
  const formattedProduct = {
    _id: productObj._id,
    title: productObj.title || '',
    description: productObj.description || '',
    carat: productObj.carat || 0,
    weight: productObj.weight || 0,
    price: productObj.price || 0,
    stock: productObj.stock !== undefined ? productObj.stock : 0,
    imageUrl: imageUrlValue, // Toujours une string (vide ou avec URL)
    imageLink: imageUrlValue, // Toujours une string (vide ou avec URL)
    sellerId: productObj.sellerId,
    goldPriceId: productObj.goldPriceId || null,
    createdAt: productObj.createdAt,
    updatedAt: productObj.updatedAt,
    __v: productObj.__v
  };
  
  return formattedProduct;
};

// Route pour récupérer la liste des produits disponibles (seulement en stock)
export const getProducts = async (req, res) => {
  try {
    const { name, carat, priceMin, priceMax, weightMin, weightMax } = req.query;
    
    // Filtrer uniquement les produits en stock (stock > 0)
    let filter = { stock: { $gt: 0 } };

    // Filtre par nom (recherche dans le titre)
    if (name) {
      filter.title = { $regex: name, $options: "i" };
    }

    // Filtre par carat
    if (carat) {
      filter.carat = Number(carat);
    }

    // Filtre par prix
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }

    // Filtre par poids
    if (weightMin || weightMax) {
      filter.weight = {};
      if (weightMin) filter.weight.$gte = Number(weightMin);
      if (weightMax) filter.weight.$lte = Number(weightMax);
    }

    const products = await Product.find(filter)
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

// Route pour consulter les détails d'un produit
export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate("sellerId", "name boutique")
      .populate("goldPriceId");

    if (!product) {
      return res.status(404).json({ 
        message: "Produit non trouvé." 
      });
    }

    // Vérifier si le produit est en stock
    if (product.stock <= 0) {
      return res.status(404).json({ 
        message: "Produit non disponible (hors stock)." 
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

// Route pour rechercher des produits par nom
export const searchProductsByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ 
        message: "Le paramètre 'name' est requis." 
      });
    }

    const products = await Product.find({
      title: { $regex: name, $options: "i" },
      stock: { $gt: 0 } // Seulement les produits en stock
    })
      .populate("sellerId", "name boutique")
      .populate("goldPriceId")
      .sort({ createdAt: -1 });

    res.json({
      message: "Recherche effectuée avec succès",
      count: products.length,
      products: products.map(product => formatProductResponse(product, req))
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la recherche.", 
      error: error.message 
    });
  }
};

// Route pour filtrer par carat
export const filterByCarat = async (req, res) => {
  try {
    const { carat } = req.query;

    if (!carat) {
      return res.status(400).json({ 
        message: "Le paramètre 'carat' est requis." 
      });
    }

    const products = await Product.find({
      carat: Number(carat),
      stock: { $gt: 0 } // Seulement les produits en stock
    })
      .populate("sellerId", "name boutique")
      .populate("goldPriceId")
      .sort({ createdAt: -1 });

    res.json({
      message: "Filtrage par carat effectué avec succès",
      count: products.length,
      products: products.map(product => formatProductResponse(product, req))
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors du filtrage par carat.", 
      error: error.message 
    });
  }
};

// Route pour filtrer par prix
export const filterByPrice = async (req, res) => {
  try {
    const { priceMin, priceMax } = req.query;

    if (!priceMin && !priceMax) {
      return res.status(400).json({ 
        message: "Au moins un paramètre 'priceMin' ou 'priceMax' est requis." 
      });
    }

    const filter = { stock: { $gt: 0 } };
    filter.price = {};
    
    if (priceMin) filter.price.$gte = Number(priceMin);
    if (priceMax) filter.price.$lte = Number(priceMax);

    const products = await Product.find(filter)
      .populate("sellerId", "name boutique")
      .populate("goldPriceId")
      .sort({ createdAt: -1 });

    res.json({
      message: "Filtrage par prix effectué avec succès",
      count: products.length,
      products: products.map(product => formatProductResponse(product, req))
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors du filtrage par prix.", 
      error: error.message 
    });
  }
};

