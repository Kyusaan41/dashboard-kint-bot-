 # 🏪 API du Marché Gacha pour NyxNode Bot
 
 ## 📚 Vue d'ensemble
 
 Ce système permet aux utilisateurs de lister leurs cartes Gacha à la vente et à d'autres utilisateurs de les acheter avec une monnaie virtuelle (Orbes). Il s'intègre au système de collection existant.
 
 ## 🎯 Fonctionnalités
 
 - ✅ Lister une carte à la vente à un prix défini.
 - ✅ Retirer une carte de la collection du vendeur lors de la mise en vente.
 - ✅ Afficher toutes les offres actives sur le marché.
 - ✅ Permettre l'achat d'une carte, transférant la carte à l'acheteur et les orbes au vendeur.
 - ✅ Annuler une de ses propres ventes.
 
 ## 📊 Structure des données
 
 ### Objet "Listing" (Offre sur le marché)
 ```json
 {
   "listingId": "uuid-string-12345",
   "sellerId": "123456789",
   "sellerUsername": "NomVendeur",
   "cardId": "ds_004",
   "cardInfo": {
     "name": "Nezuko Kamado",
     "rarity": "Rare",
     "power": 58,
     "description": "La démone qui protège les humains",
     "malId": 146157,
     "anime": "Demon Slayer"
   },
   "price": 5000,
   "listedAt": "2024-01-20T12:00:00.000Z"
 }
 ```
 
 ## 🔌 Endpoints API
 
 ### 1. Récupérer toutes les offres du marché
 
 **Endpoint:** `GET /api/gacha/marketplace`
 
 **Réponse:**
 ```json
 {
   "success": true,
   "data": [
     {
       "listingId": "uuid-string-12345",
       "sellerUsername": "NomVendeur",
       "cardId": "ds_004",
       "cardInfo": { "... " },
       "price": 5000,
       "listedAt": "2024-01-20T12:00:00.000Z"
     }
   ]
 }
 ```
 
 ### 2. Mettre une carte en vente
 
 **Endpoint:** `POST /api/gacha/marketplace/sell`
 
 **Logique:**
 1. Le bot vérifie si le vendeur (`userId`) possède la carte (`cardId`).
 2. Le bot retire la carte de la collection du vendeur.
 3. Le bot crée une nouvelle offre sur le marché.
 
 **Body:**
 ```json
 {
   "userId": "123456789",
   "username": "NomVendeur",
   "cardId": "ds_004",
   "price": 5000
 }
 ```
 
 **Réponse:**
 ```json
 {
   "success": true,
   "message": "Carte listée avec succès.",
   "data": {
     "listingId": "new-uuid-string-67890",
     "sellerId": "123456789",
     "cardId": "ds_004",
     "price": 5000,
     "listedAt": "2024-01-20T13:00:00.000Z"
   }
 }
 ```
 
 ### 3. Acheter une carte
 
 **Endpoint:** `POST /api/gacha/marketplace/buy`
 
 **Logique:**
 1. Le bot vérifie si l'offre (`listingId`) existe.
 2. Le bot vérifie si l'acheteur (`buyerId`) a assez d'orbes.
 3. Le bot retire les orbes de l'acheteur.
 4. Le bot ajoute les orbes au vendeur.
 5. Le bot ajoute la carte à la collection de l'acheteur.
 6. Le bot supprime l'offre du marché.
 
 **Body:**
 ```json
 {
   "buyerId": "987654321",
   "buyerUsername": "NomAcheteur",
   "listingId": "uuid-string-12345"
 }
 ```
 
 **Réponse:**
 ```json
 {
   "success": true,
   "message": "Achat réussi ! La carte a été ajoutée à votre collection."
 }
 ```
 
 ### 4. Annuler une vente
 
 **Endpoint:** `DELETE /api/gacha/marketplace/sell`
 
 **Logique:**
 1. Le bot vérifie que l'utilisateur (`userId`) est bien le vendeur de l'offre (`listingId`).
 2. Le bot supprime l'offre du marché.
 3. Le bot restitue la carte à la collection du vendeur.
 
 **Query Params:** `?listingId=uuid-string-12345&userId=123456789`
 
 **Réponse:**
 ```json
 {
   "success": true,
   "message": "Votre offre a été annulée et la carte a été retournée dans votre collection."
 }
 ```