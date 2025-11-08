// middleware/upload.middleware.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Obtenir le répertoire courant (équivalent à __dirname en ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer le dossier uploads/products s'il n'existe pas
const uploadsDir = path.join(__dirname, "../uploads/products");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique avec timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  // Accepter seulement les images
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers images (jpeg, jpg, png, gif, webp) sont autorisés."));
  }
};

// Configuration de Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: fileFilter
});

// Export du middleware pour une seule image (optionnelle)
export const uploadProductImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    // Si l'erreur est "Unexpected field" pour le champ image, on l'ignore
    // car l'image est optionnelle
    if (err && err.code === "LIMIT_UNEXPECTED_FILE") {
      // Si le champ image existe mais n'est pas un fichier, on l'ignore
      return next();
    }
    // Pour les autres erreurs, on les propage
    if (err) {
      return next(err);
    }
    next();
  });
};

