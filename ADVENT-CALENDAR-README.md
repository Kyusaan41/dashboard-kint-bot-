# Calendrier de l'Avent - Intégration Bot

## 📋 Description
Le calendrier de l'Avent est un système de récompenses quotidiennes disponible du 1er au 24 décembre. Chaque jour, les utilisateurs peuvent réclamer une récompense différente (pièces, jetons, orbes).

## 🔧 Installation

### 1. Ajouter la route au bot
Placez le fichier `advent-calendar-route.js` dans le dossier `routes/` de votre bot.

### 2. Importer la route dans votre serveur principal
Dans votre fichier principal du bot (ex: `index.js` ou `app.js`), ajoutez :

```javascript
const adventCalendarRoutes = require('./routes/advent-calendar-route');

// Utilisez la route
app.use('/api', adventCalendarRoutes);
```

### 3. Créer le dossier de données
Le bot créera automatiquement le dossier `data/` et le fichier `advent-calendar-bot.json` pour stocker les récompenses réclamées.

## 📡 API Endpoints

### GET `/api/advent-calendar/status`
Retourne le statut du calendrier et la liste des récompenses disponibles.

**Réponse :**
```json
{
  "active": true,
  "currentDay": 5,
  "calendar": [
    {
      "day": 1,
      "type": "currency",
      "amount": 200,
      "name": "Pièces d'or",
      "description": "200 pièces scintillantes",
      "unlocked": true,
      "claimed": false
    }
  ]
}
```

### GET `/api/advent-calendar/:userId/claimed`
Retourne la liste des récompenses déjà réclamées par un utilisateur.

**Réponse :**
```json
{
  "claimed": [1, 3, 5]
}
```

### POST `/api/advent-calendar/:userId/claim`
Réclame une récompense pour un utilisateur.

**Body :**
```json
{
  "day": 1
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Récompense du jour 1 réclamée avec succès !",
  "reward": {
    "day": 1,
    "type": "currency",
    "amount": 200,
    "name": "Pièces d'or",
    "description": "200 pièces scintillantes"
  }
}
```

## ⚙️ Personnalisation

### Modifier les récompenses
Éditez le tableau `ADVENT_REWARDS` dans `advent-calendar-route.js` :

```javascript
const ADVENT_REWARDS = [
  { day: 1, type: 'currency', amount: 100, name: 'Pièces d\'or', description: '100 pièces scintillantes' },
  { day: 2, type: 'tokens', amount: 50, name: 'Jetons magiques', description: '50 jetons pour le casino' },
  // ...
];
```

### Types de récompenses supportés
- `currency` : Pièces d'or
- `tokens` : Jetons pour le casino
- `orbs` : Orbes pour les gachas

### Logique de distribution
Adaptez la logique dans la fonction `claimReward` selon vos systèmes existants :

```javascript
switch (reward.type) {
  case 'currency':
    // Votre logique pour ajouter des pièces
    break;
  case 'tokens':
    // Votre logique pour ajouter des jetons
    break;
  case 'orbs':
    // Votre logique pour ajouter des orbes
    break;
}
```

## 🔒 Sécurité
- Vérification automatique de la période Noël (1-24 décembre)
- Protection contre les réclamations multiples
- Validation des jours débloqués

## 📊 Stockage
Les données sont stockées dans `data/advent-calendar-bot.json` :
```json
{
  "userId1": [1, 3, 5],
  "userId2": [1, 2, 4]
}
```

## 🎄 Fonctionnement
1. Le calendrier n'est actif que du 1er au 24 décembre
2. Chaque jour débloque automatiquement une nouvelle case
3. Les utilisateurs peuvent réclamer une récompense par jour
4. Les récompenses sont distribuées immédiatement
5. L'état est sauvegardé de manière persistante

## 🚀 Test
Pour tester le calendrier avant Noël, modifiez temporairement la fonction `isChristmasPeriod()` :

```javascript
function isChristmasPeriod() {
  return true; // Toujours actif pour les tests
}