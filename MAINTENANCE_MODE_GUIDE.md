# Guide du Mode Maintenance 🛠️

## Vue d'ensemble

Ce système permet d'activer facilement un mode maintenance global ou par page, avec un beau message de maintenance affiché aux utilisateurs.

## Variables d'Environnement

### Mode Maintenance Global

```env
# .env.local

# Active/désactive le mode maintenance global
BOT_MAINTENANCE_MODE=false  # true pour activer, false pour désactiver

# Message de maintenance affiché
NEXT_PUBLIC_MAINTENANCE_MESSAGE="Le bot est actuellement en maintenance. Nous serons de retour bientôt !"
```

## Utilisation

### 1. Activer la Maintenance Globale

Modifiez `.env.local`:

```env
BOT_MAINTENANCE_MODE=true
NEXT_PUBLIC_MAINTENANCE_MESSAGE="Mise à jour du système en cours..."
```

Puis redémarrez l'application:
```bash
npm run dev
```

**Résultat**: Toutes les pages protégées afficheront la page de maintenance 🚧

### 2. Désactiver la Maintenance

```env
BOT_MAINTENANCE_MODE=false
```

### 3. Maintenance par Page

Vous pouvez aussi mettre une page spécifique en maintenance via l'API:

```bash
curl -X POST http://localhost:3000/api/maintenance-status \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "dashboard",
    "message": "Dashboard en maintenance",
    "reason": "Nous améliorons votre expérience",
    "estimatedTime": "15 minutes"
  }'
```

## Pages avec Maintenance Activée

Actuellement, les pages suivantes supportent le mode maintenance:

- ✅ **Dashboard Principal** (`/dashboard`) - Wrappée avec `WithMaintenanceCheck`

### Pour ajouter à d'autres pages

1. Importez le composant:
```tsx
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'
```

2. Wrappez votre contenu:
```tsx
return (
  <WithMaintenanceCheck pageId="nom-de-la-page">
    {/* Votre contenu */}
  </WithMaintenanceCheck>
)
```

3. Utilisez le pageId comme paramètre pour la maintenance spécifique

## Composants Disponibles

### `<MaintenanceMode />`

Composant qui affiche la page de maintenance avec:
- Animation d'icône rotatif
- Temps estimé
- Heure actuelle
- Barre de progression animée
- Statut "Nous travaillons pour vous"
- Auto-refresh automatique

Props:
```tsx
interface MaintenanceModeProps {
  message?: string           // "En cours de maintenance"
  reason?: string            // Raison de la maintenance
  estimatedTime?: string     // "Environ 30 minutes"
}
```

### `<WithMaintenanceCheck />`

Wrapper qui:
- Vérifie le mode maintenance global via env variables
- Vérifie la maintenance spécifique par page via API
- Affiche `<MaintenanceMode />` si en maintenance
- Affiche le contenu normal sinon
- Rafraîchit toutes les 30 secondes

Props:
```tsx
interface WithMaintenanceCheckProps {
  children: ReactNode
  pageId?: string           // ID unique pour la page
}
```

### Hook `useMaintenanceMode()`

Pour vérifier manuellement l'état de la maintenance:

```tsx
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode'

export function MyComponent() {
  const status = useMaintenanceMode('page-id')
  
  if (status.isUnderMaintenance) {
    return <div>En maintenance: {status.message}</div>
  }
  
  return <div>Contenu normal</div>
}
```

## API Endpoints

### GET `/api/maintenance-status`

Vérifie l'état de la maintenance

Query params:
- `pageId` (optionnel): ID de la page spécifique

Response:
```json
{
  "maintenance": false,
  "global": false
}
```

ou si en maintenance:

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

### POST `/api/maintenance-status`

Active la maintenance pour une page

Body:
```json
{
  "pageId": "dashboard",
  "message": "En cours de maintenance",
  "reason": "Mise à jour en cours",
  "estimatedTime": "30 minutes"
}
```

Response:
```json
{
  "success": true,
  "pageId": "dashboard",
  "message": "En cours de maintenance"
}
```

## Fonctionnalités

### ✨ Auto-Refresh

La page de maintenance se rafraîchit automatiquement toutes les 5 secondes pour vérifier si la maintenance est terminée.

### 🎨 Design Moderne

- Animations fluides avec Framer Motion
- Gradient de fond dynamique
- Particules flottantes
- Design moderne et professionnel

### 📱 Responsive

- Fonctionne sur mobile, tablette et desktop
- Adapte les tailles de texte et d'icônes

### 🔄 Détection en Temps Réel

- Vérifie l'état de maintenance toutes les 10 secondes
- Se réactualise automatiquement sans interaction utilisateur

## Exemple Complet

### Activer le mode maintenance global pour 30 minutes

```bash
# 1. Modifiez .env.local
BOT_MAINTENANCE_MODE=true
NEXT_PUBLIC_MAINTENANCE_MESSAGE="Mise à jour importante en cours. Nous serons de retour vers 15h00"

# 2. Redémarrez (si en dev)
# npm run dev

# 3. Tous les utilisateurs verront la page de maintenance

# Quand terminé, mettez à false
BOT_MAINTENANCE_MODE=false
```

## Personnalisation

Vous pouvez personnaliser les messages et styles en modifiant:

- `src/components/MaintenanceMode.tsx` - Styles et layout
- `src/components/WithMaintenanceCheck.tsx` - Logique de détection
- `src/app/api/maintenance-status/route.ts` - API et stockage

## Troubleshooting

### La maintenance n'apparaît pas

1. ✅ Vérifiez que `BOT_MAINTENANCE_MODE=true` dans `.env.local`
2. ✅ Redémarrez l'application (`npm run dev`)
3. ✅ Videz le cache du navigateur (Ctrl+Shift+Delete)
4. ✅ Vérifiez la console du navigateur (F12) pour les erreurs

### La page ne se rafraîchit pas automatiquement

1. ✅ Vérifiez que `/api/maintenance-status` répond correctement
2. ✅ Vérifiez la console pour les erreurs CORS

### Ajouter plus de pages

1. Créez un `pageId` unique pour chaque page
2. Wrappez le contenu avec `<WithMaintenanceCheck pageId="nom">`
3. Utilisez l'API pour activer/désactiver par page