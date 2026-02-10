# KTS - Tâches & instructions (résumé)

Ce fichier récapitule les étapes restantes pour l'auth Discord <-> dashboard, les variables d'environnement nécessaires et les commandes de test.

## État actuel
- `/verify` embed interactif + boutons ✅
- Routes OAuth côté bot (`/api/auth/discord` et `/api/auth/callback`) ✅

## Tâches restantes
- [ ] Valider suppression des jobs `invite` (jobs_pool.json)
- [ ] Ajuster difficultés des quêtes hard (jobs_pool.json)
- [ ] Implanter modifications dans `jobs_pool.json`
- [ ] Revoir récompenses si nécessaire

## Variables d'environnement à configurer (bot & Vercel)
- `CLIENT_ID` (application Discord)
- `CLIENT_SECRET` (secret app Discord)
- `DASHBOARD_URL` (ex: https://mon-dashboard.vercel.app)
- `DASHBOARD_REDIRECT` (optionnel) — URL callback si spécifique
- `DASHBOARD_SECRET` — secret HMAC partagé (bot ↔ dashboard)
- `SERVER_URL` (optionnel) — URL publique du bot pour construire le lien d'auth

> Important : `DASHBOARD_SECRET` doit avoir la même valeur côté bot et côté dashboard.

## Comment tester localement
1. Mettre les variables dans `.env` (bot). Exemple :

```
CLIENT_ID=...
CLIENT_SECRET=...
DASHBOARD_URL=https://mon-dashboard.vercel.app
DASHBOARD_SECRET=ma_super_clef
SERVER_URL=https://mon-bot.example.com
```

2. Lancer le bot:

```bash
node index.js
```

3. Dans Discord, exécuter `/verify`, cliquer sur "S'identifier" → suivre le flux OAuth → vérifier que le dashboard reçoit `token`.

## Côté dashboard (Vercel / Next.js)
- Créer une route API `api/auth/callback` qui :
  - récupère la query `token`
  - vérifie la signature HMAC-SHA256 (même méthode que dans `routes/auth.js`)
  - décode le payload (base64url → JSON) et vérifie `exp`
  - crée une session (cookie httpOnly / session server-side)
  - redirige l'utilisateur vers `/dashboard`

Exemple minimal disponible dans la conversation précédente.

## Suggestions & options
- Héberger une page `/rules` sur le dashboard et définir `DASHBOARD_URL` pour pointer le bouton "Voir le règlement complet".
- Préférer une session server-side (Redis / DB) pour plus de sécurité.
- Autoriser la navigation d'embed pour tous les utilisateurs (actuellement limitée à l'auteur).

---
Fait par l'assistant — demande si tu veux que j'ajoute l'exemple Next.js `api/auth/callback` dans ce repo.
