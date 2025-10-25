# Configuration du Système Super Admin

Ce guide explique comment configurer le système de Haute Administration (Super Admin) pour votre dashboard.

## Configuration Requise

Vous devez ajouter les variables d'environnement suivantes à votre fichier `.env.local` :

### 1. ID Super Admin

```env
# ID Discord du/des super admin(s) - Séparé par des virgules
NEXT_PUBLIC_SUPER_ADMIN_IDS=YOUR_DISCORD_ID,KUROMYI_DISCORD_ID

# L'ID du super admin protégé (ne peut pas être rétrogradé)
NEXT_PUBLIC_PROTECTED_SUPER_ADMIN_ID=YOUR_DISCORD_ID
```

### 2. Remplacement des IDs

- `YOUR_DISCORD_ID` : Votre ID Discord (ne peut pas être rétrogradé)
- `KUROMYI_DISCORD_ID` : L'ID Discord de Kuromyi ou autre administrateur

## Exemple de Configuration

```env
NEXT_PUBLIC_SUPER_ADMIN_IDS=123456789012345678,987654321098765432
NEXT_PUBLIC_PROTECTED_SUPER_ADMIN_ID=123456789012345678
```

## Fonctionnalités du Super Admin

### 1. Gestion des Utilisateurs
- **Voir tous les utilisateurs** du site avec leurs informations
- **Promouvoir/Rétrograder** les utilisateurs (user → moderator → admin → super_admin)
- **Afficher les grades** sur le site (👤 Utilisateur, ⚡ Modérateur, 🛡️ Admin, 👑 Super Admin)
- **Voir les statistiques** de chaque utilisateur (points, monnaie)

### 2. Gestion des Pages
- **Voir toutes les pages** du site en temps réel
- **Mettre en ligne/maintenance** n'importe quelle page instantanément
- **Voir le statut** de chaque page (En Ligne / Maintenance)
- **Historique** de la dernière mise à jour

### 3. Fonctionnalités Avancées
- **Sauvegarde des données**
- **Statistiques globales**
- **Logs du système**
- **Alertes système**

## Protection de Sécurité

- ✅ Seul le super admin protégé ne peut **pas** être rétrogradé
- ✅ Seul les super admins peuvent accéder à cette page
- ✅ L'onglet "Haute Administration" n'est visible que pour les super admins
- ✅ Toutes les actions requièrent une authentification

## Accès à la Page

Une fois configuré, vous pouvez accéder à la page super admin via :
- **URL** : `/dashboard/super-admin`
- **Sidebar** : Visible uniquement si vous êtes super admin
- **Nom** : "Haute Administration" 👑

## Rôles Disponibles

| Rôle | Badge | Permissions |
|------|-------|-------------|
| Utilisateur | 👤 | Accès basique |
| Modérateur | ⚡ | Modération |
| Administrateur | 🛡️ | Gestion complète |
| Super Admin | 👑 | Accès total (rare) |

## Troubleshooting

### Je n'ai pas accès à la page super admin
- Vérifiez que votre ID Discord est dans `NEXT_PUBLIC_SUPER_ADMIN_IDS`
- Vérifiez que les variables d'environnement sont correctes
- Redémarrez le serveur de développement

### Les modifications ne sont pas sauvegardées
- Vérifiez que l'API backend est accessible
- Vérifiez les logs de la console pour les erreurs
- Assurez-vous que le token API est valide

## Notes Importantes

1. Les changements de rôle sont **immédiats**
2. La mise en maintenance est **instantanée**
3. Toutes les actions sont **loggées**
4. Seul le super admin protégé est **sûr**