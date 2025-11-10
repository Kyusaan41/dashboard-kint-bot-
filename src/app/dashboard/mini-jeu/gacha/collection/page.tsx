"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Loader, BookOpen, Star, Layers, Hash, Filter, ChevronDown, Coins, Tag, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { CardImage } from '../CardImage';
import { AnimeCard, ANIME_CARDS, getCardById } from '../cards';
import { API_ENDPOINTS } from '@/lib/api-config';

// --- TYPES ---
interface CollectedCard {
    cardId: string;
    count: number;
    cardInfo: AnimeCard;
}

interface AnimeCollection {
    anime: string;
    cards: CollectedCard[];
}

interface UserCollection {
    userId: string;
    username: string;
    collections: AnimeCollection[];
    totalCards: number;
    uniqueCards: number;
}

const RARITY_STYLES: { [key: string]: string } = {
    'Commun': 'border-gray-500 bg-gray-800/50 shadow-gray-500/10', // Gris
    'Rare': 'border-blue-500 bg-blue-800/50 shadow-blue-500/30', // Bleu
    'Épique': 'border-purple-500 bg-purple-800/50 shadow-purple-500/40', // Violet
    'Légendaire': 'border-orange-500 bg-orange-800/50 shadow-orange-500/50', // Orange 
    'Mythique': 'bg-red-800/50 shadow-red-500/60', // Rouge - bordure gérée par la classe holographic-border
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number | string }) => (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4">
        <div className="bg-purple-500/20 text-purple-300 p-3 rounded-lg">{icon}</div>
        <div>
            <div className="text-sm text-gray-400">{label}</div>
            <div className="text-xl font-bold text-white">{value}</div>
        </div>
    </div>
);

// ✨ NOUVEAU: Fonction pour générer les étoiles de rareté
const getRarityStars = (rarity: string) => {
    const rarityToStarCount: { [key: string]: number } = { 'Commun': 1, 'Rare': 2, 'Épique': 3, 'Légendaire': 4, 'Mythique': 5 };
    const count = rarityToStarCount[rarity] || 0;
    return Array(count).fill(0).map((_, i) => (
        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
    ));
};

// --- NOUVEAU: COMPOSANT TOAST POUR LA VENTE ---
const SellSuccessToast = ({ message, onComplete }: { message: string; onComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3000); // Disparaît après 3 secondes
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 p-4 bg-gradient-to-r from-green-600/90 to-teal-600/90 backdrop-blur-lg border border-green-400 rounded-xl shadow-2xl shadow-green-500/20 overflow-hidden"
        >
            <Coins className="w-8 h-8 text-white flex-shrink-0" />
            <p className="text-lg font-semibold text-white">
                {message}
            </p>
            <motion.div
                className="absolute bottom-0 left-0 h-1 bg-white/50"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
            />
        </motion.div>
    );
};

// --- NOUVEAU: MODALE DE VENTE DE CARTE ---
const SellCardModal = ({ card, onSell, onAuction, onClose }: { card: CollectedCard, onSell: (cardId: string, quantity: number) => void, onAuction: () => void, onClose: () => void }) => {
    const [quantity, setQuantity] = useState(1);

    if (!card?.cardInfo) return null;

    const sellPrices: { [key: string]: number } = { 'Commun': 200, 'Rare': 400, 'Épique': 900, 'Légendaire': 2600, 'Mythique': 4500 };
    const sellPrice = sellPrices[card.cardInfo.rarity] || 20;
    const maxQuantity = card.count - 1;

    const handleQuantityChange = (amount: number) => {
        setQuantity(prev => {
            const newQuantity = prev + amount;
            return Math.max(1, Math.min(newQuantity, maxQuantity));
        });
    };
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 border border-white/20 max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Vendre la carte</h3>
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                    <div className="w-32 h-44 flex-shrink-0">
                        <CardImage card={card.cardInfo} className="rounded-lg" />
                    </div>
                    <div className="text-center md:text-left">
                        <h4 className="text-xl font-semibold text-white">{card.cardInfo.name}</h4>
                        <p className={`font-bold ${RARITY_STYLES[card.cardInfo.rarity]?.replace('border-','text-')}`}>{card.cardInfo.rarity}</p>
                        <p className="text-sm text-gray-400">Vous en possédez : x{card.count}</p>
                    </div>
                </div>

                <div className="my-6">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-2 text-center">Quantité à vendre (max: {maxQuantity})</label>
                    <div className="flex items-center justify-center gap-4">
                        <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="px-4 py-2 bg-white/10 rounded-md disabled:opacity-50">-</button>
                        <input 
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (isNaN(val)) {
                                    setQuantity(1);
                                } else {
                                    setQuantity(Math.max(1, Math.min(val, maxQuantity)));
                                }
                            }}
                            className="w-20 text-center bg-white/5 border border-white/20 rounded-lg py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button onClick={() => handleQuantityChange(1)} disabled={quantity >= maxQuantity} className="px-4 py-2 bg-white/10 rounded-md disabled:opacity-50">+</button>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Option 1: Vente à la banque */}
                    <button
                        onClick={() => onSell(card.cardId, quantity)}
                        disabled={quantity <= 0 || quantity > maxQuantity}
                        className="w-full text-left p-4 bg-green-600/20 border border-green-500 rounded-lg flex items-center gap-4 hover:bg-green-600/40 transition-all group"
                    >
                        <Coins className="w-8 h-8 text-green-400 flex-shrink-0 transition-transform group-hover:scale-110" />
                        <div>
                            <p className="font-bold text-white">Vente Instantanée</p>
                            <p className="text-sm text-green-300/80">Recevez immédiatement <span className="font-bold">{sellPrice * quantity}</span> pièces.</p>
                        </div>
                    </button>

                    {/* Option 2: Maison des ventes */}
                    <button
                        onClick={onAuction}
                        className="w-full text-left p-4 bg-purple-600/20 border border-purple-500 rounded-lg flex items-center gap-4 hover:bg-purple-600/40 transition-all group"
                    >
                        <Layers className="w-8 h-8 text-purple-400 flex-shrink-0 transition-transform group-hover:scale-110" />
                        <div>
                            <p className="font-bold text-white">Mettre aux Enchères</p>
                            <p className="text-sm text-purple-300/80">Vendez votre carte à d'autres joueurs pour un meilleur prix.</p>
                        </div>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- NOUVEAU: MODALE POUR METTRE AUX ENCHÈRES ---
const AuctionModal = ({ card, onClose, onConfirm }: { card: CollectedCard, onClose: () => void, onConfirm: (cardId: string, price: number) => void }) => {
    const [price, setPrice] = useState('');

    if (!card?.cardInfo) return null;

    const handleConfirm = () => {
        const numericPrice = parseInt(price, 10);
        if (!isNaN(numericPrice) && numericPrice > 0) {
            onConfirm(card.cardId, numericPrice);
        } else {
            toast.error("Veuillez entrer un prix valide.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 border border-white/20 max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Mettre en Vente</h3>
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                    <div className="w-32 h-44 flex-shrink-0">
                        <CardImage card={card.cardInfo} className="rounded-lg" />
                    </div>
                    <div className="text-center md:text-left">
                        <h4 className="text-xl font-semibold text-white">{card.cardInfo.name}</h4>
                        <p className={`font-bold ${RARITY_STYLES[card.cardInfo.rarity]?.replace('border-','text-')}`}>{card.cardInfo.rarity}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-300">Prix de vente en pièces</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="number"
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: 5000"
                        />
                    </div>
                    <button onClick={handleConfirm} className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/30 transition-all">Confirmer la mise en vente</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const MythicAuraStyle = () => (
    <style jsx global>{`
        @keyframes mythic-aura-pulse {
            0%, 100% {
                box-shadow: 0 0 20px 0px rgba(239, 68, 68, 0.4);
            }
            50% {
                box-shadow: 0 0 35px 8px rgba(239, 68, 68, 0.6);
            }
        }
    `}</style>
);

export default function CollectionPage() {
    const { data: session } = useSession();
    const [collection, setCollection] = useState<UserCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // ✨ NOUVEAU: États pour la recherche d'utilisateur
    const [viewedUserId, setViewedUserId] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState('');

    // ✨ NOUVEAU: État pour la notification de vente
    const [sellNotification, setSellNotification] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

    // ✨ NOUVEAU: État pour la modale de vente
    const [sellModalInfo, setSellModalInfo] = useState<{ show: boolean; card: CollectedCard | null }>({ show: false, card: null });

    // ✨ NOUVEAU: État pour la modale d'enchères
    const [auctionModalInfo, setAuctionModalInfo] = useState<{ show: boolean; card: CollectedCard | null }>({ show: false, card: null });

    // ✨ NOUVEAU: États pour le filtrage et le tri
    const [rarityFilter, setRarityFilter] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<string>('rarity_desc');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [groupByAnime, setGroupByAnime] = useState(true); // ✨ NOUVEAU: État pour le regroupement
    const [showMissingCards, setShowMissingCards] = useState(false);

    // ✨ CORRECTION: On définit fetchCollection ici avec useCallback
    const fetchCollection = useCallback(async (userIdToFetch: string) => {
        if (!userIdToFetch) return;

        try {
            setLoading(true);
            const response = await fetch(API_ENDPOINTS.GACHA_COLLECTION(userIdToFetch));
            if (!response.ok) {
                throw new Error("Impossible de charger la collection.");
            }
            const data = await response.json();
            if (data.success) {
                const localData = data.data;
                localData.collections.forEach((animeCollection: AnimeCollection) => {
                    animeCollection.cards.forEach((collectedCard: CollectedCard) => {
                        const localCardInfo = getCardById(collectedCard.cardId);
                        if (localCardInfo) {
                            collectedCard.cardInfo = localCardInfo;
                        }
                    });
                });
                setCollection(localData);
            } else {
                setCollection(null); // Réinitialiser la collection en cas d'erreur ou d'utilisateur non trouvé
                throw new Error(data.error || "Utilisateur non trouvé ou collection vide.");
            }
        } catch (err: any) {
            setError(err.message);
            setCollection(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // ✨ NOUVEAU: Logique de filtrage et de tri avec useMemo pour la performance
        const processedCollections = useMemo(() => {
            // 1. Grouper toutes les cartes de ANIME_CARDS par anime
            const allAnimes = ANIME_CARDS.reduce((acc, card) => {
                if (!acc[card.anime]) {
                    acc[card.anime] = [];
                }
                acc[card.anime].push(card);
                return acc;
            }, {} as Record<string, AnimeCard[]>);
    
            // Trier les animes par ordre alphabétique
            const sortedAnimeNames = Object.keys(allAnimes).sort((a, b) => a.localeCompare(b));
    
            // 2. Créer une map des cartes possédées par l'utilisateur pour un accès rapide
            const ownedCardsMap = new Map<string, CollectedCard>();
            if (collection) {
                for (const animeCollection of collection.collections) {
                    for (const card of animeCollection.cards) {
                        ownedCardsMap.set(card.cardId, card);
                    }
                }
            }
    
            const rarityOrder: { [key: string]: number } = { 'Mythique': 5, 'Légendaire': 4, 'Épique': 3, 'Rare': 2, 'Commun': 1 };
    
            // 3. Construire la structure de données finale
            return sortedAnimeNames.map(animeName => {
                const allCardsForAnime = allAnimes[animeName];
    
                const processedCards = allCardsForAnime.map(cardTemplate => {
                    const ownedCard = ownedCardsMap.get(cardTemplate.id);
                    return {
                        ...cardTemplate,
                        isOwned: !!ownedCard,
                        count: ownedCard?.count || 0,
                    };
                });
    
                // 4. Filtrer les cartes (possédées et non possédées)
                let filteredCards = processedCards.filter(card => {
                    if (!showMissingCards && !card.isOwned) return false;
                    if (rarityFilter === 'all') return true;
                    return card.rarity.toLowerCase() === rarityFilter.toLowerCase();
                });
    
                // 5. Trier les cartes
                filteredCards.sort((a, b) => {
                    switch (sortOrder) {
                        case 'rarity_asc':
                            return (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0);
                        case 'power_desc':
                            return b.power - a.power;
                        case 'power_asc':
                            return a.power - b.power;
                        case 'name_asc':
                            return a.name.localeCompare(b.name);
                        case 'name_desc':
                            return b.name.localeCompare(a.name);
                        case 'rarity_desc':
                        default:
                            return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
                    }
                });
    
                return {
                    anime: animeName,
                    cards: filteredCards,
                    totalInAnime: allCardsForAnime.length,
                    ownedInAnime: processedCards.filter(c => c.isOwned).length,
                };
            }).filter(ac => ac.cards.length > 0); // Ne pas afficher les animes si toutes leurs cartes sont filtrées
    
        }, [collection, rarityFilter, sortOrder, showMissingCards]);
    
        // ✨ NOUVEAU: Logique pour l'affichage non groupé
        const flatCardList = useMemo(() => {
            if (groupByAnime) return [];
    
            const allCards = ANIME_CARDS.map(cardTemplate => {
                const ownedCard = collection?.collections
                    .flatMap(c => c.cards)
                    .find(owned => owned.cardId === cardTemplate.id);
                return {
                    ...cardTemplate,
                    cardInfo: cardTemplate, // Pour la compatibilité avec le reste du code
                    isOwned: !!ownedCard,
                    count: ownedCard?.count || 0,
                };
            });
    
            let filtered = allCards.filter(c => {
                if (!showMissingCards && !c.isOwned) return false;
                if (rarityFilter !== 'all' && c.rarity.toLowerCase() !== rarityFilter.toLowerCase()) return false;
                return true;
            });
            
            const rarityOrder: { [key: string]: number } = { 'Mythique': 5, 'Légendaire': 4, 'Épique': 3, 'Rare': 2, 'Commun': 1 };
    
            filtered.sort((a, b) => {
                switch (sortOrder) {
                    case 'rarity_asc': return (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0);
                    case 'power_desc': return b.power - a.power;
                    case 'power_asc': return a.power - b.power;
                    case 'name_asc': return a.name.localeCompare(b.name);
                    case 'name_desc': return b.name.localeCompare(a.name);
                    case 'rarity_desc':
                    default: return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
                }
            });
            return filtered;
    
        }, [collection, groupByAnime, rarityFilter, sortOrder, showMissingCards]);
        
        // ✨ NOUVEAU: Calcul dynamique des animes complétés
        const { completedAnimes, totalAnimes } = useMemo(() => {
            if (!collection) return { completedAnimes: 0, totalAnimes: 0 };
    
            // 1. Grouper toutes les cartes existantes par anime
            const allCardsByAnime = ANIME_CARDS.reduce((acc, card) => {
                acc[card.anime] = (acc[card.anime] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
    
            const totalAnimes = Object.keys(allCardsByAnime).length;
    
            // 2. Compter combien d'animes sont complétés par l'utilisateur
            let completedCount = 0;
            for (const animeCollection of collection.collections) {
                const totalCardsForThisAnime = allCardsByAnime[animeCollection.anime];
                if (totalCardsForThisAnime && animeCollection.cards.length === totalCardsForThisAnime) {
                    completedCount++;
                }
            }
    
            return {
                completedAnimes: completedCount,
                totalAnimes: totalAnimes
            };
        }, [collection]);
    
        // ✨ NOUVEAU: Gérer la recherche
        const handleSearch = (e: React.FormEvent) => {
            e.preventDefault();
            if (searchInput.trim()) {
                setViewedUserId(searchInput.trim());
            }
        };
    
        // ✨ NOUVEAU: Logique de vente
        const handleSellCard = async (cardId: string, quantity: number) => {
            if (!session?.user?.id) return;
    
            toast.promise(
                fetch(API_ENDPOINTS.gachaSellCard, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: session.user.id, cardId, quantity }),
                }).then(async (res) => {
                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.message || "Une erreur est survenue lors de la vente.");
                    }
                    return res.json();
                }),
                {
                    loading: 'Vente en cours...',
                    success: (data) => {
                        setSellModalInfo({ show: false, card: null }); // Fermer la modale
                        if (viewedUserId) fetchCollection(viewedUserId); // Recharger la collection
                        return data.message || "Carte vendue avec succès ! Elle apparaîtra sur le marché dans quelques instants.";
                    },
                    error: (err) => err.message || "La vente a échoué.",
                }
            );
        };
    
        // ✨ NOUVEAU: Logique pour mettre une carte aux enchères
        const handleListCardForAuction = async (cardId: string, price: number) => {
            if (!session?.user?.id) return;
    
            toast.promise(
                fetch(API_ENDPOINTS.marketplaceSell, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: session.user.id,
                        username: session.user.name,
                        cardId,
                        price,
                    }),
                }).then(async (res) => {
                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.message || "Une erreur est survenue.");
                    }
                    return res.json();
                }),
                {
                    loading: 'Mise en vente de votre carte...',
                    success: (data) => {
                        setAuctionModalInfo({ show: false, card: null }); // Fermer la modale d'enchères
                        if (viewedUserId) fetchCollection(viewedUserId); // Recharger la collection
                        return data.message || "Votre carte a été mise en vente. Elle apparaîtra sur le marché dans quelques instants.";
                    },
                    error: (err) => err.message || "La mise en vente a échoué.",
                }
            );
        };
    
        useEffect(() => {
            if (session?.user?.id && !viewedUserId) {
                setViewedUserId(session.user.id);
            }
        }, [session, viewedUserId]);
    
        useEffect(() => {
            if (viewedUserId) {
                fetchCollection(viewedUserId);
            }
        }, [viewedUserId, fetchCollection]);
    
        if (loading) {
            return (
                <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                    <Loader className="w-12 h-12 animate-spin text-purple-400 mb-4" />
                    <p className="text-lg">Chargement de votre collection...</p>
                </div>
            );
        }
    
        if (error && !collection) {
            return (
                <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent text-white p-4">
                    <p className="text-lg text-red-400">{error}</p>
                    <Link href="/dashboard/mini-jeu/gacha" className="mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                        Retour au Gacha
                    </Link>
                </div>
            );
        }
    
        return (
            <div className="min-h-screen w-full bg-transparent text-white p-4 sm:p-6 lg:p-8">
                {/* Style pour l'aura des cartes Mythiques */}
                <MythicAuraStyle />
    
                {/* ✨ NOUVEAU: Conteneur pour la notification de vente */}
                <AnimatePresence>
                    {sellNotification.show && (
                        <SellSuccessToast message={sellNotification.message} onComplete={() => setSellNotification({ show: false, message: '' })} />
                    )}
                </AnimatePresence>
    
                {/* ✨ NOUVEAU: Modale de vente */}
                <AnimatePresence>
                    {sellModalInfo.show && sellModalInfo.card && (
                        <SellCardModal 
                            card={sellModalInfo.card}
                            onClose={() => setSellModalInfo({ show: false, card: null })}
                            onSell={handleSellCard}
                            onAuction={() => {
                                setAuctionModalInfo({ show: true, card: sellModalInfo.card });
                                setSellModalInfo({ show: false, card: null });
                            }}
                        />
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {auctionModalInfo.show && auctionModalInfo.card && (
                        <AuctionModal card={auctionModalInfo.card} onClose={() => setAuctionModalInfo({ show: false, card: null })} onConfirm={handleListCardForAuction} />
                    )}
                </AnimatePresence>
    
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-purple-400" />
                                {viewedUserId === session?.user?.id ? 'Ma Collection' : `Collection de ${collection?.username || '...'}`}
                            </h1>
                            {viewedUserId !== session?.user?.id && (
                                <button onClick={() => setViewedUserId(session?.user?.id || null)} className="text-sm text-purple-400 hover:underline mt-1">
                                    Voir ma collection
                                </button>
                            )}
                        </div>
                        <Link href="/dashboard/mini-jeu/gacha" className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                            <ArrowLeft size={16} />
                            Retour
                        </Link>
                    </div>
    
                    {/* ✨ NOUVEAU: Barre de recherche d'utilisateur */}
                    <div className="mb-8">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Entrez l'ID Discord d'un utilisateur..."
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button type="submit" className="px-6 py-2 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                                Chercher
                            </button>
                        </form>
                    </div>
    
    
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <StatCard icon={<Hash size={24} />} label="Cartes Uniques" value={collection?.uniqueCards || 0} />
                        <StatCard icon={<Layers size={24} />} label="Total (avec doublons)" value={collection?.totalCards || 0} />
                        <StatCard icon={<Star size={24} />} label="Animes Complétés" value={`${completedAnimes} / ${totalAnimes}`} />
                    </div>
    
                    {/* ✨ NOUVEAU: Barre de filtres et de tri */}
                    <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-lg flex flex-col lg:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter size={16} className="text-gray-400" />
                            <span className="font-semibold mr-2">Filtrer par rareté:</span>
                            {['all', 'Commun', 'Rare', 'Épique', 'Légendaire', 'Mythique'].map(rarity => (
                                <button
                                    key={rarity}
                                    onClick={() => setRarityFilter(rarity)}
                                    className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                                        rarityFilter.toLowerCase() === rarity.toLowerCase()
                                            ? `text-black ${rarity === 'all' 
                                                ? 'bg-white' 
                                                : `bg-gradient-to-r from-${(RARITY_STYLES[rarity]?.split(' ')[0] || '').replace('border-', '')} to-${(RARITY_STYLES[rarity]?.split(' ')[0] || '').replace('border-', '').replace('-500', '-400')}`
                                            }`
                                            : 'bg-black/30 text-white/70 hover:bg-white/20'
                                    }`}
                                >
                                    {rarity === 'all' ? 'Tout' : rarity}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setShowMissingCards(!showMissingCards)}
                                className="flex items-center gap-2 px-3 py-2 bg-black/30 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors"
                                title={showMissingCards ? "Cacher les cartes manquantes" : "Afficher les cartes manquantes"}
                            >
                                {showMissingCards ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            {/* ✨ NOUVEAU: Bouton pour changer le mode de regroupement */}
                            <button 
                                onClick={() => setGroupByAnime(!groupByAnime)}
                                className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors"
                                title={groupByAnime ? "Afficher en grille simple" : "Regrouper par anime"}
                            >
                                {groupByAnime ? 
                                    <Layers size={16} /> : 
                                    <BookOpen size={16} />
                                }
                                <span>{groupByAnime ? "Par Anime" : "Grille"}</span>
                            </button>
                            <div className="relative">
                            <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors">
                                Trier par
                                <ChevronDown size={16} className={`transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isSortDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-white/20 rounded-lg shadow-lg z-10">
                                    <a onClick={() => { setSortOrder('rarity_desc'); setIsSortDropdownOpen(false); }} className="block px-4 py-2 text-sm hover:bg-purple-600/50 cursor-pointer">Rareté (décroissant)</a>
                                    <a onClick={() => { setSortOrder('rarity_asc'); setIsSortDropdownOpen(false); }} className="block px-4 py-2 text-sm hover:bg-purple-600/50 cursor-pointer">Rareté (croissant)</a>
                                    <a onClick={() => { setSortOrder('power_desc'); setIsSortDropdownOpen(false); }} className="block px-4 py-2 text-sm hover:bg-purple-600/50 cursor-pointer">Puissance (décroissant)</a>
                                    <a onClick={() => { setSortOrder('power_asc'); setIsSortDropdownOpen(false); }} className="block px-4 py-2 text-sm hover:bg-purple-600/50 cursor-pointer">Puissance (croissant)</a>
                                    <a onClick={() => { setSortOrder('name_asc'); setIsSortDropdownOpen(false); }} className="block px-4 py-2 text-sm hover:bg-purple-600/50 cursor-pointer">Nom (A-Z)</a>
                                    <a onClick={() => { setSortOrder('name_desc'); setIsSortDropdownOpen(false); }} className="block px-4 py-2 text-sm hover:bg-purple-600/50 cursor-pointer">Nom (Z-A)</a>
                                </div>
                            )}
                        </div>
                        </div>
                    </div>
    
                    {groupByAnime ? (
                        // --- AFFICHAGE GROUPÉ PAR ANIME ---
                        processedCollections && processedCollections.length > 0 ? (
                            <div className="space-y-10">
                                {processedCollections.map((animeCollection) => (
                                    <div key={animeCollection.anime}>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-purple-500/50 pb-2 mb-6">
                                            <h2 className="text-2xl font-semibold">
                                                {animeCollection.anime}
                                            </h2>
                                            <span className="text-sm font-medium text-gray-400">
                                                ({animeCollection.ownedInAnime}/{animeCollection.totalInAnime})
                                            </span>
                                            {animeCollection.ownedInAnime === animeCollection.totalInAnime && (
                                                <span className="px-3 py-1 text-xs font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-md shadow-yellow-500/20">
                                                    Collection Complète
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                            {animeCollection.cards.map((card) => (
                                                card.isOwned ? (
                                                    <motion.div
                                                        key={card.id}
                                                        layout
                                                        className={`group relative rounded-xl overflow-hidden flex flex-col h-64 border-2 ${RARITY_STYLES[card.rarity] || RARITY_STYLES['Commun']} ${card.rarity === 'Mythique' ? 'holographic-border' : ''}`}
                                                        style={card.rarity === 'Mythique' ? { animation: 'mythic-aura-pulse 4s ease-in-out infinite' } : {}}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                                        whileHover={{ 
                                                            y: -8, 
                                                            scale: 1.05, 
                                                            boxShadow: card.rarity !== 'Mythique' ? `0 0 25px -5px ${RARITY_STYLES[card.rarity]?.split(' ')[2]?.replace('shadow-', 'rgba(').replace('/10', ', 0.4)').replace('/30', ', 0.5)').replace('/40', ', 0.6)').replace('/50', ', 0.7)').replace('/60', ', 0.8)') || 'rgba(255,255,255,0.1)'}` : undefined,
                                                            transition: { duration: 0.2, ease: "circOut" }
                                                        }}> 
                                                        <div className="absolute top-1 left-1 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-br-lg rounded-tl-md z-10">
                                                            #{card.id.split('_')[1]}
                                                        </div>
                                                        <div className="flex-grow relative overflow-hidden">
                                                            <CardImage card={card} className="absolute inset-0 w-full h-full object-cover" />
                                                        </div>
                                                        <div className="p-2 bg-black/40 backdrop-blur-sm flex-shrink-0">
                                                            <p className="font-bold text-sm truncate text-white">{card.name}</p>
                                                            <div className="flex justify-center items-center gap-1 mt-1">
                                                                {getRarityStars(card.rarity)}
                                                            </div>
                                                            {viewedUserId === session?.user?.id && card.count > 1 && (
                                                                <button 
                                                                    onClick={() => setSellModalInfo({ show: true, card: { cardId: card.id, count: card.count, cardInfo: card } })}
                                                                    className="absolute bottom-2 right-2 w-7 h-7 bg-red-600/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    title="Vendre cette carte"
                                                                >
                                                                    <Coins size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        {card.count > 1 && (
                                                            <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-slate-800">
                                                                x{card.count}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key={card.id}
                                                        layout
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                                        className="group relative rounded-xl overflow-hidden flex flex-col h-64 border-2 border-dashed border-white/20 bg-black/30"
                                                    >
                                                        <div className="absolute top-1 left-1 bg-black/50 text-white/50 text-xs font-bold px-2 py-1 rounded-br-lg rounded-tl-md z-10">
                                                            #{card.id.split('_')[1]}
                                                        </div>
                                                        <div className="flex-grow flex items-center justify-center">
                                                            <span className="text-5xl font-bold text-white/20">?</span>
                                                        </div>
                                                        <div className="p-2 bg-black/40 flex-shrink-0 h-[60px]">
                                                            <p className="font-bold text-sm truncate text-white/40 text-center">?????</p>
                                                             <div className="flex justify-center items-center gap-1 mt-1">
                                                                {getRarityStars(card.rarity)}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-lg">
                                <h2 className="text-2xl font-bold mb-2">Aucune carte ne correspond à vos filtres.</h2>
                                <p className="text-gray-400">Essayez de sélectionner une autre rareté.</p>
                            </div>
                        )
                    ) : (
                        // --- ✨ NOUVEAU: AFFICHAGE EN GRILLE SIMPLE ---
                        flatCardList.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {flatCardList.map((card) => (
                                    card.isOwned ? (
                                    <motion.div
                                        key={card.id}
                                        layout
                                        className={`group relative rounded-xl overflow-hidden flex flex-col h-64 border-2 ${RARITY_STYLES[card.rarity] || RARITY_STYLES['Commun']} ${card.rarity === 'Mythique' ? 'holographic-border' : ''}`}
                                        style={card.rarity === 'Mythique' ? { animation: 'mythic-aura-pulse 4s ease-in-out infinite' } : {}}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        whileHover={{ 
                                            y: -8,
                                            scale: 1.05, 
                                            boxShadow: card.rarity !== 'Mythique' ? `0 0 25px -5px ${RARITY_STYLES[card.rarity]?.split(' ')[2]?.replace('shadow-', 'rgba(').replace('/10', ', 0.4)').replace('/30', ', 0.5)').replace('/40', ', 0.6)').replace('/50', ', 0.7)').replace('/60', ', 0.8)') || 'rgba(255,255,255,0.1)'}` : undefined,
                                            transition: { duration: 0.2, ease: "circOut" }
                                        }}> 
                                        <div className="absolute top-1 left-1 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-br-lg rounded-tl-md z-10">
                                            #{card.id.split('_')[1]}
                                        </div>
                                        <div className="flex-grow relative overflow-hidden">
                                            <CardImage card={card.cardInfo} className="absolute inset-0 w-full h-full object-cover" />
                                        </div>
                                        <div className="p-2 bg-black/40 backdrop-blur-sm flex-shrink-0">
                                            <p className="font-bold text-sm truncate text-white">{card.name}</p>
                                            <div className="flex justify-center items-center gap-1 mt-1">
                                                {getRarityStars(card.rarity)}
                                            </div>
                                            {viewedUserId === session?.user?.id && card.count > 1 && (
                                                <button 
                                                    onClick={() => setSellModalInfo({ show: true, card: { cardId: card.id, count: card.count, cardInfo: card.cardInfo } })}
                                                    className="absolute bottom-2 right-2 w-7 h-7 bg-red-600/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Vendre cette carte"
                                                >
                                                    <Coins size={14} />
                                                </button>
                                            )}
                                                </div>
                                        {card.count > 1 && (
                                            <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-slate-800">
                                                x{card.count}
                                            </div>
                                        )}
                                    </motion.div>
                                    ) : (
                                        <motion.div
                                            key={card.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                            className="group relative rounded-xl overflow-hidden flex flex-col h-64 border-2 border-dashed border-white/20 bg-black/30"
                                        >
                                            <div className="absolute top-1 left-1 bg-black/50 text-white/50 text-xs font-bold px-2 py-1 rounded-br-lg rounded-tl-md z-10">
                                                #{card.id.split('_')[1]}
                                            </div>
                                            <div className="flex-grow flex items-center justify-center">
                                                <span className="text-5xl font-bold text-white/20">?</span>
                                            </div>
                                            <div className="p-2 bg-black/40 flex-shrink-0 h-[60px]">
                                                <p className="font-bold text-sm truncate text-white/40 text-center">?????</p>
                                                <div className="flex justify-center items-center gap-1 mt-1">
                                                    {getRarityStars(card.rarity)}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-lg">
                                <h2 className="text-2xl font-bold mb-2">Aucune carte ne correspond à vos filtres.</h2>
                                <p className="text-gray-400">Essayez de sélectionner une autre rareté.</p>
                            </div>
                        )
                    )}
    
                    {(groupByAnime ? processedCollections.length === 0 : flatCardList.length === 0) && collection && collection.totalCards === 0 && (
                         <div className="text-center py-20 bg-white/5 rounded-lg mt-10">
                            <h2 className="text-2xl font-bold mb-2">Votre collection est vide.</h2>
                            <p className="text-gray-400 mb-6">Il est temps de faire votre premier souhait !</p>
                            <Link href="/dashboard/mini-jeu/gacha" className="px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                                Faire un vœu
                            </Link>
                                                </div>
                    )} 
                </div>
            </div>
        );
    }
    