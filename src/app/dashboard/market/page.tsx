'use client';

import { useState, useEffect } from 'react';
import { MarketplaceCard, MarketplaceListing } from '@/components/gacha/MarketplaceCard';
import { API_ENDPOINTS } from '@/lib/api-config';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function GachaMarketplacePage() {
    const { data: session } = useSession();
    const [listings, setListings] = useState<MarketplaceListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMarketplaceListings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.marketplaceListings);
            if (!response.ok) {
                throw new Error("Impossible de récupérer les offres du marché.");
            }
            const data = await response.json();
            
            // CORRECTION : Vérifiez la structure de la réponse
            console.log('🔍 [MARKETPLACE] Réponse API:', data);
            
            if (data.success) {
                // CORRECTION : Utilisez data.listings au lieu de data.data
                setListings(data.listings || data.data || []);
            } else {
                throw new Error(data.message || "Une erreur est survenue.");
            }
        } catch (error) {
            console.error('❌ [MARKETPLACE] Erreur:', error);
            toast.error(error instanceof Error ? error.message : "Erreur inconnue");
            setListings([]); // Assurez-vous que listings est toujours un tableau
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketplaceListings();
    }, []);

    const handleBuyCard = async (listingId: string) => {
        if (!session?.user) {
            toast.error("Vous devez être connecté pour acheter une carte.");
            return;
        }

        const listingToBuy = listings.find(l => l.listingId === listingId);
        if (!listingToBuy) return;

        toast.promise(
            fetch(API_ENDPOINTS.marketplaceBuy, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buyerId: session.user.id,
                    buyerUsername: session.user.name,
                    listingId: listingId,
                }),
            }).then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || "Une erreur est survenue.");
                }
                return res.json();
            }),
            {
                loading: `Achat de ${listingToBuy.cardInfo.name} en cours...`,
                success: (data) => {
                    fetchMarketplaceListings(); // Recharger les offres
                    return data.message || "Achat réussi !";
                },
                error: (err) => err.message || "L'achat a échoué.",
            }
        );
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-4xl font-bold mb-2 text-white">Hôtel des Ventes Gacha</h1>
            <p className="text-gray-400 mb-8">Achetez et vendez des cartes avec d'autres joueurs.</p>

            {isLoading ? (
                <div className="text-center text-gray-400">Chargement des offres...</div>
            ) : (
                // CORRECTION : Vérification plus robuste
                Array.isArray(listings) && listings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {listings.map((listing) => (
                            <MarketplaceCard 
                                key={listing.listingId} 
                                listing={listing} 
                                onBuy={handleBuyCard} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-lg">
                        <h2 className="text-2xl font-bold mb-2">Le marché est vide pour le moment.</h2>
                        <p className="text-gray-400">Soyez le premier à mettre une carte en vente depuis votre collection !</p>
                    </div>
                )
            )}
        </div>
    );
}