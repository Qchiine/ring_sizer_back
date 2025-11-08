# Documentation des Routes API

## Base URL
```
http://localhost:5000/api
```

---

## 1. 🔐 Module d'Authentification (`/api/auth`)

### POST `/api/auth/register`
**Inscription avec rôle "Utilisateur"**
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Inscription réussie",
    "token": "jwt_token_here",
    "user": {
      "userId": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Utilisateur"
    }
  }
  ```

### POST `/api/auth/login`
**Connexion avec génération de token**
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Connexion réussie",
    "token": "jwt_token_here",
    "user": {
      "userId": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Utilisateur"
    }
  }
  ```

### POST `/api/auth/register-seller`
**Inscription pour vendeur avec création de profil boutique**
- **Body:**
  ```json
  {
    "name": "John Seller",
    "email": "seller@example.com",
    "password": "password123",
    "shopName": "Ma Boutique d'Or",
    "description": "Spécialisée en bijoux en or 18k, 22k et 24k"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Inscription vendeur réussie",
    "token": "jwt_token_here",
    "user": {
      "userId": "...",
      "name": "John Seller",
      "email": "seller@example.com",
      "role": "Vendeur",
      "boutique": {
        "shopName": "Ma Boutique d'Or",
        "description": "Spécialisée en bijoux en or 18k, 22k et 24k"
      }
    }
  }
  ```

---

## 2. 📏 Module de Calcul de Taille (`/api/measurements`)

**⚠️ Toutes les routes nécessitent une authentification (header: `Authorization: Bearer <token>`)**

### POST `/api/measurements`
**Enregistrer une mesure (taille de bague ou bracelet)**
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "type": "bague",
    "valueMm": 52.5
  }
  ```
- **Response:**
  ```json
  {
    "message": "Mesure enregistrée avec succès",
    "measurement": {
      "measurementId": "...",
      "userId": "...",
      "type": "bague",
      "valueMm": 52.5,
      "date": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### POST `/api/measurements/calculate`
**Calculer la taille standard à partir d'une mesure**
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "type": "bague",
    "valueMm": 52.5
  }
  ```
- **Response:**
  ```json
  {
    "message": "Taille standard calculée",
    "originalValue": 52.5,
    "type": "bague",
    "standardSize": 16
  }
  ```

### GET `/api/measurements`
**Consulter les mesures enregistrées d'un utilisateur**
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "message": "Mesures récupérées avec succès",
    "count": 2,
    "measurements": [
      {
        "measurementId": "...",
        "userId": "...",
        "type": "bague",
        "valueMm": 52.5,
        "standardSize": 16,
        "date": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

---

## 3. 🛍️ Module Catalogue Produits (`/api/catalog`)

### GET `/api/catalog`
**Récupérer la liste des produits disponibles (avec filtres)**
- **Query Parameters:**
  - `name` (optionnel): Recherche par nom
  - `carat` (optionnel): Filtre par carat
  - `priceMin` (optionnel): Prix minimum
  - `priceMax` (optionnel): Prix maximum
  - `weightMin` (optionnel): Poids minimum
  - `weightMax` (optionnel): Poids maximum
- **Exemple:** `/api/catalog?carat=18&priceMin=100&priceMax=500`
- **Response:**
  ```json
  {
    "message": "Produits récupérés avec succès",
    "count": 10,
    "products": [...]
  }
  ```
- **Note:** Affiche uniquement les produits en stock (stock > 0)

### GET `/api/catalog/search?name=...`
**Rechercher des produits par nom**
- **Query Parameter:** `name` (requis)
- **Response:** Liste des produits correspondants

### GET `/api/catalog/filter/carat?carat=...`
**Filtrer par carat**
- **Query Parameter:** `carat` (requis)
- **Response:** Liste des produits avec le carat spécifié

### GET `/api/catalog/filter/price?priceMin=...&priceMax=...`
**Filtrer par prix**
- **Query Parameters:** `priceMin` et/ou `priceMax` (au moins un requis)
- **Response:** Liste des produits dans la gamme de prix

### GET `/api/catalog/:productId`
**Consulter les détails d'un produit**
- **Params:** `productId` (requis)
- **Response:**
  ```json
  {
    "message": "Produit récupéré avec succès",
    "product": {
      "productId": "...",
      "title": "...",
      "description": "...",
      "carat": 18,
      "weight": 5.2,
      "price": 250,
      "stock": 10,
      "imageUrl": "...",
      "sellerId": {...},
      "goldPriceId": {...}
    }
  }
  ```
- **Note:** Retourne une erreur si le produit est hors stock

---

## 4. 👤 Module Profil Utilisateur (`/api/profile`)

**⚠️ Toutes les routes nécessitent une authentification (header: `Authorization: Bearer <token>`)**

### GET `/api/profile`
**Consulter le profil utilisateur**
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "message": "Profil récupéré avec succès",
    "user": {
      "userId": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Utilisateur",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "profile": {
      "profileId": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "mesures": [
      {
        "measurementId": "...",
        "type": "bague",
        "valueMm": 52.5,
        "standardSize": 16,
        "date": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

### PUT `/api/profile`
**Modifier les informations du profil**
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "John Updated",
    "email": "john.updated@example.com"
  }
  ```
- **Response:** Profil mis à jour avec les mesures liées

---

## 5. 🏪 Module Vendeur (`/api/seller`)

**⚠️ Toutes les routes nécessitent une authentification ET le rôle "Vendeur" (header: `Authorization: Bearer <token>`)**

### 5.1. Profil Boutique

#### GET `/api/seller/shop-profile`
**Récupérer le profil boutique du vendeur**
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "message": "Profil boutique récupéré avec succès",
    "shopProfile": {
      "shopName": "Ma Boutique d'Or",
      "description": "Spécialisée en bijoux en or",
      "sellerName": "John Seller",
      "email": "seller@example.com"
    }
  }
  ```

#### PUT `/api/seller/shop-profile`
**Mettre à jour le profil boutique**
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "shopName": "Nouveau Nom de Boutique",
    "description": "Nouvelle description"
  }
  ```
- **Response:** Profil boutique mis à jour

### 5.2. Gestion des Produits (CRUD)

#### POST `/api/seller/products`
**Créer un nouveau produit**
- **Headers:** `Authorization: Bearer <token>`
- **Content-Type:** `multipart/form-data` (pour l'upload d'image)
- **Body (form-data):**
  - `title` (requis): Titre du produit
  - `description` (optionnel): Description du produit
  - `carat` (requis): Carat (18, 22 ou 24)
  - `weight` (requis): Poids en grammes
  - `price` (requis): Prix en unité de devise
  - `stock` (requis): Quantité en stock (>= 0)
  - `goldPriceId` (optionnel): ID du prix de l'or lié
  - `image` (optionnel): Fichier image (jpeg, jpg, png, gif, webp, max 5MB)
- **Response:**
  ```json
  {
    "message": "Produit créé avec succès",
    "product": {
      "productId": "...",
      "title": "Bague en or 18k",
      "description": "Bague élégante",
      "carat": 18,
      "weight": 5.2,
      "price": 250,
      "stock": 10,
      "imageUrl": "/uploads/products/product-1234567890.jpg",
      "sellerId": {...},
      "goldPriceId": {...}
    }
  }
  ```

#### GET `/api/seller/products`
**Récupérer tous les produits du vendeur**
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "message": "Produits récupérés avec succès",
    "count": 5,
    "products": [...]
  }
  ```

#### GET `/api/seller/products/:productId`
**Récupérer un produit spécifique**
- **Headers:** `Authorization: Bearer <token>`
- **Params:** `productId` (requis)
- **Response:** Détails du produit

#### PUT `/api/seller/products/:productId`
**Modifier un produit**
- **Headers:** `Authorization: Bearer <token>`
- **Content-Type:** `multipart/form-data` (si upload d'image)
- **Params:** `productId` (requis)
- **Body (form-data):** Tous les champs sont optionnels (title, description, carat, weight, price, stock, goldPriceId, image)
- **Response:** Produit mis à jour

#### DELETE `/api/seller/products/:productId`
**Supprimer un produit**
- **Headers:** `Authorization: Bearer <token>`
- **Params:** `productId` (requis)
- **Response:**
  ```json
  {
    "message": "Produit supprimé avec succès"
  }
  ```

#### PATCH `/api/seller/products/:productId/stock`
**Mettre à jour le stock d'un produit**
- **Headers:** `Authorization: Bearer <token>`
- **Params:** `productId` (requis)
- **Body:**
  ```json
  {
    "stock": 15
  }
  ```
- **Response:** Produit avec stock mis à jour

### 5.3. Gestion des Commandes

#### GET `/api/seller/orders`
**Récupérer toutes les commandes des produits du vendeur**
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "message": "Commandes récupérées avec succès",
    "count": 3,
    "orders": [
      {
        "orderId": "...",
        "userId": {...},
        "productId": {...},
        "quantity": 1,
        "totalPrice": 250,
        "status": "pending",
        "date": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

#### GET `/api/seller/orders/:orderId`
**Récupérer une commande spécifique**
- **Headers:** `Authorization: Bearer <token>`
- **Params:** `orderId` (requis)
- **Response:** Détails de la commande

#### PATCH `/api/seller/orders/:orderId/status`
**Mettre à jour le statut d'une commande**
- **Headers:** `Authorization: Bearer <token>`
- **Params:** `orderId` (requis)
- **Body:**
  ```json
  {
    "status": "processing"
  }
  ```
- **Statuts possibles:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`
- **Response:** Commande avec statut mis à jour

### 5.4. Statistiques

#### GET `/api/seller/statistics`
**Récupérer les statistiques du vendeur**
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "message": "Statistiques récupérées avec succès",
    "statistics": {
      "productCount": 15,
      "averagePrice": 275.50,
      "orderCount": 8,
      "totalRevenue": 2204.00
    }
  }
  ```

---

## 🔒 Middleware d'Authentification

Le middleware `authenticate` sécurise les routes qui nécessitent une authentification.

**Utilisation:**
```javascript
import { authenticate } from "../middleware/auth.middleware.js";

router.use(authenticate); // Pour toutes les routes du router
// ou
router.get("/route", authenticate, handler); // Pour une route spécifique
```

**Header requis:**
```
Authorization: Bearer <jwt_token>
```

---

## 📝 Notes Importantes

1. **JWT Token:** Le token JWT expire après 7 jours
2. **Stock:** Seuls les produits avec `stock > 0` sont affichés dans le catalogue public
3. **Mesures:** Les mesures sont automatiquement liées à l'utilisateur lors de l'enregistrement
4. **Profil:** Le profil est créé automatiquement lors de l'inscription
5. **Rôle:** Par défaut, tous les nouveaux utilisateurs ont le rôle "Utilisateur"
6. **Vendeur:** Pour accéder aux routes `/api/seller/*`, l'utilisateur doit avoir le rôle "Vendeur"
7. **Upload d'images:** Les images doivent être au format jpeg, jpg, png, gif ou webp, avec une taille maximale de 5MB
8. **Carat:** Les valeurs de carat acceptées sont 18, 22 et 24
9. **Statut des commandes:** Les statuts possibles sont: `pending`, `processing`, `shipped`, `delivered`, `cancelled`
10. **Sécurité:** Un vendeur ne peut modifier/supprimer que ses propres produits et gérer uniquement les commandes de ses produits
