# 🎰 Intégration Casino avec le Bot Discord

## 📋 Vue d'ensemble

Le casino du dashboard est maintenant **entièrement connecté au bot Discord NyxNode**. Toutes les statistiques (jackpot, leaderboard, gains) sont enregistrées directement sur le bot via son API.

---

## 🔧 Configuration effectuée

### 1️⃣ Fichiers créés sur le bot

**Fichier:** `c:\Users\Kyusa\Documents\NyxNode\routes\casino-stats-route.js`

Ce fichier contient les routes API pour gérer les statistiques du casino :
- `GET /api/casino/stats?type=biggestWin|winCount|totalWins` - Récupérer le leaderboard
- `POST /api/casino/stats` - Enregistrer un gain
- `DELETE /api/casino/stats` - Réinitialiser les stats (admin)

**Fichier de données:** `c:\Users\Kyusa\Documents\NyxNode\casino_stats.json`

Structure des données :
```json
{
  "players": [
    {
      "username": "Kyusaan",
      "biggestWin": 5000,
      "winCount": 42,
      "totalWins": 15000,
      "jackpotCount": 2,
      "lastWinDate": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 2️⃣ Modifications dans `index.js` du bot

**Ligne ~91** - Import de la route :
```javascript
const casinoStatsRouter = require('./routes/casino-stats-route');
```

**Ligne ~335** - Montage de la route :
```javascript
app.use('/api/casino', casinoStatsRouter);
```

### 3️⃣ Modifications dans le dashboard

**Fichier:** `src/config/api.ts`
- Les endpoints du casino pointent maintenant vers l'API du bot (`http://193.70.34.25:20007`)

**Fichier:** `src/app/dashboard/mini-jeu/casino/page.tsx`
- La fonction `recordWin()` envoie maintenant `isJackpot` pour tracker les jackpots
- La fonction `loadTopWins()` est plus robuste et gère les erreurs
- Les logs sont améliorés pour le debugging

---

## 📊 Statistiques trackées

Le système enregistre pour chaque joueur :

| Statistique | Description | Affiché dans |
|------------|-------------|--------------|
| **biggestWin** | Le plus gros gain en une seule partie | Onglet "Plus Gros Gain" 💎 |
| **winCount** | Nombre total de victoires | Onglet "Nombre de Victoires" 🏆 |
| **totalWins** | Somme de tous les gains | Onglet "Total des Gains" 💰 |
| **jackpotCount** | Nombre de jackpots gagnés | *(Futur affichage)* |
| **lastWinDate** | Date du dernier gain | *(Métadonnée)* |

---

## 🚀 Comment tester

### 1. Vérifier que le bot est démarré
```bash
# Dans le dossier NyxNode
node index.js
```

### 2. Vérifier que les routes sont montées
Regarde les logs du bot au démarrage, tu devrais voir :
```
✅ Routes API montées sur le port 20007
```

### 3. Tester l'API directement (optionnel)
```bash
# Récupérer les stats
curl http://193.70.34.25:20007/api/casino/stats?type=biggestWin

# Enregistrer un gain de test
curl -X POST http://193.70.34.25:20007/api/casino/stats \
  -H "Content-Type: application/json" \
  -d '{"username":"TestPlayer","amount":1000,"isJackpot":false}'
```

### 4. Jouer au casino
1. Lance le dashboard : `npm run dev`
2. Va sur la page du casino
3. Joue quelques parties et gagne
4. Vérifie que le leaderboard se remplit

### 5. Vérifier les logs
**Dans le dashboard (console navigateur) :**
```
[CASINO] Enregistrement gain: Kyusaan 500 Jackpot: false
[TOP WINS] Chargé depuis l'API du bot: 3 joueurs
```

**Dans le bot (console serveur) :**
```
[CASINO STATS] Stats mises à jour pour Kyusaan: +500 (Total: 2500, Victoires: 5, Jackpots: 0)
```

---

## 🐛 Dépannage

### Le leaderboard est vide
1. Vérifie que le bot est bien démarré
2. Vérifie que l'URL de l'API est correcte dans `src/config/api.ts`
3. Regarde les logs du navigateur (F12 → Console)
4. Vérifie les erreurs CORS dans le bot

### Les gains ne sont pas enregistrés
1. Vérifie que la route `/api/casino/stats` est bien montée dans le bot
2. Regarde les logs du bot pour voir si les requêtes arrivent
3. Vérifie que le fichier `casino_stats.json` existe et est accessible en écriture

### Erreur CORS
Si tu vois une erreur CORS dans la console du navigateur, vérifie que le bot a bien le middleware CORS activé :
```javascript
// Dans index.js du bot
app.use(cors());
```

### Le fichier JSON ne se crée pas
Vérifie les permissions du dossier `NyxNode` :
```bash
# Windows PowerShell
Get-Acl "c:\Users\Kyusa\Documents\NyxNode"
```

---

## 📈 Améliorations futures possibles

- [ ] Afficher le nombre de jackpots dans le leaderboard
- [ ] Ajouter un onglet "Jackpots" dans le leaderboard
- [ ] Historique des 10 dernières parties
- [ ] Statistiques globales (total de pièces misées, taux de victoire, etc.)
- [ ] Graphiques de progression
- [ ] Badges pour les achievements (100 victoires, 10 jackpots, etc.)

---

## 🔐 Sécurité

⚠️ **Important :** L'API actuelle n'a pas d'authentification. N'importe qui peut envoyer des requêtes POST pour ajouter des gains fictifs.

**Recommandations :**
1. Ajouter une clé API dans les headers
2. Valider que l'utilisateur existe dans Discord
3. Limiter le rate-limiting (max 10 requêtes/minute par IP)
4. Logger toutes les modifications pour détecter les abus

---

## 📝 Notes techniques

- **Format des montants :** Les montants sont stockés en entiers (pas de décimales)
- **Tri :** Le tri est fait côté serveur (dans la route API)
- **Limite :** Le leaderboard affiche max 20 joueurs (configurable)
- **Persistance :** Les données sont sauvegardées dans un fichier JSON (pas de base de données)
- **Performance :** Le fichier JSON est lu/écrit à chaque requête (acceptable pour <1000 joueurs)

---

## ✅ Checklist de déploiement

- [x] Créer `casino-stats-route.js` dans le bot
- [x] Modifier `index.js` pour monter la route
- [x] Modifier `api.ts` pour pointer vers l'API du bot
- [x] Modifier `page.tsx` pour envoyer `isJackpot`
- [x] Améliorer la gestion d'erreurs dans `loadTopWins()`
- [ ] Redémarrer le bot Discord
- [ ] Tester l'enregistrement des gains
- [ ] Vérifier que le leaderboard se remplit
- [ ] Vérifier que les 3 onglets fonctionnent

---

**Créé le :** $(date)  
**Auteur :** Assistant IA  
**Version :** 1.0