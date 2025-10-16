"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Trophy, ArrowLeft, Zap, Crown, Gift, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
    ANIME_CARDS, 
    AnimeCard, 
    CardRarity, 
    RARITY_RATES, 
    RARITY_COLORS,
    getRandomCardByRarity 
} from './cards';
import { CardImage } from './CardImage';
import { preloadCharacterImages } from './jikanService';

const ORB_PRICE = 50;

export default function GachaPage() {
    const { data: session } = useSession();
    const [balance, setBalance] = useState(0);
    const [pityCounter, setPityCounter] = useState(0);
    const [isRolling, setIsRolling] = useState(false);
    const [currentCard, setCurrentCard] = useState<AnimeCard | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [showNothing, setShowNothing] = useState(false);
    const [collection, setCollection] = useState<AnimeCard[]>([]);
    const [showCollection, setShowCollection] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (session?.user) {
            fetch('/api/currency/me')
                .then(res => res.json())
                .then(data => setBalance(data.balance || 0))
                .catch(err => console.error('Error fetching balance:', err));
        }
    }, [session]);

    useEffect(() => {
        const savedCollection = localStorage.getItem('gacha_collection');
        const savedPity = localStorage.getItem('gacha_pity');
        
        if (savedCollection) {
            try {
                setCollection(JSON.parse(savedCollection));
            } catch (e) {
                console.error('Error loading collection:', e);
            }
        }
        
        if (savedPity) {
            setPityCounter(parseInt(savedPity, 10));
        }

        // Précharger les images des personnages depuis Jikan API
        const malIds = ANIME_CARDS.map(card => card.malId);
        preloadCharacterImages(malIds).catch(err => {
            console.error('Error preloading character images:', err);
        });
    }, []);

    const saveToLocalStorage = (newCollection: AnimeCard[], newPity: number) => {
        localStorage.setItem('gacha_collection', JSON.stringify(newCollection));
        localStorage.setItem('gacha_pity', newPity.toString());
    };

    const rollRarity = (isPityGuaranteed: boolean): CardRarity | null => {
        if (isPityGuaranteed) {
            return 'Mythique';
        }

        const nothingChance = 0.15;
        const rand = Math.random();
        
        if (rand < nothingChance) {
            return null;
        }

        const adjustedRand = (rand - nothingChance) / (1 - nothingChance);
        
        let cumulative = 0;
        const rarities: CardRarity[] = ['Commun', 'Rare', 'Épique', 'Légendaire'];
        
        for (const rarity of rarities) {
            cumulative += RARITY_RATES[rarity];
            if (adjustedRand <= cumulative) {
                return rarity;
            }
        }
        
        return 'Commun';
    };

    const performRoll = async () => {
        if (balance < ORB_PRICE) {
            alert(`Vous n'avez pas assez de pièces ! Il vous faut ${ORB_PRICE} pièces.`);
            return;
        }

        if (isRolling) return;

        setIsRolling(true);
        setShowResult(false);
        setShowNothing(false);
        setCurrentCard(null);

        try {
            const res = await fetch('/api/currency/me', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: -ORB_PRICE }),
            });

            if (res.ok) {
                const data = await res.json();
                setBalance(data.balance || balance - ORB_PRICE);
            }
        } catch (error) {
            console.error('Error updating balance:', error);
        }

        const newPityCounter = pityCounter + 1;
        const isPityGuaranteed = newPityCounter >= 100;

        await new Promise(resolve => setTimeout(resolve, 2000));

        const rarity = rollRarity(isPityGuaranteed);

        if (rarity === null) {
            setShowNothing(true);
            setPityCounter(newPityCounter);
            saveToLocalStorage(collection, newPityCounter);
        } else {
            const card = getRandomCardByRarity(rarity);
            
            if (card) {
                setCurrentCard(card);
                setShowResult(true);

                const newCollection = [...collection, card];
                setCollection(newCollection);

                const finalPity = rarity === 'Mythique' ? 0 : newPityCounter;
                setPityCounter(finalPity);
                saveToLocalStorage(newCollection, finalPity);

                // Sauvegarder dans la collection du bot
                if (session?.user?.id) {
                    try {
                        await fetch('/api/gacha/collection', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: session.user.id,
                                username: session.user.name || 'Unknown',
                                cardId: card.id,
                                anime: card.anime
                            }),
                        });
                    } catch (error) {
                        console.error('Erreur lors de la sauvegarde dans la collection:', error);
                    }
                }

                if (rarity === 'Légendaire' || rarity === 'Mythique') {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 4000);
                }
            }
        }

        setIsRolling(false);
    };

    const Confetti = () => {
        const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#fbbf24', '#a78bfa'];
        const shapes = ['🌟', '✨', '⭐', '💫', '🎉', '🎊'];
        
        return (
            <div className="fixed inset-0 pointer-events-none z-50">
                {Array.from({ length: 150 }).map((_, i) => (
                    <motion.div
                        key={`confetti-${i}`}
                        className="absolute rounded-full"
                        style={{
                            width: Math.random() * 8 + 4,
                            height: Math.random() * 8 + 4,
                            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                            left: `${Math.random() * 100}%`,
                            top: '-5%',
                        }}
                        initial={{ y: 0, opacity: 1, rotate: 0, scale: 0 }}
                        animate={{
                            y: window.innerHeight + 100,
                            opacity: [0, 1, 1, 0],
                            rotate: Math.random() * 1080,
                            x: (Math.random() - 0.5) * 300,
                            scale: [0, 1, 1, 0],
                        }}
                        transition={{
                            duration: Math.random() * 2 + 2,
                            ease: 'easeOut',
                            delay: Math.random() * 0.5,
                        }}
                    />
                ))}
                
                {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                        key={`emoji-${i}`}
                        className="absolute text-3xl"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: '-10%',
                        }}
                        initial={{ y: 0, opacity: 0, rotate: 0, scale: 0 }}
                        animate={{
                            y: window.innerHeight + 100,
                            opacity: [0, 1, 1, 0],
                            rotate: Math.random() * 720,
                            scale: [0, 1.5, 1, 0],
                            x: (Math.random() - 0.5) * 200,
                        }}
                        transition={{
                            duration: Math.random() * 2.5 + 2,
                            ease: 'easeOut',
                            delay: Math.random() * 0.3,
                        }}
                    >
                        {shapes[Math.floor(Math.random() * shapes.length)]}
                    </motion.div>
                ))}
                
                {Array.from({ length: 20 }).map((_, i) => {
                    const angle = (i / 20) * Math.PI * 2;
                    const distance = 200 + Math.random() * 100;
                    return (
                        <motion.div
                            key={`burst-${i}`}
                            className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                            style={{
                                left: '50%',
                                top: '50%',
                            }}
                            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                            animate={{
                                x: Math.cos(angle) * distance,
                                y: Math.sin(angle) * distance,
                                opacity: [0, 1, 0],
                                scale: [0, 2, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                ease: 'easeOut',
                            }}
                        />
                    );
                })}
            </div>
        );
    };

    const CardDisplay = ({ card }: { card: AnimeCard }) => {
        const colors = RARITY_COLORS[card.rarity];
        
        const getRarityAnimation = () => {
            switch(card.rarity) {
                case 'Mythique':
                    return { particles: 50, shake: true, lightning: true, rainbowGlow: true };
                case 'Légendaire':
                    return { particles: 30, shake: true, lightning: false, rainbowGlow: false };
                case 'Épique':
                    return { particles: 20, shake: false, lightning: false, rainbowGlow: false };
                default:
                    return { particles: 0, shake: false, lightning: false, rainbowGlow: false };
            }
        };
        
        const rarityEffects = getRarityAnimation();
        
        return (
            <>
                {rarityEffects.shake && (
                    <motion.div
                        className="fixed inset-0 pointer-events-none z-40"
                        initial={{ x: 0, y: 0 }}
                        animate={{
                            x: [0, -10, 10, -10, 10, 0],
                            y: [0, 10, -10, 10, -10, 0],
                        }}
                        transition={{ duration: 0.5, repeat: 2 }}
                    />
                )}
                
                {rarityEffects.lightning && (
                    <div className="fixed inset-0 pointer-events-none z-40">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 bg-yellow-300"
                                style={{
                                    left: `${20 + i * 20}%`,
                                    top: 0,
                                    height: '100%',
                                    boxShadow: '0 0 20px #fef08a',
                                }}
                                initial={{ opacity: 0, scaleY: 0 }}
                                animate={{
                                    opacity: [0, 1, 0, 1, 0],
                                    scaleY: [0, 1, 0, 1, 0],
                                }}
                                transition={{
                                    duration: 0.3,
                                    delay: i * 0.1,
                                    repeat: 3,
                                }}
                            />
                        ))}
                    </div>
                )}
                
                <motion.div
                    initial={{ scale: 0, rotateY: 180, z: -1000 }}
                    animate={{ scale: 1, rotateY: 0, z: 0 }}
                    transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                    className="relative"
                    style={{ perspective: '1500px' }}
                >
                    <div className={`relative w-[450px] h-[650px] bg-gradient-to-br ${colors.bg} rounded-3xl border-4 ${colors.border} shadow-2xl ${colors.glow} overflow-hidden backdrop-blur-xl`}>
                        {/* Particules de rareté */}
                        {rarityEffects.particles > 0 && (
                            <div className="absolute inset-0 pointer-events-none">
                                {Array.from({ length: rarityEffects.particles }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                        }}
                                        animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0, 2, 0],
                                            y: [0, -50, -100],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: i * 0.05,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                        
                        {/* Effet de brillance */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        />
                        
                        {/* Aura arc-en-ciel pour Mythique */}
                        {rarityEffects.rainbowGlow && (
                            <motion.div
                                className="absolute -inset-4 bg-gradient-to-br from-pink-500 via-purple-500 via-blue-500 to-yellow-500 blur-xl opacity-50"
                                animate={{
                                    opacity: [0.3, 0.7, 0.3],
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 360],
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        )}
                        
                        {/* Contenu de la carte */}
                        <div className="relative z-10 p-8 h-full flex flex-col">
                            {/* Badge de rareté */}
                            <motion.div 
                                className={`absolute top-4 right-4 px-4 py-2 rounded-full ${colors.bg} ${colors.border} border-2 backdrop-blur-sm flex items-center gap-2`}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                >
                                    {card.rarity === 'Mythique' && <Crown className="w-5 h-5 text-pink-300" />}
                                    {card.rarity === 'Légendaire' && <Trophy className="w-5 h-5 text-yellow-300" />}
                                    {card.rarity === 'Épique' && <Star className="w-5 h-5 text-purple-300" />}
                                    {card.rarity === 'Rare' && <Sparkles className="w-5 h-5 text-blue-300" />}
                                </motion.div>
                                <span className={`${colors.text} font-bold text-sm`}>{card.rarity}</span>
                            </motion.div>
                            
                            {/* Image du personnage */}
                            <div className="flex items-center justify-center mt-12 mb-4">
                                <motion.div 
                                    className="relative w-full h-[280px] rounded-2xl overflow-hidden shadow-2xl"
                                    animate={{ 
                                        scale: [1, 1.02, 1],
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <CardImage card={card} />
                                    
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                                </motion.div>
                            </div>
                            
                            {/* Informations de la carte */}
                            <div className="mt-8 space-y-4">
                                <motion.h2 
                                    className="text-4xl font-black text-white text-center drop-shadow-2xl"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {card.name}
                                </motion.h2>
                                
                                <motion.p 
                                    className="text-xl text-gray-200 text-center font-bold"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    {card.anime}
                                </motion.p>
                                
                                <motion.p 
                                    className="text-base text-gray-300 text-center italic px-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    {card.description}
                                </motion.p>
                                
                                {/* Barre de puissance */}
                                <motion.div 
                                    className="mt-6 bg-black/30 backdrop-blur-xl rounded-2xl p-5 border-2 border-white/10"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-yellow-400" />
                                            <span className="text-base text-gray-300 font-bold">Puissance</span>
                                        </div>
                                        <span className="text-2xl font-black text-white">{card.power}</span>
                                    </div>
                                    <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-700">
                                        <motion.div 
                                            className={`h-full bg-gradient-to-r ${colors.bg} relative`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${card.power}%` }}
                                            transition={{ duration: 1.2, delay: 0.7, ease: 'easeOut' }}
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                                animate={{ x: ['-100%', '100%'] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                            />
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </>
        );
    };

    return (
        <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
            {/* Confetti */}
            <AnimatePresence>
                {showConfetti && <Confetti />}
            </AnimatePresence>

            {/* Header */}
            <div className="relative z-10 p-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/dashboard/mini-jeu">
                        <motion.button
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-3 px-8 py-4 bg-black/40 backdrop-blur-2xl rounded-2xl border-2 border-purple-500/30 hover:bg-black/60 hover:border-purple-400/50 transition-all shadow-2xl shadow-purple-500/20"
                        >
                            <ArrowLeft className="w-6 h-6" />
                            <span className="font-bold text-lg">Retour</span>
                        </motion.button>
                    </Link>

                    <div className="flex items-center gap-4">
                        <motion.div 
                            className="px-5 py-3 bg-gradient-to-br from-yellow-500 via-orange-500 to-amber-600 rounded-xl shadow-xl flex items-center gap-3 border-2 border-yellow-400/50 backdrop-blur-xl"
                            whileHover={{ scale: 1.05, y: -2 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Sparkles className="w-5 h-5" />
                            </motion.div>
                            <div>
                                <p className="text-xs opacity-90 font-semibold">Solde</p>
                                <p className="text-xl font-black">{balance} 💰</p>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="px-5 py-3 bg-gradient-to-br from-pink-500 via-purple-500 to-violet-600 rounded-xl shadow-xl flex items-center gap-3 border-2 border-pink-400/50 backdrop-blur-xl"
                            whileHover={{ scale: 1.05, y: -2 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <Zap className="w-5 h-5" />
                            </motion.div>
                            <div>
                                <p className="text-xs opacity-90 font-semibold">Pity</p>
                                <p className="text-xl font-black">{pityCounter}/100</p>
                            </div>
                        </motion.div>

                        <Link href="/dashboard/mini-jeu/gacha/collection">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-5 py-3 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-600 rounded-xl shadow-xl flex items-center gap-3 font-bold text-base border-2 border-blue-400/50 backdrop-blur-xl"
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                <Gift className="w-5 h-5" />
                                Ma Collection
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-6">
                <AnimatePresence mode="wait">
                    {!showResult && !showNothing && !isRolling && (
                        <motion.div
                            key="summon"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-center space-y-16"
                        >
                            {/* Cercle lumineux derrière la carte */}
                            <div className="relative">
                                <motion.div
                                    className="absolute inset-0 -z-10"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.3, 0.6, 0.3],
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <div className="w-[300px] h-[300px] mx-auto rounded-full bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-cyan-500/30 blur-3xl" />
                                </motion.div>
                                
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0],
                                        y: [0, -10, 0]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="text-[8rem] mb-8 drop-shadow-2xl filter drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]"
                                >
                                    🎴
                                </motion.div>
                            </div>

                            <div className="space-y-4">
                                <motion.h1 
                                    className="text-5xl font-black"
                                    style={{
                                        background: 'linear-gradient(90deg, #ec4899, #a855f7, #06b6d4, #ec4899)',
                                        backgroundSize: '200% 100%',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        textShadow: '0 0 40px rgba(168, 85, 247, 0.5)',
                                    }}
                                    animate={{ 
                                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                    }}
                                    transition={{ duration: 5, repeat: Infinity }}
                                >
                                    Anime Gacha
                                </motion.h1>
                                
                                <motion.p 
                                    className="text-xl font-bold"
                                    animate={{
                                        color: ['#d1d5db', '#ffffff', '#d1d5db'],
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    ✨ Invoquez des personnages légendaires ! ✨
                                </motion.p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={performRoll}
                                disabled={balance < ORB_PRICE}
                                className="relative px-12 py-5 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-2xl text-2xl font-black shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-white/30 overflow-hidden group"
                                style={{
                                    boxShadow: '0 0 40px rgba(168, 85, 247, 0.5), 0 0 60px rgba(236, 72, 153, 0.3)',
                                }}
                            >
                                {/* Effet de brillance animé */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                    animate={{ x: ['-200%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                />
                                
                                {/* Particules autour du bouton */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-2 h-2 bg-white rounded-full"
                                            style={{
                                                left: `${(i / 6) * 100}%`,
                                                top: '50%',
                                            }}
                                            animate={{
                                                y: [0, -20, 0],
                                                opacity: [0, 1, 0],
                                                scale: [0, 1.2, 0],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: i * 0.2,
                                            }}
                                        />
                                    ))}
                                </div>
                                
                                <div className="relative flex items-center gap-4">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Sparkles className="w-6 h-6" />
                                    </motion.div>
                                    <span>Invoquer ({ORB_PRICE} 💰)</span>
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Sparkles className="w-6 h-6" />
                                    </motion.div>
                                </div>
                            </motion.button>

                            {balance < ORB_PRICE && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-6 py-3 bg-red-500/30 backdrop-blur-xl rounded-xl border-2 border-red-500/60 inline-block"
                                    style={{
                                        boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)',
                                    }}
                                >
                                    <p className="text-red-200 text-base font-black flex items-center gap-3">
                                        <motion.span 
                                            className="text-xl"
                                            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                                        >
                                            ⚠️
                                        </motion.span>
                                        Solde insuffisant
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {isRolling && (
                        <motion.div
                            key="rolling"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
                        >
                            {/* Fond noir de base */}
                            <div className="absolute inset-0 bg-black" />

                            {/* PHASE 1: Flash blanc avec screen shake (0-0.4s) */}
                            <motion.div
                                className="absolute inset-0 bg-white"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0.8, 0] }}
                                transition={{ duration: 0.4, times: [0, 0.1, 0.3, 1] }}
                            />
                            <motion.div
                                className="absolute inset-0"
                                animate={{
                                    x: [0, -8, 6, -4, 0],
                                    y: [0, 6, -4, 3, 0],
                                }}
                                transition={{
                                    duration: 0.4,
                                    times: [0, 0.2, 0.4, 0.7, 1],
                                }}
                            >
                                {/* PHASE 2: Lignes de vitesse radiales (0.3-1.5s) */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {Array.from({ length: 30 }).map((_, i) => {
                                        const angle = (i / 30) * 360;
                                        const thickness = 3 + Math.random() * 6;
                                        const length = 600 + Math.random() * 300;
                                        return (
                                            <motion.div
                                                key={`speed-line-${i}`}
                                                className="absolute origin-left"
                                                style={{
                                                    width: `${length}px`,
                                                    height: `${thickness}px`,
                                                    background: `linear-gradient(to right, 
                                                        transparent 0%, 
                                                        ${i % 3 === 0 ? 'rgba(255, 255, 255, 0.9)' : 
                                                          i % 3 === 1 ? 'rgba(251, 191, 36, 0.9)' : 
                                                          'rgba(139, 92, 246, 0.9)'} 30%, 
                                                        transparent 100%)`,
                                                    transform: `rotate(${angle}deg)`,
                                                    left: '50%',
                                                    top: '50%',
                                                }}
                                                initial={{ scaleX: 0, opacity: 0 }}
                                                animate={{
                                                    scaleX: [0, 1, 2.5],
                                                    opacity: [0, 1, 0],
                                                }}
                                                transition={{
                                                    duration: 1.2,
                                                    delay: 0.3 + (i * 0.015),
                                                    ease: 'easeOut',
                                                }}
                                            />
                                        );
                                    })}
                                </div>

                                {/* PHASE 3: Symboles japonais (0.5-2s) */}
                                <div className="absolute inset-0">
                                    {['召', '喚', '運', '命', '星', '光', '魔', '力'].map((kanji, i) => (
                                        <motion.div
                                            key={`kanji-${i}`}
                                            className="absolute text-8xl font-black"
                                            style={{
                                                left: `${10 + (i % 4) * 25}%`,
                                                top: `${i < 4 ? '20%' : '60%'}`,
                                                color: 'rgba(251, 191, 36, 1)',
                                                textShadow: '0 0 60px rgba(251, 191, 36, 1), 0 0 120px rgba(251, 191, 36, 0.6)',
                                            }}
                                            initial={{ opacity: 0, scale: 0, rotate: -90 }}
                                            animate={{
                                                opacity: [0, 1, 0.8, 0],
                                                scale: [0, 1.5, 1.2, 0.8],
                                                rotate: [-90, 0, -10, -30],
                                                x: [0, 0, 100, 200],
                                                y: [0, -10, 0, 20],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                delay: 0.5 + (i * 0.1),
                                                ease: 'easeOut',
                                            }}
                                        >
                                            {kanji}
                                        </motion.div>
                                    ))}
                                </div>

                                {/* PHASE 4: Cercles d'impact (1-2s) */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <motion.div
                                            key={`impact-circle-${i}`}
                                            className="absolute rounded-full"
                                            style={{
                                                border: `${8 - i}px solid ${i % 2 === 0 ? 'rgba(251, 191, 36, 0.8)' : 'rgba(139, 92, 246, 0.8)'}`,
                                                boxShadow: `0 0 60px ${i % 2 === 0 ? 'rgba(251, 191, 36, 1)' : 'rgba(139, 92, 246, 1)'}`,
                                            }}
                                            initial={{ width: 0, height: 0, opacity: 0 }}
                                            animate={{
                                                width: ['0px', '1200px'],
                                                height: ['0px', '1200px'],
                                                opacity: [0, 1, 0],
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 1 + (i * 0.1),
                                                ease: 'easeOut',
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* PHASE 5: Particules radiales (0.5-2s) */}
                                <div className="absolute inset-0">
                                    {Array.from({ length: 40 }).map((_, i) => {
                                        const angle = (i / 40) * 360;
                                        const distance = 400;
                                        return (
                                            <motion.div
                                                key={`particle-${i}`}
                                                className="absolute"
                                                style={{
                                                    left: '50%',
                                                    top: '50%',
                                                }}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{
                                                    x: [0, Math.cos((angle * Math.PI) / 180) * distance],
                                                    y: [0, Math.sin((angle * Math.PI) / 180) * distance],
                                                    opacity: [0, 1, 0],
                                                    scale: [0, 1.5, 0],
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    delay: 0.5 + (i * 0.015),
                                                    ease: 'easeOut',
                                                }}
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        background: i % 3 === 0 
                                                            ? 'radial-gradient(circle, #ffffff, #fbbf24)' 
                                                            : i % 3 === 1 
                                                            ? 'radial-gradient(circle, #fbbf24, #f59e0b)'
                                                            : 'radial-gradient(circle, #8b5cf6, #7c3aed)',
                                                        boxShadow: `0 0 20px ${i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#fbbf24' : '#8b5cf6'}`,
                                                    }}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* PHASE 6: Hexagones (0.8-2s) */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <motion.div
                                            key={`hexagon-${i}`}
                                            className="absolute"
                                            style={{
                                                width: `${150 + i * 80}px`,
                                                height: `${150 + i * 80}px`,
                                                border: '4px solid rgba(251, 191, 36, 0.6)',
                                                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                                boxShadow: '0 0 50px rgba(251, 191, 36, 0.8)',
                                            }}
                                            initial={{ opacity: 0, scale: 0, rotate: 0 }}
                                            animate={{
                                                opacity: [0, 1, 0.6, 0],
                                                scale: [0, 1, 1.4, 1.8],
                                                rotate: i % 2 === 0 ? [0, 180] : [0, -180],
                                            }}
                                            transition={{
                                                duration: 1.2,
                                                delay: 0.8 + (i * 0.1),
                                                ease: 'easeOut',
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* PHASE 7: Build-up final avec éclairs (1.5-2s) */}
                                <motion.div
                                    className="absolute inset-0 flex items-center justify-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 1] }}
                                    transition={{ duration: 0.5, delay: 1.5 }}
                                >
                                    {/* Sphère d'énergie centrale */}
                                    <motion.div
                                        className="absolute w-64 h-64 rounded-full"
                                        style={{
                                            background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(251, 191, 36, 0.9) 40%, rgba(139, 92, 246, 0.5) 70%, transparent 100%)',
                                            boxShadow: '0 0 200px 60px rgba(251, 191, 36, 1), 0 0 100px 30px rgba(255, 255, 255, 1)',
                                        }}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{
                                            scale: [0, 1.5, 1.8],
                                            opacity: [0, 1, 1],
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            delay: 1.5,
                                            ease: 'easeOut',
                                        }}
                                    />

                                    {/* Éclairs électriques */}
                                    {Array.from({ length: 8 }).map((_, i) => {
                                        const angle = (i / 8) * 360;
                                        return (
                                            <motion.div
                                                key={`lightning-${i}`}
                                                className="absolute origin-left"
                                                style={{
                                                    width: '180px',
                                                    height: '3px',
                                                    background: 'linear-gradient(to right, rgba(255, 255, 255, 1), rgba(251, 191, 36, 1), transparent)',
                                                    transform: `rotate(${angle}deg)`,
                                                    left: '50%',
                                                    top: '50%',
                                                    boxShadow: '0 0 15px rgba(255, 255, 255, 1)',
                                                }}
                                                initial={{ scaleX: 0, opacity: 0 }}
                                                animate={{
                                                    scaleX: [0, 1.5, 1, 0],
                                                    opacity: [0, 1, 0.8, 0],
                                                }}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: 1.5 + (i * 0.03),
                                                    ease: 'easeOut',
                                                    repeat: 1,
                                                    repeatType: 'reverse',
                                                }}
                                            />
                                        );
                                    })}

                                    {/* Anneaux contractants */}
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <motion.div
                                            key={`ring-${i}`}
                                            className="absolute rounded-full border-4"
                                            style={{
                                                borderColor: i % 2 === 0 ? 'rgba(251, 191, 36, 0.8)' : 'rgba(139, 92, 246, 0.8)',
                                                boxShadow: `0 0 30px ${i % 2 === 0 ? 'rgba(251, 191, 36, 1)' : 'rgba(139, 92, 246, 1)'}`,
                                            }}
                                            initial={{ 
                                                width: '1000px', 
                                                height: '1000px',
                                                opacity: 0 
                                            }}
                                            animate={{
                                                width: ['1000px', '64px'],
                                                height: ['1000px', '64px'],
                                                opacity: [0, 1, 0],
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                delay: 1.5 + (i * 0.03),
                                                ease: 'easeIn',
                                            }}
                                        />
                                    ))}

                                    {/* Texte central */}
                                    <motion.div
                                        className="relative z-10 text-center"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ 
                                            opacity: [0, 1],
                                            scale: [0, 1.3, 1],
                                        }}
                                        transition={{ duration: 0.4, delay: 1.6 }}
                                    >
                                        <motion.div 
                                            className="text-8xl font-black text-white mb-4" 
                                            style={{
                                                textShadow: '0 0 60px rgba(251, 191, 36, 1), 0 0 120px rgba(251, 191, 36, 0.8)',
                                            }}
                                            animate={{
                                                scale: [1, 1.08, 1],
                                            }}
                                            transition={{
                                                duration: 0.3,
                                                repeat: Infinity,
                                                repeatType: 'reverse',
                                            }}
                                        >
                                            ✨
                                        </motion.div>
                                        <div 
                                            className="text-4xl font-black text-white tracking-wider" 
                                            style={{
                                                textShadow: '0 0 40px rgba(251, 191, 36, 1)',
                                            }}
                                        >
                                            INVOCATION
                                        </div>
                                    </motion.div>
                                </motion.div>

                                {/* Effet scanlines */}
                                <motion.div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)',
                                    }}
                                    animate={{
                                        opacity: [0.5, 0.8, 0.5],
                                    }}
                                    transition={{
                                        duration: 0.1,
                                        repeat: Infinity,
                                    }}
                                />
                            </motion.div>
                        </motion.div>
                    )}

                    {showResult && currentCard && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-8"
                        >
                            <CardDisplay card={currentCard} />
                            
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setShowResult(false);
                                    setCurrentCard(null);
                                }}
                                className="relative px-10 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 backdrop-blur-xl rounded-2xl border-2 border-white/40 transition-all text-xl font-black shadow-2xl overflow-hidden"
                                style={{
                                    boxShadow: '0 0 40px rgba(168, 85, 247, 0.5), 0 0 60px rgba(236, 72, 153, 0.3)',
                                }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                    animate={{ x: ['-200%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                />
                                <span className="relative">Continuer ✨</span>
                            </motion.button>
                        </motion.div>
                    )}

                    {showNothing && (
                        <motion.div
                            key="nothing"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-center space-y-8"
                        >
                            {/* Effet de vent avec plusieurs emojis */}
                            <div className="relative h-[120px] flex items-center justify-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <motion.div 
                                        key={i}
                                        className="absolute text-[4rem]"
                                        animate={{ 
                                            x: [-100, 200 + i * 100],
                                            opacity: [0, 1, 0.8, 0],
                                            scale: [0.5, 1, 1.2, 0.8],
                                        }}
                                        transition={{ 
                                            duration: 2.5, 
                                            repeat: Infinity,
                                            delay: i * 0.3,
                                            ease: 'easeOut',
                                        }}
                                    >
                                        💨
                                    </motion.div>
                                ))}
                            </div>
                            
                            <div className="space-y-3">
                                <motion.h2 
                                    className="text-3xl font-black text-gray-200"
                                    animate={{
                                        opacity: [0.7, 1, 0.7],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    😔 Rien cette fois...
                                </motion.h2>
                                <motion.p 
                                    className="text-lg text-gray-400 font-bold"
                                    animate={{
                                        y: [0, -3, 0],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    La chance tournera ! Réessayez ! 🍀
                                </motion.p>
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowNothing(false)}
                                className="relative px-10 py-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 backdrop-blur-xl rounded-2xl border-2 border-gray-500/60 transition-all text-xl font-black shadow-2xl overflow-hidden"
                                style={{
                                    boxShadow: '0 0 30px rgba(75, 85, 99, 0.4)',
                                }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{ x: ['-200%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                />
                                <span className="relative flex items-center gap-3">
                                    <motion.span
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    >
                                        🔄
                                    </motion.span>
                                    Continuer
                                </span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Collection Modal */}
            <AnimatePresence>
                {showCollection && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-8"
                        onClick={() => setShowCollection(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-black/60 backdrop-blur-3xl rounded-2xl p-8 max-w-7xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/40 shadow-2xl"
                            style={{
                                boxShadow: '0 0 60px rgba(168, 85, 247, 0.3), inset 0 0 60px rgba(168, 85, 247, 0.1)',
                            }}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        animate={{ 
                                            rotate: [0, -10, 10, -10, 10, 0],
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    >
                                        <Trophy className="w-8 h-8 text-yellow-400" />
                                    </motion.div>
                                    <h2 
                                        className="text-3xl font-black"
                                        style={{
                                            background: 'linear-gradient(90deg, #ec4899, #a855f7, #06b6d4, #ec4899)',
                                            backgroundSize: '200% 100%',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        Ma Collection
                                    </h2>
                                </div>
                                <motion.button
                                    onClick={() => setShowCollection(false)}
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-3 bg-red-500/20 rounded-xl hover:bg-red-500/40 transition-all border-2 border-red-500/50"
                                >
                                    <X className="w-6 h-6" />
                                </motion.button>
                            </div>

                            {collection.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-20"
                                >
                                    <motion.div 
                                        className="text-[6rem] mb-6"
                                        animate={{ 
                                            scale: [1, 1.1, 1],
                                            rotate: [0, 5, -5, 0],
                                            y: [0, -10, 0],
                                        }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                    >
                                        📦
                                    </motion.div>
                                    <motion.p 
                                        className="text-2xl text-gray-200 font-black mb-3"
                                        animate={{
                                            opacity: [0.7, 1, 0.7],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        Votre collection est vide
                                    </motion.p>
                                    <p className="text-base text-gray-400 font-semibold">✨ Commencez à invoquer des personnages ! ✨</p>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {collection.map((card, index) => {
                                        const colors = RARITY_COLORS[card.rarity];
                                        return (
                                            <motion.div
                                                key={`${card.id}-${index}`}
                                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={{ delay: index * 0.03, type: 'spring', stiffness: 300 }}
                                                whileHover={{ scale: 1.05, y: -5, rotateY: 5 }}
                                                className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl border-2 ${colors.border} shadow-xl ${colors.glow} overflow-hidden cursor-pointer group`}
                                                style={{ 
                                                    transformStyle: 'preserve-3d',
                                                    boxShadow: `0 8px 30px ${colors.glow.includes('purple') ? 'rgba(168, 85, 247, 0.3)' : 'rgba(236, 72, 153, 0.3)'}`,
                                                }}
                                            >
                                                <div className="aspect-[3/4] relative">
                                                    <CardImage 
                                                        card={card} 
                                                        className="transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    
                                                    {/* Effet de brillance au survol */}
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                                                        animate={{ x: ['-100%', '100%'] }}
                                                        transition={{ duration: 1.2, repeat: Infinity }}
                                                    />
                                                    
                                                    {/* Particules au survol */}
                                                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {Array.from({ length: 6 }).map((_, i) => (
                                                            <motion.div
                                                                key={i}
                                                                className="absolute w-1.5 h-1.5 bg-white rounded-full"
                                                                style={{
                                                                    left: `${Math.random() * 100}%`,
                                                                    top: `${Math.random() * 100}%`,
                                                                }}
                                                                animate={{
                                                                    y: [0, -30],
                                                                    opacity: [0, 1, 0],
                                                                    scale: [0, 1.2, 0],
                                                                }}
                                                                transition={{
                                                                    duration: 1.5,
                                                                    repeat: Infinity,
                                                                    delay: i * 0.1,
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                    
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                                                    
                                                    {/* Badge de rareté */}
                                                    <div className="absolute top-3 right-3">
                                                        <motion.div 
                                                            className={`px-3 py-1.5 ${colors.bg} backdrop-blur-xl rounded-full border-2 ${colors.border}`}
                                                            whileHover={{ scale: 1.1, rotate: 3 }}
                                                            style={{
                                                                boxShadow: `0 0 15px ${colors.glow.includes('purple') ? 'rgba(168, 85, 247, 0.5)' : 'rgba(236, 72, 153, 0.5)'}`,
                                                            }}
                                                        >
                                                            <span className="text-xs font-black text-white">{card.rarity}</span>
                                                        </motion.div>
                                                    </div>
                                                    
                                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                                        <h3 className="text-lg font-black text-white truncate mb-1 drop-shadow-lg">{card.name}</h3>
                                                        <p className="text-sm text-gray-200 truncate mb-3 font-bold">{card.anime}</p>
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-xl px-3 py-1.5 rounded-full">
                                                                <motion.div
                                                                    animate={{ rotate: [0, 360] }}
                                                                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                                                >
                                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                                </motion.div>
                                                                <span className="text-sm text-white font-black">{card.power}</span>
                                                            </div>
                                                            <motion.div
                                                                whileHover={{ scale: 1.2, rotate: 10 }}
                                                            >
                                                                <Crown className={`w-5 h-5 ${colors.text} drop-shadow-lg`} />
                                                            </motion.div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}