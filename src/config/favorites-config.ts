import { Gem, Swords, BookUser, LucideIcon, Spade } from 'lucide-react';

export interface FavoritePage {
  id: string;
  path: string;
  name: string;
  Icon: LucideIcon;
}

export const FAVORITABLE_PAGES: FavoritePage[] = [
  {
    id: 'gacha',
    path: '/dashboard/mini-jeu/gacha',
    name: 'Gacha',
    Icon: Gem,
  },
  {
    id: 'casino',
    path: '/dashboard/mini-jeu/casino',
    name: 'Casino',
    Icon: Swords,
  },
  {
    id: 'gacha-collection',
    path: '/dashboard/mini-jeu/gacha/collection',
    name: 'Collection',
    Icon: BookUser,
  },
  {
    id: 'blackjack',
    path: '/dashboard/mini-jeu/blackjack',
    name: 'Blackjack',
    Icon: Spade,
  },
];