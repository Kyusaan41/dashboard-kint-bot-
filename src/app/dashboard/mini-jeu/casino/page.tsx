"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Zap, Trophy, Crown, Target, Flame, Sparkles, Star, Coins, TrendingUp, TrendingDown, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { CASINO_ENDPOINTS } from '@/config/api';
import Link from 'next/link';
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck';
import { FavoriteToggleButton } from '@/components/FavoriteToggleButton';

// Slot Machine page using real currency via /api/currency/me

// ✨ NOUVEAU: Effet d'aurore boréale en arrière-plan
const AuroraBackground = ({ isDevilMode }: { isDevilMode: boolean }) => {
    const devilColors = ['rgba(239, 68, 68, 0.2)', 'rgba(159, 18, 57, 0.2)', 'rgba(255, 100, 0, 0.15)'];
    const normalColors = ['rgba(139, 92, 246, 0.15)', 'rgba(99, 102, 241, 0.15)', 'rgba(59, 130, 246, 0.1)'];
    const colors = isDevilMode ? devilColors : normalColors;

    return (
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
            {colors.map((color, i) => (
                <AuroraParticle key={i} color={color} index={i} />
            ))}
        </div>
    );
};

// ✨ NOUVEAU: Particule individuelle pour l'aurore, optimisée pour la performance
const AuroraParticle = ({ color, index }: { color: string, index: number }) => {
    const properties = useMemo(() => {
        const size = Math.random() * 50 + 40; // vw
        const duration = Math.random() * 30 + 30; // 30-60s
        const delay = Math.random() * 10;
        
        // Créer une trajectoire en boucle
        const x1 = `${Math.random() * 100 - 50}vw`;
        const y1 = `${Math.random() * 100 - 50}vh`;
        const x2 = `${Math.random() * 100 - 50}vw`;
        const y2 = `${Math.random() * 100 - 50}vh`;

        return { size, duration, delay, x1, y1, x2, y2 };
    }, []);

    return (
        <motion.div
            className="absolute rounded-full will-change-transform"
            style={{
                backgroundColor: color,
                width: `${properties.size}vw`,
                height: `${properties.size}vw`,
                filter: 'blur(120px)',
            }}
            initial={{ x: properties.x1, y: properties.y1, opacity: 0, scale: 0.8 }}
            animate={{ x: [properties.x1, properties.x2, properties.x1], y: [properties.y1, properties.y2, properties.y1], opacity: [0, 1, 0.8, 1, 0], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: properties.duration, repeat: Infinity, ease: 'linear', delay: properties.delay }}
        />
    );
};

// Hook personnalisé pour gérer les sons du casino
const useCasinoSounds = () => {
    const soundsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
    const bgMusicRef = useRef<HTMLAudioElement | null>(null);
    const [soundsEnabled, setSoundsEnabled] = useState(true);
    const [soundsInitialized, setSoundsInitialized] = useState(false);
    const [masterVolume, setMasterVolume] = useState(50); // Volume principal (0-100)

    useEffect(() => {
        // Créer les objets Audio pour chaque son d'effet
        // Les fichiers doivent être placés dans /public/soundFXCasino/
        soundsRef.current = {
            spin: new Audio('/soundFXCasino/spin_sound.mp3'),              // Son quand on lance les roues
            reelStop: new Audio('/soundFXCasino/reel_stop.mp3'),           // Son à chaque arrêt de roue
            win: new Audio('/soundFXCasino/win_sound.mp3'),                // Son de victoire normale
            sequence3: new Audio('/soundFXCasino/sequence3_sound.mp3'),    // Son quand on aligne 3 symboles
            jackpot: new Audio('/soundFXCasino/jackpot_sound.mp3'),        // Son de jackpot (7️⃣ x3)
            lose: new Audio('/soundFXCasino/lose_sound.mp3'),              // Son de défaite
            devilModeOn: new Audio('/soundFXCasino/devil_mode_on.mp3'),    // ✨ NOUVEAU: Son d'activation du Devil Mode
            devilModeOff: new Audio('/soundFXCasino/devil_mode_off.mp3'),  // ✨ NOUVEAU: Son de désactivation du Devil Mode
        };

        // Créer la musique de fond (en boucle)
        bgMusicRef.current = new Audio('/soundFXCasino/bg_sound.mp3');
        bgMusicRef.current.loop = true;
        bgMusicRef.current.volume = 0.10; // Volume plus bas pour la musique de fond (10%)

        // Ajuster le volume de chaque son d'effet
        Object.values(soundsRef.current).forEach(audio => {
            audio.volume = 0.25; // Volume modéré pour les effets (25%)
        });

        return () => {
            // Nettoyer les objets Audio
            Object.values(soundsRef.current).forEach(audio => {
                audio.pause();
                audio.src = '';
            });
            if (bgMusicRef.current) {
                bgMusicRef.current.pause();
                bgMusicRef.current.src = '';
            }
        };
    }, []);

    // Initialiser les sons au premier appel (contourne la restriction autoplay)
    const initializeSounds = () => {
        if (!soundsInitialized && soundsEnabled && bgMusicRef.current) { // @ts-ignore
            bgMusicRef.current.play().catch(err => console.log('Erreur lecture musique de fond:', err));
            setSoundsInitialized(true);
        }
    };

    const playSound = (soundName: string) => {
        if (!soundsEnabled) return;
        
        // Initialiser les sons au premier appel
        initializeSounds();
        
        const sound = soundsRef.current[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch((err: any) => console.log('Erreur lecture son:', err));
        }
    };

    const toggleSounds = () => {
        setSoundsEnabled(prev => {
            const newState = !prev;
            
            // Gérer la musique de fond
            if (bgMusicRef.current) {
                if (newState) { // @ts-ignore
                    bgMusicRef.current.play().catch(err => console.log('Erreur lecture musique de fond:', err));
                    setSoundsInitialized(true);
                } else {
                    bgMusicRef.current.pause();
                }
            }
            
            return newState;
        });
    };

    // Fonction pour changer le volume principal
    const changeVolume = (newVolume: number) => {
        setMasterVolume(newVolume);
        const volumeRatio = newVolume / 100;
        
        // Mettre à jour le volume de la musique de fond (10% du volume principal)
        if (bgMusicRef.current) {
            bgMusicRef.current.volume = 0.10 * volumeRatio;
        }
        
        // Mettre à jour le volume des effets sonores (25% du volume principal)
        Object.values(soundsRef.current).forEach((audio: any) => {
            audio.volume = 0.25 * volumeRatio;
        });
    };

    return { playSound, soundsEnabled, toggleSounds, masterVolume, changeVolume };
};

// ✨ NOUVEAU: Hook pour l'animation de comptage du solde
const useAnimatedBalance = (initialBalance: number) => {
    const [displayBalance, setDisplayBalance] = useState(initialBalance);
    const balanceRef = useRef(initialBalance);

    // Utiliser useLayoutEffect pour éviter un flash de l'ancien solde
    useLayoutEffect(() => {
        // Synchronise l'état interne et la valeur d'animation lorsque le solde réel change.
        setDisplayBalance(initialBalance);
        balanceRef.current = initialBalance;
    }, [initialBalance]);

    const updateBalance = useCallback((newBalance: number) => {
        const { animate } = require("framer-motion");

        const controls = animate(balanceRef.current, newBalance, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate: (latest: number) => {
                balanceRef.current = latest;
                setDisplayBalance(Math.round(latest));
            }
        });

        return () => controls.stop();
    }, []);

    return { displayBalance, updateBalance };
};

// Symboles de base et symboles "Devil Mode"
const NORMAL_SYMBOLS = ['🍒', '🍇', '🍓', '🍋', '💎', '💰', '7️⃣', '🍀'];
const DEVIL_SYMBOLS = ['🔥', '🔱', '😈', '💀', '💎', '💰', '7️⃣', '🍀']; // 💎, 💰, 7️⃣, 🍀 restent
const DEVIL_MODE_THRESHOLD = 100000; // Seuil pour activer le Devil Mode

type Reel = string[];

function randomReel(symbols: string[], length = 50) {
    return Array.from({ length }, () => symbols[Math.floor(Math.random() * symbols.length)]);
}

// NOUVEAUX multiplicateurs de gains pour un jeu plus équilibré
const PAYOUTS: { [symbol: string]: number } = {
    '7️⃣': 50,   // Jackpot (géré séparément, valeur symbolique)
    '💎': 10,    // Gains élevés mais pas abusifs
    '💰': 8,     // Moyen+
    '🍀': 7,     // Moyen
    '🍒': 6,     // Classique
    '🍇': 5,     // Modéré
    '🍓': 4,     // Petit gain
    '🍋': 3      // Faible
};

// ✨ NOUVEAU: Multiplicateurs spécifiques pour 2 symboles identiques
const PAYOUTS_TWO_SYMBOLS: { [symbol: string]: number } = {
    '7️⃣': 7,   // Gain spécial élevé
    '💎': 4.5,     // Maintien d'un gain correct
    '💰': 3.2,     // Maintien d'un gain correct
    '🍀': 2.2,     // Maintien d'un gain correct
    '🍒': 1.8,   // 1800 pour une mise de 1000
    '🍇': 1.7,   // 1700 pour une mise de 1000
    '🍓': 1.6,   // 1600 pour une mise de 1000
    '🍋': 1.5    // 1500 pour une mise de 1000
};

function useWindowSizeLocal() {
    const [size, setSize] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 1200, height: typeof window !== 'undefined' ? window.innerHeight : 800 });
    useEffect(() => {
        const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', onResize);
            return () => window.removeEventListener('resize', onResize);
        }
    }, []);
    return size;
}

// Confetti component
const Confetti = () => {
    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 100 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                        left: `${Math.random() * 100}%`,
                        top: '-5%',
                    }}
                    initial={{ y: 0, opacity: 1, rotate: 0 }}
                    animate={{
                        y: window.innerHeight + 100,
                        opacity: [1, 1, 0],
                        rotate: Math.random() * 720,
                        x: (Math.random() - 0.5) * 200,
                    }}
                    transition={{
                        duration: Math.random() * 2 + 2,
                        ease: 'easeOut',
                        delay: Math.random() * 0.5,
                    }}
                />
            ))}
        </div>
    );
};

// ✨ NOUVEAU: Composant pour une seule pièce, pour une animation stable
const Coin = () => {
    const properties = useMemo(() => ({
        left: `${Math.random() * 100}%`,
        duration: Math.random() * 3 + 3, // Ralenti : dure maintenant entre 3 et 6 secondes
        delay: Math.random() * 1, // Délai légèrement augmenté pour un effet plus étalé
        rotate: Math.random() * 720,
        x: (Math.random() - 0.5) * 100,
    }), []);

    return (
        <motion.div
            className="absolute text-3xl"
            style={{
                left: properties.left,
                top: '-10%',
            }}
            initial={{ y: 0, opacity: 1, rotate: 0, scale: 0 }}
            animate={{
                y: window.innerHeight + 100,
                opacity: [0, 1, 1, 0],
                rotate: properties.rotate,
                scale: [0, 1, 1, 0],
                x: properties.x,
            }}
            transition={{
                duration: properties.duration,
                ease: 'easeIn',
                delay: properties.delay,
            }}
        >
            💰
        </motion.div>
    );
};

// Coin rain effect
const CoinRain = ({ amount }: { amount: number }) => {
    const coinCount = Math.min(Math.floor(amount / 10), 50);
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: coinCount }).map((_, i) => <Coin key={i} />)}
        </div>
    );
};

// Laughing emojis effect when losing
const LaughingEmojis = () => {
    const mockingPhrases = [
        "Souris, je garde la pièce moi perso..",
        "Merci pour la donation ! 😂",
        "Encore raté ! 🤣",
        "La maison gagne toujours ! 😈",
        "Retente ta chance... ou pas ! 😏",
        "Tes pièces sont à moi maintenant ! 💰",
        "Dommage, c'était pas la bonne ! 😆",
        "Le casino te remercie ! 🎰"
    ];
    
    const emojiCount = 15;
    
    // Choisir UNE phrase aléatoire et la mémoriser pour éviter qu'elle change
    const randomPhrase = useMemo(
        () => mockingPhrases[Math.floor(Math.random() * mockingPhrases.length)],
        [] // eslint-disable-line react-hooks/exhaustive-deps
    );
    
    // Mémoriser les propriétés aléatoires de chaque emoji pour éviter qu'ils se téléportent
    const emojiProperties = useMemo(
        () => Array.from({ length: emojiCount }).map((_, i: number) => ({
            left: Math.random() * 100,
            rotation: Math.random() * 720 - 360,
            xOffset: (Math.random() - 0.5) * 150,
            duration: Math.random() * 2 + 2,
            delay: Math.random() * 0.5,
        })),
        [] // eslint-disable-line react-hooks/exhaustive-deps
    );
    
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {/* Emojis qui tombent */}
            {emojiProperties.map((props, i) => (
                <motion.div
                    key={`emoji-${i}`}
                    className="absolute text-4xl"
                    style={{
                        left: `${props.left}%`,
                        top: '-10%',
                    }}
                    initial={{ y: 0, opacity: 0, rotate: 0, scale: 0 }}
                    animate={{
                        y: window.innerHeight + 100,
                        opacity: [0, 1, 1, 0],
                        rotate: props.rotation,
                        scale: [0, 1.2, 1, 0],
                        x: props.xOffset,
                    }}
                    transition={{
                        duration: props.duration,
                        ease: 'easeIn',
                        delay: props.delay,
                    }}
                >
                    🤣
                </motion.div>
            ))}
            
            {/* UNE SEULE phrase moqueuse aléatoire */}
            <motion.div
                className="absolute text-xl md:text-2xl font-bold text-red-400 bg-black/80 px-6 py-3 rounded-xl border-2 border-red-500/60 shadow-2xl"
                style={{
                    left: '50%',
                    top: '40%',
                    transform: 'translate(-50%, -50%)',
                }}
                initial={{ opacity: 0, scale: 0, rotate: -10 }}
                animate={{
                    opacity: [0, 1, 1, 1, 0],
                    scale: [0, 1.2, 1.1, 1.1, 0.8],
                    rotate: [-10, 5, -5, 0, 0],
                    y: [0, -10, -20, -30, -50],
                }}
                transition={{
                    duration: 3,
                    ease: 'easeOut',
                }}
            >
                {randomPhrase}
            </motion.div>
        </div>
    );
};

// 🔥 Effet de "vraies" flammes stylisées pour le Devil Mode
const CssFlameEffect = () => {
    const particleCount = 40;
    const { width, height } = useWindowSizeLocal();

    // Un seul groupe de particules, généré une fois et réutilisé
    const particleGroup = useMemo(() => {
        return Array.from({ length: particleCount }).map((_, i) => (
            <FlameParticle key={i} width={width as number} height={height as number} />
        ));
    }, [width, height]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Conteneur 1 */}
            <motion.div
                className="absolute top-0 left-0 w-full"
                style={{ height: `${height}px` }}
                animate={{ y: [height, -height] }} // Monte de tout en bas à tout en haut
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            >
                {particleGroup}
            </motion.div>
            {/* Conteneur 2 (la copie, pour une boucle parfaite) */}
            <motion.div
                className="absolute top-0 left-0 w-full"
                style={{ height: `${height}px` }}
                animate={{ y: [height * 2, 0] }} // Suit le premier conteneur
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            >
                {particleGroup}
            </motion.div>
        </div>
    );
};

const FlameParticle = ({ width, height }: { width: number, height: number }) => {
    const size = useMemo(() => Math.random() * 40 + 20, []);
    const x = useMemo(() => Math.random() * width, [width]);
    const y = useMemo(() => Math.random() * height, [height]);
    const danceDuration = useMemo(() => Math.random() * 2 + 2, []);

    return (
        <motion.div
            className="absolute will-change-transform"
            style={{ left: x, top: y, width: size, height: size, filter: 'blur(8px) contrast(15)' }}
            animate={{ x: [0, (Math.random() - 0.5) * 30, 0], scale: [1, 1.2, 0.9, 1] }}
            transition={{ duration: danceDuration, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
        >
            <div className="relative w-full h-full">
                <motion.div className="absolute inset-0 bg-red-500 rounded-full" />
                <motion.div className="absolute inset-0 bg-orange-400 rounded-full" style={{ transform: 'scale(0.7)' }} />
                <motion.div className="absolute inset-0 bg-yellow-300 rounded-full" style={{ transform: 'scale(0.4)' }} />
            </div>
        </motion.div>
    );
};

// ⛧ Sceau démoniaque pour le fond du Devil Mode
const DemonicSigil = () => {
    return (
        <motion.div 
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.5 }}
        >
            <motion.svg
                width="600"
                height="600"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-red-800/50"
                animate={{ rotate: 360 }}
                transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
            >
                <motion.path
                    d="M12 2.5L14.39 9.52H21.81L15.71 13.98L18.1 21.5L12 17.04L5.9 21.5L8.29 13.98L2.19 9.52H9.61L12 2.5Z"
                    stroke="currentColor"
                    strokeWidth="0.3"
                    animate={{
                        opacity: [0.4, 0.8, 0.4],
                        filter: ['drop-shadow(0 0 5px currentColor)', 'drop-shadow(0 0 15px currentColor)', 'drop-shadow(0 0 5px currentColor)'],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.1" />
            </motion.svg>
        </motion.div>
    );
};

// ✨ NOUVEAU: Rayons lumineux pour le Devil Mode
const DevilGodRays = () => {
    const rayCount = 8;
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {Array.from({ length: rayCount }).map((_, i) => (
                <motion.div
                    key={`ray-${i}`}
                    className="absolute top-1/2 left-1/2 w-[200%] h-8 bg-gradient-to-r from-red-900/0 via-red-600/20 to-red-900/0"
                    style={{
                        transformOrigin: 'center left',
                        y: '-50%',
                    }}
                    initial={{ rotate: (i / rayCount) * 360, opacity: 0 }}
                    animate={{
                        rotate: (i / rayCount) * 360 + 45,
                        opacity: [0, 1, 0.8, 0],
                    }}
                    transition={{
                        duration: 15 + Math.random() * 10,
                        repeat: Infinity,
                        delay: i * 2,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
};

// 😈 Effets visuels supplémentaires pour le Devil Mode
const DevilModeOverlay = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="fixed inset-0 pointer-events-none z-10">
            {/* Vignette pulsante */}
            <div className="absolute inset-0 shadow-[inset_0_0_150px_50px_rgba(0,0,0,0.9)] devil-vignette-pulse" />
            {/* Scanlines animées */}
            <div className="absolute inset-0 bg-[url('/textures/scanlines.png')] bg-repeat opacity-20 devil-scanlines" />
        </motion.div>
    );
};

// Free Spin Unlock Animation
const FreeSpinUnlockAnimation = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            {/* Fond sombre avec effet de flash */}
            <motion.div
                className="absolute inset-0 bg-black/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0.6, 0.8, 0] }}
                transition={{ duration: 3, ease: 'easeInOut' }}
            />
            
            {/* Particules dorées qui explosent */}
            {Array.from({ length: 50 }).map((_, i) => {
                const angle = (i / 50) * Math.PI * 2;
                const distance = 150 + Math.random() * 100;
                const xOffset = Math.cos(angle) * distance;
                const yOffset = Math.sin(angle) * distance;
                
                return (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                        style={{ left: '50%', top: '50%' }}
                        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                        animate={{
                            x: xOffset,
                            y: yOffset,
                            opacity: [0, 1, 1, 0],
                            scale: [0, 1.5, 1, 0],
                        }}
                        transition={{
                            duration: 2,
                            ease: 'easeOut',
                            delay: 0.3 + Math.random() * 0.3,
                        }}
                    />
                );
            })}
            
            {/* Message principal */}
            <motion.div
                className="relative z-10 text-center"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{
                    scale: [0, 1.3, 1.1, 1],
                    rotate: [-180, 10, -10, 0],
                    opacity: [0, 1, 1, 1, 0],
                }}
                transition={{ duration: 3, ease: 'easeOut' }}
            >
                <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white px-12 py-8 rounded-3xl border-4 border-yellow-300 shadow-2xl">
                    <motion.div
                        className="text-6xl font-black mb-4"
                        animate={{
                            scale: [1, 1.1, 1],
                            textShadow: [
                                '0 0 20px rgba(255,215,0,0.8)',
                                '0 0 40px rgba(255,215,0,1)',
                                '0 0 20px rgba(255,215,0,0.8)',
                            ],
                        }}
                        transition={{
                            duration: 1,
                            repeat: 3,
                            ease: 'easeInOut',
                        }}
                    >
                        🎉 FREE SPINS ! 🎉
                    </motion.div>
                    <div className="text-3xl font-bold">3 Victoires Consécutives !</div>
                    <div className="text-5xl font-black mt-4 text-yellow-200">
                        +3 TOURS GRATUITS
                    </div>
                </div>
            </motion.div>
            
            {/* Étoiles qui tournent autour */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.div
                    key={`star-${i}`}
                    className="absolute text-6xl"
                    style={{
                        left: '50%',
                        top: '50%',
                    }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
                    animate={{
                        x: Math.cos((i / 6) * Math.PI * 2) * 200,
                        y: Math.sin((i / 6) * Math.PI * 2) * 200,
                        opacity: [0, 1, 1, 0],
                        scale: [0, 1.5, 1.5, 0],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 3,
                        ease: 'easeOut',
                        delay: 0.5,
                    }}
                >
                    ⭐
                </motion.div>
            ))}
        </div>
    );
};

// Winning line component - connects the 3 winning symbols
const WinningLine = ({ type }: { type: 'three' | 'two-left' | 'two-middle' | 'two-right' }) => {
    // Calculate line position based on win type
    const getLineConfig = () => {
        switch (type) {
            case 'three':
                return { width: '100%', left: '0%' }; // Full line across all 3 reels
            case 'two-left':
                return { width: '50%', left: '0%' }; // Line across first 2 reels
            case 'two-middle':
                return { width: '50%', left: '25%' }; // Line across middle 2 reels
            case 'two-right':
                return { width: '50%', left: '50%' }; // Line across last 2 reels
            default:
                return { width: '100%', left: '0%' };
        }
    };

    const config = getLineConfig();

    return (
        <div className="absolute top-1/2 left-0 right-0 pointer-events-none z-30" style={{ transform: 'translateY(-50%)' }}>
            {/* Glowing animated line */}
            <motion.div
                className="absolute h-2 rounded-full"
                style={{
                    width: config.width,
                    left: config.left,
                    background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.8), rgba(251, 191, 36, 1), rgba(251, 191, 36, 0.8), transparent)',
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                    scaleX: [0, 1, 1],
                    opacity: [0, 1, 1],
                }}
                transition={{
                    duration: 0.6,
                    ease: "easeOut"
                }}
            />
            
            {/* Pulsing glow effect */}
            <motion.div
                className="absolute h-4 rounded-full blur-md"
                style={{
                    width: config.width,
                    left: config.left,
                    background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.6), rgba(251, 191, 36, 0.8), rgba(251, 191, 36, 0.6), transparent)',
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                    scaleX: [0, 1, 1],
                    opacity: [0, 0.8, 0.8],
                }}
                transition={{
                    duration: 0.6,
                    ease: "easeOut"
                }}
            />
            
            {/* Animated shine effect */}
            <motion.div
                className="absolute h-3 rounded-full"
                style={{
                    width: config.width,
                    left: config.left,
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                }}
                initial={{ x: '-100%', opacity: 0 }}
                animate={{
                    x: ['0%', '100%'],
                    opacity: [0, 1, 0],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.6
                }}
            />
            
            {/* Star particles along the line */}
            {type === 'three' && (
                <>
                    {[0, 33, 66, 100].map((pos, i) => (
                        <motion.div
                            key={i}
                            className="absolute top-1/2 text-yellow-300"
                            style={{
                                left: `${pos}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                            initial={{ scale: 0, rotate: 0, opacity: 0 }}
                            animate={{
                                scale: [0, 1.5, 1],
                                rotate: [0, 180, 360],
                                opacity: [0, 1, 1],
                            }}
                            transition={{
                                duration: 0.8,
                                delay: i * 0.1 + 0.3,
                            }}
                        >
                            <Star size={20} fill="currentColor" />
                        </motion.div>
                    ))}
                </>
            )}
        </div>
    );
};

// ✨ NOUVEAU: Titres de niveaux
const getLevelTitle = (level: number) => {
    if (level >= 50) return "Roi du Casino";
    if (level >= 40) return "Prince du Casino";
    if (level >= 30) return "Duc du Jackpot";
    if (level >= 25) return "Baron du Spin";
    if (level >= 20) return "Maître des Risques";
    if (level >= 15) return "Flambeur";
    if (level >= 10) return "Parieur Agile";
    if (level >= 5) return "Joueur Régulier";
    return "Novice";
};

// ✨ NOUVEAU: Animation de Level Up
const LevelUpAnimation = ({ level, title }: { level: number, title: string }) => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
            <motion.div
                className="absolute inset-0 bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0.6, 0] }}
                transition={{ duration: 3, ease: "easeInOut" }}
            />
            <Confetti />
            <motion.div
                className="relative text-center p-8 bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl border-4 border-purple-500 shadow-2xl shadow-purple-500/50"
                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 150 }}
            >
                <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-3xl blur-xl opacity-75"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative z-10">
                    <motion.h2
                        className="text-2xl font-bold text-gray-300 mb-2"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        NIVEAU SUPÉRIEUR !
                    </motion.h2>
                    <motion.div
                        className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400 mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7, type: "spring", damping: 10 }}
                    >
                        {level}
                    </motion.div>
                    <motion.h3
                        className="text-3xl font-bold text-white mb-6"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        {title}
                    </motion.h3>
                    <motion.div
                        className="text-sm text-purple-300 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.3 }}
                    >
                       
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default function CasinoSlotPage() {
    const { data: session } = useSession();
    const { playSound, soundsEnabled, toggleSounds, masterVolume, changeVolume } = useCasinoSounds(); // @ts-ignore
    const [piecesBalance, setPiecesBalance] = useState<number>(0);
    const [jetonsBalance, setJetonsBalance] = useState<number>(0);
    const [loadingBalance, setLoadingBalance] = useState<boolean>(true);
    const [bet, setBet] = useState<number>(10);
    const [reels, setReels] = useState<Reel[]>([
        randomReel(NORMAL_SYMBOLS, 50),
        randomReel(NORMAL_SYMBOLS, 50),
        randomReel(NORMAL_SYMBOLS, 50)
    ]);
    const [spinning, setSpinning] = useState(false);
    const [message, setMessage] = useState<string>('Bonne chance !');
    const { displayBalance: displayJetonsBalance, updateBalance: updateJetonsBalance } = useAnimatedBalance(jetonsBalance);
    
    // Jackpot global (chargé depuis l'API)
    const [jackpot, setJackpot] = useState<number>(10000);
    const [jackpotLoading, setJackpotLoading] = useState<boolean>(true);
    
    // Top wins des joueurs
    const [topWins, setTopWins] = useState<Array<{ username: string; biggestWin: number; totalWins?: number; winCount?: number; level?: number; xp?: number; }>>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [leaderboardType, setLeaderboardType] = useState<'biggestWin' | 'winCount' | 'totalWins' | 'level'>('biggestWin');
    
    const [showConfetti, setShowConfetti] = useState(false);
    const [winAnimation, setWinAnimation] = useState(false);
    const [loseAnimation, setLoseAnimation] = useState(false);
    const [lastWinAmount, setLastWinAmount] = useState(0);
    
    const [biggestWin, setBiggestWin] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('casino_biggest_win');
            return saved ? Number(saved) : 0;
        }
        return 0;
    });
    
    const [biggestLoss, setBiggestLoss] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('casino_biggest_loss');
            return saved ? Number(saved) : 0;
        }
        return 0;
    });
    
    const [buyAmount, setBuyAmount] = useState<number>(100); // Default buy amount
    const [sellAmount, setSellAmount] = useState<number>(100); // Default sell amount
    const [loadingExchange, setLoadingExchange] = useState<boolean>(false);
    
    const [showCoinRain, setShowCoinRain] = useState(false);
    const [showLaughingEmojis, setShowLaughingEmojis] = useState(false);
    const [reelsStopped, setReelsStopped] = useState([false, false, false]);
    const [winningLineType, setWinningLineType] = useState<'three' | 'two-left' | 'two-middle' | 'two-right' | null>(null);
    const { width, height } = useWindowSizeLocal();
    const spinTimeouts = useRef<any[]>([]);
    
    // 🎰 FREE SPINS SYSTEM
    const [winStreak, setWinStreak] = useState(0); // Compteur de victoires consécutives
    const [freeSpins, setFreeSpins] = useState(0); // Nombre de free spins restants
    const [isFreeSpinMode, setIsFreeSpinMode] = useState(false); // Mode free spin actif
    const [showFreeSpinUnlock, setShowFreeSpinUnlock] = useState(false); // Animation de déblocage
    const [lastThreeBets, setLastThreeBets] = useState<number[]>([]); // Historique des 3 dernières mises
    const [freeSpinBet, setFreeSpinBet] = useState<number>(0); // Mise verrouillée pour les freespins

    // Avantage de la maison DIMINUÉ car les gains sont plus généreux
    const HOUSE_EDGE = 0.05; // 5% (gains plus élevés, mais chances de gagner réduites) // @ts-ignore

    // Limite de mise
    const BET_MAX = 100000;

    // 😈 DEVIL MODE
    const [isDevilMode, setIsDevilMode] = useState(false);
    const [showDevilTransition, setShowDevilTransition] = useState(false);

    useEffect(() => {
        const newDevilModeState = bet >= DEVIL_MODE_THRESHOLD;
        if (newDevilModeState !== isDevilMode) {
            setIsDevilMode(newDevilModeState);
            // ✨ NOUVEAU: Gérer la transition et le son
            if (newDevilModeState) {
                playSound('devilModeOn');
            } else {
                playSound('devilModeOff');
            }
            setShowDevilTransition(true);
            setTimeout(() => setShowDevilTransition(false), 1000);
        }
    }, [bet, isDevilMode, playSound]);

    // ✨ NOUVEAU: Historique des spins
    type SpinHistoryEntry = SpinResult & { symbols: string[]; bet: number; timestamp: number };
    const [spinHistory, setSpinHistory] = useState<SpinHistoryEntry[]>([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    // ✨ NOUVEAU: Système de niveaux
    const [playerLevel, setPlayerLevel] = useState(1);
    const [playerXp, setPlayerXp] = useState(0);
    const [xpForNextLevel, setXpForNextLevel] = useState(1000);
    const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
    const [lastLevelUpInfo, setLastLevelUpInfo] = useState({ level: 0, title: '' });


    // ✨ NOUVEAU: État pour la modale des niveaux
    const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
    const [claimedRewards, setClaimedRewards] = useState<number[]>([]);

    // ✨ NOUVEAU: Détecter si une récompense est disponible
    const hasClaimableReward = useMemo(() => {
        return Object.keys(LEVEL_REWARDS).some(levelStr => {
            const level = Number(levelStr);
            return playerLevel >= level && !claimedRewards.includes(level);
        });
    }, [playerLevel, claimedRewards]);



    const SYMBOLS = isDevilMode ? DEVIL_SYMBOLS : NORMAL_SYMBOLS;

    useEffect(() => {
        return () => spinTimeouts.current.forEach((t) => clearTimeout(t));
    }, []);

    // ✨ NOUVEAU: Charger les récompenses récupérées depuis le localStorage
    useEffect(() => {
        if (session?.user?.id) {
            const savedRewards = localStorage.getItem(`casino_claimed_rewards_${session.user.id}`);
            if (savedRewards) {
                setClaimedRewards(JSON.parse(savedRewards));
            }
        }
    }, [session?.user?.id]);

    // ✨ NOUVEAU: Sauvegarder les récompenses récupérées
    const saveClaimedRewards = (newClaimed: number[]) => {
        if (session?.user?.id) {
            localStorage.setItem(`casino_claimed_rewards_${session.user.id}`, JSON.stringify(newClaimed));
        }
    };

    const setInitialReels = () => {
        const currentSymbols = isDevilMode ? DEVIL_SYMBOLS : NORMAL_SYMBOLS;
        setReels([randomReel(currentSymbols, 50), randomReel(currentSymbols, 50), randomReel(currentSymbols, 50)]);
    };

    const fetchUserBalances = useCallback(async () => {
        if (!session?.user?.id) return;
        try {
            setLoadingBalance(true);
            
            // Fetch Pièces ET Jetons balance depuis l'API
            const currencyRes = await fetch('/api/currency/me');
            if (currencyRes.ok) {
                const data = await currencyRes.json();
                console.log('💰 Données currency:', data);
                
                if (typeof data.balance === 'number') {
                    setPiecesBalance(data.balance);
                }
                if (typeof data.tokens === 'number') {
                    setJetonsBalance(data.tokens);
                    updateJetonsBalance(data.tokens);
                }
                if (data.level) setPlayerLevel(data.level);
                if (data.xp) setPlayerXp(data.xp);
                if (data.xpForNextLevel) setXpForNextLevel(data.xpForNextLevel);
            } else {
                console.error('Erreur fetch currency balance', currencyRes.status);
            }

        } catch (e) {
            console.error('Erreur fetch balances', e);
            setMessage('Erreur de connexion pour charger votre solde.');
        } finally {
            setLoadingBalance(false);
        }
    }, [session?.user?.id, updateJetonsBalance]);

    // Fonction pour charger le jackpot depuis l'API
    const loadJackpot = async () => {
        try {
            const res = await fetch(CASINO_ENDPOINTS.jackpot);
            if (res.ok) {
                const data = await res.json();
                if (typeof data.amount === 'number') {
                    setJackpot(data.amount);
                    console.log('[JACKPOT] Chargé depuis l\'API:', data.amount);
                }
            } else {
                console.warn('Impossible de récupérer le jackpot, status', res.status);
            }
        } catch (e) {
            console.error('Erreur fetch jackpot', e);
        } finally {
            setJackpotLoading(false);
        }
    };

    // Fonction pour charger les top wins depuis l'API
    const loadTopWins = async (type: 'biggestWin' | 'winCount' | 'totalWins' | 'level' = 'biggestWin') => {
        try {
            const res = await fetch(`${CASINO_ENDPOINTS.stats}?type=${type}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.players)) {
                    setTopWins(data.players);
                    console.log('[TOP WINS] Chargé depuis l\'API du bot:', data.players.length, 'joueurs');
                } else {
                    setTopWins([]);
                    console.log('[TOP WINS] Aucun joueur trouvé');
                }
            } else {
                console.warn('[TOP WINS] Erreur API, status:', res.status);
                setTopWins([]);
            }
        } catch (e) {
            console.error('[TOP WINS] Erreur fetch:', e);
            setTopWins([]);
        }
    };

    // Fonction pour enregistrer un gain
    const recordWin = async (username: string, winAmount: number, isJackpot: boolean = false) => {
        try {
            // Enregistrer dans l'API du bot Discord
            await fetch(CASINO_ENDPOINTS.stats, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, amount: winAmount, isJackpot }),
            });
            // Recharger les top wins après enregistrement
            loadTopWins(leaderboardType);
        } catch (e) {
            console.error('Erreur enregistrement gain', e);
        }
    };

    // Load balance and jackpot from API on mount
    useEffect(() => {
        // ✨ CORRECTION: Appeler fetchUserBalances pour charger les soldes ET le niveau/XP au démarrage.
        fetchUserBalances();

        // Charger le jackpot initial
        setJackpotLoading(true);
        loadJackpot();
        
        // Charger les top wins initial
        loadTopWins();
    }, [fetchUserBalances]); // fetchUserBalances est mémorisé avec useCallback, donc cela ne se déclenchera qu'une fois.

    

    // ✨ NOUVEAU: Fonction pour ajouter de l'XP
    const addXp = async (amount: number) => {
        if (!session?.user?.name || amount <= 0) return;

        try {
            const res = await fetch(CASINO_ENDPOINTS.xp, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: session.user.name, xpToAdd: amount }),
            });

            if (res.ok) {
                const data = await res.json();
                setPlayerLevel(data.level);
                setPlayerXp(data.xp);
                setXpForNextLevel(data.xpForNextLevel);

                if (data.leveledUp) {
                    console.log(`[LEVEL UP] Niveau ${data.level} atteint !`);
                    setLastLevelUpInfo({ level: data.level, title: getLevelTitle(data.level) });
                    setShowLevelUpAnimation(true); // @ts-ignore
                    playSound('levelUp'); // ✨ NOUVEAU: Jouer le son de montée de niveau
                    setTimeout(() => setShowLevelUpAnimation(false), 3000);
                }
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout d'XP:", error);
        }
    };


    // Polling automatique du jackpot toutes les 10 secondes
    useEffect(() => {
        const interval = setInterval((t: any) => {
            loadJackpot();
        }, 10000); // 10 secondes

        return () => clearInterval(interval);
    }, []);

    // Rotation des joueurs toutes les 3 secondes
    useEffect(() => {
        if (topWins.length === 0) return;
        
        const interval = setInterval(() => {
            setCurrentPlayerIndex((prev) => (prev + 1) % topWins.length);
        }, 3000); // 3 secondes

        return () => clearInterval(interval);
    }, [topWins]);

    // Save biggest win to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('casino_biggest_win', biggestWin.toString());
        }
    }, [biggestWin]);

    // Save biggest loss to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('casino_biggest_loss', biggestLoss.toString());
        }
    }, [biggestLoss]);

    // Add a typed result state so setResult exists and isPityWin is allowed
    type SpinResult = { // @ts-ignore
        win: boolean;
        amount: number;
        isJackpot: boolean;
        lineType: 'three' | 'two-left' | 'two-middle' | 'two-right' | null;
        isPityWin?: boolean; // optional flag for pity refunds
    };

    // Store the latest spin result (used by game logic)
    const [result, setResult] = useState<SpinResult | null>(null); // @ts-ignore
    
    const computeResult = (finalSymbols: string[], currentBet: number): SpinResult => {
        const [s1, s2, s3] = finalSymbols;

        // Small debug
        console.log('=== CALCUL DU RÉSULTAT ===');
        console.log('Symboles finaux:', finalSymbols);
        console.log(`s1=${s1}, s2=${s2}, s3=${s3}`);

        // Safe bet reduction factor: scale based on currentBet to avoid referencing an undefined variable.
        // This ensures larger bets slightly reduce multipliers while small bets keep reasonable returns.
        const betReductionFactor = (() => {
            if (currentBet <= 0) return 1;
            if (currentBet >= 100000) return 0.85;
            if (currentBet >= 10000) return 0.9;
            if (currentBet >= 1000) return 0.95;
            return 1;
        })();

        // 3 identical symbols = big win
        let finalAmount = 0;
        if (s1 === s2 && s2 === s3) {
            const multiplier = PAYOUTS[s1] || 1;

            // JACKPOT with 7️⃣
            if (s1 === '7️⃣') {
                return { win: true, amount: Math.max(jackpot, currentBet * multiplier), isJackpot: true, lineType: 'three' };
            }

            const baseAmount = Math.floor(currentBet * multiplier * (1 - HOUSE_EDGE));
            finalAmount = Math.max(currentBet * 2, baseAmount);

            const maxWinMultiplier = 40;
            finalAmount = Math.min(finalAmount, currentBet * maxWinMultiplier);

            return { win: true, amount: finalAmount, isJackpot: false, lineType: 'three' };
        }

        // 2 identical symbols = smaller win
        if (s1 === s2 || s2 === s3 || s1 === s3) {
            // 1. Identifier le symbole gagnant
            const sym = s1 === s2 ? s1 : (s2 === s3 ? s2 : s1); // s1 === s3 est le dernier cas
            
            // 2. Obtenir le multiplicateur spécifique pour 2 symboles
            const multiplier = PAYOUTS_TWO_SYMBOLS[sym] || 1.5; // Fallback à 1.5x

            let lineType: 'two-left' | 'two-middle' | 'two-right' = 'two-left';
            if (s1 === s2) lineType = 'two-left';
            else if (s2 === s3) lineType = 'two-middle';
            else if (s1 === s3) lineType = 'two-right';
            
            // 3. Calculer le gain directement
            const gainAmount = Math.floor(currentBet * multiplier * (1 - HOUSE_EDGE));
            finalAmount = Math.max(gainAmount, Math.floor(currentBet * 1.1)); // Assurer un gain minimum de 1.1x la mise

            return { win: true, amount: finalAmount, isJackpot: false, lineType };
        }

        // No match = loss
        return { win: false, amount: 0, isJackpot: false, lineType: null };
    };

    const triggerWinAnimation = (amount: number) => {
        setLastWinAmount(amount);
        setWinAnimation(true);
        setShowCoinRain(true);
        setTimeout(() => setWinAnimation(false), 3000);
        setTimeout(() => setShowCoinRain(false), 3000);
    };

    const triggerLoseAnimation = () => {
        setLoseAnimation(true);
        setShowLaughingEmojis(true);
        setTimeout(() => setLoseAnimation(false), 2000);
        setTimeout(() => setShowLaughingEmojis(false), 3000);
    };

    const handleSpin = async () => {
        if (spinning) return;
        if (bet <= 0) {
            setMessage('Mise invalide');
            return;
        }
        // Limite de mise maximum
        if (bet > BET_MAX) {
            setMessage(`Mise maximale autorisée: ${BET_MAX.toLocaleString('fr-FR')}`);
            setBet(BET_MAX);
            return;
        }
        if (jetonsBalance < bet) {
            setMessage('Solde de jetons insuffisant !');
            return;
        }

        // 🎰 FREE SPIN: Vérifier si on utilise un free spin
        let isUsingFreeSpin = false;

        // 🔒 ANTI-TRICHE: Capturer la mise au début du spin pour éviter
        // que l'utilisateur ne la change pendant le spinning et la limiter à BET_MAX
        let lockedBet = Math.min(bet, BET_MAX);

    // ✨ NOUVEAU: Événement aléatoire (1 chance sur 50)
    let eventMultiplier = 1;
    if (Math.random() < 0.02) { // 2% de chance
        eventMultiplier = Math.random() < 0.7 ? 2 : 3; // 70% de chance pour x2, 30% pour x3
        setMessage(`✨ ÉVÉNEMENT: GAINS x${eventMultiplier} POUR CE TOUR ! ✨`);
        // ✨ NOUVEAU: Jouer un son spécial pour l'événement
        playSound('specialEvent');
    }

        setReelsStopped([false, false, false]);
        setWinningLineType(null); // Reset winning line

        // Jouer le son de spin
        playSound('spin');

        if (freeSpins > 0) {
            isUsingFreeSpin = true;
            setFreeSpins(prev => prev - 1);
            setIsFreeSpinMode(true);
            
            // 🔒 ANTI-TRICHE: Utiliser la mise verrouillée des freespins
            // plutôt que la mise actuelle
            lockedBet = freeSpinBet;
            
            // Si c'était le dernier free spin, désactiver le mode après ce spin
            if (freeSpins === 1) {
                setTimeout(() => {
                    setIsFreeSpinMode(false);
                    setFreeSpinBet(0); // Reset la mise verrouillée
                }, 5000);
            }
        } else {
            // 🔒 ANTI-TRICHE: Enregistrer la mise dans l'historique des 3 dernières mises
            // pour empêcher les joueurs de miser petit puis d'augmenter au 3ème tour
            setLastThreeBets(prev => {
                const updated = [...prev, lockedBet];
                
                // ✨ NOUVEAU: Ajouter de l'XP pour la mise (uniquement pour les spins payants)
                if (!isUsingFreeSpin) {
                    addXp(lockedBet); // @ts-ignore
                }
                // Garder seulement les 3 dernières mises
                return updated.slice(-3);
            });
        }

        // Reserve funds server-side: deduct bet before spinning (sauf en free spin)
        try {
            setSpinning(true);
            
            if (isUsingFreeSpin) {
                setMessage('🎁 TOUR GRATUIT EN COURS...');
            } else {
                setMessage('🎰 Mise en cours...');
                
                // Déduction via API NyxNode
                const deductRes = await fetch('/api/currency/me', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        action: 'spend',
                        amount: lockedBet,
                        type: 'tokens'
                    })
                });

                if (deductRes.ok) {
                    const data = await deductRes.json();
                    if (typeof data.tokens === 'number') {
                        setJetonsBalance(data.tokens);
                        updateJetonsBalance(data.tokens);
                    }
                } else {
                    // Fallback if API fails
                    setJetonsBalance((b) => b - lockedBet);
                    updateJetonsBalance(jetonsBalance - lockedBet);
                }
            }
        } catch (e) {
            console.error('Erreur réservation jetons:', e);
            if (!isUsingFreeSpin) {
                setJetonsBalance((b) => b - lockedBet);
                updateJetonsBalance(jetonsBalance - lockedBet);
            }
        }

            // 🎯 ÉQUILIBRAGE PARFAIT DU SLOT MACHINE 🎰
            // Objectif : ni trop de gains, ni trop de pertes, jackpot rare mais atteignable, progression naturelle.

            // 🎰 ÉQUILIBRAGE PARFAIT — Taux stable, jackpot rare mais réaliste
            const makeWeightedReel = () => {
                const reel: string[] = [];
                const reelLength = 50;
                const finalSymbolIndex = reelLength - 13;

                // ⚖️ Taux global de pertes ajusté pour augmenter le winrate
                const GLOBAL_LOSS_RATE = 0.85; // ≈25% de chances de victoire

                // Symboles perdants (majoritaires)
                const losingSymbols = ['🍋', '🍓', '🍇', '🍒'];

                // Symboles rentables (avec pondération)
                const profitableSymbols = ['💎', '💰', '🍀', '7️⃣'];
                const weights = { '💎': 4, '💰': 4, '🍀': 3, '7️⃣': 2 }; // Jackpot plus fréquent (x2)
                const weightedPool = Object.entries(weights).flatMap(([sym, w]) => Array(w).fill(sym));

                // 🌀 Remplissage des rouleaux
                for (let i = 0; i < reelLength; i++) {
                    if (Math.random() < (GLOBAL_LOSS_RATE + 0.03)) {
                        // Pertes majoritaires
                        const randomIndex = Math.floor(Math.random() * losingSymbols.length);
                        reel.push(losingSymbols[randomIndex]);
                    } else {
                        // Gains pondérés
                        const randomSymbol = weightedPool[Math.floor(Math.random() * weightedPool.length)];
                        reel.push(randomSymbol);
                    }
                }

                let finalSymbol = '🍋';

                // 😈 Mode Devil : plus risqué mais plus excitant
                if (isDevilMode) {
                    const devilLosingSymbols = ['🔥', '😈', '💀', '🔱'];
                    const devilProfitableSymbols = ['💎', '💰', '🍀', '7️⃣'];

                    // Moins punitif en Devil Mode
                    if (Math.random() < (GLOBAL_LOSS_RATE + 0.02)) {
                        finalSymbol = devilLosingSymbols[Math.floor(Math.random() * devilLosingSymbols.length)];
                    } else {
                        finalSymbol = devilProfitableSymbols[Math.floor(Math.random() * devilProfitableSymbols.length)];
                    }
                } else {
                    // Mode normal
                    if (Math.random() < (1 - GLOBAL_LOSS_RATE)) {
                        finalSymbol = weightedPool[Math.floor(Math.random() * weightedPool.length)];
                    } else {
                        finalSymbol = losingSymbols[Math.floor(Math.random() * losingSymbols.length)];
                    }
                }

                // Positionne le symbole final
                reel[finalSymbolIndex] = finalSymbol;
                return reel;
            };





        const newReels = [makeWeightedReel(), makeWeightedReel(), makeWeightedReel()];
        setReels(newReels as Reel[]);

        spinTimeouts.current.forEach((t) => clearTimeout(t));
        spinTimeouts.current = [];

        const delays = [1400, 2000, 2600];
        const finalSymbols: string[] = [];

        delays.forEach((d, idx) => {
            const t = setTimeout(async () => {
                const reel = newReels[idx];
                // Prendre le symbole du milieu (index -13) car on affiche 15 symboles et le milieu visible est à l'index 2
                const final = reel[reel.length - 13];
                finalSymbols[idx] = final;
                
                // ✨ NOUVEAU: Détection du "Quasi-Jackpot"
                if (idx === 1 && finalSymbols[0] === '7️⃣' && finalSymbols[1] === '7️⃣') {
                    console.log('[NEAR MISS] Détection de deux 7 ! Animation spéciale pour la 3ème roue.');
                    // Ici, vous déclencheriez un état pour une animation de roue plus lente/tremblante
                    // et un son de tension.
                }

                // DEBUG: Afficher les 15 derniers symboles et celui qui est considéré comme gagnant
                console.log(`Roue ${idx}: 15 derniers symboles =`, reel.slice(-15));
                console.log(`Roue ${idx}: Symbole gagnant (index -13) =`, final);
                
                // Jouer le son d'arrêt de roue
                playSound('reelStop');
                
                // Mark this reel as stopped
                setReelsStopped(prev => {
                    const newStopped = [...prev];
                    newStopped[idx] = true;
                    return newStopped;
                });

                if (idx === delays.length - 1) {
                    setSpinning(false);
                    
                    // Attendre 600ms pour que l'animation d'arrêt du dernier slot soit complète (transition: 0.5s)
                    setTimeout(async () => {
                        // 🔒 Utiliser la mise verrouillée (lockedBet) pour éviter la triche
                    let spinResult = computeResult(finalSymbols as string[], lockedBet); // @ts-ignore
                        setResult(spinResult); // Store result in state

                        // ✨ NOUVEAU: Gérer la récompense de consolation du "Quasi-Jackpot"
                        if (!spinResult.win && finalSymbols[0] === '7️⃣' && finalSymbols[1] === '7️⃣' && finalSymbols[2] !== '7️⃣') {
                            console.log('[NEAR MISS] Quasi-Jackpot ! Attribution d\'une récompense de consolation.');
                            const consolationAmount = Math.floor(lockedBet * 0.5); // Rembourse 50%
                            const consolationXp = 500;
                            
                            // On modifie le résultat pour en faire une victoire de consolation
                            spinResult = { win: true, amount: consolationAmount, isJackpot: false, lineType: null, isPityWin: true };
                            setResult(spinResult);

                            addXp(consolationXp);
                            setMessage(`QUASIMENT ! +${formatMoney(consolationAmount)} jetons & ${consolationXp} XP !`);
                            // Jouer un son spécifique pour cet événement
                        }

                        // ✨ NOUVEAU: Ajouter au début de l'historique des spins
                        setSpinHistory(prev => [
                            { ...spinResult, symbols: finalSymbols, bet: lockedBet, timestamp: Date.now() },
                            ...prev
                        ].slice(0, 5)); // Garder les 5 derniers

                                                    // 🛡️ SYSTÈME ANTI-RUINE (Pitié) - VERSION STRICTE
                            if (!spinResult.win) {
                                const postSpinBalance = jetonsBalance - lockedBet;
                                const isLowBalance = postSpinBalance < lockedBet * 5;
                                const isReasonableBet = lockedBet < jetonsBalance * 0.3;
                                
                                // ✨ MODIFICATION STRICTE: Désactiver complètement au-delà de 100K
                                const isVeryHighBet = lockedBet > 100000;
                                
                                if (isLowBalance && isReasonableBet && !isVeryHighBet) {
                                    console.log('[ANTI-RUINE] Pitié accordée ! Le joueur récupère sa mise.');
                                    spinResult = {
                                        win: true,
                                        amount: lockedBet,
                                        isJackpot: false,
                                        lineType: null,
                                        isPityWin: true
                                    };
                                } else if (isVeryHighBet) {
                                    console.log(`[ANTI-RUINE] Pitié refusée - mise très élevée: ${lockedBet}`);
                                }
                                setResult(spinResult);
                            }

                    // Appliquer le multiplicateur d'événement
                    if (spinResult.win && eventMultiplier > 1) {
                        spinResult.amount *= eventMultiplier;
                    }

                        if (spinResult.win) {
                            // Show winning line
                            if (spinResult.lineType) {
                                setWinningLineType(spinResult.lineType);
                                setTimeout(() => setWinningLineType(null), 3000); // Hide after 3 seconds
                            }
                            
                            if (spinResult.amount > biggestWin) {
                                setBiggestWin(spinResult.amount);
                            }
                            
                            // Enregistrer le gain dans l'API
                            const username = session?.user?.name || session?.user?.email?.split('@')[0] || 'Joueur';
                            console.log('[CASINO] Enregistrement gain:', username, spinResult.amount, 'Jackpot:', spinResult.isJackpot);

                            // ✨ NOUVEAU: Ajouter de l'XP pour le gain (sauf si c'est un remboursement)
                            if (!spinResult.isPityWin) {
                                const xpFromWin = Math.floor(spinResult.amount * 0.5);
                                addXp(xpFromWin);
                            }

                            recordWin(username, spinResult.amount, spinResult.isJackpot);
                            
                            if (spinResult.isJackpot) {
                                // Jouer le son de jackpot
                                playSound('jackpot');
                                
                                setMessage(`🎉 JACKPOT! +${spinResult.amount} Jetons 🎉`);
                                setShowConfetti(true);
                                setTimeout(() => setShowConfetti(false), 8000);
                                
                                // Réinitialiser le jackpot global via l'API NyxNode
                                try {
                                    const resetRes = await fetch(CASINO_ENDPOINTS.jackpotReset, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ 
                                            winner: 'Player', // Vous pouvez ajouter le nom du joueur ici
                                            winAmount: spinResult.amount * 80 // Convert jetons to pieces for jackpot stats
                                        })
                                    });
                                    if (resetRes.ok) {
                                        const data = await resetRes.json();
                                        setJackpot(data.newAmount);
                                    } else {
                                        setJackpot(1000); // Fallback
                                    }
                                } catch (e) {
                                    console.error('Erreur reset jackpot:', e);
                                    setJackpot(1000); // Fallback
                                }
                                
                                triggerWinAnimation(spinResult.amount);
                            } else {
                                // Jouer le son approprié selon le type de victoire
                                if (spinResult.lineType === 'three') {
                                    // 3 symboles alignés (but not jackpot)
                                    playSound('sequence3');
                                } else {
                                    // 2 symboles alignés
                                    playSound('win');
                                }
                                
                                if (spinResult.isPityWin) {
                                    setMessage(`Mise remboursée : +${formatMoney(spinResult.amount)} jetons`);
                                } else {
                                    setMessage(`✨ Gagné +${formatMoney(spinResult.amount)} Jetons ✨`);
                                }
                                // Le jackpot ne descend JAMAIS sur un gain normal
                                triggerWinAnimation(spinResult.amount);
                            }

                                                    // 🎰 FREE SPIN: Gérer le compteur de victoires consécutives.
                                                    if (!isUsingFreeSpin) {
                                                        if (spinResult.isPityWin) {
                                                            // Une victoire de pitié (remboursement) doit réinitialiser le compteur, comme une défaite.
                                                            setWinStreak(0);
                                                            setLastThreeBets([]);
                                                        } else {
                                                            // C'est une vraie victoire, on incrémente le compteur.
                                                            setWinStreak(prev => {
                                                                const newStreak = prev + 1;
                                                                
                                                                // Si on atteint 3 victoires consécutives, débloquer 3 free spins
                                                                if (newStreak === 3) {
                                                                    // 🔒 ANTI-TRICHE: Calculer la mise moyenne des 3 derniers tours pour éviter que les joueurs misent petit puis augmentent au dernier moment
                                                                    const avgBet = lastThreeBets.length > 0 
                                                                        ? Math.floor(lastThreeBets.reduce((sum, b) => sum + b, 0) / lastThreeBets.length)
                                                                        : lockedBet;
                                                                    
                                                                    setFreeSpinBet(avgBet);
                                                                    setFreeSpins(prevSpins => prevSpins + 3);
                                                                    setShowFreeSpinUnlock(true);
                                                                    playSound('sequence3'); // Son spécial pour le déblocage
                                                                    setTimeout(() => setShowFreeSpinUnlock(false), 3000);
                                                                    
                                                                    console.log('[FREESPIN] Débloqué ! Mise verrouillée:', avgBet, 'Historique:', lastThreeBets);
                                                                    
                                                                    // Reset l'historique après déblocage
                                                                    setLastThreeBets([]);
                                                                    
                                                                    return 0; // Reset le streak après déblocage
                                                                }
                                                                
                                                                return newStreak;
                                                            });
                                                        }
                                                    }
                            try {
                                // Crédit via API NyxNode
                                const creditRes = await fetch('/api/currency/me', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                        action: 'add', 
                                        amount: spinResult.amount,
                                        type: 'tokens'
                                    })
                                });
                                if (creditRes.ok) {
                                    const data = await creditRes.json();
                                    if (typeof data.tokens === 'number') {
                                        setJetonsBalance(data.tokens);
                                        updateJetonsBalance(data.tokens);
                                    }
                                } else {
                                    // Fallback if API fails
                                    setJetonsBalance((b) => b + spinResult.amount);
                                    updateJetonsBalance(jetonsBalance + spinResult.amount);
                                }
                            } catch (e) {
                                console.error('Erreur crédit gain jetons:', e);
                                setJetonsBalance((b) => b + spinResult.amount);
                                updateJetonsBalance(jetonsBalance + spinResult.amount);
                            }
                        } else {
                            // Jouer le son de défaite
                            playSound('lose');
                            
                            // 🎰 FREE SPIN: Reset le win streak en cas de défaite (sauf si on est en freespin)
                            if (!isUsingFreeSpin) {
                                setWinStreak(0);
                                // Reset aussi l'historique des mises en cas de défaite
                                setLastThreeBets([]);
                            }
                            
                            if (lockedBet > biggestLoss) {
                                setBiggestLoss(lockedBet);
                            }
                            
                            setMessage('💔 Perdu...');
                            
                            // Augmenter le jackpot global via l'API NyxNode (50% de la mise en jetons convertie en pièces)
                            const jackpotIncreaseAmount = Math.max(1, Math.floor(lockedBet * 0.5 * 80)); // Convert jetons to pieces
                            try {
                                const increaseRes = await fetch(CASINO_ENDPOINTS.jackpotIncrease, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ amount: jackpotIncreaseAmount })
                                });
                                if (increaseRes.ok) {
                                    const data = await increaseRes.json();
                                    setJackpot(data.newAmount);
                                } else {
                                    setJackpot((j) => j + jackpotIncreaseAmount); // Fallback
                                }
                            } catch (e) {
                                console.error('Erreur augmentation jackpot:', e);
                                setJackpot((j) => j + jackpotIncreaseAmount); // Fallback
                            }
                            
                            triggerLoseAnimation();
                        }
                    }, 600);
                }
            }, d);
            spinTimeouts.current.push(t);
        });
    };

    // ✨ NOUVEAU: Fonction pour réclamer une récompense de niveau
    const handleClaimReward = async (level: number, amount: number) => {
        if (!session?.user?.id || claimedRewards.includes(level)) return;

        try {
            const res = await fetch('/api/currency/me', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'add',
                    amount: amount,
                    type: 'tokens'
                }),
            });

            if (res.ok) {
                const newClaimed = [...claimedRewards, level];
                setClaimedRewards(newClaimed);
                await fetchUserBalances(); // Mettre à jour le solde affiché
                playSound('win');
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to claim jetons reward');
            }
        } catch (error) {
            console.error(`Erreur lors de la réclamation de la récompense pour le niveau ${level}:`, error);
            alert("Impossible de réclamer la récompense. Veuillez réessayer.");
        }
    };

    const formatMoney = (n: number) => n.toLocaleString('fr-FR');

    const handleBuyJetons = async () => {
    if (!session?.user?.id || buyAmount <= 0 || loadingExchange) return;
    setLoadingExchange(true);
    
    try {
        const res = await fetch('/api/jetons/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'buy',
                amount: buyAmount 
            }),
        });
        
        if (res.ok) {
            const data = await res.json();
            setPiecesBalance(data.currencyBalance);
            setJetonsBalance(data.jetonsBalance);
            updateJetonsBalance(data.jetonsBalance);
            setMessage(`Acheté ${formatMoney(data.bought)} jetons pour ${formatMoney(data.cost)} pièces !`);
            playSound('win');
        } else {
            const errorData = await res.json();
            setMessage(`Erreur: ${errorData.error || 'Impossible d\'acheter des jetons'}`);
        }
    } catch (error) {
        console.error('Erreur achat:', error);
        setMessage('Erreur interne lors de l\'achat');
    } finally {
        setLoadingExchange(false);
    }
};

const handleSellJetons = async () => {
    if (!session?.user?.id || sellAmount <= 0 || loadingExchange) return;
    setLoadingExchange(true);
    
    try {
        const res = await fetch('/api/jetons/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'sell',  // ✅ CORRECTION: 'sell' au lieu de 'buy'
                amount: sellAmount  // ✅ CORRECTION: sellAmount au lieu de buyAmount
            }),
        });
        
        if (res.ok) {
            const data = await res.json();
            setPiecesBalance(data.currencyBalance);
            setJetonsBalance(data.jetonsBalance);
            updateJetonsBalance(data.jetonsBalance);
            setMessage(`Vendu ${formatMoney(data.sold)} jetons pour ${formatMoney(data.gain)} pièces !`);
            playSound('win');
        } else {
            const errorData = await res.json();
            setMessage(`Erreur: ${errorData.error || 'Impossible de vendre des jetons'}`);
        }
    } catch (error) {
        console.error('Erreur vente:', error);
        setMessage('Erreur interne lors de la vente');
    } finally {
        setLoadingExchange(false);
    }
};

    const reelDisplay = (reel: Reel, index: number) => {
        const isStopped = reelsStopped[index];
        
        // Afficher 15 symboles pour l'animation de défilement circulaire fluide
        // Les 3 symboles du milieu (index 1, 2, 3) sont visibles, le symbole à l'index 2 est le résultat
        let visibleSymbols: string[];
        
        if (!reel || reel.length === 0) {
            // Si la roue est vide, générer 15 symboles aléatoires
            console.warn(`Roue ${index} vide, génération de symboles par défaut`);
            visibleSymbols = Array.from({ length: 15 }, () => 
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
            );
        } else if (reel.length < 15) {
            // Si moins de 15 symboles, compléter avec des symboles aléatoires
            console.warn(`Roue ${index} a seulement ${reel.length} symboles, complétion...`);
            visibleSymbols = [...reel];
            while (visibleSymbols.length < 15) {
                visibleSymbols.unshift(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
            }
        } else {
            // Sinon, prendre les 15 derniers
            visibleSymbols = reel.slice(-15);
        }
        
        // Vérification finale de sécurité
        if (visibleSymbols.length !== 15) {
            console.error(`ERREUR: visibleSymbols a ${visibleSymbols.length} éléments au lieu de 15!`);
            visibleSymbols = Array.from({ length: 15 }, (_, i) => 
                SYMBOLS[i % SYMBOLS.length]
            );
        }
        
        return (
            <motion.div 
                className="relative w-36 h-48 rounded-3xl overflow-hidden"
                animate={isStopped ? {
                    scale: [1, 1.05, 1],
                } : {}}
                transition={{ duration: 0.3 }}
            >
                {/* Outer glow container - Golden in Free Spin mode */}
                <div className={`absolute inset-0 rounded-3xl blur-xl ${
                    isFreeSpinMode 
                        ? 'bg-gradient-to-b from-yellow-400/30 via-amber-500/20 to-yellow-400/30'
                        : isDevilMode ? 'bg-gradient-to-b from-red-600/30 via-red-500/20 to-red-600/30' : 'bg-gradient-to-b from-purple-600/20 via-purple-500/10 to-purple-600/20'
                }`} />
                
                {/* Main reel container - Golden border in Free Spin mode */}
                <div className={`relative w-full h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-3xl border-4 shadow-2xl overflow-hidden ${
                    isFreeSpinMode 
                        ? 'border-yellow-400/60 shadow-yellow-500/50'
                        : isDevilMode ? 'border-red-500/60 shadow-red-500/50' : 'border-purple-500/40'
                }`}>
                    {/* Animated border glow - Golden in Free Spin mode */}
                    <motion.div 
                        className="absolute inset-0 rounded-3xl"
                        style={{
                            background: isFreeSpinMode 
                                ? 'linear-gradient(45deg, transparent, rgba(234, 179, 8, 0.4), transparent)'
                                : isDevilMode ? 'linear-gradient(45deg, transparent, rgba(239, 68, 68, 0.4), transparent)' : 'linear-gradient(45deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
                        }}
                        animate={spinning ? {
                            rotate: [0, 360],
                        } : {}}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                    
                    {/* Spinning glow effect - Golden in Free Spin mode */}
                    {spinning && (
                        <motion.div 
                            className={`absolute inset-0 ${
                                isFreeSpinMode 
                                    ? 'bg-gradient-to-b from-yellow-500/30 via-transparent to-yellow-500/30'
                                    : isDevilMode ? 'bg-gradient-to-b from-red-500/40 via-transparent to-red-500/40' : 'bg-gradient-to-b from-purple-500/30 via-transparent to-purple-500/30'
                            }`}
                            animate={{ 
                                opacity: [0.3, 0.7, 0.3],
                                y: [-50, 50, -50]
                            }}
                            transition={{ 
                                duration: 0.8, 
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    )}
                    
                    {/* Reel symbols - Affichage de 15 symboles avec décalage pour centrer parfaitement */}
                    <motion.div 
                        className="flex flex-col relative z-10"
                        animate={spinning && !isStopped ? {
                            y: [-64, -832],  // Animation de -64px à -832px (768px de défilement = 12 symboles)
                        } : {
                            y: -64  // Position de repos : décalage de -64px pour centrer le symbole 2
                        }}
                        transition={spinning && !isStopped ? {
                            duration: 0.6,
                            repeat: Infinity,
                            ease: "linear",
                            repeatType: "loop"
                        } : {
                            duration: 0.5,
                            ease: "easeOut"
                        }}
                        // ✨ NOUVEAU: Effet de flou pendant le spin
                        style={{
                            filter: spinning && !isStopped ? 'blur(2px)' : 'blur(0px)',
                            transition: 'filter 0.3s ease-out',
                        }}
                    >
                        {visibleSymbols.map((s, i) => (
                            <div 
                                key={`${s}-${i}`} 
                                className="flex items-center justify-center h-16 w-full relative"
                            >
                                {/* Winning symbol highlight - symbole du milieu (index 2 sur 15) */}
                                {i === 2 && !spinning && (
                                    <>
                                        <motion.div
                                            className={`absolute inset-0 bg-gradient-to-r from-transparent ${isDevilMode ? 'via-red-400/40' : 'via-purple-400/40'} to-transparent`}
                                            animate={{
                                                opacity: [0.3, 0.8, 0.3],
                                                scale: [0.95, 1.05, 0.95],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        />
                                        <div className={`absolute inset-0 border-y-4 ${isDevilMode ? 'border-red-400/60 shadow-red-500/50' : 'border-purple-400/60 shadow-purple-500/50'} shadow-lg`} />
                                        <motion.div
                                            className="absolute -left-2 -right-2 -top-2 -bottom-2"
                                            animate={{
                                                boxShadow: [
                                                    `0 0 20px ${isDevilMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(139, 92, 246, 0.3)'}`,
                                                    `0 0 40px ${isDevilMode ? 'rgba(239, 68, 68, 0.7)' : 'rgba(139, 92, 246, 0.6)'}`,
                                                    `0 0 20px ${isDevilMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(139, 92, 246, 0.3)'}`,
                                                ],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                            }}
                                        />
                                    </>
                                )}
                                
                                <motion.div 
                                    className="text-5xl relative z-10 flex items-center justify-center"
                                    animate={i === 2 && !spinning ? {
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 5, -5, 0],
                                    } : {}}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1
                                    }}
                                    style={{
                                        filter: i === 2 && !spinning 
                                            ? `drop-shadow(0 0 10px ${isDevilMode ? 'rgba(239, 68, 68, 0.8)' : 'rgba(139, 92, 246, 0.8)'})` 
                                            : 'none'
                                    }}
                                >
                                    {s}
                                </motion.div>
                            </div>
                        ))}
                    </motion.div>
                    
                    {/* Enhanced overlay effects - masque le haut et le bas pour ne montrer que les 3 symboles du milieu */}
                    <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/90 via-black/60 to-transparent pointer-events-none z-20" />
                    <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none z-20" />
                    
                    {/* Corner sparkles */}
                    {!spinning && (
                        <>
                            <motion.div
                                className={`absolute top-2 left-2 ${isDevilMode ? 'text-red-400' : 'text-purple-400'}`}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0],
                                    rotate: [0, 180, 360],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: index * 0.3,
                                }}
                            >
                                <Sparkles size={16} />
                            </motion.div>
                            <motion.div
                                className={`absolute top-2 right-2 ${isDevilMode ? 'text-red-400' : 'text-purple-400'}`}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0],
                                    rotate: [360, 180, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: index * 0.3 + 0.5,
                                }}
                            >
                                <Sparkles size={16} />
                            </motion.div>
                        </>
                    )}
                    
                    {/* Side glow effects */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent ${isDevilMode ? 'via-red-400/70' : 'via-purple-400/70'} to-transparent pointer-events-none z-20`} />
                    <div className={`absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent ${isDevilMode ? 'via-red-400/70' : 'via-purple-400/70'} to-transparent pointer-events-none z-20`} />
                </div>
            </motion.div>
        );
    };

    return (
        <WithMaintenanceCheck pageId="casino">
            <div className="w-full text-white p-4 md:p-8 relative overflow-hidden">
            <AuroraBackground isDevilMode={isDevilMode} />
            {/* Confetti effect */}
            <AnimatePresence>
                {showConfetti && <Confetti />}
            </AnimatePresence>
            
            {/* Coin rain effect */}
            <AnimatePresence>
                {showCoinRain && <CoinRain amount={lastWinAmount} />}
            </AnimatePresence>
            
            {/* Laughing emojis effect when losing */}
            <AnimatePresence>
                {showLaughingEmojis && <LaughingEmojis />}
            </AnimatePresence>
            
            {/* Free Spin Unlock Animation */}
            <AnimatePresence>
                {showFreeSpinUnlock && <FreeSpinUnlockAnimation />}
            </AnimatePresence>

            {/* ✨ NOUVEAU: Animation de Level Up */}
            <AnimatePresence>
                {showLevelUpAnimation && (
                    <LevelUpAnimation level={lastLevelUpInfo.level} title={lastLevelUpInfo.title} />
                )}
            </AnimatePresence>

            {/* ✨ NOUVEAU: Modale des niveaux */}
            <AnimatePresence>
                {isLevelModalOpen && (
                    <LevelModal onClose={() => setIsLevelModalOpen(false)} currentLevel={playerLevel} claimedRewards={claimedRewards} onClaim={handleClaimReward} />
                )}
            </AnimatePresence>

            {/* ✨ NOUVEAU: Effet de transition pour le Devil Mode */}
            <AnimatePresence>
                {showDevilTransition && (
                    <motion.div
                        className={`fixed inset-0 z-50 pointer-events-none ${isDevilMode ? 'bg-red-500' : 'bg-purple-300'}`}
                        initial={{ opacity: 0.5, clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' }}
                        animate={{ opacity: 0, clipPath: ['polygon(0 0, 100% 0, 100% 100%, 0 100%)', 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)'] }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                )}
            </AnimatePresence>

            {/* 🔥 DEVIL MODE EFFECTS */}
            <AnimatePresence>
                {isDevilMode && (
                    <>
                        {/* Effets de fond (flammes, vortex) */}
                        <div className="fixed inset-0 z-0 devil-bg-vortex" />
                        <DevilGodRays />
                        <DemonicSigil />
                        <CssFlameEffect /> 

                        {/* Effets de premier plan (vignette, scanlines) */}
                        <DevilModeOverlay />
                    </>
                )}
            </AnimatePresence>
            
            {/* Header avec bouton retour */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    <Link href="/dashboard/mini-jeu/casino-vip">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 bg-black/30 hover:bg-black/50 rounded-lg border border-gray-700/50 transition-colors backdrop-blur-sm"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Retour au Carré VIP
                        </motion.button>
                    </Link>
                    <div>
                        <FavoriteToggleButton pageId="casino" />
                    </div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 items-start relative z-10">
                {/* Main Slot Machine */}
                <motion.div 
                    // Effet d'aberration chromatique en Devil Mode
                    className={`lg:col-span-3 bg-black/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 ${isDevilMode ? 'devil-chromatic-aberration' : ''} relative overflow-hidden border ${isDevilMode ? 'border-red-500/30' : 'border-purple-500/20'} shadow-2xl`}
                    animate={isDevilMode ? {
                        x: spinning ? [0, -1, 1, -2, 2, -1, 1, 0] : 0, // @ts-ignore
                        y: spinning ? [0, 1, -1, 2, -2, 1, -1, 0] : 0,
                        rotate: spinning ? [0, 0.1, -0.1, 0.2, -0.2, 0.1, -0.1, 0] : 0,
                        '--glitch-x': spinning ? `${Math.random() * 4 - 2}px` : '0px',
                        '--glitch-y': spinning ? `${Math.random() * 4 - 2}px` : '0px',
                        boxShadow: "0 0 60px rgba(239, 68, 68, 0.5), inset 0 0 15px rgba(239, 68, 68, 0.3)"
                    } : { 
                        x: 0, y: 0, rotate: 0,
                        boxShadow: "0 0 40px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.15)" 
                    }}
                    transition={{
                        x: { duration: 0.4, repeat: Infinity },
                        y: { duration: 0.4, repeat: Infinity },
                        rotate: { duration: 0.4, repeat: Infinity },
                        boxShadow: { duration: 3, repeat: isDevilMode ? Infinity : 0, ease: 'easeInOut' },
                        '--glitch-x': { duration: 0.1, repeat: Infinity }, '--glitch-y': { duration: 0.1, repeat: Infinity }
                    }}
                >
                    {/* Animated corner elements */}
                    <motion.div
                        className={`absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 ${isDevilMode ? 'border-red-500/40' : 'border-purple-500/40'} rounded-tl-3xl transition-colors duration-500`}
                        animate={{
                            borderColor: isDevilMode ? ['rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.4)'] : ['rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.4)'],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                        className={`absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 ${isDevilMode ? 'border-red-500/40' : 'border-purple-500/40'} rounded-tr-3xl transition-colors duration-500`}
                        animate={{
                            borderColor: isDevilMode ? ['rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.4)'] : ['rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.4)'],
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.div
                        className={`absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 ${isDevilMode ? 'border-red-500/40' : 'border-purple-500/40'} rounded-bl-3xl transition-colors duration-500`}
                        animate={{
                            borderColor: isDevilMode ? ['rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.4)'] : ['rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.4)'],
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                    <motion.div
                        className={`absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 ${isDevilMode ? 'border-red-500/40' : 'border-purple-500/40'} rounded-br-3xl transition-colors duration-500`}
                        animate={{
                            borderColor: isDevilMode ? ['rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.4)'] : ['rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.4)'],
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                    />
                    
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between mb-8 relative z-10"
                    >
                        <div className="flex items-center gap-4">
                            <motion.div
                                className={`w-16 h-16 rounded-2xl ${isDevilMode ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-red-500/50' : 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 shadow-purple-500/50'} flex items-center justify-center shadow-lg relative overflow-hidden transition-all duration-500`}
                                animate={{ 
                                    rotate: spinning ? [0, 360] : [0, 5, -5, 0],
                                    scale: spinning ? [1, 1.1, 1] : 1,
                                }}
                                transition={spinning ? {
                                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 0.5, repeat: Infinity },
                                } : {
                                    duration: 2,
                                    repeat: Infinity
                                }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                                    animate={{
                                        opacity: [0.2, 0.5, 0.2],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                    }}
                                />
                                {isDevilMode ? <Flame size={32} className="text-white relative z-10" /> : <Zap size={32} className="text-white relative z-10" />}
                            </motion.div>
                            <div>
                                <motion.h1 className={`text-3xl md:text-4xl font-black bg-clip-text text-transparent transition-all duration-500 ${
                                    isDevilMode
                                        ? 'bg-gradient-to-r from-red-500 via-orange-400 to-red-500'
                                        : 'bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400'
                                }`}
                                animate={isDevilMode ? {
                                    textShadow: [
                                        '0 0 5px rgba(255, 165, 0, 0.7)',
                                        '0 0 15px rgba(255, 100, 0, 0.9)',
                                        '0 0 5px rgba(255, 165, 0, 0.7)',
                                    ],
                                    opacity: [1, 0.9, 1]
                                } : {}}
                                transition={isDevilMode ? { duration: 1.5, repeat: Infinity } : {}}>
                                    {isDevilMode ? 'DEVIL SLOT' : 'Casino Slot'}
                                </motion.h1>
                                <motion.p
                                    className="text-sm text-gray-400 font-medium"
                                    animate={{
                                        opacity: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                    }}
                                >
                                    {isDevilMode
                                        ? 'Pacte avec le diable : Gains x2, Risque x10 !'
                                        : 'Prêt à défier la chance ? | Casino conçu par Kyû.'}
                                </motion.p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {/* 🎰 FREE SPINS & WIN STREAK DISPLAY */}
                            <div className="flex flex-col gap-2">
                                {/* Win Streak Counter */}
                                <motion.div
                                    className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-orange-500/40"
                                    animate={winStreak > 0 ? {
                                        scale: [1, 1.05, 1],
                                        borderColor: ['rgba(249, 115, 22, 0.4)', 'rgba(249, 115, 22, 0.8)', 'rgba(249, 115, 22, 0.4)'],
                                    } : {}}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    <p className="text-xs text-orange-300 font-bold flex items-center gap-1">
                                        🔥 Série: {winStreak}/3
                                    </p>
                                </motion.div>
                                
                                {/* Free Spins Counter */}
                                {freeSpins > 0 && (
                                    <>
                                        <motion.div
                                            className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-yellow-500/40"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{
                                                scale: 1,
                                                opacity: 1,
                                                borderColor: ['rgba(234, 179, 8, 0.4)', 'rgba(234, 179, 8, 0.8)', 'rgba(234, 179, 8, 0.4)']
                                            }}
                                            transition={{ 
                                                scale: { type: "spring", stiffness: 300 },
                                                borderColor: { duration: 1, repeat: Infinity }
                                            }}
                                        >
                                            <p className="text-xs text-yellow-300 font-bold flex items-center gap-1">
                                                🎁 Free Spins: {freeSpins}
                                            </p>
                                        </motion.div>
                                        
                                        {/* 🔒 Locked Bet Display */}
                                        <motion.div
                                            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-500/40"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{
                                                scale: 1,
                                                opacity: 1,
                                            }}
                                            transition={{ 
                                                scale: { type: "spring", stiffness: 300 },
                                                delay: 0.2
                                            }}
                                        >
                                            <p className="text-xs text-blue-300 font-bold flex items-center gap-1">
                                                🔒 Mise: {formatMoney(freeSpinBet)}
                                            </p>
                                        </motion.div>
                                    </>
                                )}
                            </div>
                            
                            <motion.div
                                className="text-right"
                                animate={loadingBalance ? { opacity: [0.5, 1, 0.5] } : {}}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <p className="text-sm text-gray-400 font-semibold mb-1">Vos Pièces</p>
                                <p className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent mb-4">
                                    {formatMoney(piecesBalance)} 💰
                                </p>
                                <p className="text-sm text-gray-400 font-semibold mb-1">Vos Jetons</p>
                                <p className="text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                                    {loadingBalance ? '...' : formatMoney(displayJetonsBalance)} 💎
                                </p>

                                {/* ✨ NOUVEAU: Barre d'XP et Niveau */}
                                <motion.div
                                    className="mt-2 cursor-pointer relative p-2 -m-2 rounded-lg" // ✨ NOUVEAU: Ajout de 'relative' et padding pour l'aura
                                    onClick={() => setIsLevelModalOpen(true)}
                                    whileHover={{ scale: 1.05 }}
                                    title="Voir les récompenses de niveau"
                                    // ✨ NOUVEAU: Animation de clignotement si une récompense est disponible
                                    animate={hasClaimableReward ? {
                                        scale: [1, 1.03, 1],
                                        boxShadow: [ // ✨ NOUVEAU: Aura dorée
                                            "0 0 0px rgba(251, 191, 36, 0)",
                                            "0 0 15px rgba(251, 191, 36, 0.6)",
                                            "0 0 25px rgba(251, 191, 36, 0.4)",
                                            "0 0 15px rgba(251, 191, 36, 0.6)",
                                            "0 0 0px rgba(251, 191, 36, 0)",
                                        ]
                                    } : {}}
                                    transition={hasClaimableReward ? {
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    } : {}}
                                >
                                    <div className="flex justify-between items-center text-xs mb-1">
                                        <span className={`font-bold ${isDevilMode ? 'text-red-300' : 'text-purple-300'}`}>{`Niv. ${playerLevel} - ${getLevelTitle(playerLevel)}`}</span>
                                        <span className="text-gray-400">{`${formatMoney(playerXp)} / ${formatMoney(xpForNextLevel)} XP`}</span>
                                    </div>
                                    <div className={`w-full bg-black/30 rounded-full h-2.5 border ${isDevilMode ? 'border-red-500/30' : 'border-purple-500/30'}`}>
                                        <motion.div
                                            className={`h-full rounded-full ${isDevilMode ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-fuchsia-500'}`}
                                            initial={{ width: '0%' }}
                                            animate={{ width: `${(playerXp / xpForNextLevel) * 100}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                        />
                                    </div>
                                    {/* ✨ NOUVEAU: Message si une récompense est disponible */}
                                    {hasClaimableReward && (
                                        <motion.div
                                            className="text-center text-xs font-bold text-yellow-400 mt-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5, duration: 0.5 }}
                                        >
                                            Une récompense t'attend !
                                        </motion.div>
                                    )}
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Reels Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative mb-8"
                    >
                        {/* Slot machine frame */}
                        <motion.div className={`relative bg-black/50 rounded-3xl p-8 border-4 ${isDevilMode ? 'border-red-500/30' : 'border-purple-500/30'} shadow-2xl transition-colors duration-500`}>
                            {/* Top decorative bar */}
                            <motion.div
                                className={`absolute -top-6 left-1/2 transform -translate-x-1/2 ${isDevilMode ? 'bg-gradient-to-r from-red-600 via-red-500 to-red-600 border-red-400/50 shadow-red-500/50' : 'bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 border-purple-400/50 shadow-purple-500/50'} px-8 py-3 rounded-full border-4 shadow-lg transition-all duration-500 backdrop-blur-sm`}
                                animate={{
                                    boxShadow: [
                                        '0 0 20px rgba(139, 92, 246, 0.5)',
                                        '0 0 40px rgba(139, 92, 246, 0.8)',
                                        '0 0 20px rgba(139, 92, 246, 0.5)',
                                    ],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <motion.div
                                    className="flex items-center gap-2"
                                    animate={spinning ? {
                                        scale: [1, 1.1, 1],
                                    } : {}}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                >
                                    {isDevilMode ? (
                                        <Flame className="text-orange-300" size={20} />
                                    ) : (
                                        <Star className="text-yellow-300" size={20} />
                                    )}
                                    <span className="text-white font-black text-lg">{isDevilMode ? 'HELLFIRE' : 'SLOT MACHINE'}</span>
                                    {isDevilMode ? (
                                        <Flame className="text-orange-300" size={20} />
                                    ) : (
                                        <Star className="text-yellow-300" size={20} />
                                    )}
                                </motion.div>
                            </motion.div>
                            
                            {/* Reels - ✨ NOUVEAU: Indicateur de Free Spin amélioré */}
                            <div className="flex justify-center items-center gap-6 mb-6 relative">
                                {/* 🎁 FREE SPIN MODE INDICATOR */}
                                {isFreeSpinMode && (
                                    <motion.div
                                        className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-40"
                                        initial={{ scale: 0, y: -20, opacity: 0 }}
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            y: 0,
                                            opacity: 1,
                                        }}
                                        exit={{ scale: 0, y: -20, opacity: 0 }}
                                        transition={{
                                            scale: { duration: 1, repeat: Infinity },
                                            y: { type: "spring", stiffness: 300 },
                                            opacity: { duration: 0.3 }
                                        }}
                                    >
                                        <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-white px-6 py-2 rounded-full font-black text-lg shadow-2xl border-2 border-yellow-300">
                                            🎁 MODE FREE SPIN 🎁
                                        </div>
                                    </motion.div>
                                )}
                                
                                {reels.map((reel, idx) => (
                                    <div key={idx}>
                                        {reelDisplay(reel, idx)}
                                    </div>
                                ))}
                                
                                {/* Winning Line Animation */}
                                <AnimatePresence>
                                    {winningLineType && (
                                        <WinningLine type={winningLineType} />
                                    )}
                                </AnimatePresence>
                            </div>
                            
                            {/* Message Display */}
                            <motion.div
                                className="text-center mb-6"
                                key={message}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                            >
                                <motion.div
                                    className={`inline-block px-8 py-4 rounded-2xl font-black text-xl md:text-2xl shadow-lg backdrop-blur-sm ${
                                        winAnimation
                                            ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 text-white' 
                                            : loseAnimation ? 'bg-gradient-to-r from-red-500 via-red-400 to-red-500 text-white'
                                            : isDevilMode ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border-2 border-red-500/30'
                                            : 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border-2 border-purple-500/30'
                                    }`}
                                    animate={winAnimation && !isDevilMode ? {
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 2, -2, 0],
                                    } : loseAnimation ? {
                                        x: [0, -10, 10, -10, 10, 0],
                                    } : {}}
                                    transition={{ duration: 0.5, repeat: winAnimation || loseAnimation ? 3 : 0 }}
                                >
                                    {message}
                                </motion.div>
                            </motion.div>

                            {/* Controls */}
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
                                <motion.div
                                    className={`flex items-center gap-3 bg-black/50 px-6 py-4 rounded-2xl border-2 ${isDevilMode ? 'border-red-500/30' : 'border-purple-500/30'} shadow-lg backdrop-blur-sm transition-colors duration-500`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ scale: 1.03, borderColor: isDevilMode ? 'rgba(239, 68, 68, 0.6)' : 'rgba(139, 92, 246, 0.6)' }}
                                >
                                    <motion.div
                                        animate={{ 
                                            rotate: [0, 15, -15, 0],
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Target size={24} className={isDevilMode ? 'text-red-400' : 'text-purple-400'} />
                                    </motion.div>
                                    <label className="text-sm text-gray-300 font-bold">Mise</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={Math.min(100000, Math.max(1, jetonsBalance))}
                                        value={bet}
                                        onChange={(e) => {
                                        if (spinning) return;
                                        
                                        const value = e.target.value;
                                        if (value === '') {
                                            setBet(0);
                                            return;
                                        }
                                        const numValue = Number(value);
                                        if (!isNaN(numValue)) {
                                            // ✨ MODIFICATION: Limiter à 100K maximum
                                            const limitedValue = Math.min(numValue, 100000);
                                            setBet(limitedValue);
                                        }
                                    }}
                                        onBlur={(e) => {
                                        if (spinning) return;
                                        
                                        const numValue = Number(e.target.value);
                                        if (isNaN(numValue) || numValue < 1) {
                                            setBet(1);
                                        } else {
                                            // ✨ MODIFICATION: Limiter à 100K maximum
                                            const limitedValue = Math.min(numValue, 100000, Math.max(1, jetonsBalance));
                                            setBet(limitedValue);
                                        }
                                    }}
                                        disabled={spinning || loadingBalance || isFreeSpinMode || freeSpins > 0}
                                        className={`nyx-input w-32 text-center font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                                            isDevilMode
                                                ? 'focus:border-red-500 focus:ring-red-500'
                                                : 'focus:border-purple-500 focus:ring-purple-500'
                                        }`}
                                    />
                                </motion.div>

                                {/* ✨ NOUVEAU: Boutons de mise rapide */}
                                <motion.div 
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.55 }}
                                >
                                    {['/2', 'x2', 'MIN', 'MAX'].map((action) => {
                                        const handleQuickBet = () => {
                                            if (spinning || isFreeSpinMode) return;
                                            let newBet = bet;
                                            if (action === '/2') newBet = Math.max(1, Math.floor(bet / 2));
                                            if (action === 'x2') newBet = Math.min(100000, bet * 2, jetonsBalance);
                                            if (action === 'MIN') newBet = 1;
                                            if (action === 'MAX') newBet = Math.min(100000, jetonsBalance);
                                            setBet(newBet);
                                        };

                                        const isDisabled = spinning || isFreeSpinMode || 
                                            (action === 'x2' && (bet * 2 > 100000 || bet * 2 > jetonsBalance)) ||
                                            (action === '/2' && bet <= 1) ||
                                            (action === 'MAX' && (jetonsBalance === 0 || jetonsBalance > 100000))

                                        return (
                                            <motion.button
                                                key={action}
                                                onClick={handleQuickBet}
                                                disabled={isDisabled}
                                                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                                                    isDevilMode
                                                        ? 'bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 enabled:hover:scale-105'
                                                        : 'bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 enabled:hover:scale-105'
                                                }`}
                                                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                                title={action === '/2' ? 'Diviser par 2' : action === 'x2' ? 'Multiplier par 2' : action === 'MIN' ? 'Mise minimum' : 'Mise maximum (100K max)'}
                                            >
                                                {action}
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>
                                    {/* Message limite de mise */}
                                <motion.div
                                    className="text-center mt-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <p className="text-xs text-gray-500 font-semibold">
                                        By Kyû | 2025
                                    </p>
                                </motion.div>
                                <motion.button
                                    onClick={handleSpin}
                                    disabled={spinning || loadingBalance || bet > jetonsBalance}
                                    className={`relative px-12 py-5 rounded-2xl font-black text-xl shadow-2xl flex items-center gap-3 overflow-hidden transition-all duration-300 ${
                                        spinning
                                            ? 'bg-gray-700 cursor-not-allowed'
                                            : bet > jetonsBalance
                                            ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                            : isDevilMode
                                            ? 'btn-nyx-danger'
                                            : 'btn-nyx-primary'
                                    }`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        boxShadow: isDevilMode && !spinning ? [
                                            "0 0 15px rgba(239, 68, 68, 0.5)",
                                            "0 0 25px rgba(239, 68, 68, 0.8)",
                                            "0 0 15px rgba(239, 68, 68, 0.5)",
                                        ] : "none"
                                    }}
                                    transition={isDevilMode && !spinning ? {
                                        boxShadow: { duration: 1.5, repeat: Infinity },
                                        default: { delay: 0.6 }
                                    } : { delay: 0.6 }}
                                    whileHover={{ scale: spinning ? 1 : 1.1 }}
                                    whileTap={{ scale: spinning ? 1 : 0.95 }}
                                >
                                    {/* ✨ NOUVEAU: Effet de reflet sur le bouton */}
                                    {!spinning && !isDevilMode && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            animate={{
                                                x: ['-100%', '200%'],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "linear",
                                            }}
                                        />
                                    )}
                                    {/* ✨ NOUVEAU: Effet de lueur pulsante en Devil Mode */}
                                    {isDevilMode && !spinning && (
                                        <motion.div
                                            className="absolute inset-0"
                                            style={{
                                                boxShadow: '0 0 20px 5px rgba(239, 68, 68, 0.7)',
                                            }}
                                            animate={{
                                                opacity: [0.7, 1, 0.7],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                            }}
                                        />
                                    )}
                                    <motion.div
                                        animate={spinning ? {
                                            rotate: [0, 360],
                                        } : {}}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                    >
                                        {isDevilMode ? <Flame size={24} /> : <Zap size={24} />}
                                    </motion.div>
                                    <span className="relative z-10">
                                        {spinning ? 'SPINNING...' : isDevilMode ? 'RISK IT ALL' : 'SPIN'}
                                    </span>
                                </motion.button>
                            </div>

                            {/* ✨ NOUVEAU: Historique des spins */}
                            <div className="mt-6">
                                <button
                                    onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                                    className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-t-lg transition-colors ${isHistoryVisible ? (isDevilMode ? 'bg-red-900/50' : 'bg-purple-900/50') : (isDevilMode ? 'bg-black/30 hover:bg-red-900/40' : 'bg-black/30 hover:bg-purple-900/40')}`}
                                >
                                    Historique des lancers
                                    <motion.div animate={{ rotate: isHistoryVisible ? 180 : 0 }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {isHistoryVisible && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className={`overflow-hidden rounded-b-lg p-4 border-x-2 border-b-2 ${isDevilMode ? 'bg-red-900/30 border-red-500/30' : 'bg-purple-900/30 border-purple-500/30'}`}
                                        >
                                            {spinHistory.length > 0 ? (
                                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar-sm">
                                                    {spinHistory.map((entry) => (
                                                        <motion.div
                                                            key={entry.timestamp}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="flex items-center justify-between text-xs p-2 rounded-md bg-black/40"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex text-lg">
                                                                    {entry.symbols.map((s, i) => <span key={i}>{s}</span>)}
                                                                </div>
                                                                <div className="text-gray-400">
                                                                    Mise: <span className="font-bold text-gray-300">{formatMoney(entry.bet)}</span>
                                                                </div>
                                                            </div>
                                                            <div className={`font-bold ${entry.win ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                {entry.win ? `+${formatMoney(entry.amount)}` : `-${formatMoney(entry.bet)}`}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-center text-xs text-gray-500 py-4">
                                                    Aucun lancer dans l'historique.
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* ✨ NOUVEAU: Contrôle du volume déplacé ici */}
                        <div className="flex items-center justify-center gap-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-500/30 shadow-lg mt-4">
                            {/* Mute/Unmute Button */}
                            <motion.button
                                onClick={toggleSounds}
                                className={`p-2 rounded-lg transition-all duration-300 ${
                                    isDevilMode
                                        ? (soundsEnabled ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-gray-600/20 hover:bg-gray-600/30')
                                        : (soundsEnabled 
                                        ? 'bg-purple-500/20 hover:bg-purple-500/30' 
                                        : 'bg-gray-600/20 hover:bg-gray-600/30')
                                }`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                title={soundsEnabled ? "Désactiver les sons" : "Activer les sons"}
                            >
                                {soundsEnabled ? (
                                    <Volume2 size={20} className={isDevilMode ? 'text-red-400' : 'text-purple-400'} />
                                ) : (
                                    <VolumeX size={20} className="text-gray-400" />
                                )}
                            </motion.button>
                            
                            {/* Volume Slider */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={masterVolume}
                                    onChange={(e) => changeVolume(Number(e.target.value))}
                                    disabled={!soundsEnabled}
                                    className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                                        [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-purple-500/50"
                                    style={{ // @ts-ignore
                                        background: soundsEnabled 
                                            ? `linear-gradient(to right, ${isDevilMode ? 'rgb(249, 115, 22)' : 'rgb(168, 85, 247)'} 0%, ${isDevilMode ? 'rgb(249, 115, 22)' : 'rgb(168, 85, 247)'} ${masterVolume}%, rgb(55, 65, 81) ${masterVolume}%, rgb(55, 65, 81) 100%)`
                                            : 'rgb(55, 65, 81)',
                                    }}
                                />
                                <span className={`text-xs font-medium min-w-[2rem] text-right ${soundsEnabled ? (isDevilMode ? 'text-red-400' : 'text-purple-400') : 'text-gray-500'}`}>
                                    {masterVolume}%
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Statistics Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }} // @ts-ignore
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {/* Biggest Win */}
                        <motion.div
                            className="relative bg-gradient-to-br from-emerald-900/50 via-black/30 to-emerald-900/50 rounded-2xl p-6 border-2 border-emerald-500/30 shadow-lg overflow-hidden"
                            whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.5)' }}
                            animate={biggestWin > 0 ? {
                                boxShadow: [
                                    '0 0 20px rgba(16, 185, 129, 0.3)',
                                    '0 0 35px rgba(16, 185, 129, 0.5)',
                                    '0 0 20px rgba(16, 185, 129, 0.3)',
                                ],
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {/* ✨ NOUVEAU: Arrière-plan animé */}
                            <div className="absolute inset-0 opacity-20 bg-[url('/textures/circuit-board.svg')] bg-cover" style={{ animation: 'pan-bg 20s linear infinite' }} />

                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50"
                                        animate={{
                                            rotate: [0, 10, -10, 0],
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Trophy size={24} className="text-white" />
                                    </motion.div>
                                    <div>
                                        <p className="text-sm text-emerald-300 font-bold mb-1">Plus Gros Gain</p>
                                        <motion.p 
                                            className="text-2xl font-black text-emerald-400"
                                            key={biggestWin}
                                            initial={{ scale: 1.3, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", stiffness: 200 }}
                                        >
                                            {biggestWin > 0 ? `${formatMoney(biggestWin)} 💰` : '- -'}
                                        </motion.p>
                                    </div>
                                </div>
                                <motion.div
                                    animate={{
                                        y: [0, -5, 0],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <TrendingUp size={32} className="text-emerald-400/50" />
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Biggest Loss */}
                        <motion.div
                            className="relative bg-gradient-to-br from-red-900/50 via-black/30 to-red-900/50 rounded-2xl p-6 border-2 border-red-500/30 shadow-lg overflow-hidden"
                            whileHover={{ scale: 1.02, borderColor: 'rgba(239, 68, 68, 0.5)' }}
                            animate={biggestLoss > 0 ? {
                                boxShadow: [
                                    '0 0 20px rgba(239, 68, 68, 0.3)',
                                    '0 0 35px rgba(239, 68, 68, 0.5)',
                                    '0 0 20px rgba(239, 68, 68, 0.3)',
                                ],
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {/* ✨ NOUVEAU: Arrière-plan animé */}
                            <div className="absolute inset-0 opacity-20 bg-[url('/textures/circuit-board.svg')] bg-cover" style={{ animation: 'pan-bg 25s linear infinite reverse' }} />

                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/50"
                                        animate={{
                                            rotate: [0, -10, 10, 0],
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Flame size={24} className="text-white" />
                                    </motion.div>
                                    <div>
                                        <p className="text-sm text-red-300 font-bold mb-1">Plus Grosse Perte</p>
                                        <motion.p 
                                            className="text-2xl font-black text-red-400"
                                            key={biggestLoss}
                                            initial={{ scale: 1.3, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", stiffness: 200 }}
                                        >
                                            {biggestLoss > 0 ? `${formatMoney(biggestLoss)} 💸` : '- -'}
                                        </motion.p>
                                    </div>
                                </div>
                                <motion.div
                                    animate={{
                                        y: [0, 5, 0],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <TrendingDown size={32} className="text-red-400/50" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Jackpot Card - Thème adapté au Devil Mode */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className={`relative bg-black/30 backdrop-blur-2xl rounded-2xl p-1 border-2 border-transparent overflow-hidden transition-all duration-300 ${isDevilMode ? 'shadow-red-500/40' : 'shadow-yellow-500/30'}`}
                        whileHover={{ scale: 1.02, boxShadow: isDevilMode ? '0 0 30px rgba(239, 68, 68, 0.4)' : '0 0 30px rgba(139, 92, 246, 0.3)' }}
                    >
                        {/* ✨ NOUVEAU: Bordure animée */}
                        <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
                            style={{
                                border: '2px solid transparent',
                                background: isDevilMode 
                                    ? 'conic-gradient(from var(--angle), rgba(239, 68, 68, 0.5), rgba(255, 165, 0, 0.3), rgba(239, 68, 68, 0.5)) border-box'
                                    : 'conic-gradient(from var(--angle), rgba(234, 179, 8, 0.5), rgba(249, 115, 22, 0.3), rgba(234, 179, 8, 0.5)) border-box',
                                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                maskComposite: 'exclude',
                                '--angle': '0deg',
                            } as any}
                            animate={{ '--angle': '360deg' } as any}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        />
                        <div className={`relative z-10 p-5 rounded-lg h-full ${isDevilMode ? 'bg-gradient-to-br from-red-900/20 to-black/30' : 'bg-gradient-to-br from-yellow-900/20 to-black/30'}`}>

                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    className={`w-12 h-12 rounded-xl ${isDevilMode ? 'bg-gradient-to-br from-red-500 to-orange-600 shadow-red-500/50' : 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-yellow-500/50'} flex items-center justify-center shadow-lg transition-all duration-500`}
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Crown size={24} className="text-white" />
                                </motion.div>
                                <h3 className={`text-xl font-black ${isDevilMode ? 'text-red-400' : 'text-yellow-400'} transition-colors duration-500`}>JACKPOT GLOBAL</h3>
                            </div>
                            <motion.p 
                                className={`text-3xl font-black bg-clip-text text-transparent ${isDevilMode ? 'bg-gradient-to-r from-red-400 via-orange-400 to-red-400' : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400'} transition-all duration-500`}
                                key={jackpot}
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                            >
                                {formatMoney(jackpot)} 💎
                            </motion.p>
                            <motion.p 
                                className="text-xs text-gray-400 mt-2 font-semibold italic"
                                animate={{
                                    opacity: [0.6, 1, 0.6],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                Le jackpot est partagé et augmente pour tout le monde à chaque spin ! Qui gagnera le JACKPOT ??
                            </motion.p>
                            <motion.p 
                                className="text-xs text-gray-400 mt-2 font-semibold"
                                animate={{
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                Alignez 3x 7️⃣ pour gagner !
                            </motion.p>
                            
                            {/* Système d'onglets pour le classement */}
                            <div className={`mt-4 pt-4 border-t ${isDevilMode ? 'border-red-500/20' : 'border-yellow-500/20'} transition-colors duration-500`}>
                                {/* Onglets */}
                                <div className="flex gap-2 mb-3">
                                    {[
                                        { key: 'biggestWin' as const, label: 'Plus gros gain', icon: '💎' },
                                        { key: 'level' as const, label: 'Niveau', icon: '⭐' },
                                        { key: 'winCount' as const, label: 'Nombre de victoires', icon: '🏆' },
                                        { key: 'totalWins' as const, label: 'Gains total', icon: '💰' }
                                    ].map((tab, i) => (
                                        <motion.button
                                            key={tab.key}
                                            onClick={() => {
                                                setLeaderboardType(tab.key);
                                                loadTopWins(tab.key);
                                            }}
                                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                                leaderboardType === tab.key
                                                    ? isDevilMode ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/50' : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/50'
                                                    : isDevilMode ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20' : 'bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20'
                                            }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {tab.icon} {tab.label}
                                        </motion.button>
                                    ))}
                                </div>
                                
                                {/* Liste du classement (Top 20) */}
                                <div className={`max-h-[300px] overflow-y-auto space-y-2 pr-2 ${isDevilMode ? 'custom-scrollbar-devil' : 'custom-scrollbar'}`}>
                                    <AnimatePresence mode="wait">
                                        {topWins.length > 0 ? (
                                            topWins.slice(0, 20).map((player, index) => {
                                                // Déterminer la valeur à afficher selon le type de classement
                                                let displayValue = '';
                                                if (leaderboardType === 'biggestWin') {
                                                    displayValue = `${formatMoney(player.biggestWin)} 💰`;
                                                } else if (leaderboardType === 'winCount') {
                                                    displayValue = `${player.winCount || 0} 🏆`;
                                                } else if (leaderboardType === 'totalWins') {
                                                    displayValue = `${formatMoney(player.totalWins || 0)} 💰`;
                                                } else if (leaderboardType === 'level') {
                                                    displayValue = `Niv. ${player.level || 1}`;
                                                }
                                                
                                                return (
                                                    <motion.div
                                                        key={`${leaderboardType}-${player.username}-${index}`}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ delay: index * 0.03 }}
                                                        className={`flex items-center justify-between p-2 rounded-lg transition-colors duration-500 ${
                                                            index === 0 ? (isDevilMode ? 'bg-gradient-to-r from-red-500/30 to-orange-500/30 border border-red-500/50' : 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border border-yellow-500/50') :
                                                            index === 1 ? 'bg-gradient-to-r from-gray-300/20 to-gray-400/20 border border-gray-400/30' :
                                                            index === 2 ? 'bg-gradient-to-r from-orange-600/20 to-orange-700/20 border border-orange-600/30' :
                                                            (isDevilMode ? 'bg-red-500/5 border border-red-500/10' : 'bg-yellow-500/5 border border-yellow-500/10')
                                                        }`}
                                                        whileHover={{ scale: 1.02, x: 5 }}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black w-6">
                                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                                            </span>
                                                            <span className={`text-xs font-bold ${
                                                                index < 3 ? (isDevilMode ? 'text-red-300' : 'text-yellow-300') : 'text-gray-300'
                                                            }`}>
                                                                {player.username}
                                                            </span>
                                                        </div>
                                                        <span className={`text-xs font-black ${
                                                            index === 0 ? (isDevilMode ? 'text-red-400' : 'text-yellow-400') :
                                                            index === 1 ? 'text-gray-300' :
                                                            index === 2 ? 'text-orange-400' :
                                                            (isDevilMode ? 'text-orange-300' : 'text-purple-300')
                                                        }`}>
                                                            {displayValue}
                                                        </span>
                                                    </motion.div>
                                                );
                                            })
                                        ) : (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-xs text-gray-400 text-center py-4"
                                            >
                                                Aucun joueur dans ce classement
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>


                    {/* Jeton Exchange Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className={`relative bg-black/30 backdrop-blur-2xl rounded-2xl p-1 border-2 border-transparent overflow-hidden transition-all duration-300 ${isDevilMode ? 'shadow-red-500/40' : 'shadow-purple-500/30'}`}
                        whileHover={{ scale: 1.02, boxShadow: isDevilMode ? '0 0 30px rgba(239, 68, 68, 0.4)' : '0 0 30px rgba(139, 92, 246, 0.3)' }}
                    >
                        <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
                            style={{
                                border: '2px solid transparent',
                                background: isDevilMode 
                                    ? 'conic-gradient(from var(--angle), rgba(239, 68, 68, 0.5), rgba(255, 165, 0, 0.3), rgba(239, 68, 68, 0.5)) border-box'
                                    : 'conic-gradient(from var(--angle), rgba(139, 92, 246, 0.5), rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.5)) border-box',
                                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                maskComposite: 'exclude',
                                '--angle': '0deg',
                            } as any}
                            animate={{ '--angle': '360deg' } as any}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        />
                        <div className={`relative z-10 p-5 rounded-lg h-full ${isDevilMode ? 'bg-gradient-to-br from-red-900/20 to-black/30' : 'bg-gradient-to-br from-purple-900/20 to-black/30'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    className={`w-12 h-12 rounded-xl ${isDevilMode ? 'bg-gradient-to-br from-red-500 to-orange-600 shadow-red-500/50' : 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/50'} flex items-center justify-center shadow-lg transition-all duration-500`}
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Coins size={24} className="text-white" />
                                </motion.div>
                                <h3 className={`text-xl font-black ${isDevilMode ? 'text-red-400' : 'text-purple-400'} transition-colors duration-500`}>Échange de Jetons</h3>
                            </div>

                            <div className="space-y-4">
                                {/* Buy Jetons */}
                                <div>
                                    <p className="text-sm text-gray-400 mb-2">Acheter des Jetons (1000 💎 = 500 💰)</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            min={1}
                                            value={buyAmount}
                                            onChange={(e) => setBuyAmount(Number(e.target.value))}
                                            className="nyx-input flex-grow text-center font-bold text-lg"
                                            disabled={loadingExchange}
                                        />
                                        <motion.button
                                            onClick={handleBuyJetons}
                                            disabled={loadingExchange || buyAmount <= 0 || piecesBalance < Math.ceil(buyAmount * 0.5)}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                                                isDevilMode
                                                    ? 'bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 enabled:hover:scale-105'
                                                    : 'bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 enabled:hover:scale-105'
                                            }`}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Acheter
                                        </motion.button>
                                    </div>
                                        {buyAmount > 0 && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Coût: {formatMoney(Math.ceil(buyAmount * 0.5))} 💰
                                            </p>
                                        )}
                                    </div>

                                {/* Sell Jetons */}
                                <div>
                                    <p className="text-sm text-gray-400 mb-2">Vendre des Jetons (500,000💎 = 10,000 💰)</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            min={1}
                                            value={sellAmount}
                                            onChange={(e) => setSellAmount(Number(e.target.value))}
                                            className="nyx-input flex-grow text-center font-bold text-lg"
                                            disabled={loadingExchange}
                                        />
                                        <motion.button
                                            onClick={handleSellJetons}
                                            disabled={loadingExchange || sellAmount <= 0 || jetonsBalance < sellAmount}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                                                isDevilMode
                                                    ? 'bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 enabled:hover:scale-105'
                                                    : 'bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 enabled:hover:scale-105'
                                            }`}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Vendre
                                        </motion.button>
                                    </div>
                                            {sellAmount > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Gain: {formatMoney(Math.floor(sellAmount * 0.02))} 💰
                                                </p>
                                            )}
                                        </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Payouts Table */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`relative bg-black/30 backdrop-blur-2xl rounded-2xl p-1 border-2 border-transparent transition-shadow duration-500 overflow-hidden ${isDevilMode ? 'shadow-red-500/40' : 'shadow-purple-500/30'}`}
                    >
                        {/* ✨ NOUVEAU: Bordure animée */}
                        <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
                            style={{
                                border: '2px solid transparent',
                                background: isDevilMode 
                                    ? 'conic-gradient(from var(--angle), rgba(239, 68, 68, 0.5), rgba(159, 18, 57, 0.3), rgba(239, 68, 68, 0.5)) border-box'
                                    : 'conic-gradient(from var(--angle), rgba(139, 92, 246, 0.5), rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.5)) border-box',
                                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                maskComposite: 'exclude',
                                '--angle': '0deg',
                            } as any}
                            animate={{ '--angle': '360deg' } as any}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        />
                        <div className={`relative z-10 p-5 rounded-lg h-full ${isDevilMode ? 'bg-gradient-to-br from-red-900/20 to-black/30' : 'bg-gradient-to-br from-purple-900/20 to-black/30'}`}>

                            <div className="flex items-center gap-3 mb-4">
                            <motion.div
                                className={`w-10 h-10 rounded-xl ${isDevilMode ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/50' : 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/50'} flex items-center justify-center shadow-lg transition-all duration-500`}
                                animate={{
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Coins size={20} className="text-white" />
                            </motion.div>
                            <h3 className={`text-lg font-black ${isDevilMode ? 'text-red-300' : 'text-purple-300'} transition-colors duration-500`}>Gains {isDevilMode && '(x2)'}</h3>
                            </div>
                        <div className="space-y-2">
                            {Object.entries(PAYOUTS)
                                .sort(([, a], [, b]) => b - a)
                                .map(([symbol, multiplier], idx) => (
                                    <motion.div
                                        key={symbol}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + idx * 0.05, type: 'spring', stiffness: 200 }}
                                        className={`flex items-center justify-between p-3 bg-gradient-to-r ${isDevilMode ? 'from-red-500/10 border-red-500/20 hover:border-red-500/40' : 'from-purple-500/10 border-purple-500/20 hover:border-purple-500/40'} to-transparent rounded-xl border transition-all`}
                                        whileHover={{ scale: 1.03, x: 5 }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{symbol}</span>
                                            <span className="text-xs text-gray-400 font-semibold">x3</span>
                                        </div>
                                        <motion.span
                                            className={`text-sm font-black ${isDevilMode ? 'text-red-300' : 'text-purple-300'}`}
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            {multiplier}x
                                        </motion.span>
                                    </motion.div>
                                ))}
                        </div>
                        <motion.p
                            className="text-xs text-gray-500 mt-4 text-center font-semibold"
                            animate={{
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            2 symboles identiques = gain réduit
                        </motion.p>
                        </div>
                    </motion.div>
                    </motion.div>
                </div>
            </div>
            </div>
        </WithMaintenanceCheck>
    );
}

// ✨ NOUVEAU: Modale pour afficher la frise des niveaux et les récompenses
const LEVEL_REWARDS: { [level: number]: number } = {
    5: 5000,
    10: 10000,
    15: 15000,
    20: 20000,
    25: 25000,
    30: 30000,
    35: 35000,
    40: 40000,
    45: 45000,
    50: 50000,  
    55: 55000,
    60: 60000,
    65: 65000,
    70: 70000,
    75: 75000,
    80: 80000,
    85: 85000,
    90: 90000,
    95: 95000,
    100: 100000,
    105: 105000,
    110: 110000,
    115: 115000,
    120: 120000,
    125: 125000,
    130: 130000,
    135: 135000,
    140: 140000,
    150: 150000,
    160: 160000,
    170: 170000,
    180: 180000,
    190: 190000,
    200: 200000,
    210: 210000,
    220: 220000,
    230: 230000,
    240: 240000,
    250: 250000,
    260: 260000,
    270: 270000,    
    280: 280000,
    290: 290000,
    300: 300000,        
    310: 310000,    
    320: 320000,
    330: 330000,
    340: 340000,
    350: 350000,
    360: 360000,
    370: 370000,
    380: 380000,
    390: 390000,
    400: 400000,
    410: 410000,
    420: 420000,
    430: 430000,
    440: 440000,
    450: 450000,
    460: 460000,
    470: 470000,
    480: 480000,
    490: 490000,
    500: 500000,
};

const LevelModal = ({ onClose, currentLevel, claimedRewards, onClaim }: { onClose: () => void; currentLevel: number; claimedRewards: number[]; onClaim: (level: number, amount: number) => void; }) => {
    // ✨ NOUVEAU: Affichage progressif des niveaux
    const levels = useMemo(() => {
        const allLevels = Object.keys(LEVEL_REWARDS).map(Number);
        // Trouver le premier niveau de récompense non atteint
        const nextRewardIndex = allLevels.findIndex(l => l > currentLevel);

        // Si toutes les récompenses sont atteintes, tout afficher
        if (nextRewardIndex === -1) return allLevels;

        // Afficher les niveaux atteints + les 4 prochains paliers
        const levelsToShow = Math.min(allLevels.length, nextRewardIndex + 4);
        return allLevels.slice(0, levelsToShow);
    }, [currentLevel]);

    return (
        <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-gradient-to-br from-slate-900 to-black rounded-2xl p-8 border-2 border-purple-500/50 w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
            >
                <h2 className="text-3xl font-black text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">
                    Récompenses de Niveau
                </h2>
                <p className="text-center text-gray-400 mb-8">Montez de niveau en misant pour débloquer des récompenses exclusives !</p>

                <div className="flex-1 overflow-visible custom-scrollbar pr-4 -mr-4">
                    <div className="relative flex items-center justify-between h-full py-8">
                        {/* Ligne de progression */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700/50 rounded-full" style={{ transform: 'translateY(-50%)' }}>
                            <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: `${Math.min(100, (currentLevel / Math.max(...levels)) * 100)}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>

                        {/* Points de niveau */}
                        {levels.map((level, i) => {
                            const isUnlocked = currentLevel >= level;
                            const isClaimed = claimedRewards.includes(level);
                            const canClaim = isUnlocked && !isClaimed;

                            return (
                                <motion.div
                                    key={level} // ✨ MODIFIÉ: Ajout de padding pour agrandir la zone de survol
                                    className="relative flex flex-col items-center group pt-48 -mt-48"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                                >
                                    {/* Point sur la ligne */}
                                    <motion.div
                                        className={`relative w-8 h-8 rounded-full border-4 flex items-center justify-center font-bold transition-all duration-300 ${
                                            isUnlocked ? (canClaim ? 'bg-yellow-500 border-yellow-300 text-black' : 'bg-purple-600 border-purple-400 text-white') : 'bg-gray-800 border-gray-600 text-gray-500'
                                        }`}
                                        animate={currentLevel === level ? { scale: [1, 1.3, 1], boxShadow: '0 0 20px rgba(168, 85, 247, 0.8)' } : {}}
                                        transition={currentLevel === level ? { duration: 1.5, repeat: Infinity } : {}}
                                    >
                                        {/* ✨ NOUVEAU: Lueur dorée pour les récompenses à récupérer */}
                                        {canClaim && (
                                            <motion.div
                                                className="absolute -inset-1 rounded-full bg-yellow-400"
                                                animate={{
                                                    opacity: [0, 0.7, 0],
                                                    scale: [1, 1.5, 1],
                                                }}
                                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                            />
                                        )}
                                        {isClaimed ? '✓' : <Star size={16} />}
                                    </motion.div>

                                    {/* Label du niveau */}
                                    <div className={`mt-3 text-sm font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                                        Niv. {level}
                                    </div>

                                    {/* Tooltip/Popup de récompense */}
                                    <div className="absolute top-0 w-48 p-3 bg-slate-800 rounded-lg border border-slate-700 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20">
                                        <p className="text-lg font-bold text-yellow-400 mb-1">
                                            +{LEVEL_REWARDS[level].toLocaleString()} 💎
                                        </p>
                                        <p className="text-xs text-gray-400">Récompense du niveau {level}</p>
                                        {canClaim && (
                                            <motion.button
                                                onClick={() => onClaim(level, LEVEL_REWARDS[level])}
                                                className="mt-3 w-full px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-md hover:bg-green-500 transition-colors"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Récupérer
                                            </motion.button>
                                        )}
                                        {isClaimed && (
                                            <div className="mt-3 text-xs text-green-400 font-semibold">Récupéré</div>
                                        )}
                                        {!isUnlocked && (
                                            <div className="mt-3 text-xs text-gray-500 font-semibold">Verrouillé</div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-auto pt-6 text-center">
                    <motion.button
                        onClick={onClose}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/30 transition-all"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                        Fermer
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};