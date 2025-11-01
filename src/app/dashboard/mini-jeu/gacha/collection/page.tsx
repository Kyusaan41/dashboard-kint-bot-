"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Loader, BookOpen, Star, Layers, Hash, Filter, ChevronDown, Coins, Tag } from 'lucide-react';
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
    'Mythique': 'border-red-500 bg-red-800/50 shadow-red-500/60', // Rouge
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
const SellCardModal = ({ card, onSell, onAuction, onClose }: { card: CollectedCard, onSell: (cardId: string) => void, onAuction: () => void, onClose: () => void }) => {
    if (!card?.cardInfo) return null;

    const sellPrices: { [key: string]: number } = { 'Commun': 80, 'Rare': 250, 'Épique': 550, 'Légendaire': 1500, 'Mythique': 3100 };
    const sellPrice = sellPrices[card.cardInfo.rarity] || 20;

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

                <div className="space-y-4">
                    {/* Option 1: Vente à la banque */}
                    <button
                        onClick={() => onSell(card.cardId)}
                        className="w-full text-left p-4 bg-green-600/20 border border-green-500 rounded-lg flex items-center gap-4 hover:bg-green-600/40 transition-all group"
                    >
                        <Coins className="w-8 h-8 text-green-400 flex-shrink-0 transition-transform group-hover:scale-110" />
                        <div>
                            <p className="font-bold text-white">Vente Instantanée</p>
                            <p className="text-sm text-green-300/80">Recevez immédiatement <span className="font-bold">{sellPrice}</span> pièces.</p>
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
    const filteredAndSortedCollections = useMemo(() => {
        if (!collection) return [];

        const rarityOrder: { [key: string]: number } = { 'Mythique': 5, 'Légendaire': 4, 'Épique': 3, 'Rare': 2, 'Commun': 1 };

        return collection.collections
            .map(animeCollection => {
                let cards = [...animeCollection.cards];

                // 1. Filtrage par rareté
                if (rarityFilter !== 'all') {
                    // ✨ CORRECTION: Comparaison insensible à la casse
                    cards = cards.filter(c => c.cardInfo && c.cardInfo.rarity.toLowerCase() === rarityFilter.toLowerCase());
                }

                // 2. Tri
                cards.sort((a, b) => {
                    if (!a.cardInfo || !b.cardInfo) return 0;
                    switch (sortOrder) {
                        case 'rarity_asc':
                            return (rarityOrder[a.cardInfo.rarity] || 0) - (rarityOrder[b.cardInfo.rarity] || 0);
                        case 'power_desc':
                            return b.cardInfo.power - a.cardInfo.power;
                        case 'power_asc':
                            return a.cardInfo.power - b.cardInfo.power;
                        case 'name_asc':
                            return a.cardInfo.name.localeCompare(b.cardInfo.name);
                        case 'name_desc':
                            return b.cardInfo.name.localeCompare(a.cardInfo.name);
                        case 'rarity_desc':
                        default:
                            return (rarityOrder[b.cardInfo.rarity] || 0) - (rarityOrder[a.cardInfo.rarity] || 0);
                    }
                });
                return { ...animeCollection, cards };
            }).filter(ac => ac.cards.length > 0); // Ne pas afficher les animes sans cartes après filtrage
    }, [collection, rarityFilter, sortOrder]);
    
    // ✨ NOUVEAU: Logique pour l'affichage non groupé
    const flatCardList = useMemo(() => {
        if (groupByAnime || !filteredAndSortedCollections) return [];
        
        const allCards = filteredAndSortedCollections.flatMap(ac => ac.cards);
        const rarityOrder: { [key: string]: number } = { 'Mythique': 5, 'Légendaire': 4, 'Épique': 3, 'Rare': 2, 'Commun': 1 };

        allCards.sort((a, b) => {
            if (!a.cardInfo || !b.cardInfo) return 0;
            switch (sortOrder) {
                case 'rarity_asc': return (rarityOrder[a.cardInfo.rarity] || 0) - (rarityOrder[b.cardInfo.rarity] || 0);
                case 'power_desc': return b.cardInfo.power - a.cardInfo.power;
                case 'power_asc': return a.cardInfo.power - b.cardInfo.power;
                case 'name_asc': return a.cardInfo.name.localeCompare(b.cardInfo.name);
                case 'name_desc': return b.cardInfo.name.localeCompare(a.cardInfo.name);
                case 'rarity_desc':
                default: return (rarityOrder[b.cardInfo.rarity] || 0) - (rarityOrder[a.cardInfo.rarity] || 0);
            }
        });
        return allCards;
    }, [filteredAndSortedCollections, groupByAnime, sortOrder]);
    
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
    const handleSellCard = async (cardId: string) => {
        if (!session?.user?.id) return;

        toast.promise(
            fetch(API_ENDPOINTS.gachaSellCard, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id, cardId }),
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
                    return data.message || "Carte vendue avec succès !";
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
                    return data.message || "Votre carte est maintenant sur le marché !";
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
                                        ? `text-black ${rarity === 'all' ? 'bg-white' : `bg-gradient-to-r ${Object.values(RARITY_STYLES[rarity] || {})[0] || 'from-gray-400 to-gray-600'}`}`
                                        : 'bg-black/30 text-white/70 hover:bg-white/20'
                                }`}
                            >
                                {rarity === 'all' ? 'Tout' : rarity}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
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
                    filteredAndSortedCollections && filteredAndSortedCollections.length > 0 ? (
                        <div className="space-y-10">
                            {filteredAndSortedCollections.map((animeCollection) => (
                                <div key={animeCollection.anime}>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-purple-500/50 pb-2 mb-6">
                                        <h2 className="text-2xl font-semibold">
                                            {animeCollection.anime}
                                        </h2>
                                        <span className="text-sm font-medium text-gray-400">
                                            ({animeCollection.cards.length}/{ANIME_CARDS.filter(c => c.anime === animeCollection.anime).length})
                                        </span>
                                        {animeCollection.cards.length === ANIME_CARDS.filter(c => c.anime === animeCollection.anime).length && (
                                            <span className="px-3 py-1 text-xs font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-md shadow-yellow-500/20">
                                                Collection Complète
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                        {animeCollection.cards.map(({ cardId, count, cardInfo }) => (
                                            cardInfo && (
                                            <motion.div
                                                key={cardId}
                                                layout
                                                className={`group relative rounded-xl border-2 overflow-hidden flex flex-col h-64 ${RARITY_STYLES[cardInfo.rarity] || RARITY_STYLES['Commun']}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, ease: "easeOut" }}
                                                whileHover={{ 
                                                    y: -8, 
                                                    scale: 1.05, 
                                                    boxShadow: `0 0 25px -5px ${RARITY_STYLES[cardInfo.rarity]?.split(' ')[2].replace('shadow-', 'rgba(').replace('/10', ', 0.4)').replace('/30', ', 0.5)').replace('/40', ', 0.6)').replace('/50', ', 0.7)').replace('/60', ', 0.8)') || 'rgba(255,255,255,0.1)'}`,
                                                    transition: { duration: 0.2, ease: "circOut" }
                                                }}> 
                                                <div className="flex-grow relative overflow-hidden">
                                                    {cardInfo.rarity === 'Mythique' && (
                                                        <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                                                             style={{
                                                                 background: 'linear-gradient(110deg, transparent 25%, rgba(255, 255, 255, 0.4) 50%, transparent 75%)',
                                                                 backgroundSize: '200% 100%',
                                                                 animation: 'holographicShine 3s infinite linear'
                                                             }}></div>
                                                    )}
                                                    <CardImage card={cardInfo} className="absolute inset-0 w-full h-full object-cover" />
                                                </div>
                                                <div className="p-2 bg-black/40 backdrop-blur-sm flex-shrink-0">
                                                    <p className="font-bold text-sm truncate text-white">{cardInfo.name}</p>
                                                    <div className="flex justify-center items-center gap-1 mt-1">
                                                        {getRarityStars(cardInfo.rarity)}
                                                    </div>
                                                    {viewedUserId === session?.user?.id && count > 1 && (
                                                        <button 
                                                            onClick={() => setSellModalInfo({ show: true, card: { cardId, count, cardInfo } })}
                                                            className="absolute bottom-2 right-2 w-7 h-7 bg-red-600/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Vendre cette carte"
                                                        >
                                                            <Coins size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                {count > 1 && (
                                                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-slate-800">
                                                        x{count}
                                                    </div>
                                                )}
                                            </motion.div>)
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
                            {flatCardList.map(({ cardId, count, cardInfo }) => (
                                cardInfo && (
                                <motion.div
                                    key={cardId}
                                    layout
                                    className={`group relative rounded-xl border-2 overflow-hidden flex flex-col h-64 ${RARITY_STYLES[cardInfo.rarity] || RARITY_STYLES['Commun']}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    whileHover={{ 
                                        y: -8, 
                                        scale: 1.05, 
                                        boxShadow: `0 0 25px -5px ${RARITY_STYLES[cardInfo.rarity]?.split(' ')[2].replace('shadow-', 'rgba(').replace('/10', ', 0.4)').replace('/30', ', 0.5)').replace('/40', ', 0.6)').replace('/50', ', 0.7)').replace('/60', ', 0.8)') || 'rgba(255,255,255,0.1)'}`,
                                        transition: { duration: 0.2, ease: "circOut" }
                                    }}> 
                                    <div className="flex-grow relative overflow-hidden">
                                        {cardInfo.rarity === 'Mythique' && (
                                            <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                                                 style={{
                                                     background: 'linear-gradient(110deg, transparent 25%, rgba(255, 255, 255, 0.4) 50%, transparent 75%)',
                                                     backgroundSize: '200% 100%',
                                                     animation: 'holographicShine 3s infinite linear'
                                                 }}></div>
                                        )}
                                        <CardImage card={cardInfo} className="absolute inset-0 w-full h-full object-cover" />
                                    </div>
                                    <div className="p-2 bg-black/40 backdrop-blur-sm flex-shrink-0">
                                        <p className="font-bold text-sm truncate text-white">{cardInfo.name}</p>
                                        <div className="flex justify-center items-center gap-1 mt-1">
                                            {getRarityStars(cardInfo.rarity)}
                                        </div>
                                        {viewedUserId === session?.user?.id && count > 1 && (
                                            <button 
                                                onClick={() => setSellModalInfo({ show: true, card: { cardId, count, cardInfo } })}
                                                className="absolute bottom-2 right-2 w-7 h-7 bg-red-600/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Vendre cette carte"
                                            >
                                                <Coins size={14} />
                                            </button>
                                        )}
                                            </div>
                                    {count > 1 && (
                                        <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-slate-800">
                                            x{count}
                                        </div>
                                    )}
                                </motion.div>)
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/5 rounded-lg">
                            <h2 className="text-2xl font-bold mb-2">Aucune carte ne correspond à vos filtres.</h2>
                            <p className="text-gray-400">Essayez de sélectionner une autre rareté.</p>
                        </div>
                    )
                )}

                {(groupByAnime ? filteredAndSortedCollections.length === 0 : flatCardList.length === 0) && collection && collection.totalCards === 0 && (
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