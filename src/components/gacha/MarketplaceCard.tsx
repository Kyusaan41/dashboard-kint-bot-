'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Shield, Gem, Star, Sparkles, Crown } from 'lucide-react';
import { NyxCard } from '@/components/ui/NyxCard';

const rarityIcons = {
    'Commun': <Star size={16} className="text-gray-400" />,
    'Rare': <Shield size={16} className="text-blue-500" />,
    'Épique': <Gem size={16} className="text-purple-500" />,
    'Légendaire': <Sparkles size={16} className="text-yellow-500" />,
    'Mythique': <Crown size={16} className="text-red-500" />,
} as const;

export interface MarketplaceListing {
    listingId: string;
    sellerUsername: string;
    sellerId?: string;
    cardId: string;
    cardInfo: {
        name: string;
        rarity: keyof typeof rarityIcons;
        power: number;
        malId: number;
        anime: string;
        image: string;
    };
    price: number;
    listedAt: string;
}

interface MarketplaceCardProps {
    listing: MarketplaceListing;
    onBuy: (listingId: string) => void;
    onRemove?: (listingId: string) => void;
    isOwner?: boolean;
}

export function MarketplaceCard({ listing, onBuy, onRemove, isOwner }: MarketplaceCardProps) {
    const imageUrl = `/gacha/cards/${listing.cardId}.jpg`;

    return (
        <NyxCard className="flex flex-col overflow-hidden p-0">
            <div className="p-4">
                <h3 className="text-lg font-bold truncate text-white">{listing.cardInfo.name}</h3>
                <div className="flex items-center text-sm text-gray-400">
                    {rarityIcons[listing.cardInfo.rarity]}
                    <span className="ml-2">{listing.cardInfo.rarity}</span>
                </div>
            </div>
            <div className="flex-grow flex items-center justify-center relative aspect-[2/3]">
                <Image src={imageUrl} alt={listing.cardInfo.name} width={200} height={300} className="object-cover w-full h-full" />
            </div>
            <div className="flex flex-col items-start p-4 bg-black/20 mt-auto">
                <div className="w-full flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-yellow-400">{listing.price.toLocaleString()} pièces</span>
                    <span className="text-xs text-gray-500">Vendu par {listing.sellerUsername}</span>
                </div>
                {isOwner ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => onRemove && onRemove(listing.listingId)}
                  >
                    Retirer
                  </Button>
                ) : (
                  <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => onBuy(listing.listingId)}>
                      Acheter
                  </Button>
                )}
            </div>
        </NyxCard>
    );
}