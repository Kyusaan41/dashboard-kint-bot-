# Ajouter la Maintenance à Vos Pages 📋

## Vue d'Ensemble Rapide

Vous avez 3 options pour ajouter le mode maintenance à vos pages:

1. **Wrapper Simple** (Recommandé) - Le plus facile
2. **Hook Custom** - Si vous besoin d'une logique personnalisée
3. **API Directe** - Contrôle maximal

## Option 1️⃣: Wrapper Simple (Recommandé ⭐)

C'est la méthode la plus simple et la plus efficace!

### Étape 1: Importer le composant

```tsx
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'
```

### Étape 2: Wrapper votre contenu

```tsx
'use client'

import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'

export default function MyPage() {
  return (
    <WithMaintenanceCheck pageId="mon-nom-de-page">
      {/* Tout votre contenu ici */}
      <div>Contenu normal</div>
    </WithMaintenanceCheck>
  )
}
```

### Étape 3: C'est tout! 🎉

Le wrapper va automatiquement:
- ✅ Vérifier le mode maintenance global
- ✅ Vérifier la maintenance par page
- ✅ Afficher la page de maintenance si nécessaire
- ✅ Se rafraîchir toutes les 30 secondes

### Exemple Concret

```tsx
'use client'

import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'
import { useSession } from 'next-auth/react'

export default function ClassementPage() {
  const { data: session } = useSession()

  return (
    <WithMaintenanceCheck pageId="classement">
      <div className="space-y-8">
        <h1>Classement XP</h1>
        {/* Votre contenu du classement */}
      </div>
    </WithMaintenanceCheck>
  )
}
```

## Option 2️⃣: Hook Custom

Si vous besoin de vérifier l'état de maintenance dans le composant:

```tsx
'use client'

import { useMaintenanceMode } from '@/hooks/useMaintenanceMode'
import { MaintenanceMode } from '@/components/MaintenanceMode'

export default function MyPage() {
  const status = useMaintenanceMode('mon-page')

  if (status.isUnderMaintenance) {
    return (
      <MaintenanceMode
        message={status.message}
        reason={status.reason}
        estimatedTime={status.estimatedTime}
      />
    )
  }

  return (
    <div>
      {/* Votre contenu normal */}
    </div>
  )
}
```

## Option 3️⃣: Contrôle Manuel

Pour un contrôle maximal, vous pouvez gérer directement l'affichage:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { MaintenanceMode } from '@/components/MaintenanceMode'

export default function MyPage() {
  const [isMaintenance, setIsMaintenance] = useState(false)

  useEffect(() => {
    const checkMaintenance = async () => {
      const response = await fetch('/api/maintenance-status?pageId=mon-page')
      const data = await response.json()
      setIsMaintenance(data.maintenance)
    }

    checkMaintenance()
  }, [])

  if (isMaintenance) {
    return <MaintenanceMode />
  }

  return <div>Contenu normal</div>
}
```

## Pages du Dashboard à Wrapper

Voici les pages principales du dashboard que vous pouvez wrapper:

### 1. Classement (`/dashboard/classement/page.tsx`)

```tsx
'use client'

import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'

export default function ClassementPage() {
  return (
    <WithMaintenanceCheck pageId="classement">
      {/* Contenu du classement */}
    </WithMaintenanceCheck>
  )
}
```

### 2. Inventaire (`/dashboard/inventory/page.tsx`)

```tsx
'use client'

import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'

export default function InventoryPage() {
  return (
    <WithMaintenanceCheck pageId="inventory">
      {/* Contenu de l'inventaire */}
    </WithMaintenanceCheck>
  )
}
```

### 3. Boutique (`/dashboard/boutique/page.tsx`)

```tsx
'use client'

import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'

export default function BoutiquePage() {
  return (
    <WithMaintenanceCheck pageId="boutique">
      {/* Contenu de la boutique */}
    </WithMaintenanceCheck>
  )
}
```

### 4. Mini-Jeux (`/dashboard/mini-jeu/page.tsx`)

```tsx
'use client'

import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'

export default function MiniJeuPage() {
  return (
    <WithMaintenanceCheck pageId="mini-jeu">
      {/* Contenu des mini-jeux */}
    </WithMaintenanceCheck>
  )
}
```

### 5. Stats (`/dashboard/stats/page.tsx`)

```tsx
'use client'

import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'

export default function StatsPage() {
  return (
    <WithMaintenanceCheck pageId="stats">
      {/* Contenu des stats */}
    </WithMaintenanceCheck>
  )
}
```

### 6. Événements (`/dashboard/events/page.tsx`)

```tsx
'use client'

import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'

export default function EventsPage() {
  return (
    <WithMaintenanceCheck pageId="events">
      {/* Contenu des événements */}
    </WithMaintenanceCheck>
  )
}
```

### 7. Admin (`/dashboard/admin/page.tsx`)

```tsx
'use client'

import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'

export default function AdminPage() {
  return (
    <WithMaintenanceCheck pageId="admin">
      {/* Contenu admin */}
    </WithMaintenanceCheck>
  )
}
```

## Noms de Pages Recommandés (pageId)

Utilisez ces noms cohérents pour vos `pageId`:

```
dashboard           - Page principale du dashboard
classement          - Page de classement
inventory           - Inventaire
boutique            - Boutique/Shop
mini-jeu            - Mini-jeux
stats               - Statistiques
events              - Événements
admin               - Panel admin
settings            - Paramètres
members             - Membres/Profils
super-admin         - Super admin panel
```

## Activation de la Maintenance

### Par pageId Spécifique

```bash
# Metter le classement en maintenance
curl -X POST http://localhost:3000/api/maintenance-status \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "classement",
    "message": "Classement en maintenance",
    "reason": "Recalcul des scores",
    "estimatedTime": "15 minutes"
  }'
```

### Globale (Toutes les Pages)

```env
# .env.local
BOT_MAINTENANCE_MODE=true
NEXT_PUBLIC_MAINTENANCE_MESSAGE="Maintenance globale en cours"
```

## Vérification

```bash
# Vérifier une page spécifique
curl "http://localhost:3000/api/maintenance-status?pageId=classement"

# Vérifier le statut global
curl http://localhost:3000/api/maintenance-status
```

## Exemple Complet d'Intégration

### Avant (Sans Maintenance)

```tsx
'use client'

import { useSession } from 'next-auth/react'

export default function ClassementPage() {
  const { data: session } = useSession()
  
  return (
    <div className="space-y-8">
      <h1>Classement XP</h1>
      {/* Contenu ... */}
    </div>
  )
}
```

### Après (Avec Maintenance)

```tsx
'use client'

import { useSession } from 'next-auth/react'
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'

export default function ClassementPage() {
  const { data: session } = useSession()
  
  return (
    <WithMaintenanceCheck pageId="classement">
      <div className="space-y-8">
        <h1>Classement XP</h1>
        {/* Contenu ... */}
      </div>
    </WithMaintenanceCheck>
  )
}
```

**C'est tout!** 3 lignes changées! 🎉

## Customisation Avancée

### Styles Personnalisés

Modifiez `src/components/MaintenanceMode.tsx` pour changer:
- Couleurs
- Animations
- Messages par défaut
- Layout

### Messages Personnalisés

Pour chaque page, vous pouvez avoir des messages différents:

```tsx
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode'
import { MaintenanceMode } from '@/components/MaintenanceMode'

export default function ClassementPage() {
  const status = useMaintenanceMode('classement')

  if (status.isUnderMaintenance) {
    return (
      <MaintenanceMode
        message="Classement en maintenance"
        reason="Nous recalculons les scores de tous les joueurs"
        estimatedTime="10 minutes"
      />
    )
  }

  return <div>Classement</div>
}
```

### Auto-Refresh Personnalisé

Modifiez l'intervalle dans `src/components/WithMaintenanceCheck.tsx`:

```tsx
// Ligne 30 - Actuellement 30000 ms (30 secondes)
const interval = setInterval(checkMaintenance, 10000)  // Change à 10 secondes
```

## Troubleshooting

### ❌ Erreur: "Cannot find module"

```
Error: Cannot find module '@/components/WithMaintenanceCheck'
```

Vérifiez que le fichier existe:
```bash
ls src/components/WithMaintenanceCheck.tsx
```

### ❌ Page de maintenance ne s'affiche pas

1. Vérifiez que vous avez wrappé le contenu
2. Vérifiez la console pour les erreurs
3. Vérifiez que l'API répond: `http://localhost:3000/api/maintenance-status`

### ❌ pageId non unique

Utilisez des noms uniques pour chaque page. Exemples mauvais:
```
❌ "page"
❌ "test"
❌ "main"

✅ "classement"
✅ "inventory"
✅ "boutique"
```

## Checklist d'Implémentation

Pour chaque page:

- [ ] Ajouté `import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'`
- [ ] Wrappé le contenu avec `<WithMaintenanceCheck pageId="..."`
- [ ] Donné un pageId unique et significatif
- [ ] Testé en local: `npm run dev`
- [ ] Testé la maintenance: `curl -X POST http://localhost:3000/api/maintenance-status ...`
- [ ] Testé le refresh automatique
- [ ] Committé et pushé: `git push origin main`

## Support

Besoin d'aide?

1. Regardez `MAINTENANCE_MODE_GUIDE.md` pour plus de détails
2. Regardez `TEST_MAINTENANCE_MODE.md` pour les tests
3. Vérifiez `src/components/MaintenanceMode.tsx` pour le code
4. Vérifiez `src/components/WithMaintenanceCheck.tsx` pour le wrapper

Voilà! 🚀 Vous pouvez maintenant ajouter le mode maintenance à n'importe quelle page!