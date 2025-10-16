# API de Collection Gacha pour NyxNode Bot

## 📚 Vue d'ensemble

Ce système permet de stocker et gérer les collections de cartes anime des utilisateurs. Les cartes sont organisées par anime et les doublons sont comptabilisés avec un système de compteur (x2, x3, etc.).

## 🎯 Fonctionnalités

- ✅ Stockage des collections en JSON
- ✅ Organisation des cartes par anime
- ✅ Gestion des doublons avec compteur
- ✅ 3 nouvelles séries ajoutées : Dragon Ball Z, Bleach, Hunter x Hunter
- ✅ Total de 63 cartes disponibles (9 cartes × 7 animes)
- ✅ API REST pour le bot Discord

## 📊 Structure des données

### Collection utilisateur
```json
{
  "userId": "123456789",
  "username": "NomUtilisateur",
  "collections": [
    {
      "anime": "Demon Slayer",
      "cards": [
        {
          "cardId": "ds_001",
          "count": 3,
          "obtainedAt": "2024-01-15T10:30:00.000Z"
        }
      ]
    }
  ],
  "totalCards": 15,
  "uniqueCards": 8,
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

## 🔌 Endpoints API

### 1. Récupérer la collection d'un utilisateur

**Endpoint:** `GET /api/bot/gacha/collection/[userId]`

**Exemple:**
```bash
GET http://localhost:3002/api/bot/gacha/collection/123456789
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "userId": "123456789",
    "username": "NomUtilisateur",
    "collections": [
      {
        "anime": "Demon Slayer",
        "cards": [
          {
            "cardId": "ds_004",
            "count": 2,
            "obtainedAt": "2024-01-15T10:30:00.000Z",
            "cardInfo": {
              "name": "Nezuko Kamado",
              "rarity": "Rare",
              "power": 58,
              "description": "La démone qui protège les humains",
              "malId": 146157
            }
          }
        ]
      }
    ],
    "totalCards": 15,
    "uniqueCards": 8,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Ajouter une carte à la collection

**Endpoint:** `POST /api/gacha/collection`

**Body:**
```json
{
  "userId": "123456789",
  "username": "NomUtilisateur",
  "cardId": "ds_004",
  "anime": "Demon Slayer"
}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "userId": "123456789",
    "username": "NomUtilisateur",
    "collections": [...],
    "totalCards": 16,
    "uniqueCards": 8,
    "lastUpdated": "2024-01-15T10:35:00.000Z"
  }
}
```

### 3. Supprimer une carte (pour les trades)

**Endpoint:** `DELETE /api/gacha/collection?userId=123456789&cardId=ds_004`

**Réponse:**
```json
{
  "success": true,
  "data": {
    "userId": "123456789",
    "username": "NomUtilisateur",
    "collections": [...],
    "totalCards": 15,
    "uniqueCards": 8,
    "lastUpdated": "2024-01-15T10:40:00.000Z"
  }
}
```

## 🎴 Liste des cartes disponibles

### Demon Slayer (9 cartes)
- **Commun:** Tanjiro, Zenitsu, Inosuke
- **Rare:** Nezuko, Giyu
- **Épique:** Rengoku, Tengen
- **Légendaire:** Muzan
- **Mythique:** Yoriichi

### Naruto (9 cartes)
- **Commun:** Naruto, Sakura, Rock Lee
- **Rare:** Sasuke, Kakashi
- **Épique:** Itachi, Jiraiya
- **Légendaire:** Minato
- **Mythique:** Madara

### One Piece (9 cartes)
- **Commun:** Luffy, Zoro, Nami
- **Rare:** Sanji, Ace
- **Épique:** Law, Boa Hancock
- **Légendaire:** Shanks
- **Mythique:** Gol D. Roger

### Attack on Titan (7 cartes)
- **Commun:** Eren, Mikasa
- **Rare:** Armin, Levi
- **Épique:** Reiner
- **Légendaire:** Eren (Titan Originel)
- **Mythique:** Ymir Fritz

### My Hero Academia (7 cartes)
- **Commun:** Deku, Ochaco
- **Rare:** Bakugo, Todoroki
- **Épique:** Endeavor
- **Légendaire:** All Might (Prime)
- **Mythique:** All For One

### Jujutsu Kaisen (7 cartes)
- **Commun:** Yuji, Megumi
- **Rare:** Nobara, Maki
- **Épique:** Toji
- **Légendaire:** Gojo
- **Mythique:** Sukuna

### Dragon Ball Z (9 cartes) ✨ NOUVEAU
- **Commun:** Goku, Gohan, Piccolo
- **Rare:** Vegeta, Trunks
- **Épique:** Majin Buu, Cell
- **Légendaire:** Goku Super Saiyan
- **Mythique:** Beerus

### Bleach (9 cartes) ✨ NOUVEAU
- **Commun:** Ichigo, Rukia, Orihime
- **Rare:** Renji, Byakuya
- **Épique:** Kenpachi, Toshiro
- **Légendaire:** Aizen
- **Mythique:** Yhwach

### Hunter x Hunter (9 cartes) ✨ NOUVEAU
- **Commun:** Gon, Killua, Kurapika
- **Rare:** Leorio, Hisoka
- **Épique:** Chrollo, Netero
- **Légendaire:** Meruem
- **Mythique:** Adult Gon

## 💻 Exemple d'utilisation dans le bot Discord

### Commande: `/gacha collection`

```javascript
// Dans votre bot Discord (NyxNode)
const axios = require('axios');

// Récupérer la collection d'un utilisateur
async function getUserCollection(userId) {
    try {
        const response = await axios.get(
            `http://localhost:3002/api/bot/gacha/collection/${userId}`
        );
        
        if (response.data.success) {
            const collection = response.data.data;
            
            // Créer un embed Discord
            const embed = {
                title: `📚 Collection de ${collection.username}`,
                color: 0x8b5cf6,
                fields: [
                    {
                        name: '📊 Statistiques',
                        value: `**Total:** ${collection.totalCards} cartes\n**Uniques:** ${collection.uniqueCards} cartes\n**Animes:** ${collection.collections.length}`,
                        inline: false
                    }
                ]
            };
            
            // Ajouter chaque anime
            for (const animeCollection of collection.collections) {
                const cardsList = animeCollection.cards
                    .map(card => {
                        const count = card.count > 1 ? ` x${card.count}` : '';
                        return `• ${card.cardInfo.name} (${card.cardInfo.rarity})${count}`;
                    })
                    .join('\n');
                
                embed.fields.push({
                    name: `🎌 ${animeCollection.anime}`,
                    value: cardsList || 'Aucune carte',
                    inline: false
                });
            }
            
            return embed;
        }
    } catch (error) {
        console.error('Erreur:', error);
        return null;
    }
}

// Exemple d'utilisation
const userId = interaction.user.id;
const collectionEmbed = await getUserCollection(userId);
await interaction.reply({ embeds: [collectionEmbed] });
```

### Commande: `/gacha trade`

```javascript
// Échanger une carte entre deux utilisateurs
async function tradeCard(fromUserId, toUserId, cardId) {
    try {
        // 1. Retirer la carte de l'utilisateur 1
        await axios.delete(
            `http://localhost:3002/api/gacha/collection?userId=${fromUserId}&cardId=${cardId}`
        );
        
        // 2. Récupérer les infos de la carte
        const card = ANIME_CARDS.find(c => c.id === cardId);
        
        // 3. Ajouter la carte à l'utilisateur 2
        await axios.post('http://localhost:3002/api/gacha/collection', {
            userId: toUserId,
            username: 'Username2',
            cardId: cardId,
            anime: card.anime
        });
        
        return { success: true };
    } catch (error) {
        console.error('Erreur lors du trade:', error);
        return { success: false, error: error.message };
    }
}
```

## 📁 Fichiers créés

1. **`data/gacha-collections.json`** - Stockage des collections
2. **`src/types/collection.ts`** - Types TypeScript
3. **`src/app/api/gacha/collection/route.ts`** - API principale
4. **`src/app/api/bot/gacha/collection/[userId]/route.ts`** - API pour le bot
5. **`src/app/dashboard/mini-jeu/gacha/collection/page.tsx`** - Page de collection
6. **`src/app/dashboard/mini-jeu/gacha/cards.ts`** - 27 nouvelles cartes ajoutées

## 🚀 Prochaines étapes

Pour implémenter le système de trade dans le bot Discord :

1. Créer une commande `/gacha trade @user [cardId]`
2. Vérifier que l'utilisateur possède la carte
3. Créer un système de confirmation (boutons Discord)
4. Utiliser les endpoints DELETE et POST pour effectuer le trade
5. Envoyer une notification aux deux utilisateurs

## 🔒 Sécurité

⚠️ **Important:** Dans un environnement de production, ajoutez :
- Authentification par token pour les endpoints du bot
- Validation des données entrantes
- Rate limiting
- Logs des transactions
- Système de rollback en cas d'erreur

## 📝 Notes

- Les images sont chargées dynamiquement depuis l'API Jikan (MyAnimeList)
- Tous les IDs MyAnimeList ont été vérifiés
- Le système de pity (100 tirages = Mythique garanti) est conservé
- Les collections sont sauvegardées automatiquement à chaque tirage