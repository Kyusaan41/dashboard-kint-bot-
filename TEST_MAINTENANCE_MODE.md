# Test du Mode Maintenance 🧪

## Tests Rapides

### 1️⃣ Voir la Page de Maintenance (Preview)

```bash
# Ouvrez cette URL dans votre navigateur
http://localhost:3000/maintenance-preview
```

C'est une preview directe de la page de maintenance - sans activation du mode! 🎨

### 2️⃣ Activer le Mode Maintenance Global

#### Option A: Modifier `.env.local`

```bash
# Éditez .env.local
BOT_MAINTENANCE_MODE=true

# Redémarrez l'app
npm run dev
```

Ensuite:
```bash
# Visitez n'importe quelle page protégée
http://localhost:3000/dashboard
```

Vous verrez la page de maintenance! 🚧

#### Option B: Utiliser l'API

```bash
# Vérifier l'état
curl http://localhost:3000/api/maintenance-status

# Réponse si en maintenance
# {
#   "maintenance": false
# }
```

### 3️⃣ Activer la Maintenance par Page

```bash
# Metter le dashboard en maintenance
curl -X POST http://localhost:3000/api/maintenance-status \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "dashboard",
    "message": "Dashboard en maintenance",
    "reason": "Mise à jour importante",
    "estimatedTime": "15 minutes"
  }'

# Vérifier l'état du dashboard
curl "http://localhost:3000/api/maintenance-status?pageId=dashboard"
```

### 4️⃣ Ajouter des Pages à la Maintenance

Pour tester, modifiez une page du dashboard, par exemple `/dashboard/classement/page.tsx`:

```tsx
'use client'

import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'

export default function ClassementPage() {
  return (
    <WithMaintenanceCheck pageId="classement">
      {/* Votre contenu */}
    </WithMaintenanceCheck>
  )
}
```

## Checklist de Tests

### ✅ Tests Fonctionnels

- [ ] Preview de maintenance s'affiche correctement à `/maintenance-preview`
- [ ] Page de maintenance a les bonnes animations
- [ ] Le compte à rebours (l'heure) s'actualise chaque seconde
- [ ] La barre de progression s'anime correctement
- [ ] Le message "Nous travaillons pour vous" avec le point vert s'affiche
- [ ] Les gradients de fond bougent

### ✅ Mode Global

- [ ] Activé: `BOT_MAINTENANCE_MODE=true`
- [ ] Redémarrage: `npm run dev`
- [ ] `/dashboard` affiche la maintenance ✓
- [ ] Message personnalisé s'affiche ✓
- [ ] Désactivé: `BOT_MAINTENANCE_MODE=false`
- [ ] `/dashboard` charge normalement ✓

### ✅ API Endpoints

- [ ] `GET /api/maintenance-status` retourne `{ maintenance: false }`
- [ ] `GET /api/maintenance-status?pageId=dashboard` fonctionne
- [ ] `POST /api/maintenance-status` crée une entrée ✓

### ✅ Auto-Refresh

- [ ] Activez le mode maintenance
- [ ] Ouvrez `/dashboard`
- [ ] La page affiche la maintenance
- [ ] Désactivez le mode (`BOT_MAINTENANCE_MODE=false`)
- [ ] Attendez 5-10 secondes
- [ ] La page se rafraîchit automatiquement ✓

### ✅ Responsive Design

- [ ] Desktop: Ouvrez DevTools (F12) à résolution full
- [ ] Mobile: Testez en `375px` de largeur
- [ ] Tablet: Testez en `768px` de largeur
- [ ] Tous les éléments sont bien positionnés

### ✅ Erreurs Possibles

- [ ] Pas de crash si API inaccessible
- [ ] Page charge sans JavaScript (graceful degradation)
- [ ] Console ne montre pas d'erreurs (F12)

## Scénarios de Test Complets

### Scénario 1: Maintenance Rapide (5 min)

```bash
# 1. Activez la maintenance
echo "BOT_MAINTENANCE_MODE=true" >> .env.local

# 2. Redémarrez
npm run dev

# 3. Utilisateurs voient la page de maintenance
# Visitez: http://localhost:3000/dashboard

# 4. Attendez 2 minutes...

# 5. Désactivez
echo "BOT_MAINTENANCE_MODE=false" >> .env.local

# 6. Page se rafraîchit automatiquement
```

### Scénario 2: Maintenance Multiple Pages

```bash
# Page 1 - Dashboard
curl -X POST http://localhost:3000/api/maintenance-status \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "dashboard",
    "message": "Dashboard en maintenance",
    "reason": "Sauvegarde des données",
    "estimatedTime": "10 minutes"
  }'

# Page 2 - Classement
curl -X POST http://localhost:3000/api/maintenance-status \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "classement",
    "message": "Classement en maintenance",
    "reason": "Recalcul des scores",
    "estimatedTime": "5 minutes"
  }'

# Vérifier
curl "http://localhost:3000/api/maintenance-status?pageId=dashboard"
curl "http://localhost:3000/api/maintenance-status?pageId=classement"
```

## Output Attendu

### Page de Maintenance Affichée ✓

```
┌────────────────────────────────────────────────────┐
│                                                    │
│         [🔧 Icône qui tourne]                      │
│                                                    │
│         En cours de                               │
│         Maintenance                               │
│                                                    │
│   Nous améliorons NyxBot pour vous offrir        │
│   une meilleure expérience...                    │
│                                                    │
│  ┌──────────────┐  ┌──────────────┐              │
│  │ Temps estimé │  │ Heure actuelle│             │
│  │ Environ 30   │  │ 14:30:45     │              │
│  │ minutes      │  │               │             │
│  └──────────────┘  └──────────────┘              │
│                                                    │
│  [███████████████████░░░░░░░░░░░░░░░░]           │
│                                                    │
│  🟢 Nous travaillons pour vous                    │
│                                                    │
└────────────────────────────────────────────────────┘
```

### API Response ✓

```json
{
  "maintenance": true,
  "global": true,
  "message": "En cours de maintenance",
  "reason": "Mise à jour système",
  "estimatedTime": "30 minutes",
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

## Console Logs Attendus

```
[SUPER-ADMIN] Fetching from: http://193.70.34.25:20007/api/serverinfo
[SUPER-ADMIN] Response status: 200
[SUPER-ADMIN] Successfully fetched 150 users from bot API
[SSE] Connecté au serveur d'événements
```

Pas de `error` ni `error: Failed to fetch`!

## Problèmes Communs

### ❌ Page de maintenance n'apparaît pas

```bash
# 1. Vérifiez l'env
cat .env.local | grep BOT_MAINTENANCE

# 2. Redémarrez npm
npm run dev

# 3. Videz le cache
# Ctrl+Shift+Delete dans le navigateur

# 4. Visitez en mode incognito
# Ctrl+Shift+N
```

### ❌ Auto-refresh ne marche pas

```bash
# 1. Vérifiez que l'API répond
curl http://localhost:3000/api/maintenance-status

# 2. Regardez la console (F12) pour erreurs
# 3. Vérifiez CORS dans Network tab
```

### ❌ Images/Icônes ne chargent pas

```bash
# 1. Vérifiez que lucide-react est installé
npm list lucide-react

# 2. Réinstallez si nécessaire
npm install lucide-react
```

## Déploiement en Production

```bash
# 1. Buildez l'app
npm run build

# 2. En production (.env.production ou .env):
BOT_MAINTENANCE_MODE=true
NEXT_PUBLIC_MAINTENANCE_MESSAGE="Maintenance en cours..."

# 3. Deployez
npm start

# Ou via Vercel
git push origin main
# Ajouter env vars dans Vercel dashboard
```

Voilà! 🎉 C'est prêt à tester!