# Test du système de statistiques du casino

## Problème actuel
Le leaderboard affiche "Aucun joueur dans ce classement" pour tous les onglets.

## Solution appliquée

### 1. Correction du code
- ✅ Ajout d'un fallback pour le nom d'utilisateur (utilise email ou "Joueur" si name n'existe pas)
- ✅ Ajout de logs pour déboguer
- ✅ L'appel à `recordWin()` est maintenant toujours exécuté (pas de condition)

### 2. Tests à effectuer

#### Test 1: Vérifier que le serveur Next.js fonctionne
```bash
npm run dev
```

#### Test 2: Tester l'API manuellement
```bash
node test-casino-stats-manual.js
```

Cela va :
- Ajouter 6 victoires de test pour 3 joueurs
- Afficher les classements pour chaque type
- Vérifier que l'API fonctionne correctement

#### Test 3: Tester depuis le navigateur (Console DevTools)

1. Ouvrir le casino dans le navigateur
2. Ouvrir la console DevTools (F12)
3. Coller ce code pour tester l'API directement :

```javascript
// Test d'ajout de victoire
fetch('/api/casino/stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'TestPlayer', winAmount: 1000 })
})
.then(r => r.json())
.then(data => console.log('✅ Victoire enregistrée:', data))
.catch(err => console.error('❌ Erreur:', err));

// Test de récupération des stats
fetch('/api/casino/stats?type=biggestWin')
.then(r => r.json())
.then(data => console.log('📊 Stats:', data))
.catch(err => console.error('❌ Erreur:', err));
```

#### Test 4: Jouer au casino
1. Aller sur la page du casino
2. Faire quelques spins et gagner
3. Vérifier dans la console que vous voyez : `[CASINO] Enregistrement gain: VotreNom 500`
4. Vérifier que le leaderboard se met à jour

### 3. Vérification du fichier de données

Le fichier `data/casino-stats.json` devrait contenir :
```json
{
  "players": [
    {
      "username": "TestPlayer1",
      "biggestWin": 500,
      "totalWins": 950,
      "winCount": 3,
      "lastUpdated": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 4. Debugging

Si le problème persiste, vérifier :

1. **La session utilisateur** - Dans la console du navigateur :
```javascript
// Vérifier la session
console.log('Session:', window.next?.router?.query);
```

2. **Les logs du serveur** - Dans le terminal où tourne `npm run dev`, vous devriez voir :
```
[CASINO] Enregistrement gain: VotreNom 500
[TOP WINS] Chargé depuis l'API: 1 joueurs
```

3. **Les requêtes réseau** - Dans l'onglet Network des DevTools :
- Chercher les requêtes vers `/api/casino/stats`
- Vérifier qu'elles retournent 200 OK
- Vérifier le contenu de la réponse

### 5. Réinitialiser les données

Si vous voulez repartir de zéro :
```bash
# Supprimer le fichier de stats
Remove-Item "c:\Users\Kyusa\Documents\Kint dashboard\dashboard-bot\data\casino-stats.json"

# Le fichier sera recréé automatiquement au prochain appel API
```

## Changements effectués dans le code

### Fichier: `src/app/dashboard/mini-jeu/casino/page.tsx`

**Avant (ligne 896-898):**
```typescript
if (session?.user?.name) {
    recordWin(session.user.name, result.amount);
}
```

**Après (ligne 896-898):**
```typescript
const username = session?.user?.name || session?.user?.email?.split('@')[0] || 'Joueur';
console.log('[CASINO] Enregistrement gain:', username, result.amount);
recordWin(username, result.amount);
```

**Avantages:**
- ✅ Fonctionne même si `session.user.name` est undefined
- ✅ Utilise l'email comme fallback
- ✅ Utilise "Joueur" comme dernier recours
- ✅ Ajoute des logs pour déboguer
- ✅ Toujours exécuté (pas de condition)