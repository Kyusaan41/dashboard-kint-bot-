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

    if (!currentFeaturedChar) {
        return <div className="flex h-screen w-full items-center justify-center"><div className="nyx-spinner"></div></div>;
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
            {/* ✨ CORRECTION: Ajout du composant Toaster pour que les notifications s'affichent */}
            <Toaster richColors position="top-center" />

            
            <div className="w-full max-w-7xl h-auto md:h-[750px] bg-slate-900/70 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-lg p-4 pb-24 font-sans relative overflow-hidden flex flex-col text-white z-50">
                <div className="flex items-center justify-between gap-3 mb-3 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-lg md:text-xl font-semibold">Bannières d'Invocation</div>
                            <div className="text-xs text-white/60 hidden md:block">Rotation des bannières toutes les 2 semaines</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full text-sm">
                            <Gem className="w-4 h-4 text-yellow-400" />
                            <span className="font-semibold">{currency}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full text-sm">
                            <img src="/gacha/icons/wish.png" alt="Vœux" className="w-4 h-4" />
                            <span className="font-semibold">{wishes}</span>
                        </div>
                        <Link href="/dashboard/mini-jeu"><FavoriteToggleButton pageId="gacha" /></Link>
                        <Link href="/dashboard/mini-jeu">
                            <button className="w-8 h-8 md:w-9 md:h-9 bg-black/40 rounded-full flex items-center justify-center text-white/70 hover:text-white border border-white/10">
                                <X size={18} />
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Bannières: chips horizontales */}
                <div className="mt-1 overflow-x-auto">
                    <div className="flex items-center gap-2 min-w-max">
                        {featuredCharacters.map((char, index) => (
                            <motion.button
                                key={char.id}
                                onClick={() => setCurrentFeatured(index)}
                                tabIndex={0}
                                role="tab"
                                aria-selected={currentFeatured === index}
                                title={`${char.name} • ${char.anime}`}
                                className={`flex items-center gap-2 pr-3 rounded-full border transition-all outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 ${
                                    currentFeatured === index
                                        ? 'border-purple-400/60 bg-purple-400/10 ring-2 ring-purple-400/60 ring-offset-2 ring-offset-black/40'
                                        : 'border-white/10 bg-black/30 hover:bg-black/40'
                                }`}
                                whileHover={{ y: -2 }}
                            >
                                <img src={char.image} alt={char.name} className="w-10 h-10 rounded-full object-cover shadow-md shadow-black/40" />
                                <span className="text-sm whitespace-nowrap opacity-90">{char.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
                
                <div className="flex-1 rounded-xl relative overflow-hidden shadow-lg mb-3">
                    {/* Image de fond floutée */}
                    <motion.img
                        src={currentFeaturedChar.image}
                        alt="Banner Background"
                        className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 opacity-25"
                        animate={{ scale: [1.1, 1.15, 1.1], rotate: [0, 0.5, 0] }}
                        transition={{ duration: 20, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                    />
                    {/* Dégradé pour la lisibilité */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                    {/* Glow dynamique derrière le personnage */}
                    <AnimatePresence mode="wait">
                        {currentFeaturedChar.rarity && currentFeaturedChar.rarity !== 'Commun' && (
                            <motion.div
                                key={`glow-${currentFeaturedChar.id}`}
                                className="absolute top-1/2 -translate-y-1/2 z-0 rounded-full blur-xl"
                                style={{
                                    right: currentFeaturedChar.rarity === 'Mythique' ? '-20px' : '10px',
                                    height: currentFeaturedChar.rarity === 'Mythique' ? '130%' : '110%',
                                    width: currentFeaturedChar.rarity === 'Mythique' ? '400px' : '300px',
                                    backgroundColor: getGlowColor(currentFeaturedChar.rarity),
                                }}
                                initial={{ scale: 0.9, opacity: 0.4 }}
                                animate={{ scale: [0.9, 1, 0.9], opacity: [0.4, 0.6, 0.4] }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Image du personnage "Splash Art" */}
                    {/* Image du personnage "Splash Art" avec fusion + masque doux */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`char-container-${currentFeaturedChar.id}`}
                    className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {/* Glow subtil autour du personnage */}
                    <motion.div
                        className="absolute top-1/2 left-1/2 w-[60%] h-[60%] max-w-[700px] max-h-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-50"
                        style={{
                            background: getGlowColor(currentFeaturedChar.rarity),
                            filter: 'blur(60px)',
                        }}
                        animate={{ opacity: [0.4, 0.6, 0.4], scale: [0.95, 1.05, 0.95] }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                    />

                    {/* Image du personnage, centrée et à taille uniforme */}
                    <motion.img
                        src={currentFeaturedChar.image}
                        alt={currentFeaturedChar.name}
                        className="relative h-[85%] max-w-[85%] object-contain mix-blend-screen mask-fade select-none pointer-events-none"
                        draggable={false}
                    />
                </motion.div>
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
                            <PityProgressCircle pity={currentFeaturedChar.pity} maxPity={90} />
                        </div>
                    </div></div>

                {/* Barre d'actions sticky */}
                <div className="fixed left-0 right-0 z-40" style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-2 md:p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-2xl">
                            <div className="flex gap-2 bg-black/20 p-1 rounded-full">
                                <button className={`px-4 py-1.5 rounded-full text-sm ${activeTab === 'shop' ? 'bg-white text-slate-900' : 'text-white/80 hover:bg-white/10'}`} onClick={() => setActiveTab('shop')}>Boutique</button>
                                <button className={`px-4 py-1.5 rounded-full text-sm ${activeTab === 'details' ? 'bg-white text-slate-900' : 'text-white/80 hover:bg-white/10'}`} onClick={() => setActiveTab('details')}>Détails</button>
                                <button className={`px-4 py-1.5 rounded-full text-sm ${activeTab === 'history' ? 'bg-white text-slate-900' : 'text-white/80 hover:bg-white/10'}`} onClick={() => setActiveTab('history')}>Historique</button>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3">
                                <Link href="/dashboard/mini-jeu/gacha/collection">
                                    <button className="h-10 px-4 bg-white/10 rounded-full text-white/80 hover:bg-white/20">Collection</button>
                                </Link>
                                <motion.button title={`Coût: 1 vœu • Solde: ${wishes}`} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => performPull('single')} disabled={isPulling || wishes < 1} className="h-10 px-5 rounded-full bg-gradient-to-r from-slate-600 to-slate-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                                    <div className="flex items-center gap-2">
                                        <span>Souhait x1</span>
                                        <img src="/gacha/icons/wish.png" alt="Vœu" className="w-4 h-4" />
                                    </div>
                                </motion.button>
                                <motion.button title={`Coût: 10 vœux • Solde: ${wishes}`} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => performPull('multi')} disabled={isPulling || wishes < 10} className="h-10 px-6 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 text-black font-bold shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <div className="flex items-center gap-2">
                                        <span>Souhait x10</span>
                                        <img src="/gacha/icons/wish.png" alt="Vœu" className="w-4 h-4" />
                                    </div>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {(activeTab === 'shop' || activeTab === 'history' || activeTab === 'details') && (
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
                                {activeTab === 'shop' && (
                                    <div>
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <Sparkles className="w-5 h-5 text-yellow-400" />
                                            <h3 className="text-2xl font-bold text-white text-center">Boutique de Vœux</h3>
                                        </div>
                                        <div className="text-center text-xs text-white/60 mb-4">Achetez des vœux avec vos pièces</div>
                                        <div className="flex items-center justify-center gap-3 mb-6">
                                            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full text-sm">
                                                <Gem className="w-4 h-4 text-yellow-400" />
                                                <span className="font-semibold">{currency}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full text-sm">
                                                <img src="/gacha/icons/wish.png" alt="Vœux" className="w-4 h-4" />
                                                <span className="font-semibold">{wishes}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                                            {/* Carte pour 1 Vœu */}
                                            <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/10 text-center flex flex-col justify-between transition-all hover:border-blue-400/60 hover:bg-slate-800/70 shadow-lg">
                                                <img src="/gacha/icons/wish.png" alt="Vœu" className="w-20 h-20 mx-auto mb-4"/>
                                                <h4 className="text-lg font-semibold text-white mb-2">1 Vœu</h4>
                                                <p className="text-gray-300/80 mb-4 flex-grow">Pour un tirage unique</p>
                                                <button 
                                                    onClick={() => buyWishes('single')}
                                                    disabled={isBuying || currency < 500}
                                                    className="w-full px-6 py-3 bg-blue-600 rounded-xl font-bold text-white shadow-lg hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    <Gem className="w-4 h-4 text-yellow-300" /> 500
                                                </button>
                                                {(currency < 500) && (
                                                    <div className="mt-2 text-xs text-red-300">Solde insuffisant</div>
                                                )}
                                            </div>
                                            {/* Carte pour 10 Vœux avec encadrement promo */}
                                            <div className="relative bg-gradient-to-br from-purple-900/30 via-slate-800/60 to-slate-800/60 rounded-2xl p-6 border-2 border-purple-500/70 text-center flex flex-col justify-between shadow-xl shadow-purple-500/20">
                                                <div className="absolute top-0 right-0 bg-purple-500 text-white font-bold text-xs uppercase px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-md">
                                                    -10%
                                                </div>
                                                <div>
                                                    <img src="/gacha/icons/wish-pack.png" alt="Pack de Vœux" className="w-24 h-24 mx-auto mb-4"/>
                                                    <h4 className="text-xl font-bold text-white mb-2">10 Vœux</h4>
                                                    <p className="text-purple-200/80 mb-4 flex-grow">Le meilleur rapport qualité‑prix</p>
                                                </div>
                                                <button 
                                                    onClick={() => buyWishes('multi')}
                                                    disabled={isBuying || currency < 4500}
                                                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    <Gem className="w-4 h-4 text-yellow-300" /> 4500
                                                </button>
                                                {(currency < 4500) && (
                                                    <div className="mt-2 text-xs text-red-300">Solde insuffisant</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'details' && (
                                    <div>
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <BookOpen className="w-5 h-5 text-purple-300" />
                                            <h3 className="text-2xl font-bold text-white text-center">Détails de la Bannière</h3>
                                        </div>
                                        <div className="text-center text-xs text-white/60 mb-6">Aperçu du personnage vedette, garanties et probabilités</div>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-gray-300">
                                            <div className="lg:col-span-2 space-y-6">
                                                <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex items-center gap-4">
                                                    <img src={currentFeaturedChar.image} alt={currentFeaturedChar.name} className="w-16 h-16 rounded-lg object-cover" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-lg font-bold text-white">{currentFeaturedChar.name}</div>
                                                            <div className="flex items-center">{getRarityStars('Mythique')}</div>
                                                        </div>
                                                        <div className="text-xs text-white/70">{currentFeaturedChar.anime}</div>
                                                        <div className="mt-2 text-xs text-white/70">Puissance • <span className="font-semibold text-white">{currentFeaturedChar.power}</span></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                                    <h4 className="text-lg font-semibold text-purple-300 mb-2">Taux d'obtention</h4>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                        <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 flex items-center justify-between">
                                                            <div className="flex items-center gap-1 text-yellow-400">{[...Array(5)].map((_,i)=>(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />))}</div>
                                                            <div className="text-sm font-semibold text-white">0.6%</div>
                                                        </div>
                                                        <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 flex items-center justify-between">
                                                            <div className="flex items-center gap-1 text-purple-400">{[...Array(4)].map((_,i)=>(<Star key={i} size={14} className="fill-purple-400 text-purple-400" />))}</div>
                                                            <div className="text-sm font-semibold text-white">5.1%</div>
                                                        </div>
                                                        <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 flex items-center justify-between">
                                                            <div className="flex items-center gap-1 text-blue-400">{[...Array(3)].map((_,i)=>(<Star key={i} size={14} className="fill-blue-400 text-blue-400" />))}</div>
                                                            <div className="text-sm font-semibold text-white">20%</div>
                                                        </div>
                                                        <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 flex items-center justify-between">
                                                            <div className="flex items-center gap-1 text-green-400">{[...Array(2)].map((_,i)=>(<Star key={i} size={14} className="fill-green-400 text-green-400" />))}</div>
                                                            <div className="text-sm font-semibold text-white">—</div>
                                                        </div>
                                                        <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 flex items-center justify-between">
                                                            <div className="flex items-center gap-1 text-gray-400">{[...Array(1)].map((_,i)=>(<Star key={i} size={14} className="fill-gray-400 text-gray-400" />))}</div>
                                                            <div className="text-sm font-semibold text-white">—</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-2">
                                                    <h4 className="text-lg font-semibold text-purple-300">Règles de la bannière</h4>
                                                    <ul className="list-disc list-inside text-sm space-y-1">
                                                        <li>50% de chances que le 5★ soit le personnage vedette.</li>
                                                        <li>Si le 5★ n'est pas le vedette, le prochain 5★ est garanti vedette.</li>
                                                        <li>4★ ou plus garanti au moins tous les 10 vœux.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="bg-black/30 rounded-lg border border-white/10 p-4 flex flex-col items-center gap-4">
                                                    <div className="text-center">
                                                        <div className="text-xs text-white/70">Garantie 5★ (Pity)</div>
                                                        <div className="text-sm font-semibold text-white">{currentFeaturedChar.name}</div>
                                                    </div>
                                                    <PityProgressCircle pity={currentFeaturedChar.pity} maxPity={90} />
                                                    <div className={`text-xs font-semibold ${pityStatus.className}`}>{pityStatus.text}</div>
                                                    <div className="text-xs text-white/80">Au plus tard dans <span className="font-bold text-white">{remainingToFive}</span> vœux</div>
                                                </div>
                                                <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                                                    <h4 className="text-sm font-semibold text-purple-300 mb-2">Astuces</h4>
                                                    <ul className="list-disc list-inside text-xs space-y-1 text-white/80">
                                                        <li>Les vœux multiples n'affectent pas les probabilités, mais garantissent un 4★+ sur 10.</li>
                                                        <li>La progression de pity est conservée entre les sessions pendant l'événement.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'history' && (
                                    <div>
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <History className="w-5 h-5 text-blue-300" />
                                            <h3 className="text-2xl font-bold text-white text-center">Historique</h3>
                                        </div>
                                        <div className="text-center text-xs text-white/60 mb-4">Vos tirages récents et filtres</div>
                                        <div className="flex flex-wrap gap-3 mb-6 justify-center bg-white/5 border border-white/10 rounded-xl p-3">
                                            <div className="flex items-center gap-2">
                                                <Filter className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-300">Rareté</span>
                                                <select
                                                    value={rarityFilter}
                                                    onChange={(e) => setRarityFilter(e.target.value as any)}
                                                    className="bg-black/30 border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    <option value="all">Tout</option>
                                                    <option value="rare">2★+</option>
                                                    <option value="epic">3★+</option>
                                                    <option value="legendary">4★+</option>
                                                    <option value="mythic">5★+</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-300">Qté</span>
                                                <select
                                                    value={quantityFilter}
                                                    onChange={(e) => setQuantityFilter(e.target.value as any)}
                                                    className="bg-black/30 border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    <option value="all">Tout</option>
                                                    <option value="multiple">10x Seulement</option>
                                                </select>
                                            </div>
                                        </div>
                                        {(() => {
                                            const total = pullHistory.reduce((a, e) => a + e.cards.length, 0);
                                            const mythic = pullHistory.reduce((a, e) => a + e.cards.filter(r => r.card.rarity === 'Mythique').length, 0);
                                            const legendary = pullHistory.reduce((a, e) => a + e.cards.filter(r => r.card.rarity === 'Légendaire').length, 0);
                                            return (
                                                <div className="flex flex-wrap justify-center gap-2 mb-6">
                                                    <div className="px-3 py-1.5 rounded-full bg-black/30 border border-white/10 text-xs text-white/80">Total cartes: <span className="font-semibold text-white">{total}</span></div>
                                                    <div className="px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-400/30 text-xs text-yellow-300">5★: <span className="font-semibold">{mythic}</span></div>
                                                    <div className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/30 text-xs text-purple-300">4★: <span className="font-semibold">{legendary}</span></div>
                                                </div>
                                            );
                                        })()}
                                        
                                        <div className="space-y-4">
                                            {getFilteredHistory().length === 0 ? (
                                                <div className="text-center py-12">
                                                    <div className="text-6xl mb-4">🎴</div>
                                                    <h3 className="text-xl font-bold text-white mb-2">Aucun Historique</h3>
                                                    <p className="text-gray-400">Votre premier souhait vous attend !</p>
                                                </div>
                                            ) : (
                                                getFilteredHistory().map((entry) => (
                                                    <div key={entry.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors">
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
                                                                        className={`relative p-2 rounded-lg border ${styles.border} ${styles.bg} min-w-[110px] text-center shadow-sm`}
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
                            className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-4"
                            onClick={closeResults}
                        >
                            {/* Fond étoilé pour l'ambiance */}
                            <div className="absolute inset-0 z-0 overflow-hidden">
                                <motion.div 
                                    className="absolute inset-[-20%] bg-[url('/gacha/cosmic-bg.jpg')] bg-cover bg-center opacity-30"
                                    animate={{ scale: [1, 1.05, 1], rotate: [0, -1, 0] }}
                                    transition={{ duration: 40, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                                />
                            </div>

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="relative w-full h-full flex flex-col items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <AnimatePresence mode="wait">
                                    {pullResults[revealedCardIndex] && (
                                        <RevealedCard
                                            key={revealedCardIndex}
                                            card={pullResults[revealedCardIndex].card}
                                            isNew={pullResults[revealedCardIndex].isNew}
                                            rarityStyles={getRarityStyle(pullResults[revealedCardIndex].card.rarity)}
                                            rarityStars={getRarityStars(pullResults[revealedCardIndex].card.rarity) as React.ReactNode[]}
                                            isHighRarity={['Légendaire', 'Mythique'].includes(pullResults[revealedCardIndex].card.rarity)}
                                            onAnimationComplete={() => { /* La logique est maintenant dans RevealedCard */ }}
                                        />
                                    )}
                                </AnimatePresence>

                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20">
                                    {revealedCardIndex < pullResults.length - 1 ? (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setRevealedCardIndex(prev => prev + 1)}
                                            className="px-10 py-3 bg-blue-600/80 backdrop-blur-sm border border-blue-400 rounded-full font-bold text-white shadow-lg hover:bg-blue-500 transition-all"
                                        >
                                            Suivant ({revealedCardIndex + 1}/{pullResults.length})
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={closeResults}
                                            className="px-10 py-3 bg-purple-600/80 backdrop-blur-sm border border-purple-400 rounded-full font-bold text-white shadow-lg hover:bg-purple-500 transition-all"
                                        >
                                            Terminer
                                        </motion.button>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setRevealedCardIndex(pullResults.length - 1)}
                                        className="text-xs text-white/50 hover:text-white hover:underline transition-colors"
                                    >
                                        Passer
                                    </motion.button>
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
                                setPullAnimation({ active: false, count: 0, highestRarity: null, currentBalance: pullAnimation.currentBalance });
                                setShowResults(true);
                            }}
                        />
                    )}
                </AnimatePresence>
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