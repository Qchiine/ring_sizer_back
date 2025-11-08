// controller/catalog.controller.js
import Product from "../models/product.model.js";

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
      products
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
      product
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
      products
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
      products
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
      products
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors du filtrage par prix.", 
      error: error.message 
    });
  }
};

