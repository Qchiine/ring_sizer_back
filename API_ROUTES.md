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
  - `
  priceMax` (optionnel): Prix maximum
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
2. **Stock:** Seuls les produits avec `stock > 0` sont affichés
3. **Mesures:** Les mesures sont automatiquement liées à l'utilisateur lors de l'enregistrement
4. **Profil:** Le profil est créé automatiquement lors de l'inscription
5. **Rôle:** Par défaut, tous les nouveaux utilisateurs ont le rôle "Utilisateur"

