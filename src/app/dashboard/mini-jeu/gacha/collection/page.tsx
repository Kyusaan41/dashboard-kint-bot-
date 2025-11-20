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
    'Commun': 'border-gray-500 bg-gray-800/50 shadow-gray-500/20 shadow-lg', // Gris
    'Rare': 'border-blue-500 bg-blue-800/50 shadow-blue-500/50 shadow-lg', // Bleu
    'Épique': 'border-purple-500 bg-purple-800/50 shadow-purple-500/60 shadow-lg', // Violet
    'Légendaire': 'border-orange-500 bg-orange-800/50 shadow-orange-500/70 shadow-lg', // Orange
    'Mythique': 'bg-red-800/50 shadow-red-500/80 shadow-lg', // Rouge - bordure gérée par la classe holographic-border
};

// Estimation locale du nombre de fragments gagnés par rareté (doit rester cohérent avec le backend)
const FRAGMENTS_PER_RARITY: { [key: string]: number } = {
    'Commun': 5,
    'Rare': 15,
    'Épique': 45,
    'Légendaire': 135,
    'Mythique': 400,
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

// --- NOUVEAU: MODALE DE DESTRUCTION DE CARTE (FRAGMENTS) ---
const SellCardModal = ({ card, onSell, onAuction, onClose }: { card: CollectedCard, onSell: (cardId: string, quantity: number) => void, onAuction: () => void, onClose: () => void }) => {
    const [quantity, setQuantity] = useState(1);
    const INSTANT_SELL_DISABLED = false; // Désormais utilisée pour détruire contre des fragments d'étoiles

    if (!card?.cardInfo) return null;

    const estimatedFragmentsPerCard = FRAGMENTS_PER_RARITY[card.cardInfo.rarity] || 0;
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
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl shadow-purple-500/10 max-w-2xl w-full relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Fond décoratif avec effet de particules */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-3xl" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-2xl" />

                {/* Header avec titre et bouton de fermeture */}
                <div className="relative z-10 flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Tag className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Détruire la carte
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                        <span className="text-white text-lg leading-none">×</span>
                    </button>
                </div>

                {/* Section carte avec effets améliorés */}
                <div className="relative z-10 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 mb-6 border border-white/10">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <motion.div
                            className={`relative w-40 h-56 rounded-xl overflow-hidden border-2 ${RARITY_STYLES[card.cardInfo.rarity] || RARITY_STYLES['Commun']} ${card.cardInfo.rarity === 'Mythique' ? 'holographic-border' : ''} shadow-2xl`}
                            style={card.cardInfo.rarity === 'Mythique' ? { animation: 'mythic-aura-pulse 4s ease-in-out infinite' } : {}}
                            whileHover={{ scale: 1.05, rotateY: 5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CardImage card={card.cardInfo} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        </motion.div>

                        <div className="flex-1 text-center md:text-left">
                            <h4 className="text-2xl font-bold text-white mb-2">{card.cardInfo.name}</h4>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${RARITY_STYLES[card.cardInfo.rarity]?.replace('border-','bg-').replace('bg-gray-800','bg-gray-600').replace('bg-blue-800','bg-blue-600').replace('bg-purple-800','bg-purple-600').replace('bg-orange-800','bg-orange-600').replace('/50','/80') || 'bg-gray-600'} text-white shadow-lg`}>
                                    {card.cardInfo.rarity}
                                </span>
                                <div className="flex gap-1">
                                    {getRarityStars(card.cardInfo.rarity)}
                                </div>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-300">
                                <Layers className="w-4 h-4" />
                                <span className="text-sm">Possédées: <span className="font-bold text-white">x{card.count}</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section quantité avec design amélioré */}
                {maxQuantity > 0 && (
                    <div className="relative z-10 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl p-6 mb-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-lg font-semibold text-white flex items-center gap-2">
                                <Hash className="w-5 h-5 text-purple-400" />
                                Quantité à détruire
                            </label>
                            <span className="text-sm text-gray-400">Maximum: {maxQuantity}</span>
                        </div>

                        <div className="flex items-center justify-center gap-6">
                            <motion.button
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1}
                                className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 disabled:from-gray-600 disabled:to-gray-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                −
                            </motion.button>

                            <div className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-white/20 rounded-xl px-6 py-3 min-w-[80px] text-center">
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        if (isNaN(val)) {
                                            setQuantity(1);
                                        } else {
                                            setQuantity(Math.max(1, Math.min(val, maxQuantity)));
                                        }
                                    }}
                                    className="w-full bg-transparent text-center text-2xl font-bold text-white focus:outline-none"
                                    min="1"
                                    max={maxQuantity}
                                />
                            </div>

                            <motion.button
                                onClick={() => handleQuantityChange(1)}
                                disabled={quantity >= maxQuantity}
                                className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                +
                            </motion.button>
                        </div>

                        <div className="mt-4 text-center">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-lg px-4 py-2">
                                <Star className="w-5 h-5 text-yellow-400" />
                                <span className="text-yellow-300 font-semibold">
                                    Fragments estimés: ~{estimatedFragmentsPerCard * quantity} fragments d'étoiles
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Section options de vente avec design amélioré */}
                <div className="relative z-10 space-y-4">
                    {/* Option 1: Destruction de carte contre fragments d'étoiles */}
                    <motion.button
                        onClick={() => onSell(card.cardId, quantity)}
                        disabled={INSTANT_SELL_DISABLED || quantity <= 0 || quantity > maxQuantity}
                        className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 group relative overflow-hidden ${
                            INSTANT_SELL_DISABLED
                                ? 'bg-gradient-to-r from-gray-700/50 to-gray-800/50 border-gray-600/50 cursor-not-allowed opacity-60'
                                : 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20'
                        }`}
                        whileHover={!INSTANT_SELL_DISABLED ? { scale: 1.02 } : {}}
                        whileTap={!INSTANT_SELL_DISABLED ? { scale: 0.98 } : {}}
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                INSTANT_SELL_DISABLED
                                    ? 'bg-gray-600/50'
                                    : 'bg-gradient-to-br from-green-500 to-emerald-500 group-hover:scale-110 shadow-lg'
                            }`}>
                                <Star className={`w-6 h-6 ${
                                    INSTANT_SELL_DISABLED ? 'text-gray-400' : 'text-white'
                                }`} />
                            </div>
                            <div className="text-left flex-1">
                                <p className={`text-lg font-bold mb-1 ${
                                    INSTANT_SELL_DISABLED ? 'text-gray-400' : 'text-white'
                                }`}>Détruire pour des fragments</p>
                                <p className={`text-sm ${
                                    INSTANT_SELL_DISABLED ? 'text-gray-500' : 'text-green-300'
                                }`}>
                                    {INSTANT_SELL_DISABLED
                                        ? 'Temporairement indisponible'
                                        : `Transformez ces cartes en fragments d'étoiles`
                                    }
                                </p>
                            </div>
                            {!INSTANT_SELL_DISABLED && (
                                <div className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowLeft className="w-5 h-5 rotate-180" />
                                </div>
                            )}
                        </div>
                        {!INSTANT_SELL_DISABLED && (
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                    </motion.button>

                    {/* Option 2: Maison des ventes */}
                    <motion.button
                        onClick={onAuction}
                        className="w-full p-6 rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500/50 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group relative overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 shadow-lg transition-all duration-300">
                                <Layers className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left flex-1">
                                <p className="text-lg font-bold text-white mb-1">Mettre aux Enchères</p>
                                <p className="text-sm text-purple-300">Vendez à d'autres joueurs pour un meilleur prix</p>
                            </div>
                            <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>
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
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl shadow-purple-500/10 max-w-2xl w-full relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Fond décoratif avec effet de particules */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-3xl" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-2xl" />

                {/* Header avec titre et bouton de fermeture */}
                <div className="relative z-10 flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Mettre aux Enchères
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                        <span className="text-white text-lg leading-none">×</span>
                    </button>
                </div>

                {/* Section carte avec effets améliorés */}
                <div className="relative z-10 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 mb-6 border border-white/10">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <motion.div
                            className={`relative w-40 h-56 rounded-xl overflow-hidden border-2 ${RARITY_STYLES[card.cardInfo.rarity] || RARITY_STYLES['Commun']} ${card.cardInfo.rarity === 'Mythique' ? 'holographic-border' : ''} shadow-2xl`}
                            style={card.cardInfo.rarity === 'Mythique' ? { animation: 'mythic-aura-pulse 4s ease-in-out infinite' } : {}}
                            whileHover={{ scale: 1.05, rotateY: 5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CardImage card={card.cardInfo} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        </motion.div>

                        <div className="flex-1 text-center md:text-left">
                            <h4 className="text-2xl font-bold text-white mb-2">{card.cardInfo.name}</h4>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${RARITY_STYLES[card.cardInfo.rarity]?.replace('border-','bg-').replace('bg-gray-800','bg-gray-600').replace('bg-blue-800','bg-blue-600').replace('bg-purple-800','bg-purple-600').replace('bg-orange-800','bg-orange-600').replace('/50','/80') || 'bg-gray-600'} text-white shadow-lg`}>
                                    {card.cardInfo.rarity}
                                </span>
                                <div className="flex gap-1">
                                    {getRarityStars(card.cardInfo.rarity)}
                                </div>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-300">
                                <Layers className="w-4 h-4" />
                                <span className="text-sm">Carte unique à mettre en vente</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section prix avec design amélioré */}
                <div className="relative z-10 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl p-6 mb-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <Tag className="w-5 h-5 text-purple-400" />
                        <label className="text-lg font-semibold text-white">Prix de départ</label>
                    </div>

                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400">
                            <Coins className="w-5 h-5" />
                        </div>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-white/20 rounded-xl pl-12 pr-4 py-4 text-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-200"
                            placeholder="Ex: 5000"
                            min="1"
                        />
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-400">
                            Les enchères dureront 24 heures. Le plus offrant remportera la carte.
                        </p>
                    </div>
                </div>

                {/* Bouton de confirmation avec design amélioré */}
                <motion.button
                    onClick={handleConfirm}
                    className="relative z-10 w-full p-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl font-bold text-white text-lg shadow-lg hover:shadow-purple-500/30 transition-all duration-300 group overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="flex items-center justify-center gap-3 relative z-10">
                        <Layers className="w-6 h-6" />
                        <span>Confirmer la mise aux enchères</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
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

    // ✨ NOUVEAU: Autocomplete des utilisateurs + recherche de cartes
    const [members, setMembers] = useState<Array<{ id: string; username: string; avatar: string }>>([]);
    const [showUserSuggestions, setShowUserSuggestions] = useState(false);
    const [cardQuery, setCardQuery] = useState('');

    // Solde local de fragments d'étoiles (optionnel)
    const [fragmentsBalance, setFragmentsBalance] = useState<number | null>(null);

    // Mode fusion et cartes sélectionnées pour la fusion
    const [fusionMode, setFusionMode] = useState(false);
    const [selectedForFusion, setSelectedForFusion] = useState<string[]>([]);
    const [fusionResultCard, setFusionResultCard] = useState<AnimeCard | null>(null);

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

    // Récupérer le solde de fragments pour l'utilisateur courant
    useEffect(() => {
        const fetchFragments = async () => {
            if (!session?.user?.id) return;
            try {
                const res = await fetch('/api/currency/me', { cache: 'no-store' });
                if (!res.ok) return;
                const data = await res.json();
                if (typeof data.fragments_etoiles === 'number') {
                    setFragmentsBalance(data.fragments_etoiles);
                }
            } catch {
                // silencieux : le manque de fragments n'empêche pas la page de fonctionner
            }
        };

        fetchFragments();
    }, [session]);

    // Gestion du mode fusion
    const toggleFusionMode = () => {
        setFusionMode((prev) => {
            const next = !prev;
            if (!next) {
                setSelectedForFusion([]);
            }
            return next;
        });
    };

    const toggleCardForFusion = (cardId: string) => {
        setSelectedForFusion((current) => {
            // Si déjà sélectionnée → on la retire
            if (current.includes(cardId)) {
                return current.filter((id) => id !== cardId);
            }
            // Limiter à 3 cartes
            if (current.length >= 3) return current;
            return [...current, cardId];
        });
    };

    const handleFusion = async () => {
        if (!session?.user?.id) return;
        if (selectedForFusion.length !== 3) {
            toast.error('Vous devez sélectionner exactement 3 cartes pour fusionner.');
            return;
        }

        const payload = {
            userId: session.user.id,
            cardIds: selectedForFusion,
        };

        toast.promise(
            fetch(API_ENDPOINTS.gachaFusion, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }).then(async (res) => {
                const data = await res.json();
                if (!res.ok || data.success === false) {
                    throw new Error(data.message || 'La fusion a échoué.');
                }
                // Préparer les données pour le reveal (chercher la carte complète par id)
                const gained = data?.gainedCard;
                if (gained?.cardId || gained?.id) {
                    const cardInfo = getCardById(gained.cardId || gained.id);
                    if (cardInfo) {
                        setFusionResultCard(cardInfo);
                    }
                }
                return data;
            }),
            {
                loading: 'Fusion en cours...',
                success: (data: any) => {
                    setSelectedForFusion([]);
                    setFusionMode(false);
                    if (viewedUserId) fetchCollection(viewedUserId);
                    const gained = data?.gainedCard;
                    if (gained?.name && gained?.rarity) {
                        return `Fusion réussie ! Vous obtenez ${gained.name} (${gained.rarity}).`;
                    }
                    return 'Fusion réussie !';
                },
                error: (err) => err.message || 'La fusion a échoué.',
            }
        );
    };

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
            const q = searchInput.trim();
            if (!q) return;
            const match = members.find(m => m.username.toLowerCase().includes(q.toLowerCase()))
                || members.find(m => m.id === q);
            if (match) {
                setViewedUserId(match.id);
                setSearchInput(match.username);
                setShowUserSuggestions(false);
            } else {
                setViewedUserId(q);
            }
        };

        // ✨ NOUVEAU: Suggestions d'utilisateurs filtrées
        const userSuggestions = useMemo(() => {
            const q = searchInput.trim().toLowerCase();
            if (!q) return [] as Array<{ id: string; username: string; avatar: string }>;
            return members.filter(m => m.username.toLowerCase().includes(q)).slice(0, 8);
        }, [members, searchInput]);

        // ✨ NOUVEAU: Recherche d'une carte par nom et scroll vers la carte possédée
        const handleCardSearch = (e: React.FormEvent) => {
            e.preventDefault();
            const q = cardQuery.trim().toLowerCase();
            if (!q) return;
            const match = ANIME_CARDS.find(c => c.name.toLowerCase().includes(q));
            if (!match) {
                toast.error('Carte introuvable.');
                return;
            }
            const owned = !!collection?.collections.flatMap(c => c.cards).find(c => c.cardId === match.id);
            if (!owned) {
                toast.error("Vous ne possédez pas cette carte.");
                return;
            }
            const el = document.querySelector(`[data-card-id="${match.id}"]`) as HTMLElement | null;
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                toast.message?.('Carte trouvée, mais non visible avec les filtres actuels.');
            }
        };
    
        // ✨ NOUVEAU: Logique de destruction → fragments d'étoiles
        const handleSellCard = async (cardId: string, quantity: number) => {
            if (!session?.user?.id) return;

            toast.promise(
                fetch(API_ENDPOINTS.gachaDestroyCard, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: session.user.id, cardId, quantity }),
                }).then(async (res) => {
                    const data = await res.json();
                    if (!res.ok || data.success === false) {
                        throw new Error(data.message || 'Une erreur est survenue lors de la destruction.');
                    }
                    return data;
                }),
                {
                    loading: 'Destruction en cours...',
                    success: (data: any) => {
                        setSellModalInfo({ show: false, card: null }); // Fermer la modale
                        if (viewedUserId) fetchCollection(viewedUserId); // Recharger la collection

                        const gained = typeof data?.fragmentsGained === 'number' ? data.fragmentsGained : undefined;
                        if (gained && gained > 0) {
                            return `Carte détruite avec succès ! +${gained} fragments d'étoiles obtenus.`;
                        }
                        return data.message || 'Carte détruite avec succès !';
                    },
                    error: (err) => err.message || 'La destruction a échoué.',
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

        // ✨ Initialiser l'utilisateur affiché depuis la session
        useEffect(() => {
            if (session?.user?.id && !viewedUserId) {
                setViewedUserId(session.user.id);
            }
        }, [session, viewedUserId]);

        // ✨ Charger la collection quand l'utilisateur change
        useEffect(() => {
            if (viewedUserId) {
                fetchCollection(viewedUserId);
            }
        }, [viewedUserId, fetchCollection]);

        // ✨ Charger la liste des membres pour l'autocomplete
        useEffect(() => {
            (async () => {
                try {
                    const res = await fetch('/api/discord/members');
                    if (res.ok) {
                        const data = await res.json();
                        setMembers(Array.isArray(data?.members) ? data.members : []);
                    }
                } catch (e) {
                    // ignore
                }
            })();
        }, []);

        // ✨ Chargement
        if (loading && !collection) {
            return (
                <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent text-white p-4">
                    <Loader className="w-6 h-6 animate-spin mb-2" />
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
                {/* Reveal de fusion */}
                <AnimatePresence>
                    {fusionResultCard && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-4"
                            onClick={() => setFusionResultCard(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 260 }}
                                className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 border border-purple-500/50 shadow-2xl max-w-md w-full overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-amber-400/10" />
                                <div className="relative z-10 flex flex-col items-center gap-4">
                                    <h3 className="text-xl font-bold text-white mb-2">Carte obtenue par fusion</h3>
                                    <motion.div
                                        initial={{ rotateY: -90 }}
                                        animate={{ rotateY: 0 }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                        className={`relative w-48 h-64 rounded-xl overflow-hidden border-2 ${RARITY_STYLES[fusionResultCard.rarity] || RARITY_STYLES['Commun']} ${fusionResultCard.rarity === 'Mythique' ? 'holographic-border' : ''}`}
                                    >
                                        <CardImage card={fusionResultCard} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                                    </motion.div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-white">{fusionResultCard.name}</p>
                                        <p className="text-sm text-purple-200">{fusionResultCard.anime}</p>
                                        <div className="mt-2 flex justify-center gap-1">
                                            {getRarityStars(fusionResultCard.rarity)}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFusionResultCard(null)}
                                        className="mt-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-sm text-white font-semibold"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
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
                        <div className="flex items-center gap-3">
                            {fragmentsBalance !== null && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/30 border border-white/10 text-sm">
                                    <Star className="w-4 h-4 text-yellow-300" />
                                    <span className="text-white font-semibold">{fragmentsBalance} fragments</span>
                                </div>
                            )}
                            {viewedUserId === session?.user?.id && (
                                <button
                                    type="button"
                                    onClick={toggleFusionMode}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                                        fusionMode
                                            ? 'bg-purple-600 border-purple-400 text-white'
                                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                    }`}
                                >
                                    {fusionMode
                                        ? `Mode Fusion actif (${selectedForFusion.length}/3)`
                                        : 'Activer le mode Fusion'}
                                </button>
                            )}
                            <Link href="/dashboard/mini-jeu/gacha" className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                                <ArrowLeft size={16} />
                                Retour
                            </Link>
                        </div>
                    </div>
    
                    {/* ✨ NOUVEAU: Barre de recherche d'utilisateur avec suggestions */}
                    <div className="mb-6 relative">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={searchInput}
                                onFocus={() => setShowUserSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowUserSuggestions(false), 120)}
                                onChange={(e) => { setSearchInput(e.target.value); setShowUserSuggestions(true); }}
                                placeholder="Rechercher un utilisateur par pseudo..."
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button type="submit" className="px-6 py-2 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                                Chercher
                            </button>
                        </form>
                        {showUserSuggestions && userSuggestions.length > 0 && (
                            <div className="absolute z-20 mt-2 w-full bg-slate-800 border border-white/20 rounded-lg shadow-lg max-h-64 overflow-auto">
                                {userSuggestions.map(u => (
                                    <button
                                        key={u.id}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => { setViewedUserId(u.id); setSearchInput(u.username); setShowUserSuggestions(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 text-left"
                                    >
                                        <img src={u.avatar} alt={u.username} className="w-6 h-6 rounded-full" />
                                        <span className="text-sm">{u.username}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ✨ NOUVEAU: Recherche de carte */}
                    <div className="mb-8">
                        <form onSubmit={handleCardSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={cardQuery}
                                onChange={(e) => setCardQuery(e.target.value)}
                                placeholder="Rechercher une carte (ex: Eren Yeager)"
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button type="submit" className="px-6 py-2 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                                Aller à la carte
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
                                                        data-card-id={card.id}
                                                        className={`group relative rounded-xl overflow-hidden flex flex-col h-72 border-2 ${RARITY_STYLES[card.rarity] || RARITY_STYLES['Commun']} ${card.rarity === 'Mythique' ? 'holographic-border' : ''}`}
                                                        style={card.rarity === 'Mythique' ? { animation: 'mythic-aura-pulse 4s ease-in-out infinite' } : {}}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                                        whileHover={{
                                                            y: -12,
                                                            scale: 1.08,
                                                            rotateX: 5,
                                                            rotateY: 5,
                                                            boxShadow: card.rarity !== 'Mythique' ? `0 0 40px -5px ${RARITY_STYLES[card.rarity]?.split(' ')[2]?.replace('shadow-', 'rgba(').replace('/10', ', 0.6)').replace('/30', ', 0.7)').replace('/40', ', 0.8)').replace('/50', ', 0.9)').replace('/60', ', 1.0)') || 'rgba(255,255,255,0.2)'}` : undefined,
                                                            transition: { duration: 0.3, ease: "easeOut" }
                                                        }}>
                                                        <div className="absolute top-1 left-1 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-br-lg rounded-tl-md z-10">
                                                            #{card.id.split('_')[1]}
                                                        </div>
                                                        <div
                                            className={`flex-grow relative overflow-hidden cursor-${fusionMode ? 'pointer' : 'default'}`}
                                            onClick={fusionMode ? () => toggleCardForFusion(card.id) : undefined}
                                        >
                                            <CardImage card={card} className="absolute inset-0 w-full h-full object-cover" />
                                            {fusionMode && selectedForFusion.includes(card.id) && (
                                                <div className="absolute inset-0 bg-purple-600/40 border-4 border-purple-400 flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">Sélectionnée</span>
                                                </div>
                                            )}
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
                                                        className="group relative rounded-xl overflow-hidden flex flex-col h-72 border-2 border-dashed border-white/20 bg-black/30"
                                                        whileHover={{
                                                            y: -8,
                                                            scale: 1.05,
                                                            transition: { duration: 0.2, ease: "easeOut" }
                                                        }}
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
                                        data-card-id={card.id}
                                        className={`group relative rounded-xl overflow-hidden flex flex-col h-72 border-2 ${RARITY_STYLES[card.rarity] || RARITY_STYLES['Commun']} ${card.rarity === 'Mythique' ? 'holographic-border' : ''}`}
                                        style={card.rarity === 'Mythique' ? { animation: 'mythic-aura-pulse 4s ease-in-out infinite' } : {}}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        whileHover={{
                                            y: -12,
                                            scale: 1.08,
                                            rotateX: 5,
                                            rotateY: 5,
                                            boxShadow: card.rarity !== 'Mythique' ? `0 0 40px -5px ${RARITY_STYLES[card.rarity]?.split(' ')[2]?.replace('shadow-', 'rgba(').replace('/10', ', 0.6)').replace('/30', ', 0.7)').replace('/40', ', 0.8)').replace('/50', ', 0.9)').replace('/60', ', 1.0)') || 'rgba(255,255,255,0.2)'}` : undefined,
                                            transition: { duration: 0.3, ease: "easeOut" }
                                        }}>
                                        <div className="absolute top-1 left-1 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-br-lg rounded-tl-md z-10">
                                            #{card.id.split('_')[1]}
                                        </div>
                                        <div
                                            className={`flex-grow relative overflow-hidden cursor-${fusionMode ? 'pointer' : 'default'}`}
                                            onClick={fusionMode ? () => toggleCardForFusion(card.id) : undefined}
                                        >
                                            <CardImage card={card.cardInfo} className="absolute inset-0 w-full h-full object-cover" />
                                            {fusionMode && selectedForFusion.includes(card.id) && (
                                                <div className="absolute inset-0 bg-purple-600/40 border-4 border-purple-400 flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">Sélectionnée</span>
                                                </div>
                                            )}
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
                                            className="group relative rounded-xl overflow-hidden flex flex-col h-72 border-2 border-dashed border-white/20 bg-black/30"
                                            whileHover={{
                                                y: -8,
                                                scale: 1.05,
                                                transition: { duration: 0.2, ease: "easeOut" }
                                            }}
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

                    {/* Bouton global de fusion, visible uniquement en mode Fusion */}
                    {fusionMode && viewedUserId === session?.user?.id && (
                        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                            <button
                                type="button"
                                onClick={handleFusion}
                                disabled={selectedForFusion.length !== 3}
                                className={`px-6 py-3 rounded-full text-sm font-semibold shadow-lg transition-colors border ${
                                    selectedForFusion.length === 3
                                        ? 'bg-purple-600 hover:bg-purple-700 border-purple-400 text-white'
                                        : 'bg-white/10 border-white/20 text-white/60 cursor-not-allowed'
                                }`}
                            >
                                Fusionner ({selectedForFusion.length}/3)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }