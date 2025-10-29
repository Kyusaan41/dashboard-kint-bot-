"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { Star, Filter, History, X, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { getRandomCardByRarity, getCardById, getCardsByRarity, AnimeCard } from './cards';
import { useSession } from 'next-auth/react'; 
import { fetchCurrency as apiFetchCurrency, updateCurrency } from '@/utils/api';
import { RevealedCard } from './RevealedCard'; 
import { GachaProvider, useGacha, FeaturedCharacter } from './GachaContext';
import { API_ENDPOINTS } from '@/lib/api-config.js';

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

const WishAnimation = ({ count, highestRarity }: { count: number, highestRarity: CardRarity | null }) => {
	const rarityStyle = getRarityStyle(highestRarity || 'Commun');
	const isHighRarity = highestRarity === 'Légendaire' || highestRarity === 'Mythique';
	const isMultiPull = count > 1;

	const cometColor = isMultiPull
		? 'bg-gradient-to-r from-red-500 via-yellow-400 to-cyan-400'
		: highestRarity === 'Mythique' ? 'bg-yellow-400'
		: highestRarity === 'Légendaire' ? 'bg-purple-400'
		: highestRarity === 'Épique' ? 'bg-blue-400'
		: 'bg-white';

	return (
		<motion.div
			exit={{ opacity: 0, transition: { delay: 1.5 } }}
			className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
			variants={{
				hidden: { opacity: 0 },
				visible: { opacity: 1 },
				shake: { x: [0, -5, 5, -5, 5, 0], y: [0, 2, -2, 2, -2, 0], transition: { duration: 0.2, delay: 3.6 } },
			}}
			initial="hidden"
			animate={["visible", "shake"]}
		>
			{/* Fond étoilé */}
			{Array.from({ length: 100 }).map((_, i) => (
				<motion.div
					key={i}
					className="absolute rounded-full bg-white/50"
					style={{
						width: Math.random() * 2 + 0.5,
						height: Math.random() * 2 + 0.5,
						top: `${Math.random() * 100}%`,
						left: `${Math.random() * 100}%`,
					}}
					initial={{ opacity: 0, scale: 0.5 }}
					animate={{ opacity: [0, 1, 0] }}
					transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 4 }}
				/>
			))}

			{/* Étoile filante principale */}
			<motion.div
				className="absolute"
				initial={{ x: '-100vw', y: '-50vh', opacity: 0 }}
				animate={{ x: '100vw', y: '50vh', opacity: [0, 1, 1, 0] }}
				transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
			>
				<div className={`w-48 h-1.5 ${cometColor} rounded-full blur-[1px]`} />
				<div className={`absolute top-0 left-0 w-48 h-1.5 ${cometColor} rounded-full blur-md opacity-70`} />
			</motion.div>

			{/* Onde de choc */}
			<motion.div
				className={`absolute w-1 h-1 rounded-full border-4 ${rarityStyle.border}`}
				initial={{ scale: 0, opacity: 0 }}
				animate={{ scale: [0, 1, 300], opacity: [0, 1, 0] }}
				transition={{ duration: 0.7, ease: 'easeOut', delay: 1.5 }}
			/>
			
			{/* Formation de la porte */}
			<motion.div
				className="absolute"
				initial={{ opacity: 0, scale: 0 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 1.8, duration: 0.5 }}
			>
				<motion.div
					className={`absolute -inset-8 w-80 h-80 rounded-full ${rarityStyle.bg} blur-2xl`}
					animate={{ rotate: 360 }}
					transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
				/>
				<svg width="256" height="256" viewBox="0 0 256 256" className="relative">
					<defs>
						<radialGradient id="gateGradient" cx="50%" cy="50%" r="50%">
							<stop offset="60%" stopColor="rgba(10, 5, 20, 0)" />
							<stop offset="85%" stopColor={isHighRarity ? 'rgba(255, 220, 120, 0.5)' : 'rgba(190, 150, 255, 0.5)'} />
							<stop offset="100%" stopColor={isHighRarity ? 'rgba(255, 255, 255, 1)' : 'rgba(220, 200, 255, 1)'} />
						</radialGradient>
					</defs>
					<motion.circle
						cx="128" cy="128" r="120"
						stroke="url(#gateGradient)" strokeWidth="8" fill="none"
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{ pathLength: 1, opacity: 1 }}
						transition={{ duration: 1, delay: 2.0, ease: 'easeInOut' }}
					/>
					<motion.circle
						cx="128" cy="128" r="120"
						fill="none" stroke={isHighRarity ? 'rgba(255, 220, 120, 0.7)' : 'rgba(190, 150, 255, 0.7)'} strokeWidth="2"
						initial={{ scale: 1, opacity: 0 }}
						animate={{ scale: [1, 1.05, 1], opacity: [0, 0.8, 0] }}
						transition={{ duration: 1, repeat: Infinity, delay: 3.0, repeatType: "mirror" }}
					/>
				</svg>
			</motion.div>

			{/* Flash final */}
			<motion.div
				className={`absolute inset-0 ${RARITY_FLASH_COLORS[highestRarity || 'Commun']}`}
				initial={{ opacity: 0, zIndex: -1 }}
				animate={{ opacity: [0, 1, 0] }}
				transition={{ delay: 3.8, duration: 0.4, times: [0, 0.1, 1] }}
			/>
		</motion.div>
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
    const [quantityFilter, setQuantityFilter] = useState<'all' | 'multiple'>('all');
    
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
            setWishes(data.wishes || 0);
        } catch (error) {
            console.error("[GACHA] Erreur de récupération des vœux:", error);
            setWishes(0);
        }
    }, [session]);

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
        }
    };

    const performPull = async (type: 'single' | 'multi') => {
        if (pullAnimation.active) return;
        if (!session) {
            alert("Veuillez vous connecter pour jouer.");
            return;
        }

        const cost = type === 'single' ? 1 : 10;
        if (wishes < cost) {
            alert('Pas assez de vœux !');
            return;
        }

        // Dépenser les vœux via l'API
        try {
            const spendResponse = await fetch(API_ENDPOINTS.gachaSpendWishes(session.user.id), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id, amount: cost }),
            });

            if (!spendResponse.ok) {
                const errorData = await spendResponse.json();
                throw new Error(errorData.error || 'Échec de la dépense des vœux');
            }

            const pullData = await spendResponse.json();
            setWishes(pullData.newWishes); // Met à jour le solde de vœux après le tirage

        const results: PullResult[] = [];
            // La logique de tirage est maintenant côté bot, on utilise les résultats qu'il renvoie.
            for (const pulledCard of pullData.pulledCards) {
                results.push({ card: pulledCard, isNew: pulledCard.isNew }); // isNew est maintenant géré par le bot

                // ✨ CORRECTION : On sauvegarde chaque carte obtenue dans la collection
                try {
                    await fetch(API_ENDPOINTS.GACHA_ADD_CARD, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: session.user.id,
                            username: session.user.name,
                            cardId: pulledCard.id,
                            anime: pulledCard.anime,
                        }),
                    });
                } catch (error) {
                    console.error("[GACHA] Erreur de sauvegarde de la carte:", pulledCard.name, error);
                }
            }
        
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

    if (!currentFeaturedChar) {
        return <div className="flex h-screen w-full items-center justify-center"><div className="nyx-spinner"></div></div>;
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
            {/* ✨ CORRECTION: Ajout du composant Toaster pour que les notifications s'affichent */}
            <Toaster richColors position="top-center" />

            
            <div className="w-full max-w-7xl h-auto md:h-[750px] bg-slate-900/70 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-lg p-4 font-sans relative overflow-hidden flex flex-col text-white z-50">

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
                        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full text-sm">
                            <img 
                                src="/gacha/icons/wish.png" 
                                alt="Vœux" 
                                className="w-4 h-4"
                            />
                            <span className="font-semibold">{wishes}</span>
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
                    <motion.img
                        src={currentFeaturedChar.image}
                        alt="Banner Background"
                        className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 opacity-30"
                        initial={{ scale: 1.1, rotate: 0 }}
                        animate={{ scale: 1.15, rotate: 0.5 }}
                        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
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
                                    right: currentFeaturedChar.rarity === 'Mythique' ? '-10px' : '20px',
                                    height: currentFeaturedChar.rarity === 'Mythique' ? '130%' : '110%',
                                    width: currentFeaturedChar.rarity === 'Mythique' ? '400px' : '300px',
                                    backgroundColor: getGlowColor(currentFeaturedChar.rarity),
                                }}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 0.5 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Image du personnage "Splash Art" */}
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
                            <div className="text-xs text-white/70 mt-2">Progression du Vœu</div>
                            <div className={`text-lg font-semibold ${pityStatus.className}`}>{pityStatus.text}</div>
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
                                disabled={pullAnimation.active || wishes < 1}
                            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="px-5 py-2.5 flex flex-col items-center">
                                <span>Souhait x1</span>
                                <div className="flex items-center gap-1 text-xs text-yellow-300">
                                    <img 
                                        src="/gacha/icons/wish.png" 
                                        alt="Vœu" 
                                        className="w-4 h-4"
                                    />
                                    <span className="font-semibold">1</span>
                                </div>
                            </div>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => performPull('multi')}
                            disabled={pullAnimation.active || wishes < 10}
                            className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 text-black font-bold rounded-full shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="px-8 py-2.5 flex flex-col items-center">
                                <span>Souhait x10</span>
                                <div className="flex items-center gap-1 text-xs text-black/70">
                                    <img 
                                        src="/gacha/icons/wish.png" 
                                        alt="Vœu" 
                                        className="w-4 h-4"
                                    />
                                    <span className="font-semibold">10</span>
                                </div>
                            </div>
                        </motion.button>
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
                                        <h3 className="text-2xl font-bold text-white mb-6 text-center">Boutique de Vœux</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                                            {/* Carte pour 1 Vœu */}
                                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center flex flex-col transition-all hover:border-blue-500 hover:bg-slate-800">
                                                <img src="/gacha/icons/wish.png" alt="Vœu" className="w-20 h-20 mx-auto mb-4"/>
                                                <h4 className="text-lg font-semibold text-white mb-2">1 Vœu</h4>
                                                <p className="text-gray-400 mb-4 flex-grow">Pour un tirage unique.</p>
                                                <button 
                                                    onClick={() => buyWishes('single')}
                                                    disabled={currency < 500}
                                                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-white shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Acheter pour 500 ✦
                                                </button>
                                            </div>
                                            {/* Carte pour 10 Vœux avec encadrement promo */}
                                            <div className="relative bg-gradient-to-b from-yellow-900/30 to-slate-800/50 rounded-xl p-6 border-2 border-yellow-500 text-center flex flex-col shadow-lg shadow-yellow-500/10">
                                                <div className="absolute top-0 right-0 bg-yellow-500 text-black font-bold text-xs uppercase px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-md">
                                                    Promo
                                                </div>
                                                <h4 className="text-lg font-semibold text-white mb-2">10 Vœux</h4>
                                                <img src="/gacha/icons/wish-pack.png" alt="Pack de Vœux" className="w-24 h-24 mx-auto mb-4"/>
                                                <p className="text-yellow-300/80 mb-4 flex-grow">Le meilleur rapport qualité-prix pour vos tirages !</p>
                                                <button 
                                                    onClick={() => buyWishes('multi')}
                                                    disabled={currency < 4500}
                                                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Acheter pour 4500 ✦
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

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
                    {pullAnimation.active && <WishAnimation count={pullAnimation.count} highestRarity={pullAnimation.highestRarity} />}
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