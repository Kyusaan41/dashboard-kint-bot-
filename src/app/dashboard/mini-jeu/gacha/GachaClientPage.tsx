"use client";

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Clock, Filter, History, ShoppingCart, Info, Sparkles, Crown, Zap, X, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ANIME_CARDS, getRandomCardByRarity, getCardById } from './cards';
import { useSession } from 'next-auth/react';
import { CardImage } from './CardImage';
import { fetchCurrency as apiFetchCurrency, updateCurrency as apiUpdateCurrency } from '@/utils/api';
import { RevealedCard } from './RevealedCard';

const BANNER_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 jours

// --- INTERFACES ---

interface PullResult {
    card: typeof ANIME_CARDS[0];
    isNew: boolean;
}
type CardRarity = 'Commun' | 'Rare' | 'Épique' | 'Légendaire' | 'Mythique';

interface PullHistory {
    id: string;
    cards: PullResult[];
    timestamp: Date;
    type: 'single' | 'multi';
    cost: number;
}

interface FeaturedCharacter {
    id: string;
    name: string;
    anime: string;
    image: string;
    power: number;
    pity: number;
    lastRotation: Date;
}

// --- CONSTANTES DE STYLE (POUR TAILWIND) ---

const RARITY_STYLES = {
    commun: {
        border: 'border-gray-500',
        text: 'text-gray-400',
        bg: 'bg-gray-800/50',
        shadow: 'shadow-gray-500/10'
    },
    rare: {
        border: 'border-green-500',
        text: 'text-green-400',
        bg: 'bg-green-800/50',
        shadow: 'shadow-green-500/30'
    },
    épique: {
        border: 'border-blue-500',
        text: 'text-blue-400',
        bg: 'bg-blue-800/50',
        shadow: 'shadow-blue-500/40'
    },
    légendaire: {
        border: 'border-purple-500',
        text: 'text-purple-400',
        bg: 'bg-purple-800/50',
        shadow: 'shadow-purple-500/50'
    },
    mythique: {
        border: 'border-yellow-500',
        text: 'text-yellow-400',
        bg: 'bg-yellow-800/50',
        shadow: 'shadow-yellow-500/60'
    },
};

const getRarityStyle = (rarity: string) => {
    const key = rarity.toLowerCase() as keyof typeof RARITY_STYLES;
    return RARITY_STYLES[key] || RARITY_STYLES.commun;
};

// --- COMPOSANT D'ANIMATION DE SOUHAIT ---

const WishAnimation = ({ count, highestRarity }: { count: number, highestRarity: CardRarity | null }) => {
    const rarityStyle = getRarityStyle(highestRarity || 'Commun');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.5 } }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center overflow-hidden"
        >
            {/* Particules qui convergent */}
            {Array.from({ length: count * 5 }).map((_, i) => (
                <motion.div
                    key={i}
                    className={`absolute w-1 h-1 rounded-full ${rarityStyle.bg}`}
                    style={{
                        top: '50%',
                        left: '50%',
                        boxShadow: `0 0 8px 1px ${rarityStyle.shadow.replace('shadow-', 'rgba(').replace('/50', ', 0.8)')}`
                    }}
                    initial={{ 
                        x: (Math.random() - 0.5) * 1000, 
                        y: (Math.random() - 0.5) * 1000,
                        opacity: 0
                    }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    transition={{ duration: 1.5, delay: i * 0.02, ease: 'circIn' }}
                />
            ))}

            {/* Cercle de runes */}
            <motion.div
                className="absolute w-64 h-64"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-50">
                    <path d="M50 2 a 48 48 0 1 1 0 96 a 48 48 0 1 1 0 -96" stroke="currentColor" strokeWidth="0.5" fill="none" className={rarityStyle.text} />
                    <text x="50" y="53" textAnchor="middle" fontSize="10" fill="currentColor" className={rarityStyle.text}>룬</text>
                </svg>
            </motion.div>

            {/* Explosion de lumière */}
            <motion.div
                className={`absolute w-96 h-96 rounded-full ${rarityStyle.bg}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 3] }}
                transition={{ duration: 0.5, delay: 2.5, ease: 'easeOut' }}
            />
            
            {/* Flash blanc */}
            <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.9, duration: 0.1 }}
            />
        </motion.div>
    );
};

// --- COMPOSANT PRINCIPAL DE LA PAGE GACHA ---

export default function GachaClientPage() {
    const { data: session } = useSession();
    const [currency, setCurrency] = useState(0);
    const [pullAnimation, setPullAnimation] = useState<{ active: boolean; count: number; highestRarity: CardRarity | null }>({
        active: false, count: 0, highestRarity: null
    });
    const [revealedCardIndex, setRevealedCardIndex] = useState(0);

    const [pullResults, setPullResults] = useState<PullResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [pullHistory, setPullHistory] = useState<PullHistory[]>([]);
    const [activeTab, setActiveTab] = useState<'shop' | 'details' | 'history' | null>(null);
    const [rarityFilter, setRarityFilter] = useState<'all' | 'rare' | 'epic' | 'legendary' | 'mythic'>('all');
    const [quantityFilter, setQuantityFilter] = useState<'all' | 'multiple'>('all');
    const [timeRemaining, setTimeRemaining] = useState(6 * 24 * 60 * 60 * 1000);

    const [featuredCharacters, setFeaturedCharacters] = useState<FeaturedCharacter[]>(() => {
        const mythicCards = ANIME_CARDS.filter(card => card.rarity === 'Mythique');
        
        const shuffleArray = (array: any[]) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const shuffledMythics = shuffleArray([...mythicCards]);
        return shuffledMythics.slice(0, 3).map(card => ({
            id: card.id,
            name: card.name,
            anime: card.anime,
            image: card.image,
            power: card.power,
            pity: 0,
            lastRotation: new Date()
        }));
    });
    const [currentFeatured, setCurrentFeatured] = useState(0);

    const fetchCurrency = useCallback(async () => {
        if (!session?.user?.id) return;
        try {
            const data = await apiFetchCurrency(session.user.id);
            setCurrency(data.balance || 0);
        } catch (error) {
            console.error("[GACHA] Erreur de récupération de la monnaie:", error);
            setCurrency(0);
        }
    }, [session]);

    const updateCurrency = async (amount: number) => {
        if (!session) return false;
        try {
            const data = await apiUpdateCurrency(session.user.id, amount, 'Gacha');
            setCurrency(data.newBalance);
            return true;
        } catch (error) {
            console.error("[GACHA] Erreur de mise à jour de la monnaie:", error);
            return false;
        }
    };

    useEffect(() => {
        fetchCurrency();
    }, [fetchCurrency]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (!featuredCharacters[currentFeatured]) return;

            const now = Date.now();
            const rotationEndTime = new Date(featuredCharacters[currentFeatured].lastRotation).getTime() + BANNER_DURATION_MS;
            setTimeRemaining(Math.max(0, rotationEndTime - now));

            let needsUpdate = false;
            const updatedFeatured = featuredCharacters.map(char => {
                if (now >= new Date(char.lastRotation).getTime() + BANNER_DURATION_MS) {
                    needsUpdate = true;
                    const mythicCards = ANIME_CARDS.filter(c => c.rarity === 'Mythique');
                    const currentIds = featuredCharacters.map(fc => fc.id);
                    const availableCards = mythicCards.filter(mc => !currentIds.includes(mc.id));
                    
                    let newCard = availableCards[Math.floor(Math.random() * availableCards.length)];
                    if (!newCard) newCard = mythicCards[Math.floor(Math.random() * mythicCards.length)];

                    return {
                        id: newCard.id,
                        name: newCard.name,
                        anime: newCard.anime,
                        image: newCard.image,
                        power: newCard.power,
                        pity: 0,
                        lastRotation: new Date()
                    };
                }
                return char;
            });

            if (needsUpdate) {
                setFeaturedCharacters(updatedFeatured);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [featuredCharacters, currentFeatured]);

    const formatTime = (ms: number) => {
        const days = Math.floor(ms / (24 * 60 * 60 * 1000));
        const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((ms % (60 * 1000)) / 1000);
        return `${days}j ${hours}h ${minutes}m ${seconds}s`;
    };

    const performPull = async (type: 'single' | 'multi') => {
        if (pullAnimation.active) return;
        if (!session) {
            alert("Veuillez vous connecter pour jouer.");
            return;
        }

        const cost = type === 'single' ? 50 : 500;
        if (currency < cost) {
            alert('Pas assez de monnaie !');
            return;
        }

        const currencyUpdated = await updateCurrency(-cost);
        if (!currencyUpdated) {
            alert("Une erreur est survenue avec votre solde. Veuillez réessayer.");
            return;
        }

        const numCards = type === 'single' ? 1 : 10;
        const results: PullResult[] = [];

        for (let i = 0; i < numCards; i++) {
            const featuredChar = featuredCharacters[currentFeatured];
            const pity = featuredChar.pity;
            const isGuaranteedPull = pity + (numCards - i) >= 100;

            let selectedRarity: CardRarity;
            let selectedCard: typeof ANIME_CARDS[0];
            if (isGuaranteedPull) {
                selectedCard = getCardById(featuredChar.id) || getRandomCardByRarity('Légendaire');
                setFeaturedCharacters(prev => prev.map((char, index) =>
                    index === currentFeatured ? { ...char, pity: 0 } : char
                ));
            } else {
                const random = Math.random();
                if (random < 0.004) selectedRarity = 'Mythique';
                else if (random < 0.034) selectedRarity = 'Légendaire';
                else if (random < 0.184) selectedRarity = 'Épique';
                else if (random < 0.434) selectedRarity = 'Rare';
                else selectedRarity = 'Commun';

                selectedCard = getRandomCardByRarity(selectedRarity);

                if (selectedCard.id !== featuredChar.id) {
                    setFeaturedCharacters(prev => prev.map((char, index) =>
                        index === currentFeatured ? { ...char, pity: char.pity + 1 } : char
                    ));
                } else {
                    setFeaturedCharacters(prev => prev.map((char, index) =>
                        index === currentFeatured ? { ...char, pity: 0 } : char
                    ));
                }
            }

            const isNew = Math.random() > 0.5;
            results.push({ card: selectedCard, isNew });

            try {
                await fetch('http://193.70.34.25:20007/api/gacha/collection', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: session.user.id,
                        username: session.user.name,
                        cardId: selectedCard.id,
                        anime: selectedCard.anime,
                    }),
                });
            } catch (error) {
                console.error("[GACHA] Erreur de sauvegarde de la carte:", error);
            }
        }
        
        const rarityOrder: CardRarity[] = ['Commun', 'Rare', 'Épique', 'Légendaire', 'Mythique'];
        const highestRarity = results.reduce((max, current) => {
            return rarityOrder.indexOf(current.card.rarity) > rarityOrder.indexOf(max) ? current.card.rarity : max;
        }, 'Commun' as CardRarity);

        setPullResults(results);
        setPullAnimation({ active: true, count: numCards, highestRarity });

        await new Promise(resolve => setTimeout(resolve, 3000));

        setPullHistory(prev => [{ id: Date.now().toString(), cards: results, timestamp: new Date(), type, cost }, ...prev]);
        setPullAnimation({ active: false, count: 0, highestRarity: null });
        setShowResults(true);
    };

    const closeResults = () => {
        setShowResults(false);
        setRevealedCardIndex(0);
        setPullResults([]);
    };

    const getFilteredHistory = () => {
        return pullHistory.filter(entry => {
            if (rarityFilter !== 'all') {
                const hasMatchingRarity = entry.cards.some(result => {
                    const rarity = result.card.rarity.toLowerCase();
                    if (rarityFilter === 'rare') return ['rare', 'épique', 'légendaire', 'mythique'].includes(rarity);
                    if (rarityFilter === 'epic') return ['épique', 'légendaire', 'mythique'].includes(rarity);
                    if (rarityFilter === 'legendary') return ['légendaire', 'mythique'].includes(rarity);
                    if (rarityFilter === 'mythic') return rarity === 'mythique';
                    return false;
                });
                if (!hasMatchingRarity) return false;
            }
            if (quantityFilter === 'multiple') {
                return entry.cards.length > 1;
            }
            return true;
        });
    };

    const getRarityStars = (rarity: string) => {
        const count = rarity === 'Commun' ? 1 : rarity === 'Rare' ? 2 : rarity === 'Épique' ? 3 : rarity === 'Légendaire' ? 4 : 5;
        return Array(count).fill(0).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        ));
    };

    const currentFeaturedChar = featuredCharacters[currentFeatured];

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
            {/* Fond cosmique fixe */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 -z-20" />
            <motion.div
                className="absolute inset-0 -z-10"
                style={{
                    backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(129, 140, 248, 0.1) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(192, 132, 252, 0.1) 0%, transparent 30%)',
                }}
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
            
            <div className="w-full max-w-7xl h-auto md:h-[750px] bg-slate-900/70 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-lg p-4 font-sans relative overflow-hidden flex flex-col text-white">

                <div className="flex justify-between items-center mb-3 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-white text-lg font-medium">✨ Bannières</span>
                        <div className="hidden md:flex items-center gap-2">
                            {featuredCharacters.map((char, index) => (
                                <motion.div
                                    key={char.id}
                                    className={`w-10 h-10 bg-black/30 rounded-lg border-2 shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                                        currentFeatured === index ? 'border-yellow-400 scale-110' : 'border-white/20 opacity-60 hover:opacity-100'
                                    }`}
                                    onClick={() => setCurrentFeatured(index)}
                                    whileHover={{ y: -3 }}
                                >
                                    <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full text-sm">
                            <span className="text-yellow-400">✦</span>
                            <span>{currency}</span>
                        </div>
                        <Link href="/dashboard/mini-jeu">
                            <button className="bg-black/40 w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </Link>
                    </div>
                </div>
                
                <div className="flex-1 rounded-xl relative overflow-hidden shadow-lg mb-3">
                    {/* Image de fond floutée */}
                    <img
                        src={currentFeaturedChar.image}
                        alt="Banner Background"
                        className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 opacity-30"
                    />
                    {/* Dégradé pour la lisibilité */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                    {/* Image du personnage "Splash Art" (grande, sans case, non floue) */}
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentFeaturedChar.id}
                            src={currentFeaturedChar.image}
                            alt={currentFeaturedChar.name}
                                className="absolute right-[-50px] md:right-0 top-1/2 -translate-y-1/2 h-[110%] md:h-[120%] w-auto z-10 object-contain object-right"
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </AnimatePresence>

                    {/* Contenu de la bannière (sur la gauche) */}
                    <div className="relative z-20 h-full p-6 md:p-8 flex flex-col justify-between">
                        <div>
                            <div className="mb-3">
                                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Événement Personnage
                                </span>
                                <AnimatePresence mode="wait">
                                    <motion.h1 key={currentFeaturedChar.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="text-4xl md:text-5xl font-bold text-white shadow-black/50 [text-shadow:_0_2px_4px_var(--tw-shadow-color)] mt-2">
                                        {currentFeaturedChar.name}
                                    </motion.h1>
                                </AnimatePresence>
                                <div className="flex items-center gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} fill="#ffd700" color="#ffd700" />
                                    ))}
                                    <span className="ml-2 text-sm italic text-white/60">
                                        ({currentFeaturedChar.anime})
                                    </span>
                                </div>
                            </div>
                            <div className="bg-black/50 backdrop-blur-sm border border-white/10 p-3 rounded-lg max-w-xs text-xs">
                                <div className="font-bold text-yellow-400 mb-1">Probabilité augmentée !</div>
                                <p className="text-white/80 leading-snug">
                                    5★ garanti d'être le personnage vedette 50% du temps. Garantie d'obtenir un 5★ tous les 90 tirages.
                                </p>
                                <div
                                    className="mt-1 font-semibold text-cyan-400 cursor-pointer hover:underline"
                                    onClick={() => setActiveTab('details')}
                                >
                                    Voir les détails ›
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="text-xs text-white/70">Temps Restant</div>
                            <div className="text-lg font-bold text-white">{formatTime(timeRemaining)}</div>
                        </div>

                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm border border-white/10 p-3 rounded-lg text-right z-20">
                            <div className="text-xs text-white/70">Puissance</div>
                            <div className="text-lg font-semibold text-white">{currentFeaturedChar.power}</div>
                            <div className="text-xs text-white/70 mt-2">Pity Actuelle</div>
                            <div className="text-lg font-semibold text-cyan-400">{currentFeaturedChar.pity} / 100</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-3 flex-shrink-0">
                    <div className="flex gap-2 bg-black/30 p-1 rounded-full">
                        <button
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'shop' ? 'bg-white/90 text-purple-900' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                            onClick={() => setActiveTab('shop')}
                        >
                            Boutique
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'details' ? 'bg-white/90 text-purple-900' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                            onClick={() => setActiveTab('details')}
                        >
                            Détails
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white/90 text-purple-900' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                            onClick={() => setActiveTab('history')}
                        >
                            Historique
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <Link href="/dashboard/mini-jeu/gacha/collection">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="h-full px-4 bg-white/10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors">
                                <BookOpen size={20} />
                            </motion.button>
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => performPull('single')}
                                disabled={pullAnimation.active || currency < 50}
                            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="px-5 py-2.5 flex flex-col items-center">
                                <span>Souhait x1</span>
                                <div className="flex items-center gap-1 text-xs text-yellow-300">
                                    <span className="text-yellow-400">✦</span>
                                    <span>50</span>
                                </div>
                            </div>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => performPull('multi')}
                            disabled={pullAnimation.active || currency < 500}
                            className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 text-black font-bold rounded-full shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="px-8 py-2.5 flex flex-col items-center">
                                <span>Souhait x10</span>
                                <div className="flex items-center gap-1 text-xs text-black/70">
                                    <span className="text-yellow-700">✦</span>
                                    <span>500</span>
                                </div>
                            </div>
                        </motion.button>
                    </div>
                </div>

                <AnimatePresence>
                    {(activeTab === 'shop' || activeTab === 'history') && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setActiveTab(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {activeTab === 'history' && (
                                    <div>
                                        <div className="flex flex-wrap gap-4 mb-6 justify-center">
                                            <div className="flex items-center gap-2">
                                                <Filter className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-300">Rareté:</span>
                                                <select
                                                    value={rarityFilter}
                                                    onChange={(e) => setRarityFilter(e.target.value as any)}
                                                    className="bg-white/10 border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    <option value="all">Tout</option>
                                                    <option value="rare">2★+</option>
                                                    <option value="epic">3★+</option>
                                                    <option value="legendary">4★+</option>
                                                    <option value="mythic">5★+</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-300">Qté:</span>
                                                <select
                                                    value={quantityFilter}
                                                    onChange={(e) => setQuantityFilter(e.target.value as any)}
                                                    className="bg-white/10 border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    <option value="all">Tout</option>
                                                    <option value="multiple">10x Seulement</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {getFilteredHistory().length === 0 ? (
                                                <div className="text-center py-12">
                                                    <div className="text-6xl mb-4">🎴</div>
                                                    <h3 className="text-xl font-bold text-white mb-2">Aucun Historique</h3>
                                                    <p className="text-gray-400">Votre premier souhait vous attend !</p>
                                                </div>
                                            ) : (
                                                getFilteredHistory().map((entry) => (
                                                    <div key={entry.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <History className="w-4 h-4 text-gray-400" />
                                                                <span className="font-medium text-white">
                                                                    {entry.type === 'single' ? '1x Souhait' : '10x Souhaits'}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    {entry.timestamp.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-400">
                                                                Coût: {entry.cost} ✦
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {entry.cards.map((result, index) => {
                                                                const styles = getRarityStyle(result.card.rarity);
                                                                return (
                                                                    <div
                                                                        key={index}
                                                                        className={`relative p-2 rounded-lg border ${styles.border} ${styles.bg} min-w-[100px] text-center`}
                                                                    >
                                                                        <div className="text-sm font-medium text-white truncate max-w-24 mb-1 mx-auto">
                                                                            {result.card.name}
                                                                        </div>
                                                                        <div className="flex justify-center mb-1">
                                                                            {getRarityStars(result.card.rarity)}
                                                                        </div>
                                                                        {result.isNew && (
                                                                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800" />
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'shop' && (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">🛒</div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Boutique Bientôt Disponible</h3>
                                        <p className="text-gray-400">Monnaie premium et objets exclusifs seront disponibles ici.</p>
                                    </div>
                                )}
                                
                                <div className="text-center mt-6">
                                    <button
                                        onClick={() => setActiveTab(null)}
                                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/30 transition-all"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {activeTab === 'details' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setActiveTab(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-6 text-center">Probabilités de Tirage</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                            <h4 className="text-lg font-semibold text-white mb-4">Tirage Simple (1x)</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center"><span className="text-gray-300">☆☆☆☆☆ Mythique</span><span className="text-yellow-400 font-semibold">0.4%</span></div>
                                                <div className="flex justify-between items-center"><span className="text-gray-300">☆☆☆☆ Légendaire</span><span className="text-purple-400 font-semibold">3.0%</span></div>
                                                <div className="flex justify-between items-center"><span className="text-gray-300">☆☆☆ Épique</span><span className="text-blue-400 font-semibold">15.0%</span></div>
                                                <div className="flex justify-between items-center"><span className="text-gray-300">☆☆ Rare</span><span className="text-green-400 font-semibold">25.0%</span></div>
                                                <div className="flex justify-between items-center"><span className="text-gray-300">☆ Commun</span><span className="text-gray-400 font-semibold">56.6%</span></div>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                            <h4 className="text-lg font-semibold text-white mb-4">Tirage Multiple (10x)</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center"><span className="text-gray-300">Au moins 1 ☆☆☆☆☆</span><span className="text-yellow-400 font-semibold">4.0%</span></div>
                                                <div className="flex justify-between items-center"><span className="text-gray-300">Au moins 1 ☆☆☆☆</span><span className="text-purple-400 font-semibold">30.0%</span></div>
                                                <div className="flex justify-between items-center"><span className="text-gray-300">Au moins 1 ☆☆☆</span><span className="text-blue-400 font-semibold">85.0%</span></div>
                                                <div className="flex justify-between items-center"><span className="text-gray-300">Garantie ☆☆☆☆☆ à 100 pity</span><span className="text-red-400 font-semibold">100%</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 bg-gradient-to-r from-yellow-600/20 to-purple-600/20 rounded-xl p-6 border border-yellow-500/30">
                                        <h4 className="text-lg font-semibold text-yellow-400 mb-3">Système de Pity</h4>
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            Le système de pity garantit l'obtention du personnage vedette après un certain nombre de tirages.
                                            Actuellement, {currentFeaturedChar.name} a un pity de {currentFeaturedChar.pity} / 100.
                                            À 100 de pity, le prochain tirage garantira l'obtention du personnage vedette.
                                        </p>
                                    </div>
                                </div>
                                <div className="text-center mt-6">
                                    <button
                                        onClick={() => setActiveTab(null)}
                                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/30 transition-all"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showResults && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={closeResults}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 border border-white/20 max-w-5xl w-full max-h-[90vh] flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex-1 flex items-center justify-center min-h-0">
                                    <AnimatePresence mode="wait">
                                        {pullResults[revealedCardIndex] && (
                                            <motion.div
                                                key={revealedCardIndex}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.3 }}
                                                className="w-auto h-full max-h-full max-w-[320px]"
                                            >
                                                <RevealedCard
                                                    card={pullResults[revealedCardIndex].card}
                                                    isNew={pullResults[revealedCardIndex].isNew}
                                                    rarityStyles={getRarityStyle(pullResults[revealedCardIndex].card.rarity)}
                                                    rarityStars={getRarityStars(pullResults[revealedCardIndex].card.rarity) as React.ReactNode[]}
                                                    isHighRarity={['Légendaire', 'Mythique'].includes(pullResults[revealedCardIndex].card.rarity)}
                                                    delay={0}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="text-center mt-6 flex-shrink-0">
                                    {revealedCardIndex < pullResults.length - 1 ? (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setRevealedCardIndex(prev => prev + 1)}
                                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-white shadow-lg hover:shadow-cyan-500/30 transition-all"
                                        >
                                            Suivant ({revealedCardIndex + 1}/{pullResults.length})
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={closeResults}
                                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/30 transition-all"
                                        >
                                            Terminer
                                        </motion.button>
                                    )}
                                </div>
                                <div className="text-center mt-2 text-xs text-gray-500 flex-shrink-0">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setRevealedCardIndex(pullResults.length - 1)}
                                        className="hover:underline"
                                    >
                                        Passer
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {pullAnimation.active && <WishAnimation count={pullAnimation.count} highestRarity={pullAnimation.highestRarity} />}
                </AnimatePresence>
            </div>
        </div>
    );
}