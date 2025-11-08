# 🧪 Tests Postman - Routes Vendeur

## 📍 URL de Base
```
http://localhost:5000
```

## 🔐 1. INSCRIPTION VENDEUR

**POST** `http://localhost:5000/api/auth/register-seller`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "John Seller",
  "email": "seller@example.com",
  "password": "password123",
  "shopName": "Ma Boutique d'Or",
  "description": "Spécialisée en bijoux en or 18k, 22k et 24k"
}
```

**Réponse attendue:** Token JWT + informations utilisateur

---

## 🔐 2. CONNEXION VENDEUR

**POST** `http://localhost:5000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "seller@example.com",
  "password": "password123"
}
```

**Réponse attendue:** Token JWT

**⚠️ IMPORTANT:** Copiez le token pour l'utiliser dans les autres requêtes !

---

## 🏪 3. PROFIL BOUTIQUE

### GET Profil Boutique
**GET** `http://localhost:5000/api/seller/shop-profile`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN_ICI
```

### PUT Profil Boutique
**PUT** `http://localhost:5000/api/seller/shop-profile`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN_ICI
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "shopName": "Nouveau Nom",
  "description": "Nouvelle description"
}
```

---

## 📦 4. PRODUITS

### POST Créer un Produit (avec image)
**POST** `http://localhost:5000/api/seller/products`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN_ICI
```

**Body (form-data):**
- Dans Postman, sélectionnez l'onglet "Body"
- Cochez "form-data"
- Ajoutez les champs suivants :

| Key | Value | Type | Requis |
|-----|-------|------|--------|
| `title` | Bague en or 18k | Text | ✅ Oui |
| `description` | Bague élégante en or | Text | ❌ Non |
| `carat` | 18 | Text | ✅ Oui (18, 22 ou 24) |
| `weight` | 5.2 | Text | ✅ Oui |
| `price` | 250 | Text | ✅ Oui |
| `stock` | 10 | Text | ✅ Oui |
| `image` | [Sélectionner un fichier] | **File** ⚠️ | ❌ Non |

**⚠️ IMPORTANT pour l'image :**
- Pour le champ `image`, changez le type de "Text" à "File" dans le menu déroulant à droite
- Cliquez sur "Select Files" et choisissez un fichier image (jpeg, jpg, png, gif, webp)
- Taille maximale : 5MB
- L'image est optionnelle, vous pouvez créer un produit sans image

### GET Tous mes Produits
**GET** `http://localhost:5000/api/seller/products`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN_ICI
```

### GET Un Produit
**GET** `http://localhost:5000/api/seller/products/:productId`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN_ICI
```

**Remplacez `:productId` par l'ID réel du produit**

### PUT Modifier un Produit
**PUT** `http://localhost:5000/api/seller/products/:productId`

**⚠️ Remplacez `:productId` par l'ID réel du produit (ex: `http://localhost:5000/api/seller/products/507f1f77bcf86cd799439011`)**

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN_ICI
```

**Body (form-data):**
- Dans Postman, sélectionnez l'onglet "Body"
- Cochez "form-data"
- Ajoutez les champs suivants (tous sont optionnels - modifiez seulement ce que vous voulez changer) :

| Key | Value | Type |
|-----|-------|------|
| `title` | Nouveau titre | Text |
| `description` | Nouvelle description | Text |
| `carat` | 22 | Text |
| `weight` | 6.5 | Text |
| `price` | 300 | Text |
| `stock` | 15 | Text |
| `image` | [Sélectionner un fichier] | **File** ⚠️ |

**⚠️ IMPORTANT pour l'image :**
- Pour le champ `image`, changez le type de "Text" à "File" dans le menu déroulant à droite
- Cliquez sur "Select Files" et choisissez un fichier image
- Si vous ne voulez pas changer l'image, ne mettez pas ce champ

**Exemple de body minimal (modifier seulement le prix) :**
- `price`: 300

**Exemple complet :**
- `title`: Bague en or 22k
- `price`: 300
- `stock`: 15
- `image`: [fichier image]

### DELETE Supprimer un Produit
**DELETE** `http://localhost:5000/api/seller/products/:productId`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN_ICI
```

### PATCH Mettre à jour le Stock
**PATCH** `http://localhost:5000/api/seller/products/:productId/stock`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN_ICI
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "stock": 20
}
```

---

## 🛒 5. COMMANDES

### GET Toutes mes Commandes
**GET** `http://localhost:5000/api/seller/orders`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN_ICI
```

### GET Une Commande
**GET** `http://localhost:5000/api/seller/orders/:orderId`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN_ICI
```

### PATCH Mettre à jour le Statut
**PATCH** `http://localhost:5000/api/seller/orders/:orderId/status`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN_ICI
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "status": "processing"
}
```

**Statuts possibles:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`

---

## 📊 6. STATISTIQUES

### GET Statistiques
**GET** `http://localhost:5000/api/seller/statistics`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN_ICI
```

---

## ⚠️ ORDRE DE TEST RECOMMANDÉ

1. **Inscription Vendeur** → Récupérer le token
2. **Créer un Produit** → Récupérer l'ID du produit
3. **Lister mes Produits** → Vérifier que le produit apparaît
4. **Modifier le Produit** → Tester la mise à jour
5. **Mettre à jour le Stock** → Tester la route stock
6. **Voir les Statistiques** → Vérifier les compteurs
7. **Voir les Commandes** → (S'il y a des commandes)

---

## 🔑 Variables Postman (Optionnel)

Créez une variable d'environnement dans Postman:
- **Variable:** `token`
- **Valeur:** (Le token JWT après connexion)

Ensuite, utilisez `{{token}}` dans le header Authorization:
```
Authorization: Bearer {{token}}
```

