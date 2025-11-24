// Exemple de configuration d'items de boutique pour NyxBot
// Ce fichier n'est pas encore branché aux APIs, il sert de base pour déclarer / documenter les items.

export type ShopItemCategory = 'Légendaire' | 'Épique' | 'Rare' | 'Commun' | 'Divers' | string;
export type ShopItemType = 'Kint' | 'Utilitaire' | 'Personnalisation' | string;

export type ShopItemConfig = {
  // Identifiant unique de l'item côté bot / dashboard
  id: string;
  name: string;
  price: number;
  description: string;
  category: ShopItemCategory;
  type: ShopItemType;
  icon: string;
  // Optionnels selon l'item
  promoPrice?: number;
  action?: string;
  roleId?: string;
  role?: string;
};

export const SHOP_ITEMS_EXAMPLE: ShopItemConfig[] = [
  {
    id: 'KShield',
    name: 'KShield',
    price: 7000,
    description:
      'Protège contre la perte de points KIP.\nAchetable une fois par semaine.\nLimité à un par personne.',
    category: 'Épique',
    type: 'Kint',
    icon: '/icons/kshield.png',
  },
  {
    id: 'Swap Lane',
    name: 'Swap Lane',
    price: 2500,
    description: "Échange de lane avec un joueur pendant un Kint.",
    category: 'Commun',
    type: 'Kint',
    icon: '/icons/swap_lane.png',
  },
  {
    id: 'My Champ',
    name: 'My Champ',
    price: 2550,
    description: "Choisis le champion d'un joueur",
    category: 'Commun',
    type: 'Kint',
    icon: '/icons/my_champ.png',
  },
  {
    id: 'Ticket Coin Million',
    name: 'Ticket Coin Million',
    price: 3000,
    promoPrice: 2000,
    description: 'Participe à la lotterie quotidienne !',
    category: 'Rare',
    type: 'Utilitaire',
    icon: '/icons/ticket.png',
  },
  {
    id: 'Épée du KINT',
    name: 'Épée du KINT',
    price: 35000,
    description:
      "Une lame mythique forgée dans les flammes de la volonté.\nPendant 2h, tous les Kints que tu gagnes sont doublés.",
    category: 'Légendaire',
    type: 'Kint',
    icon: '/icons/epee_du_kint.png',
  },
  {
    id: 'Rôle VIP',
    name: 'Rôle VIP 💎',
    price: 100000,
    description: 'Choppe ton VIP sur le serveur !',
    category: 'Légendaire',
    type: 'Personnalisation',
    action: 'role',
    roleId: '1371086528247496704',
    icon: '/icons/role_vip.png',
  },
  {
    id: 'Couleur bleu',
    name: 'Couleur Bleu',
    price: 2500,
    description: 'Change ton pseudo en Bleu.',
    category: 'Commun',
    type: 'Personnalisation',
    action: 'color',
    role: 'bleu',
    roleId: '1371078801504866436',
    icon: '/icons/blue.png',
  },
  {
    id: 'Couleur vert',
    name: 'Couleur Vert',
    price: 2500,
    description: 'Change ton pseudo en Vert.',
    category: 'Commun',
    type: 'Personnalisation',
    action: 'color',
    role: 'vert',
    roleId: '1371081662317985803',
    icon: '/icons/green.png',
  },
  {
    id: 'Couleur rose',
    name: 'Couleur Rose',
    price: 2500,
    description: 'Change ton pseudo en Rose.',
    category: 'Commun',
    type: 'Personnalisation',
    action: 'color',
    role: 'rose',
    roleId: '1371081743280509038',
    icon: '/icons/pink.png',
  },
  {
    id: 'Couleur jaune',
    name: 'Couleur Jaune',
    price: 2500,
    promoPrice: 1500,
    description: 'Change ton pseudo en Jaune.',
    category: 'Commun',
    type: 'Personnalisation',
    action: 'color',
    role: 'jaune',
    roleId: '1371081816919904326',
    icon: '/icons/yellow.png',
  },
  {
    id: 'Couleur orange',
    name: 'Couleur Orange',
    price: 2500,
    description: 'Change ton pseudo en Orange.',
    category: 'Commun',
    type: 'Personnalisation',
    action: 'color',
    role: 'orange',
    roleId: '1371081854408724580',
    icon: '/icons/orange.png',
  },
  {
    id: 'Couleur rouge',
    name: 'Couleur Rouge',
    price: 2500,
    description: 'Change ton pseudo en Rouge.',
    category: 'Commun',
    type: 'Personnalisation',
    action: 'color',
    role: 'rouge',
    roleId: '1371081906120163339',
    icon: '/icons/red.png',
  },
  {
    id: 'Couleur Blanc',
    name: 'Couleur Blanc',
    price: 2500,
    description: 'Change ton pseudo en Blanc.',
    category: 'Commun',
    type: 'Personnalisation',
    action: 'color',
    role: 'blanc',
    roleId: '1371082003167838238',
    icon: '/icons/white.png',
  },
  {
    id: 'Starter Pack',
    name: 'Starter Pack',
    price: 1,
    description:
      'Pack de démarrage : 20 000 pièces, 10 000 jetons, 90 orbs. Achetable une seule fois.',
    category: 'Légendaire',
    type: 'Utilitaire',
    action: 'starter_pack',
    icon: '/icons/starter_pack.png',
  },
];
