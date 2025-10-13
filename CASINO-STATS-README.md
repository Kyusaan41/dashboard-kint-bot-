# 🎰 Système de Statistiques du Casino

## 📋 Vue d'ensemble

Le système de statistiques du casino permet de tracker et afficher 3 types de classements :

1. **💎 Plus gros gain** - Le plus gros gain unique de chaque joueur
2. **🏆 Nombre de victoires** - Le nombre total de parties gagnées
3. **💰 Gains total** - La somme totale de tous les gains

## 🗂️ Architecture

### Fichiers créés/modifiés :

```
dashboard-bot/
├── data/
│   └── casino-stats.json              # Stockage JSON des statistiques
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── casino/
│   │   │       └── stats/
│   │   │           └── route.ts       # API de gestion des stats
│   │   └── dashboard/
│   │       └── mini-jeu/
│   │           └── casino/
│   │               └── page.tsx       # Interface utilisateur (modifié)
│   └── config/
│       └── api.ts                     # Configuration endpoints (modifié)
└── test-casino-stats.js               # Script de test
```

## 🔧 Fonctionnement

### 1. Enregistrement des gains

Quand un joueur gagne au casino :

```typescript
// Dans page.tsx, ligne ~896
if (session?.user?.name) {
    recordWin(session.user.name, result.amount);
}
```

La fonction `recordWin()` envoie les données à l'API :

```typescript
POST /api/casino/stats
Body: { username: "Player1", winAmount: 5000 }
```

### 2. Mise à jour des statistiques

L'API `/api/casino/stats` (route.ts) :
- Lit le fichier `casino-stats.json`
- Trouve ou crée le joueur
- Met à jour ses stats :
  - `winCount` : +1
  - `totalWins` : +winAmount
  - `biggestWin` : max(ancien, nouveau)
- Sauvegarde dans le fichier JSON

### 3. Affichage des classements

L'interface affiche 3 onglets qui chargent les données triées :

```typescript
GET /api/casino/stats?type=biggestWin
GET /api/casino/stats?type=winCount
GET /api/casino/stats?type=totalWins
```

## 📊 Structure des données

### casino-stats.json

```json
{
  "players": [
    {
      "username": "Player1",
      "biggestWin": 8000,
      "totalWins": 15000,
      "winCount": 3,
      "lastUpdated": "2024-01-15T10:30:00.000Z"
    },
    {
      "username": "Player2",
      "biggestWin": 4500,
      "totalWins": 7500,
      "winCount": 2,
      "lastUpdated": "2024-01-15T10:25:00.000Z"
    }
  ]
}
```

## 🧪 Test du système

### Prérequis
1. Lancer le serveur Next.js :
   ```bash
   npm run dev
   ```

2. Dans un autre terminal, lancer le script de test :
   ```bash
   node test-casino-stats.js
   ```

### Résultat attendu

Le script va :
1. ✅ Enregistrer 6 gains pour 3 joueurs différents
2. ✅ Afficher les 3 classements triés
3. ✅ Vérifier que les stats sont correctement calculées

### Test manuel

1. Ouvrir le casino : `http://localhost:3000/dashboard/mini-jeu/casino`
2. Jouer quelques parties et gagner
3. Vérifier que les onglets du leaderboard affichent les bonnes valeurs

## 🔍 Débogage

### Vérifier le fichier JSON

```powershell
Get-Content "data\casino-stats.json" | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Logs de l'API

Les logs apparaissent dans la console du serveur Next.js :
- `[TOP WINS] Chargé depuis l'API: X joueurs`
- Erreurs éventuelles dans `console.error()`

### Réinitialiser les stats

Pour remettre à zéro :

```powershell
Set-Content "data\casino-stats.json" '{"players":[]}'
```

## 🎯 Fonctionnalités

### ✅ Implémenté

- [x] Stockage JSON local des statistiques
- [x] API GET pour récupérer les classements triés
- [x] API POST pour enregistrer les gains
- [x] Interface avec 3 onglets de classement
- [x] Top 20 joueurs par catégorie
- [x] Mise à jour automatique après chaque gain
- [x] Calcul automatique des 3 statistiques

### 🔮 Améliorations possibles

- [ ] Synchronisation avec le bot Discord (NyxNode)
- [ ] Historique des gains par joueur
- [ ] Statistiques par période (jour/semaine/mois)
- [ ] Graphiques d'évolution
- [ ] Badges/achievements selon les stats
- [ ] Export des données en CSV

## 🚨 Important

### Comptage des victoires

Actuellement, **toutes les victoires** sont comptées, même les petits gains de 2 symboles.

Pour changer ce comportement, modifier dans `page.tsx` ligne ~896 :

```typescript
// Option 1 : Compter seulement les gros gains (3 symboles)
if (result.lineType === 'three' && session?.user?.name) {
    recordWin(session.user.name, result.amount);
}

// Option 2 : Compter seulement les gains > mise
if (result.amount > bet && session?.user?.name) {
    recordWin(session.user.name, result.amount);
}
```

### Persistance des données

Les données sont stockées dans `data/casino-stats.json` :
- ✅ Persistent entre les redémarrages du serveur
- ✅ Partagées entre tous les utilisateurs
- ⚠️ Non synchronisées avec le bot Discord (pour l'instant)
- ⚠️ Pas de backup automatique (faire des sauvegardes manuelles)

## 📞 Support

En cas de problème :
1. Vérifier que le fichier `data/casino-stats.json` existe
2. Vérifier les permissions d'écriture sur le dossier `data/`
3. Consulter les logs du serveur Next.js
4. Lancer le script de test pour diagnostiquer