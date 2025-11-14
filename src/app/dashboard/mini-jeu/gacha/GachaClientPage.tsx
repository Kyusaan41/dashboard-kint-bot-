"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { Star, Filter, History, X, BookOpen, Gem, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getRandomCardByRarity, getCardById, getCardsByRarity, AnimeCard } from './cards';
import { useSession } from 'next-auth/react'; 
import { fetchCurrency as apiFetchCurrency, updateCurrency } from '@/utils/api';
import { RevealedCard } from './RevealedCard'; 
import { GachaProvider, useGacha, FeaturedCharacter } from './GachaContext';
import { API_ENDPOINTS } from '@/lib/api-config.js';
import { FavoriteToggleButton } from '@/components/FavoriteToggleButton';

const BANNER_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 jours

// --- INTERFACES ---

interface PullResult {
    card: import('./cards').AnimeCard; // Exported for potential future use or consistency
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

// ✨ NOUVEAU: Structure de données pour la Pity côté serveur
interface UserPityState {
    pityCounter: number;
    guaranteedFeatured: boolean;
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

// --- FONCTION POUR OBTENIR LA COULEUR DE LUEUR EN FONCTION DE LA RARETÉ ---
const getGlowColor = (rarity: CardRarity | null) => {
    switch (rarity) {
        case 'Mythique': return 'rgba(255, 220, 120, 0.7)'; // Yellowish
        case 'Légendaire': return 'rgba(190, 150, 255, 0.7)'; // Purplish
        case 'Épique': return 'rgba(100, 150, 255, 0.7)'; // Bluish
        case 'Rare': return 'rgba(100, 255, 150, 0.7)'; // Greenish
        default: return 'transparent'; // Commun or null
    }
};

// --- NOUVEAU: COULEURS POUR LE FLASH FINAL ---
const RARITY_FLASH_COLORS = {
    'Commun': 'bg-white',
    'Rare': 'bg-green-400',
    'Épique': 'bg-blue-400',
    'Légendaire': 'bg-purple-400',
    'Mythique': 'bg-yellow-400',
};

// --- COMPOSANT D'ANIMATION DE SOUHAIT (WishAnimation) ---

const WishAnimation = ({ count, highestRarity, onSkip }: { count: number, highestRarity: CardRarity | null, onSkip?: () => void }) => {
    const isMultiPull = count > 1;
    
    // Couleurs selon la rareté (style Genshin)
    const getRarityColor = (rarity: CardRarity | null) => {
        switch (rarity) {
            case 'Mythique': return { primary: '#FFD700', secondary: '#FFA500' }; // Or
            case 'Légendaire': return { primary: '#9D4EDD', secondary: '#7209B7' }; // Violet
            case 'Épique': return { primary: '#4CC9F0', secondary: '#0077B6' }; // Bleu
            case 'Rare': return { primary: '#06FFA5', secondary: '#028A0F' }; // Vert
            default: return { primary: '#FFFFFF', secondary: '#CCCCCC' }; // Blanc
        }
    };
    
    const colors = getRarityColor(highestRarity);
    
    return (
        <motion.div
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="fixed inset-0 bg-gradient-to-b from-slate-950 to-black z-50 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Onde cosmique principale */}
            <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                    width: 400,
                    height: 400,
                    background: `radial-gradient(circle, ${colors.primary}60, ${colors.secondary}40, transparent 70%)`,
                    filter: 'blur(1px)'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: [0, 1, 1.2, 1],
                    opacity: [0, 0.8, 0.6, 0.8]
                }}
                transition={{
                    duration: 2,
                    ease: "easeOut"
                }}
            />

            {/* Anneaux d'énergie expansifs */}
            <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                        key={`ring-${i}`}
                        className="absolute border-4 rounded-full"
                        style={{
                            borderColor: i === 0 ? colors.primary : colors.secondary,
                            borderStyle: 'solid',
                            boxShadow: `0 0 40px ${i === 0 ? colors.primary : colors.secondary}`
                        }}
                        initial={{
                            width: 0,
                            height: 0,
                            opacity: 0,
                            left: 0,
                            top: 0
                        }}
                        animate={{
                            width: [0, 600 + i * 200, 1000 + i * 300],
                            height: [0, 600 + i * 200, 1000 + i * 300],
                            opacity: [0, 0.8, 0],
                            left: [0, -(300 + i * 100), -(500 + i * 150)],
                            top: [0, -(300 + i * 100), -(500 + i * 150)],
                            borderWidth: [4, 2, 0]
                        }}
                        transition={{
                            duration: 3,
                            delay: 0.5 + i * 0.3,
                            ease: "easeOut"
                        }}
                    />
                ))}
            </motion.div>

            {/* Particules orbitales élégantes */}
            <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i / 8) * 360;
                    const radius = 180;
                    
                    return (
                        <motion.div
                            key={`particle-${i}`}
                            className="absolute w-4 h-4 rounded-full"
                            style={{
                                background: `radial-gradient(circle, ${colors.primary}, ${colors.secondary})`,
                                boxShadow: `0 0 20px ${colors.primary}`,
                                left: -8,
                                top: -8
                            }}
                            initial={{
                                x: Math.cos(angle * Math.PI / 180) * radius,
                                y: Math.sin(angle * Math.PI / 180) * radius,
                                opacity: 0,
                                scale: 0
                            }}
                            animate={{
                                x: Math.cos((angle + 360) * Math.PI / 180) * radius,
                                y: Math.sin((angle + 360) * Math.PI / 180) * radius,
                                opacity: [0, 1, 0.7, 1],
                                scale: [0, 1.5, 1, 1.2]
                            }}
                            transition={{
                                duration: 4,
                                delay: 0.8 + i * 0.1,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    );
                })}
            </motion.div>

            {/* Pulse énergétique central */}
            <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
                style={{
                    background: `radial-gradient(circle, ${colors.primary}, ${colors.secondary})`,
                    boxShadow: `0 0 60px ${colors.primary}, 0 0 120px ${colors.primary}50`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: [0, 1, 1.3, 1],
                    opacity: [0, 1, 0.8, 1]
                }}
                transition={{
                    duration: 2,
                    delay: 1,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                }}
            />

            {/* Flash final spectaculaire */}
            <motion.div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(45deg, ${colors.primary}40, transparent, ${colors.secondary}40)`
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1, 0] }}
                transition={{
                    duration: 0.5,
                    delay: 3.5,
                    ease: "easeOut"
                }}
            />

            {/* Bouton Passer */}
            {onSkip && (
                <motion.button
                    onClick={onSkip}
                    className="absolute bottom-6 right-6 px-6 py-3 rounded-full bg-black/50 hover:bg-black/70 border border-white/30 text-white font-medium backdrop-blur-sm transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    Passer
                </motion.button>
            )}
        </motion.div>
    );
};

// --- ✨ NOUVEAU: CERCLE DE PROGRESSION POUR LA PITY ---
const PityProgressCircle = ({ pity, maxPity }: { pity: number; maxPity: number }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const progress = pity / maxPity;
    const strokeDashoffset = circumference * (1 - progress);

    const pityStatus = getPityStatus(pity);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20">
                <svg className="w-full h-full" viewBox="0 0 80 80">
                    <circle
                        cx="40" cy="40" r={radius}
                        className="stroke-current text-white/10"
                        strokeWidth="8" fill="none"
                    />
                    <motion.circle
                        cx="40" cy="40" r={radius}
                        className={`stroke-current ${pityStatus.className}`}
                        strokeWidth="8" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        transform="rotate(-90 40 40)"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">{pity}</div>
            </div>
            <div className={`text-xs font-semibold ${pityStatus.className}`}>{pityStatus.text}</div>
        </div>
    );
};

// --- FONCTION POUR LE SUSPENSE DE LA PITY ---

const getPityStatus = (pity: number): { text: string; className: string } => {
    if (pity >= 90) {
        return { text: "Le destin est imminent !", className: "text-red-400 animate-pulse" };
    }
    if (pity >= 75) {
        return { text: "Une aura dorée se forme...", className: "text-yellow-400" };
    }
    if (pity >= 50) {
        return { text: "L'étoile scintille intensément", className: "text-purple-400" };
    }
    if (pity >= 25) {
        return { text: "Une lueur se dessine", className: "text-blue-400" };
    }
    return { text: "Une faible étincelle", className: "text-cyan-400" };
};


// --- COMPOSANT DE LA PAGE GACHA (LOGIQUE) ---
function GachaPageContent() {
    const { data: session } = useSession();
    const [currency, setCurrency] = useState<number>(0); // Explicitly type to number
    const [wishes, setWishes] = useState<number>(0); // Ajout du state pour les vœux
    const [pullAnimation, setPullAnimation] = useState<{ active: boolean; count: number; highestRarity: CardRarity | null; currentBalance: number }>({ // Add currentBalance
        active: false, count: 0, highestRarity: null, currentBalance: 0
    });
    const [purchaseSuccess, setPurchaseSuccess] = useState<{ show: boolean; amount: number }>({ show: false, amount: 0 });
    const [revealedCardIndex, setRevealedCardIndex] = useState(0); 

    const [pullResults, setPullResults] = useState<PullResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [pullHistory, setPullHistory] = useState<PullHistory[]>([]);
    const [activeTab, setActiveTab] = useState<'shop' | 'details' | 'history' | null>(null);
    const [rarityFilter, setRarityFilter] = useState<'all' | 'rare' | 'epic' | 'legendary' | 'mythic'>('all');
    const [isPulling, setIsPulling] = useState(false); // ✨ ÉTAT DE VERROUILLAGE
    const [quantityFilter, setQuantityFilter] = useState<'all' | 'multiple'>('all');
    const [isBuying, setIsBuying] = useState(false); // État de verrouillage pour l'achat
    
    const {
        featuredCharacters,
        setFeaturedCharacters,
        currentFeatured,
        setCurrentFeatured,
        timeRemaining
    } = useGacha();

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

    const fetchWishes = useCallback(async () => {
        if (!session?.user?.id) return;
        try {
            const response = await fetch(API_ENDPOINTS.gachaWishes(session.user.id));
            if (!response.ok) {
                throw new Error('Failed to fetch wishes');
            }
            const data = await response.json();
            // Mettre à jour le nombre de vœux
            setWishes(data.wishes || 0);

            // ✨ CORRECTION: Mettre à jour l'état de la pity depuis les données reçues
            if (data.pity) {
                setFeaturedCharacters(prevChars =>
                    prevChars.map(char => ({
                        ...char,
                        pity: data.pity[char.id]?.pity5 || 0,
                    }))
                );
            }
        } catch (error) {
            console.error("[GACHA] Erreur de récupération des vœux:", error);
            setWishes(0);
        }
    }, [session, setFeaturedCharacters]);

    useEffect(() => {
        fetchCurrency();
        fetchWishes();
    }, [fetchCurrency, fetchWishes]);

    const formatTime = (ms: number) => {
        const days = Math.floor(ms / (24 * 60 * 60 * 1000));
        const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((ms % (60 * 1000)) / 1000);
        return `${days}j ${hours}h ${minutes}m ${seconds}s`;
    };

    // --- NOUVELLE FONCTION POUR ACHETER DES VŒUX ---
    const buyWishes = async (pack: 'single' | 'multi') => {
        if (!session) return;

        const coinCost = pack === 'single' ? 500 : 4500;
        const wishesAmount = pack === 'single' ? 1 : 10;

        if (currency < coinCost) {
            alert('Pas assez de pièces !');
            return;
        }

        if (isBuying) return; // Empêche le spam
        setIsBuying(true); // Verrouille le bouton

        try {
            // Étape 1 : Déduire les pièces en utilisant la fonction centralisée et fiable
            await updateCurrency(session.user.id, -coinCost, 'Achat de Vœux Gacha');

            // Étape 2 : Ajouter les vœux via l'API du bot
            const buyResponse = await fetch(API_ENDPOINTS.gachaBuyWishes, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id, amount: wishesAmount }),
            });

            if (!buyResponse.ok) {
                const errorData = await buyResponse.json();
                // Si l'ajout de vœux échoue, on essaie de rembourser les pièces
                await updateCurrency(session.user.id, coinCost, 'Remboursement achat Gacha échoué');
                throw new Error(errorData.error || 'Échec de l\'ajout des vœux');
            }

            const buyData = await buyResponse.json();
            setWishes(buyData.newWishes); // Met à jour le solde de vœux
            await fetchCurrency(); // Met à jour le solde de pièces

            // On déclenche l'animation de succès au lieu de l'alerte
            // ✨ CORRECTION: On utilise toast.custom pour créer la notification directement ici
            toast.custom(() => (
                <div className="flex items-center gap-3 p-4 bg-slate-800 border border-green-500 rounded-xl shadow-lg">
                    <img 
                        src={wishesAmount > 1 ? "/gacha/icons/wish-pack.png" : "/gacha/icons/wish.png"} 
                        alt="Vœux achetés" 
                        className="w-10 h-10 flex-shrink-0"
                    />
                    <p className="text-md font-semibold text-white">
                        +{wishesAmount} Vœu{wishesAmount > 1 ? 'x' : ''} ajouté{wishesAmount > 1 ? 's' : ''} !
                    </p>
                </div>
            ), { duration: 3000 });

        } catch (error: any) {
            console.error("[GACHA] Erreur lors de l'achat de vœux:", error);
            alert(`Erreur: ${error.message}`);
        } finally {
            setIsBuying(false); // Déverrouille le bouton
        }
    };

    const performPull = async (type: 'single' | 'multi') => {
        if (isPulling) return; // ✨ Si un tirage est déjà en cours, on ne fait rien.
        if (!session) {
            alert("Veuillez vous connecter pour jouer.");
            return;
        }

        const cost = type === 'single' ? 1 : 10;
        if (wishes < cost) {
            alert('Pas assez de vœux !');
            return;
        }

        setIsPulling(true); // ✨ On verrouille le bouton

        // Dépenser les vœux via l'API
        try {
            const spendResponse = await fetch(API_ENDPOINTS.gachaSpendWishes(session.user.id), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: session.user.id, 
                    amount: cost,
                    bannerId: currentFeaturedChar.id // ✨ On envoie l'ID de la bannière actuelle
                }),
            });

            if (!spendResponse.ok) {
                const errorData = await spendResponse.json();
                throw new Error(errorData.error || 'Échec de la dépense des vœux');
            }

            const pullData = await spendResponse.json();
            setWishes(pullData.newWishes); // Met à jour le solde de vœux après le tirage

            // ✨ CORRECTION CRITIQUE: Mettre à jour l'état de la pity après le tirage
            // Le backend renvoie maintenant l'état de la pity mis à jour.
            if (pullData.updatedPity) {
                setFeaturedCharacters(prev => prev.map(char => 
                    char.id === pullData.updatedPity.bannerId
                        ? { ...char, pity: pullData.updatedPity.pity5 } // ✨ CORRECTION: Utiliser pity5 pour le cercle 5★
                        : char
                ));
            }

            const results: PullResult[] = pullData.pulledCards.map((card: any) => ({ card, isNew: card.isNew }));
            // La logique de tirage est maintenant côté bot, on utilise les résultats qu'il renvoie.
        
        const rarityOrder: CardRarity[] = ['Commun', 'Rare', 'Épique', 'Légendaire', 'Mythique'];
        const highestRarity = results.reduce((max, current) => {
            return rarityOrder.indexOf(current.card.rarity) > rarityOrder.indexOf(max) ? current.card.rarity : max;
        }, 'Commun' as CardRarity);

        setPullResults(results);
            setPullAnimation({ active: true, count: cost, highestRarity, currentBalance: wishes - cost });

        await new Promise(resolve => setTimeout(resolve, 4200));
            setPullHistory(prev => [{ id: Date.now().toString(), cards: results, timestamp: new Date(), type, cost }, ...prev]);
            setPullAnimation({ active: false, count: 0, highestRarity: null, currentBalance: wishes - cost });
        setShowResults(true);
        } catch (error: any) {
            console.error("[GACHA] Erreur lors du tirage:", error);
            alert(`Erreur: ${error.message}`);
        } finally {
            // ✨ On déverrouille le bouton une fois que tout est terminé
            setIsPulling(false);
        }
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

    const currentFeaturedChar = featuredCharacters[currentFeatured]; // Get current featured character

    const pityStatus = currentFeaturedChar ? getPityStatus(currentFeaturedChar.pity) : { text: '', className: '' };

    const remainingToFive = currentFeaturedChar ? Math.max(0, 90 - currentFeaturedChar.pity) : 0;

    // NEW: état pour synchroniser le positionnement (focale) de l'image vedette
    const [foregroundObjectPosition, setForegroundObjectPosition] = useState<string>('center center');

    // NEW: handler pour ajuster le focus selon les proportions de l'image
    const handleForegroundImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        const ratio = img.naturalHeight / img.naturalWidth;
        // Si l'image est très verticale (portrait), aligner sur le haut pour montrer la tête
        if (ratio > 1.6) {
            setForegroundObjectPosition('top center');
        } else {
            setForegroundObjectPosition('center center');
        }
    };

    if (!currentFeaturedChar) {
        return <div className="flex h-screen w-full items-center justify-center"><div className="nyx-spinner"></div></div>;
    }

    return (
        <div className="min-h-screen w-full relative bg-transparent overflow-hidden">
            <div className="relative z-30 max-w-7xl mx-auto px-6 py-8">
                {/* Header avec timer */}
                <header className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-700 to-amber-400 flex items-center justify-center shadow-xl border border-white/6">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Invocation — Événement</h1>
                            <p className="text-sm text-white/60">Bannière à durée limitée • Style invocation épique</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-full border border-white/6">
                            <Gem className="w-4 h-4 text-amber-300" />
                            <div className="text-sm text-white font-semibold">{currency}</div>
                        </div>

                        <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-full border border-white/6">
                            <img src="/gacha/icons/wish.png" alt="wish" className="w-4 h-4" />
                            <div className="text-sm text-white font-semibold">{wishes}</div>
                        </div>

                        {/* Timer visible dans le header */}
                        <div className="px-3 py-2 rounded-full bg-black/20 border border-white/6 text-sm text-white/90">
                            {formatTime(timeRemaining)}
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Collection button ajouté */}
                            <Link href="/dashboard/mini-jeu/gacha/collection">
                                <button className="px-3 py-1 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 text-sm text-white font-medium hover:opacity-90 border border-white/10">
                                    Collection
                                </button>
                            </Link>

                            <Link href="/dashboard/mini-jeu"><FavoriteToggleButton pageId="gacha" /></Link>
                            <Link href="/dashboard/mini-jeu">
                                <button className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/70">
                                    <X size={16} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Layout principal */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: grand artwork — now includes its own blurred background + foreground image */}
                    <div className="lg:col-span-8 col-span-12 relative rounded-2xl overflow-hidden shadow-2xl border border-white/6 flex items-center justify-center bg-transparent">
                        {/* BACKGROUND: same image, larger, blurred & offset (pointer-events-none so controls restent cliquables) */}
                        <div className="absolute inset-0 -z-10 pointer-events-none">
                            <div
                                className="absolute -left-16 -right-16 top-0 bottom-0 blur-3xl opacity-30 transform scale-[1.12] bg-cover bg-no-repeat bg-center"
                                style={{
                                    backgroundImage: `url(${currentFeaturedChar.image})`,
                                    backgroundPosition: foregroundObjectPosition,
                                    backgroundSize: 'cover'
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
                        </div>

                        {/* FOREGROUND: image nette au premier plan, object-contain pour éviter le crop du buste */}
                        <motion.img
                            src={currentFeaturedChar.image}
                            alt={currentFeaturedChar.name}
                            className="max-h-[720px] w-auto object-contain z-20 pointer-events-none"
                            style={{ objectPosition: foregroundObjectPosition }}
                            onLoad={handleForegroundImageLoad}
                            initial={{ scale: 1.01, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        />

                        {/* badge personnage (toujours cliquable) */}
                        <div className="absolute left-6 bottom-6 z-30 pointer-events-auto">
                            <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/6">
                                <div className="text-xs text-white/60">Personnage</div>
                                <div className="text-lg font-bold text-white">{currentFeaturedChar.name}</div>
                                <div className="flex items-center gap-1 mt-1">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-300" />)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: panneau de contrôle — inchangé */}
                    <aside className="lg:col-span-4 col-span-12 flex flex-col gap-5 z-50 pointer-events-auto">
                        <div className="bg-gradient-to-br from-white/6 to-black/20 border border-white/8 rounded-2xl p-5 backdrop-blur-lg shadow-2xl">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-xs text-white/60">Bannière</div>
                                    <div className="text-2xl font-extrabold text-white">{currentFeaturedChar.name}</div>
                                    <div className="text-sm text-amber-300 mt-1 font-semibold">Probabilité augmentée</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-white/60">Puissance</div>
                                    <div className="text-lg font-bold text-white">{currentFeaturedChar.power}</div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                                <div className="flex-1">
                                    <PityProgressCircle pity={currentFeaturedChar.pity} maxPity={90} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    {/* Boutons avec logique intacte et cliquable */}
                                    <motion.button onClick={() => performPull('single')} disabled={isPulling || wishes < 1} className="px-4 py-3 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 text-white font-semibold shadow-lg disabled:opacity-50">
                                        Souhait x1
                                    </motion.button>
                                    <motion.button onClick={() => performPull('multi')} disabled={isPulling || wishes < 10} className="px-4 py-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-black font-bold shadow-2xl disabled:opacity-50">
                                        Souhait x10
                                    </motion.button>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <button onClick={() => setActiveTab('shop')} className="px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold">Boutique</button>
                                <button onClick={() => setActiveTab('history')} className="px-3 py-2 rounded-lg border border-white/8 text-white">Historique</button>
                            </div>

                            <div className="mt-4 text-xs text-white/70">
                                <div className="font-semibold text-white/90">Règles rapides</div>
                                <ul className="list-inside list-disc mt-2 space-y-1">
                                    <li>5★ garanti maximum à 90 vœux.</li>
                                    <li>4★+ garanti au moins une fois tous les 10 vœux.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Bannières disponibles */}
                        <div className="bg-black/30 border border-white/6 rounded-2xl p-4">
                            <div className="text-sm text-white/80 font-semibold mb-3">Bannières disponibles</div>
                            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2">
	{featuredCharacters.map((char, idx) => (
		<button
			key={char.id}
			onClick={() => setCurrentFeatured(idx)}
			aria-label={`Sélectionner ${char.name}`}
			className={`relative w-full rounded-lg overflow-hidden transition focus:outline-none ${
				currentFeatured === idx ? 'ring-2 ring-purple-400/50' : 'hover:scale-[1.01]'
			}`}
		>
			{/* Background image (cover, slightly shifted) */}
			<div
				className="absolute inset-0 transform transition-transform duration-500"
				style={{
					backgroundImage: `url(${char.image})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					willChange: 'transform'
				}}
			/>
			{/* Dark overlay for legibility */}
			<div className={`absolute inset-0 ${currentFeatured === idx ? 'bg-gradient-to-r from-purple-900/40 to-black/30' : 'bg-black/30'} `} />

			{/* Content */}
			<div className="relative flex items-center gap-3 p-2">
				<div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border border-white/10 bg-black/20">
					<img src={char.image} alt={char.name} className="w-full h-full object-cover" />
				</div>
				<div className="text-left">
					<div className="text-sm font-semibold text-white">{char.name}</div>
					<div className="text-xs text-white/70">{char.anime}</div>
				</div>
				<div className="ml-auto text-xs text-white/70">{char.pity} / 90</div>
			</div>
		</button>
	))}
</div>
                        </div>

                        <div className="text-xs text-white/60">Astuce : convertissez des pièces en vœux dans la boutique. La progression de pity est persistante.</div>
                    </aside>
                </div>

                {/* Modals & results placeholders — logique inchangée */}
                <div className="mt-8">
                    {/* Toaster pour les notifications */}
                    <Toaster richColors position="top-center" />

                    {/* --- MODAL: SHOP / HISTORY / DETAILS --- */}
                    <AnimatePresence>
                        {(activeTab === 'shop' || activeTab === 'history') && (
                            <motion.div
                                key="panel-modal"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[90] flex items-center justify-center p-4"
                                onClick={() => setActiveTab(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.96, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.96, opacity: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full max-w-3xl bg-gradient-to-br from-slate-800/80 to-black/80 border border-white/10 rounded-2xl p-6 shadow-2xl"
                                >
                                    {activeTab === 'shop' && (
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-bold text-white">Boutique de Vœux</h3>
                                                <button onClick={() => setActiveTab(null)} className="text-sm text-white/60">Fermer</button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-white/5 rounded-lg p-4 flex flex-col items-center">
                                                    <img src="/gacha/icons/wish.png" alt="1v" className="w-20 h-20 mb-3" />
                                                    <div className="text-lg font-semibold text-white mb-2">1 Vœu</div>
                                                    <div className="text-sm text-white/70 mb-4">Pour un tirage unique</div>
                                                    <button
                                                        onClick={() => buyWishes('single')}
                                                        disabled={isBuying || currency < 500}
                                                        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold disabled:opacity-50"
                                                    >
                                                        <Gem className="inline w-4 h-4 mr-2" /> 500
                                                    </button>
                                                </div>

                                                <div className="bg-gradient-to-br from-purple-900/30 rounded-lg p-4 flex flex-col items-center">
                                                    <img src="/gacha/icons/wish-pack.png" alt="10v" className="w-24 h-24 mb-3" />
                                                    <div className="text-lg font-semibold text-white mb-2">10 Vœux</div>
                                                    <div className="text-sm text-white/70 mb-4">Pack promo -10%</div>
                                                    <button
                                                        onClick={() => buyWishes('multi')}
                                                        disabled={isBuying || currency < 4500}
                                                        className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold disabled:opacity-50"
                                                    >
                                                        <Gem className="inline w-4 h-4 mr-2" /> 4500
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'history' && (
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-bold text-white">Historique</h3>
                                                <button onClick={() => setActiveTab(null)} className="text-sm text-white/60">Fermer</button>
                                            </div>

                                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                                {getFilteredHistory().length === 0 ? (
                                                    <div className="text-center py-12 text-white/60">
                                                        <div className="text-4xl mb-2">🎴</div>
                                                        <div className="font-semibold">Aucun Historique</div>
                                                        <div className="text-sm mt-1">Faites vos premiers vœux pour remplir l'historique.</div>
                                                    </div>
                                                ) : (
                                                    getFilteredHistory().map((entry) => (
                                                        <div key={entry.id} className="bg-white/5 p-3 rounded-lg border border-white/10">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <div className="text-sm text-white font-medium">
                                                                    {entry.type === 'single' ? '1x Souhait' : '10x Souhaits'} • {entry.timestamp.toLocaleString()}
                                                                </div>
                                                                <div className="text-xs text-white/60">Coût: {entry.cost} ✦</div>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {entry.cards.map((r, i) => (
                                                                    <div key={i} className="p-2 rounded-md bg-black/30 border border-white/8 min-w-[120px]">
                                                                        <div className="text-sm font-semibold text-white truncate">{r.card.name}</div>
                                                                        <div className="text-xs text-white/60">{r.card.rarity}</div>
                                                                        {r.isNew && <div className="text-xs text-emerald-400 mt-1">Nouveau</div>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Toaster + Results + WishAnimation (existants) */}
                    {/* ...existing results & wish animation code... */}
                    <Toaster richColors position="top-center" />

                    <AnimatePresence>
                        {showResults && (
                            <motion.div
                                key="results-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
                                onClick={closeResults}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    className="relative w-full max-w-4xl max-h-[86vh] overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Fond décoratif léger */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent pointer-events-none" />

                                    <div className="relative z-10 flex flex-col items-center justify-center p-6">
                                        <AnimatePresence mode="wait">
                                            {pullResults[revealedCardIndex] && (
                                                <RevealedCard
                                                    key={revealedCardIndex}
                                                    card={pullResults[revealedCardIndex].card}
                                                    isNew={pullResults[revealedCardIndex].isNew}
                                                    rarityStyles={getRarityStyle(pullResults[revealedCardIndex].card.rarity)}
                                                    rarityStars={getRarityStars(pullResults[revealedCardIndex].card.rarity) as React.ReactNode[]}
                                                    isHighRarity={['Légendaire', 'Mythique'].includes(pullResults[revealedCardIndex].card.rarity)}
                                                    onAnimationComplete={() => { /* optional hook */ }}
                                                />
                                            )}
                                        </AnimatePresence>

                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20">
                                            {revealedCardIndex < pullResults.length - 1 ? (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setRevealedCardIndex(prev => prev + 1)}
                                                    className="px-8 py-3 bg-blue-600 rounded-full text-white font-bold shadow-lg"
                                                >
                                                    Suivant ({revealedCardIndex + 1}/{pullResults.length})
                                                </motion.button>
                                            ) : (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={closeResults}
                                                    className="px-8 py-3 bg-purple-600 rounded-full text-white font-bold shadow-lg"
                                                >
                                                    Terminer
                                                </motion.button>
                                            )}

                                            <motion.button
                                                onClick={() => setRevealedCardIndex(pullResults.length - 1)}
                                                className="text-xs text-white/50 hover:text-white underline"
                                            >
                                                Passer
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {pullAnimation.active && (
                            <WishAnimation
                                count={pullAnimation.count}
                                highestRarity={pullAnimation.highestRarity}
                                onSkip={() => {
                                    // Arrêter l'animation et ouvrir le modal de résultats
                                    setPullAnimation({ active: false, count: 0, highestRarity: null, currentBalance: pullAnimation.currentBalance });
                                    setShowResults(true);
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// --- COMPOSANT PRINCIPAL (Wrapper avec Provider) ---

export default function GachaClientPage() {
    return (
        <GachaProvider>
            <GachaPageContent />
        </GachaProvider>
    );
}