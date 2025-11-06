"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Crown, Target, Flame, Sparkles, Star, Coins, TrendingUp, TrendingDown, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { CASINO_ENDPOINTS } from '@/config/api';
import Link from 'next/link';
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck';

// Slot Machine page using real currency via /api/currency/me

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
        if (!soundsInitialized && soundsEnabled && bgMusicRef.current) {
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
            sound.play().catch(err => console.log('Erreur lecture son:', err));
        }
    };

    const toggleSounds = () => {
        setSoundsEnabled(prev => {
            const newState = !prev;
            
            // Gérer la musique de fond
            if (bgMusicRef.current) {
                if (newState) {
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
        Object.values(soundsRef.current).forEach(audio => {
            audio.volume = 0.25 * volumeRatio;
        });
    };

    return { playSound, soundsEnabled, toggleSounds, masterVolume, changeVolume };
};

// Symboles de base et symboles "Devil Mode"
const NORMAL_SYMBOLS = ['🍒', '🍇', '🍊', '🍋', '💎', '💰', '7️⃣', '🍀'];
const DEVIL_SYMBOLS = ['🔥', '🔱', '😈', '💀', '💎', '💰', '7️⃣', '🍀']; // 💎, 💰, 7️⃣, 🍀 restent
const DEVIL_MODE_THRESHOLD = 100000; // Seuil pour activer le Devil Mode

type Reel = string[];

function randomReel(symbols: string[], length = 50) {
    return Array.from({ length }, () => symbols[Math.floor(Math.random() * symbols.length)]);
}

// NOUVEAUX multiplicateurs de gains pour un jeu plus équilibré
const PAYOUTS: { [symbol: string]: number } = {
    '7️⃣': 50,    // Jackpot (logique spéciale)
    '💎': 10,    // Réduit de 12 à 10
    '💰': 8,     // Réduit de 10 à 8
    '🍀': 6,     // Réduit de 8 à 6
    '🍒': 5,     // Réduit de 7 à 5
    '🍇': 4,     // Réduit de 6 à 4
    '🍊': 3,     // Réduit de 5 à 3
    '🍋': 2     // Réduit de 4 à 2
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

// Coin rain effect
const CoinRain = ({ amount }: { amount: number }) => {
    const coinCount = Math.min(Math.floor(amount / 10), 50);
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: coinCount }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute text-3xl"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: '-10%',
                    }}
                    initial={{ y: 0, opacity: 1, rotate: 0, scale: 0 }}
                    animate={{
                        y: window.innerHeight + 100,
                        opacity: [0, 1, 1, 0],
                        rotate: Math.random() * 720,
                        scale: [0, 1, 1, 0],
                        x: (Math.random() - 0.5) * 100,
                    }}
                    transition={{
                        duration: Math.random() * 1.5 + 1.5,
                        ease: 'easeIn',
                        delay: Math.random() * 0.3,
                    }}
                >
                    💰
                </motion.div>
            ))}
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
        () => Array.from({ length: emojiCount }).map(() => ({
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
                    duration: 3.5,
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
            <FlameParticle key={i} width={width} height={height} />
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
                transition={{ duration: 4, ease: 'easeInOut' }}
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
                transition={{ duration: 4, ease: 'easeOut' }}
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
                    <div className="text-3xl font-bold">4 Victoires Consécutives !</div>
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

export default function CasinoSlotPage() {
    const { data: session } = useSession();
    const { playSound, soundsEnabled, toggleSounds, masterVolume, changeVolume } = useCasinoSounds();
    const [balance, setBalance] = useState<number>(0);
    const [loadingBalance, setLoadingBalance] = useState<boolean>(true);
    const [bet, setBet] = useState<number>(10);
    const [reels, setReels] = useState<Reel[]>([
        randomReel(NORMAL_SYMBOLS, 50),
        randomReel(NORMAL_SYMBOLS, 50),
        randomReel(NORMAL_SYMBOLS, 50)
    ]);
    const [spinning, setSpinning] = useState(false);
    const [message, setMessage] = useState<string>('Bonne chance !');
    
    // Jackpot global (chargé depuis l'API)
    const [jackpot, setJackpot] = useState<number>(10000);
    const [jackpotLoading, setJackpotLoading] = useState<boolean>(true);
    
    // Top wins des joueurs
    const [topWins, setTopWins] = useState<Array<{ username: string; biggestWin: number; totalWins?: number; winCount?: number }>>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [leaderboardType, setLeaderboardType] = useState<'biggestWin' | 'winCount' | 'totalWins'>('biggestWin');
    
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

    // Avantage de la maison augmenté pour rendre le jeu plus difficile
    const HOUSE_EDGE = 0.10; // 10% au lieu de 15%, pour rendre le jeu un peu plus rentable

    // 😈 DEVIL MODE
    const [isDevilMode, setIsDevilMode] = useState(false);
    useEffect(() => {
        setIsDevilMode(bet >= DEVIL_MODE_THRESHOLD);
    }, [bet]);

    const SYMBOLS = isDevilMode ? DEVIL_SYMBOLS : NORMAL_SYMBOLS;

    useEffect(() => {
        return () => spinTimeouts.current.forEach((t) => clearTimeout(t));
    }, []);

    const setInitialReels = () => {
        const currentSymbols = isDevilMode ? DEVIL_SYMBOLS : NORMAL_SYMBOLS;
        setReels([randomReel(currentSymbols, 50), randomReel(currentSymbols, 50), randomReel(currentSymbols, 50)]);
    };

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
    const loadTopWins = async (type: 'biggestWin' | 'winCount' | 'totalWins' = 'biggestWin') => {
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
        setInitialReels();

        // Charger le solde
        (async () => {
            try {
                setLoadingBalance(true);
                const res = await fetch('/api/currency/me');
                if (res.ok) {
                    const data = await res.json();
                    if (typeof data.balance === 'number') setBalance(data.balance);
                } else {
                    console.warn('Impossible de récupérer le solde réel, status', res.status);
                }
            } catch (e) {
                console.error('Erreur fetch balance', e);
            } finally {
                setLoadingBalance(false);
            }
        })();

        // Charger le jackpot initial
        setJackpotLoading(true);
        loadJackpot();
        
        // Charger les top wins initial
        loadTopWins();
    }, []);

    // Polling automatique du jackpot toutes les 10 secondes
    useEffect(() => {
        const interval = setInterval(() => {
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

    const computeResult = (finalSymbols: string[], currentBet: number) => {
        const [s1, s2, s3] = finalSymbols;
        
        // DEBUG: Afficher les symboles finaux utilisés pour le calcul
        console.log('=== CALCUL DU RÉSULTAT ===');
        console.log('Symboles finaux:', finalSymbols);
        console.log(`s1=${s1}, s2=${s2}, s3=${s3}`);
        
        // 3 symboles identiques = GROS GAIN
        let finalAmount = 0;
        if (s1 === s2 && s2 === s3) {
            const multiplier = PAYOUTS[s1] || 1;
            
            // JACKPOT avec 7️⃣
            if (s1 === '7️⃣') {
                return { win: true, amount: Math.max(jackpot, currentBet * multiplier), isJackpot: true, lineType: 'three' as const };
            }
            
            // Gain normal avec 3 symboles identiques
            // On garantit au minimum le double de la mise
            const baseAmount = Math.floor(currentBet * multiplier * (1 - HOUSE_EDGE));
            finalAmount = Math.max(currentBet * 2, baseAmount);

            // --- SÉCURITÉ ANTI GROS GAINS ---
            // On plafonne le gain maximum pour une victoire normale (non-jackpot)
            // Par exemple, à 50 fois la mise. Ajustez cette valeur si besoin.
            const maxWinMultiplier = 50;
            finalAmount = Math.min(finalAmount, currentBet * maxWinMultiplier);

            return { win: true, amount: finalAmount, isJackpot: false, lineType: 'three' as const };
        }

        // 2 symboles identiques = PETIT GAIN
        if (s1 === s2 || s2 === s3 || s1 === s3) {
            const sym = s1 === s2 ? s1 : s2 === s3 ? s2 : s1 === s3 ? s1 : s2;

            // En Devil Mode, le gain de base pour 2 symboles est encore plus faible (division par 4)
            const divisor = isDevilMode ? 4 : 2;
            const multiplier = PAYOUTS[sym] ? Math.max(1, Math.floor(PAYOUTS[sym] / divisor)) : 1;
            
            // Déterminer le type de ligne selon les symboles qui matchent
            let lineType: 'two-left' | 'two-middle' | 'two-right' = 'two-left';
            if (s1 === s2) lineType = 'two-left';
            else if (s2 === s3) lineType = 'two-middle';
            else if (s1 === s3) lineType = 'two-right';
            
            // On garantit au minimum 120% de la mise pour que ça soit rentable
            const baseAmount = Math.floor(currentBet * multiplier * (1 - HOUSE_EDGE));
            finalAmount = Math.max(Math.floor(currentBet * 1.2), baseAmount);

            // --- SÉCURITÉ ANTI GROS GAINS ---
            // On plafonne aussi les petits gains pour éviter les abus sur les grosses mises.
            // Par exemple, à 5 fois la mise pour une ligne de 2 symboles.
            const maxSmallWinMultiplier = 5;
            finalAmount = Math.min(finalAmount, currentBet * maxSmallWinMultiplier);

            return { win: true, amount: finalAmount, isJackpot: false, lineType };
        }

        // Aucun symbole identique = PERTE
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
        setTimeout(() => setShowLaughingEmojis(false), 4000);
    };

    const handleSpin = async () => {
        if (spinning) return;
        if (bet <= 0) {
            setMessage('Mise invalide');
            return;
        }

        setReelsStopped([false, false, false]);
        setWinningLineType(null); // Reset winning line

        // Jouer le son de spin
        playSound('spin');

        // 🎰 FREE SPIN: Vérifier si on utilise un free spin
        let isUsingFreeSpin = false;
        if (freeSpins > 0) {
            isUsingFreeSpin = true;
            setFreeSpins(prev => prev - 1);
            setIsFreeSpinMode(true);
            
            // Si c'était le dernier free spin, désactiver le mode après ce spin
            if (freeSpins === 1) {
                setTimeout(() => setIsFreeSpinMode(false), 5000);
            }
        }

        // Reserve funds server-side: deduct bet before spinning (sauf en free spin)
        try {
            setSpinning(true);
            
            if (isUsingFreeSpin) {
                setMessage('🎁 TOUR GRATUIT EN COURS...');
            } else {
                setMessage('🎰 Mise en cours...');
                
                const reserve = await fetch('/api/currency/me', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: -Math.abs(bet) })
                });

                if (reserve.ok) {
                    const json = await reserve.json();
                    if (typeof json.balance === 'number') setBalance(json.balance);
                } else {
                    setBalance((b) => b - bet);
                }
            }
        } catch (e) {
            console.error('Erreur réservation:', e);
            if (!isUsingFreeSpin) {
                setBalance((b) => b - bet);
            }
        }

        const makeWeightedReel = () => {
            const reel: string[] = [];
            const reelLength = 50;
            const finalSymbolIndex = reelLength - 13; // L'index du symbole qui s'arrête sur la ligne

            // D'abord, on remplit la roue avec des symboles aléatoires pour l'animation
            for (let i = 0; i < reelLength; i++) {
                reel.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
            }

            // Ensuite, on choisit le symbole final (celui qui compte) en fonction des probabilités
            const r = Math.random() * 1000; // 0-1000 pour des pourcentages plus précis
            let finalSymbol = '🍋'; // Symbole par défaut

            if (isDevilMode) {
                // Probabilités plus difficiles en Devil Mode
                if (r < 2) { finalSymbol = '7️⃣'; } // 0.2%
                else if (r < 52) { finalSymbol = '💎'; } // 5%
                else if (r < 122) { finalSymbol = '💰'; } // 7%
                else if (r < 222) { finalSymbol = '🍀'; } // 10%
                else if (r < 422) { finalSymbol = '💀'; } // 20%
                else if (r < 622) { finalSymbol = '😈'; } // 20%
                else if (r < 822) { finalSymbol = '🔱'; } // 20%
                else { finalSymbol = '🔥'; } // 17.8%
            } else {
                // Probabilités normales
                if (r < 3) { // 0.3% de chance
                    finalSymbol = '7️⃣';
                } else if (r < 83) { // 8% de chance
                    finalSymbol = '💎';
                } else if (r < 183) { // 10% de chance
                    finalSymbol = '💰';
                } else if (r < 303) { // 12% de chance
                    finalSymbol = '🍀';
                } else if (r < 483) { // 18% de chance
                    finalSymbol = '🍒';
                } else if (r < 663) { // 18% de chance
                    finalSymbol = '🍇';
                } else if (r < 833) { // 17% de chance
                    finalSymbol = '🍊';
                }
            }

            // On place le symbole final à la bonne position dans la roue
            reel[finalSymbolIndex] = finalSymbol;
            
            return reel;
        };

        const newReels = [makeWeightedReel(), makeWeightedReel(), makeWeightedReel()];
        setReels(newReels);

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
                        const result = computeResult(finalSymbols as string[], bet);
                        if (result.win) {
                            // Show winning line
                            if (result.lineType) {
                                setWinningLineType(result.lineType);
                                setTimeout(() => setWinningLineType(null), 4000); // Hide after 4 seconds
                            }
                            
                            if (result.amount > biggestWin) {
                                setBiggestWin(result.amount);
                            }
                            
                            // Enregistrer le gain dans l'API
                            const username = session?.user?.name || session?.user?.email?.split('@')[0] || 'Joueur';
                            console.log('[CASINO] Enregistrement gain:', username, result.amount, 'Jackpot:', result.isJackpot);
                            recordWin(username, result.amount, result.isJackpot);
                            
                            if (result.isJackpot) {
                                // Jouer le son de jackpot
                                playSound('jackpot');
                                
                                setMessage(`🎉 JACKPOT! +${result.amount} Pièces 🎉`);
                                setShowConfetti(true);
                                setTimeout(() => setShowConfetti(false), 8000);
                                
                                // Réinitialiser le jackpot global via l'API NyxNode
                                try {
                                    const resetRes = await fetch(CASINO_ENDPOINTS.jackpotReset, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ 
                                            winner: 'Player', // Vous pouvez ajouter le nom du joueur ici
                                            winAmount: result.amount 
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
                                
                                triggerWinAnimation(result.amount);
                            } else {
                                // Jouer le son approprié selon le type de victoire
                                if (result.lineType === 'three') {
                                    // 3 symboles alignés (mais pas jackpot)
                                    playSound('sequence3');
                                } else {
                                    // 2 symboles alignés
                                    playSound('win');
                                }
                                
                                setMessage(`✨ Gagné +${result.amount} Pièces ✨`);
                                // Le jackpot ne descend JAMAIS sur un gain normal
                                triggerWinAnimation(result.amount);
                            }

                            // 🎰 FREE SPIN: Incrémenter le win streak
                            setWinStreak(prev => {
                                const newStreak = prev + 1;
                                
                                // Si on atteint 4 victoires consécutives, débloquer 3 free spins
                                if (newStreak === 4) {
                                    setFreeSpins(prevSpins => prevSpins + 3);
                                    setShowFreeSpinUnlock(true);
                                    playSound('sequence3'); // Son spécial pour le déblocage
                                    setTimeout(() => setShowFreeSpinUnlock(false), 4000);
                                    return 0; // Reset le streak après déblocage
                                }
                                
                                return newStreak;
                            });

                            try {
                                const post = await fetch('/api/currency/me', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ amount: result.amount })
                                });
                                if (post.ok) {
                                    const j = await post.json();
                                    if (typeof j.balance === 'number') setBalance(j.balance);
                                } else {
                                    setBalance((b) => b + result.amount);
                                }
                            } catch (e) {
                                console.error('Erreur crédit gain:', e);
                                setBalance((b) => b + result.amount);
                            }
                        } else {
                            // Jouer le son de défaite
                            playSound('lose');
                            
                            // 🎰 FREE SPIN: Reset le win streak en cas de défaite
                            setWinStreak(0);
                            
                            if (bet > biggestLoss) {
                                setBiggestLoss(bet);
                            }
                            
                            setMessage('💔 Perdu...');
                            
                            // Augmenter le jackpot global via l'API NyxNode (50% de la mise)
                            const jackpotIncrease = Math.max(1, Math.floor(bet * 0.5));
                            try {
                                const increaseRes = await fetch(CASINO_ENDPOINTS.jackpotIncrease, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ amount: jackpotIncrease })
                                });
                                if (increaseRes.ok) {
                                    const data = await increaseRes.json();
                                    setJackpot(data.newAmount);
                                } else {
                                    setJackpot((j) => j + jackpotIncrease); // Fallback
                                }
                            } catch (e) {
                                console.error('Erreur augmentation jackpot:', e);
                                setJackpot((j) => j + jackpotIncrease); // Fallback
                            }
                            
                            triggerLoseAnimation();
                        }
                    }, 600);
                }
            }, d);
            spinTimeouts.current.push(t);
        });
    };

    const formatMoney = (n: number) => n.toLocaleString('fr-FR');

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
                            y: [-64, -832]  // Animation de -64px à -832px (768px de défilement = 12 symboles)
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
            <div className="min-h-screen w-full text-white p-4 md:p-8 relative overflow-hidden">
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
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Retour au Carré VIP
                        </motion.button>
                    </Link>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 items-start relative z-10">
                {/* Main Slot Machine */}
                <motion.div 
                    // Effet d'aberration chromatique en Devil Mode
                    className={`lg:col-span-3 futuristic-card rounded-3xl p-6 md:p-8 ${isDevilMode ? 'devil-chromatic-aberration' : ''} relative overflow-hidden`}
                    animate={isDevilMode ? {
                        x: spinning ? [0, -1, 1, -2, 2, -1, 1, 0] : 0,
                        y: spinning ? [0, 1, -1, 2, -2, 1, -1, 0] : 0,
                        rotate: spinning ? [0, 0.1, -0.1, 0.2, -0.2, 0.1, -0.1, 0] : 0,
                        boxShadow: [
                            "0 0 40px rgba(239, 68, 68, 0.4), 0 0 60px rgba(239, 68, 68, 0.2)",
                            "0 0 60px rgba(239, 68, 68, 0.6), 0 0 90px rgba(239, 68, 68, 0.3)",
                            "0 0 40px rgba(239, 68, 68, 0.4), 0 0 60px rgba(239, 68, 68, 0.2)",
                        ]
                    } : { 
                        x: 0, y: 0, rotate: 0,
                        boxShadow: "0 0 40px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.15)" 
                    }}
                    transition={{
                        x: { duration: 0.4, repeat: Infinity },
                        y: { duration: 0.4, repeat: Infinity },
                        rotate: { duration: 0.4, repeat: Infinity },
                        boxShadow: { duration: 3, repeat: isDevilMode ? Infinity : 0, ease: 'easeInOut' }
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
                                        🔥 Série: {winStreak}/4
                                    </p>
                                </motion.div>
                                
                                {/* Free Spins Counter */}
                                {freeSpins > 0 && (
                                    <motion.div
                                        className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-yellow-500/40"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{
                                            scale: 1,
                                            opacity: 1,
                                            borderColor: ['rgba(234, 179, 8, 0.4)', 'rgba(234, 179, 8, 0.8)', 'rgba(234, 179, 8, 0.4)'],
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
                                )}
                            </div>
                            
                            <motion.div
                                className="text-right"
                                animate={loadingBalance ? { opacity: [0.5, 1, 0.5] } : {}}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <p className="text-sm text-gray-400 font-semibold mb-1">Solde</p>
                                <motion.p 
                                    className="text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent"
                                    key={balance}
                                    initial={{ scale: 1.2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {formatMoney(balance)} 💰
                                </motion.p>
                            </motion.div>
                            
                            {/* Sound Control with Volume Slider */}
                            <div className="flex items-center gap-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-500/30 shadow-lg">
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
                                            [&::-webkit-slider-thumb]:appearance-none
                                            [&::-webkit-slider-thumb]:w-4
                                            [&::-webkit-slider-thumb]:h-4
                                            ${isDevilMode 
                                                ? '[&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-red-400 [&::-webkit-slider-thumb]:to-red-600 [&::-webkit-slider-thumb]:shadow-red-500/50' 
                                                : '[&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-purple-400 [&::-webkit-slider-thumb]:to-purple-600 [&::-webkit-slider-thumb]:shadow-purple-500/50'
                                            }
                                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110
                                            [&::-moz-range-thumb]:w-4
                                            [&::-moz-range-thumb]:h-4
                                            [&::-moz-range-thumb]:rounded-full
                                            ${isDevilMode
                                                ? '[&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-red-400 [&::-moz-range-thumb]:to-red-600'
                                                : '[&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-purple-400 [&::-moz-range-thumb]:to-purple-600'
                                            }
                                            [&::-moz-range-thumb]:border-0
                                            [&::-moz-range-thumb]:cursor-pointer
                                            [&::-moz-range-thumb]:shadow-lg
                                            [&::-moz-range-thumb]:shadow-purple-500/50"
                                        style={{
                                            background: soundsEnabled 
                                                ? `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${masterVolume}%, rgb(55, 65, 81) ${masterVolume}%, rgb(55, 65, 81) 100%)`
                                                : 'rgb(55, 65, 81)',
                                        }}
                                    />
                                    <span className={`text-xs font-medium min-w-[2rem] text-right ${
                                        soundsEnabled ? (isDevilMode ? 'text-red-400' : 'text-purple-400') : 'text-gray-500'
                                    }`}>
                                        {masterVolume}%
                                    </span>
                                </div>
                            </div>
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
                        <motion.div className={`relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 border-4 ${isDevilMode ? 'border-red-500/30' : 'border-purple-500/30'} shadow-2xl transition-colors duration-500`}>
                            {/* Top decorative bar */}
                            <motion.div 
                                className={`absolute -top-6 left-1/2 transform -translate-x-1/2 ${isDevilMode ? 'bg-gradient-to-r from-red-600 via-red-500 to-red-600 border-red-400/50 shadow-red-500/50' : 'bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 border-purple-400/50 shadow-purple-500/50'} px-8 py-3 rounded-full border-4 shadow-lg transition-all duration-500`}
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
                            
                            {/* Reels */}
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
                                    className={`inline-block px-8 py-4 rounded-2xl font-black text-xl md:text-2xl shadow-lg ${
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
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                                <motion.div
                                    className={`flex items-center gap-3 bg-gradient-to-br from-gray-900/90 to-gray-800/90 px-6 py-4 rounded-2xl border-2 ${isDevilMode ? 'border-red-500/30' : 'border-purple-500/30'} shadow-lg backdrop-blur-sm transition-colors duration-500`}
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
                                        max={Math.max(1, balance)}
                                        value={bet}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '') {
                                                setBet(0);
                                                return;
                                            }
                                            const numValue = Number(value);
                                            if (!isNaN(numValue)) {
                                                setBet(numValue);
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const numValue = Number(e.target.value);
                                            if (isNaN(numValue) || numValue < 1) {
                                                setBet(1);
                                            } else if (numValue > balance) {
                                                setBet(Math.max(1, balance));
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

                                <motion.button
                                    onClick={handleSpin}
                                    disabled={spinning || loadingBalance || bet > balance}
                                    className={`relative px-12 py-5 rounded-2xl font-black text-xl shadow-2xl flex items-center gap-3 overflow-hidden transition-all duration-300 ${
                                        spinning 
                                            ? 'bg-gray-700 cursor-not-allowed'
                                            : bet > balance
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
                                    {!spinning && (
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
                        </motion.div>
                    </motion.div>

                    {/* Statistics Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {/* Biggest Win */}
                        <motion.div
                            className="relative bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-emerald-500/10 rounded-2xl p-6 border-2 border-emerald-500/30 shadow-lg overflow-hidden"
                            whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.5)' }}
                            animate={biggestWin > 0 ? {
                                boxShadow: [
                                    '0 0 20px rgba(16, 185, 129, 0.2)',
                                    '0 0 30px rgba(16, 185, 129, 0.4)',
                                    '0 0 20px rgba(16, 185, 129, 0.2)',
                                ],
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <motion.div
                                className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
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
                            className="relative bg-gradient-to-br from-red-500/10 via-red-600/5 to-red-500/10 rounded-2xl p-6 border-2 border-red-500/30 shadow-lg overflow-hidden"
                            whileHover={{ scale: 1.02, borderColor: 'rgba(239, 68, 68, 0.5)' }}
                            animate={biggestLoss > 0 ? {
                                boxShadow: [
                                    '0 0 20px rgba(239, 68, 68, 0.2)',
                                    '0 0 30px rgba(239, 68, 68, 0.4)',
                                    '0 0 20px rgba(239, 68, 68, 0.2)',
                                ],
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <motion.div
                                className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                            />
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
                        className={`futuristic-card rounded-2xl p-6 ${isDevilMode ? 'shadow-red hover:border-red-500/50' : 'shadow-purple hover:border-purple-500/50'} relative overflow-hidden transition-all duration-300`}
                        whileHover={{ scale: 1.02, boxShadow: isDevilMode ? '0 0 30px rgba(239, 68, 68, 0.4)' : '0 0 30px rgba(139, 92, 246, 0.3)' }}
                    >
                        <motion.div
                            className={`absolute inset-0 ${isDevilMode ? 'bg-gradient-to-br from-red-500/10 to-orange-600/10' : 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10'}`}
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    className={`w-12 h-12 rounded-xl ${isDevilMode ? 'bg-gradient-to-br from-red-500 to-orange-600 shadow-red-500/50' : 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-yellow-500/50'} flex items-center justify-center shadow-lg transition-all duration-500`}
                                    animate={{
                                        rotate: [0, 360],
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                                        scale: { duration: 1, repeat: Infinity },
                                    }}
                                >
                                    <Crown size={24} className="text-white" />
                                </motion.div>
                                <h3 className={`text-xl font-black ${isDevilMode ? 'text-red-400' : 'text-yellow-400'} transition-colors duration-500`}>JACKPOT</h3>
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
                                        { key: 'winCount' as const, label: 'Nombre de victoires', icon: '🏆' },
                                        { key: 'totalWins' as const, label: 'Gains total', icon: '💰' }
                                    ].map((tab) => (
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
                    </motion.div>

                    {/* Payouts Table */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`futuristic-card rounded-2xl p-6 ${isDevilMode ? 'shadow-red hover:border-red-500/50' : 'shadow-purple hover:border-purple-500/50'} transition-shadow duration-500`}
                    >
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
                                        transition={{ delay: 0.5 + idx * 0.05 }}
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
                    </motion.div>
                </div>
            </div>
            </div>
        </WithMaintenanceCheck>
    );
}
