# 🚀 Instructions d'intégration du Casino avec le Bot

## ⚠️ IMPORTANT : Étapes à suivre

### 1️⃣ Copier le fichier de route dans le bot

**Fichier source :** `c:\Users\Kyusa\Documents\Kint dashboard\dashboard-bot\casino-stats-route.js`  
**Destination :** `c:\Users\Kyusa\Documents\NyxNode\routes\casino-stats-route.js`

```powershell
Copy-Item "c:\Users\Kyusa\Documents\Kint dashboard\dashboard-bot\casino-stats-route.js" "c:\Users\Kyusa\Documents\NyxNode\routes\casino-stats-route.js"
```

---

### 2️⃣ Modifier `index.js` du bot

**Fichier :** `c:\Users\Kyusa\Documents\NyxNode\index.js`

#### A. Ajouter l'import (ligne ~91)

Cherche cette ligne :
```javascript
const casinoTopWinsRouter = require('./routes/casino-top-wins-route');
```

Ajoute juste en dessous :
```javascript
const casinoStatsRouter = require('./routes/casino-stats-route');
```

#### B. Monter la route (ligne ~335)

Cherche cette ligne :
```javascript
app.use('/api/casino', casinoTopWinsRouter);
```

Ajoute juste en dessous :
```javascript
app.use('/api/casino', casinoStatsRouter);
```

---

### 3️⃣ Redémarrer le bot

```powershell
# Arrête le bot (Ctrl+C si il tourne)
# Puis relance-le
Set-Location "c:\Users\Kyusa\Documents\NyxNode"
node index.js
```

Vérifie dans les logs que tu vois :
```
✅ Routes API montées sur le port 20007
```

---

### 4️⃣ Tester l'API du bot (optionnel)

```powershell
Set-Location "c:\Users\Kyusa\Documents\Kint dashboard\dashboard-bot"
node test-bot-casino-api.js
```

Tu devrais voir :
```
🎰 TEST DE L'API CASINO DU BOT DISCORD

📝 Test 1: Ajout de gains de test...
  ✅ Kyusaan: +5000 🎰 JACKPOT
  ✅ TestPlayer1: +1500
  ...

🏆 Test 2: Récupération du leaderboard "Plus Gros Gain"...
  ✅ 4 joueurs trouvés
    🥇 JackpotKing: 10000 💰
    🥈 Kyusaan: 5000 💰
    ...
```

---

### 5️⃣ Tester dans le dashboard

1. Lance le dashboard :
```powershell
Set-Location "c:\Users\Kyusa\Documents\Kint dashboard\dashboard-bot"
npm run dev
```

2. Va sur la page du casino : `http://localhost:3000/dashboard/mini-jeu/casino`

3. Ouvre la console du navigateur (F12)

4. Joue quelques parties et gagne

5. Vérifie les logs dans la console :
```
[CASINO] Enregistrement gain: Kyusaan 500 Jackpot: false
[TOP WINS] Chargé depuis l'API du bot: 3 joueurs
```

6. Vérifie que le leaderboard se remplit dans les 3 onglets :
   - 💎 Plus Gros Gain
   - 🏆 Nombre de Victoires
   - 💰 Total des Gains

---

## 📁 Fichiers modifiés

### Dans le dashboard (`c:\Users\Kyusa\Documents\Kint dashboard\dashboard-bot\`)

✅ `src/config/api.ts` - Les endpoints pointent vers l'API du bot  
✅ `src/app/dashboard/mini-jeu/casino/page.tsx` - Envoie `isJackpot` et gère mieux les erreurs  
✅ `casino-stats-route.js` - Nouveau fichier de route (à copier dans le bot)  
✅ `test-bot-casino-api.js` - Script de test de l'API  
✅ `CASINO-BOT-INTEGRATION.md` - Documentation complète  
✅ `INSTRUCTIONS-INTEGRATION-BOT.md` - Ce fichier  

### Dans le bot (`c:\Users\Kyusa\Documents\NyxNode\`)

⚠️ `routes/casino-stats-route.js` - **À CRÉER** (copier depuis le dashboard)  
⚠️ `index.js` - **À MODIFIER** (ajouter 2 lignes)  
🆕 `casino_stats.json` - Sera créé automatiquement au premier gain  

---

## 🐛 Problèmes courants

### Le bot ne démarre pas après les modifications

**Erreur :** `Cannot find module './routes/casino-stats-route'`

**Solution :** Vérifie que tu as bien copié le fichier `casino-stats-route.js` dans le dossier `routes` du bot.

---

### Le leaderboard reste vide

**Causes possibles :**
1. Le bot n'est pas démarré
2. L'URL de l'API est incorrecte dans `api.ts`
3. Erreur CORS (vérifie la console du navigateur)

**Solution :**
1. Vérifie que le bot tourne : `http://193.70.34.25:20007/api/casino/stats`
2. Vérifie les logs du bot pour voir si les requêtes arrivent
3. Vérifie que le bot a bien `app.use(cors());` dans `index.js`

---

### Les gains ne sont pas enregistrés

**Causes possibles :**
1. La route n'est pas montée correctement
2. Le fichier JSON n'a pas les permissions d'écriture

**Solution :**
1. Vérifie que tu as bien ajouté `app.use('/api/casino', casinoStatsRouter);` dans `index.js`
2. Vérifie les logs du bot pour voir les erreurs
3. Vérifie que le dossier `NyxNode` est accessible en écriture

---

## ✅ Checklist finale

Avant de considérer que tout fonctionne, vérifie :

- [ ] Le fichier `casino-stats-route.js` est copié dans `NyxNode/routes/`
- [ ] Les 2 lignes sont ajoutées dans `index.js` du bot
- [ ] Le bot redémarre sans erreur
- [ ] L'API répond : `http://193.70.34.25:20007/api/casino/stats`
- [ ] Le dashboard se connecte au bot (pas d'erreur CORS)
- [ ] Les gains sont enregistrés quand tu gagnes au casino
- [ ] Le leaderboard se remplit dans les 3 onglets
- [ ] Les jackpots sont comptés (vérifie dans les logs du bot)

---

## 📞 Support

Si tu rencontres un problème :

1. **Vérifie les logs du bot** (console où tu as lancé `node index.js`)
2. **Vérifie les logs du dashboard** (console du navigateur, F12)
3. **Teste l'API directement** avec le script `test-bot-casino-api.js`
4. **Vérifie le fichier JSON** : `c:\Users\Kyusa\Documents\NyxNode\casino_stats.json`

---

**Bon courage ! 🚀**