# ⚡ Quick Start - Mode Maintenance

## 🚀 En 30 Secondes

### 1️⃣ Voir le Design

```bash
http://localhost:3000/maintenance-preview
```

Ouvrez ça dans votre navigateur. Vous verrez immédiatement à quoi ressemble la page de maintenance! 🎨

### 2️⃣ Activer Globalement

```bash
# Éditez .env.local
BOT_MAINTENANCE_MODE=true

# Redémarrez
npm run dev

# Visitez
http://localhost:3000/dashboard
```

Boom! 💥 Page en maintenance! 

### 3️⃣ Désactiver

```bash
# Changez dans .env.local
BOT_MAINTENANCE_MODE=false

# La page se rafraîchit automatiquement
```

## 📋 Cas d'Usage Courants

### Maintenance de Routine (Dimanche Matin)

```bash
# 1. Activez avant de commencer
echo "BOT_MAINTENANCE_MODE=true" >> .env.local

# 2. Utilisateurs voient le message
# 3. Faites votre travail (1-2 heures)
# 4. Quand fini:
echo "BOT_MAINTENANCE_MODE=false" >> .env.local

# 5. Poof! Tout revient à normal ✨
```

### Maintenance d'Urgence (Problème Détecté)

```bash
# Activation immédiate
BOT_MAINTENANCE_MODE=true

# Correction en cours
# ...

# Redémarrage
npm run dev
```

### Une Seule Page en Maintenance

```bash
# Seulement le classement
curl -X POST http://localhost:3000/api/maintenance-status \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "classement",
    "message": "Classement en maintenance",
    "reason": "Recalcul des scores",
    "estimatedTime": "30 minutes"
  }'

# Vérifier
curl "http://localhost:3000/api/maintenance-status?pageId=classement"
```

## 🎨 Personnaliser le Message

Dans `.env.local`:

```env
NEXT_PUBLIC_MAINTENANCE_MESSAGE="🔧 Mise à jour en cours | ETA: 15 minutes"
```

## 🧪 Tests Rapides

```bash
# Voir le design
http://localhost:3000/maintenance-preview

# Activer global
BOT_MAINTENANCE_MODE=true && npm run dev

# Vérifier API
curl http://localhost:3000/api/maintenance-status

# Activer par page
curl -X POST http://localhost:3000/api/maintenance-status \
  -H "Content-Type: application/json" \
  -d '{"pageId": "test", "message": "Test"}'
```

## 📁 Fichiers Clés

```
src/
├── components/
│   ├── MaintenanceMode.tsx           ← La belle page
│   └── WithMaintenanceCheck.tsx       ← Le wrapper
├── hooks/
│   └── useMaintenanceMode.ts          ← Vérification d'état
└── app/
    ├── api/maintenance-status/route.ts ← L'API
    └── maintenance-preview/page.tsx    ← Preview
```

## 🎯 Prochaines Étapes

### Facile (2 minutes)

```tsx
// Ajouter à une autre page:
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck'

// Wrapper le contenu:
<WithMaintenanceCheck pageId="classement">
  {/* Contenu */}
</WithMaintenanceCheck>
```

### Moyen (10 minutes)

Créer un dashboard pour super-admin où ils peuvent:
- ✅ Activer/désactiver la maintenance
- ✅ Modifier le message
- ✅ Voir l'état des pages

### Avancé (30 minutes)

Persister en base de données (actuellement en RAM).

## ❓ FAQ Rapide

**Q: Comment vérifier l'état?**
```bash
curl http://localhost:3000/api/maintenance-status
```

**Q: Comment désactiver rapidement?**
```env
BOT_MAINTENANCE_MODE=false
```

**Q: Puis-je personnaliser le design?**
Oui! Modifiez `src/components/MaintenanceMode.tsx`

**Q: Ça marche sur mobile?**
Oui, c'est 100% responsive!

**Q: Comment ajouter à d'autres pages?**
Importez le wrapper et wrappez le contenu.

## 🎉 C'est Prêt!

Le système est **100% fonctionnel** et **prêt à l'emploi**:

- ✅ Mode global (env vars)
- ✅ Mode par page (API)
- ✅ Page de preview
- ✅ Auto-refresh automatique
- ✅ Design professionnel
- ✅ Documentation complète

## 📚 Documentation Complète

- **MAINTENANCE_MODE_GUIDE.md** - Guide complet
- **TEST_MAINTENANCE_MODE.md** - Comment tester
- **ADD_MAINTENANCE_TO_PAGES.md** - Ajouter à vos pages
- **MAINTENANCE_SETUP_SUMMARY.md** - Résumé technique

---

**TL;DR**: 
1. Voir preview: `http://localhost:3000/maintenance-preview`
2. Activer: `BOT_MAINTENANCE_MODE=true`
3. Redémarrer: `npm run dev`
4. Profit! 🚀