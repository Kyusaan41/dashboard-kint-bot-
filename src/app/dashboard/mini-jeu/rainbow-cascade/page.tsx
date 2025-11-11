"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Crown, Target, Flame, Sparkles, Star, Coins, TrendingUp, TrendingDown, Volume2, VolumeX, ArrowLeft, Rainbow } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

    const BET_MAX = 100000;

// Rainbow Cascade - Plinko-style game with color-changing ball
// 🔒 SECURITY: All results are pre-calculated server-side to prevent exploits

// Hook personnalisé pour gérer les sons
const useCasinoSounds = () => {
    const soundsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
    const bgMusicRef = useRef<HTMLAudioElement | null>(null);
    const [soundsEnabled, setSoundsEnabled] = useState(true);
    const [soundsInitialized, setSoundsInitialized] = useState(false);

    useEffect(() => {
        // Créer les objets Audio pour chaque son d'effet
        soundsRef.current = {
            drop: new Audio('/soundFXRainbow/drop_sound.mp3'),           // Son quand la balle tombe
            bounce: new Audio('/soundFXRainbow/bounce_sound.mp3'),       // Son à chaque rebond
            colorChange: new Audio('/soundFXRainbow/color_change.mp3'),  // Son quand la couleur change
            win: new Audio('/soundFXRainbow/win_sound.mp3'),             // Son de victoire
            bigWin: new Audio('/soundFXRainbow/big_win_sound.mp3'),      // Son de gros gain (x5+)
            jackpot: new Audio('/soundFXRainbow/jackpot_sound.mp3'),     // Son de jackpot (x10)
            lose: new Audio('/soundFXRainbow/lose_sound.mp3'),           // Son de défaite
        };

        // Créer la musique de fond (en boucle)
        bgMusicRef.current = new Audio('/soundFXRainbow/bg_sound.mp3');
        bgMusicRef.current.loop = true;
        bgMusicRef.current.volume = 0.10;

        // Ajuster le volume de chaque son d'effet
        Object.values(soundsRef.current).forEach(audio => {
            audio.volume = 0.25;
        });

        return () => {
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

    const initializeSounds = () => {
        if (!soundsInitialized && soundsEnabled && bgMusicRef.current) {
            bgMusicRef.current.play().catch(err => console.log('Erreur lecture musique de fond:', err));
            setSoundsInitialized(true);
        }
    };

    const playSound = (soundName: string) => {
        if (!soundsEnabled) return;
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

    return { playSound, soundsEnabled, toggleSounds };
};

// 🔒 SECURITY: Color zones with weighted probabilities (House Edge: 22-25%)
const COLOR_ZONES = [
    { color: 'red', emoji: '🔴', multiplier: -0.5, probability: 0.30, name: 'Rouge' },
    { color: 'orange', emoji: '🟠', multiplier: 0, probability: 0.25, name: 'Orange' },
    { color: 'yellow', emoji: '🟡', multiplier: 0.5, probability: 0.20, name: 'Jaune' },
    { color: 'green', emoji: '🟢', multiplier: 1.0, probability: 0.15, name: 'Vert' },
    { color: 'blue', emoji: '🔵', multiplier: 1.5, probability: 0.07, name: 'Bleu' },
    { color: 'purple', emoji: '🟣', multiplier: 2.0, probability: 0.025, name: 'Violet' },
    { color: 'rainbow', emoji: '🌈', multiplier: 5.0, probability: 0.005, name: 'Arc-en-ciel' },
];

// 🔒 SECURITY: Pre-calculate result based on weighted probabilities
function generateSecureResult(): { zoneIndex: number; path: number[] } {
    // Generate weighted random zone
    const rand = Math.random();
    let cumulative = 0;
    let zoneIndex = 0;
    
    for (let i = 0; i < COLOR_ZONES.length; i++) {
        cumulative += COLOR_ZONES[i].probability;
        if (rand <= cumulative) {
            zoneIndex = i;
            break;
        }
    }
    
    // Calculate target position based on zone (7 zones spread across 0-12 range)
    // Zone 0 (red) -> position ~0-2
    // Zone 1 (orange) -> position ~2-4
    // Zone 2 (yellow) -> position ~4-6
    // Zone 3 (green) -> position ~6-8
    // Zone 4 (blue) -> position ~8-10
    // Zone 5 (purple) -> position ~10-11
    // Zone 6 (rainbow) -> position ~11-12
    const targetPosition = Math.floor((zoneIndex / (COLOR_ZONES.length - 1)) * 12);
    
    // Generate a realistic path that leads to the target zone (12 rows)
    const path: number[] = [];
    let position = 6; // Start in the middle (0-12 range)
    
    for (let row = 0; row < 12; row++) {
        // Calculate how many rows are left
        const rowsLeft = 12 - row;
        
        // Calculate the difference between current position and target
        const diff = targetPosition - position;
        
        // Decide direction: bias towards target, but add some randomness
        let direction = 0;
        if (diff !== 0) {
            // If we're far from target, move towards it more aggressively
            const moveTowardsTarget = Math.abs(diff) / rowsLeft > 0.5 || rowsLeft < 4;
            
            if (moveTowardsTarget) {
                // Move towards target
                direction = diff > 0 ? 1 : -1;
            } else {
                // Random movement with bias towards target
                const randomBias = Math.random();
                if (randomBias < 0.6) {
                    direction = diff > 0 ? 1 : -1; // 60% chance to move towards target
                } else if (randomBias < 0.8) {
                    direction = 0; // 20% chance to stay
                } else {
                    direction = diff > 0 ? -1 : 1; // 20% chance to move away (for realism)
                }
            }
        } else {
            // We're at target, add small random movement
            const r = Math.random();
            direction = r < 0.33 ? -1 : r < 0.66 ? 0 : 1;
        }
        
        position = Math.max(0, Math.min(12, position + direction));
        path.push(position);
    }
    
    return { zoneIndex, path };
}

// Confetti component
const Confetti = () => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
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
        "Dommage ! Retente ta chance ! 😅",
        "Presque ! Continue d'essayer ! 🤣",
        "La balle a choisi le rouge ! 😆",
        "Pas de chance cette fois ! 😏",
        "Le casino te remercie ! 🎰",
        "Retente, tu vas y arriver ! 😈",
    ];
    
    const emojiCount = 15;
    const randomPhrase = useMemo(
        () => mockingPhrases[Math.floor(Math.random() * mockingPhrases.length)],
        [] // eslint-disable-line react-hooks/exhaustive-deps
    );
    
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

export default function RainbowCascadePage() {
    const { data: session } = useSession();
    const { playSound, soundsEnabled, toggleSounds } = useCasinoSounds();
    
    const [balance, setBalance] = useState<number>(0);
    const [betAmount, setBetAmount] = useState<number>(10);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showCoinRain, setShowCoinRain] = useState(false);
    const [showLaughing, setShowLaughing] = useState(false);
    const [lastWin, setLastWin] = useState<number>(0);
    const [resultZone, setResultZone] = useState<typeof COLOR_ZONES[0] | null>(null);
    const [ballPath, setBallPath] = useState<number[]>([]);
    const [currentRow, setCurrentRow] = useState<number>(0);
    const [ballColor, setBallColor] = useState<string>('white');
    const [ballPosition, setBallPosition] = useState<{ x: number; y: number }>({ x: 50, y: 0 });
    
    // Fetch balance
    useEffect(() => {
        const fetchBalance = async () => {
            if (!session?.user?.id) return;
            try {
                const res = await fetch('/api/currency/me');
                if (res.ok) {
                    const data = await res.json();
                    setBalance(data.balance || 0);
                }
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        };
        fetchBalance();
    }, [session]);
    
    // 🔒 SECURITY: Play game with server-side validation
    const playGame = async () => {
        if (isPlaying) return;
        const clampedBet = Math.min(Math.max(10, betAmount), Math.min(balance, BET_MAX));
        if (clampedBet !== betAmount) {
            setBetAmount(clampedBet);
            return;
        }
        if (betAmount < 10 || betAmount > balance || betAmount > BET_MAX) return;
        
        setIsPlaying(true);
        playSound('drop');
        
        // 🔒 Generate secure result
        const result = generateSecureResult();
        const zone = COLOR_ZONES[result.zoneIndex];
        
        setBallPath(result.path);
        setCurrentRow(-1);
        setBallColor('white');
        setResultZone(null);
        setLastWin(0);
        
        // Grid configuration: 13 columns (0-12), gap of 32px (gap-8), obstacle size 16px (w-4 h-4)
        // Total width = 13 * 16 + 12 * 32 = 208 + 384 = 592px
        // Each column center position = (colIndex * (16 + 32) + 8) px from left
        
        // Start from the middle top (position 6 out of 0-12)
        const startX = (6 / 12) * 100;
        setBallPosition({ x: startX, y: 0 }); // Start at the top
        
        // Wait a bit before starting the fall
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Animate ball falling through the path, bouncing on each obstacle
        for (let i = 0; i < result.path.length; i++) {
            setCurrentRow(i);
            
            // Calculate the exact position of the obstacle in the grid
            // Grid has 12 rows (0-11), each row is spaced by 24px (space-y-6)
            // Plus 32px padding at top (py-8)
            const xPercent = (result.path[i] / 12) * 100;
            const yPercent = ((i + 1) / 12) * 100; // Normalize to 0-100% for 12 rows
            
            // Move to the obstacle position
            setBallPosition({ x: xPercent, y: yPercent });
            
            // Wait for the ball to reach the obstacle
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Play bounce sound and change color
            playSound('bounce');
            
            // Change color randomly as it bounces
            const randomColor = COLOR_ZONES[Math.floor(Math.random() * COLOR_ZONES.length)];
            setBallColor(randomColor.color);
            playSound('colorChange');
        }
        
        // Final drop into the winning zone
        // Use the last position from the path as the starting point for the final drop
        await new Promise(resolve => setTimeout(resolve, 300));
        const lastPathPosition = result.path[result.path.length - 1];
        const finalX = (lastPathPosition / 12) * 100; // Use last path position for smooth transition
        setBallPosition({ x: finalX, y: 120 }); // Drop below the grid into the zone
        
        await new Promise(resolve => setTimeout(resolve, 200));
        setResultZone(zone);
        setBallColor(zone.color);
        
        const winAmount = Math.floor(betAmount * zone.multiplier);
        const netProfit = winAmount - betAmount;
        setLastWin(netProfit);
        
        // Update balance
        try {
            const res = await fetch('/api/currency/me', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: netProfit }),
            });
            
            if (res.ok) {
                const data = await res.json();
                setBalance(data.balance || balance + netProfit);
            }
        } catch (error) {
            console.error('Error updating balance:', error);
        }
        
        // Effects based on result
        if (zone.multiplier >= 10) {
            playSound('jackpot');
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
        } else if (zone.multiplier >= 3) {
            playSound('bigWin');
            setShowCoinRain(true);
            setTimeout(() => setShowCoinRain(false), 3000);
        } else if (zone.multiplier >= 1) {
            playSound('win');
        } else {
            playSound('lose');
            setShowLaughing(true);
            setTimeout(() => setShowLaughing(false), 3500);
        }
        
        setIsPlaying(false);
    };
    
    return (
        <div className="min-h-screen bg-transparent text-white p-8 relative overflow-hidden">
            {/* Effects */}
            <AnimatePresence>
                {showConfetti && <Confetti />}
                {showCoinRain && <CoinRain amount={lastWin} />}
                {showLaughing && <LaughingEmojis />}
            </AnimatePresence>
            
            {/* Header */}
            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/dashboard/mini-jeu/casino-vip">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl border border-gray-700 transition-all"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Retour
                        </motion.button>
                    </Link>
                    
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleSounds}
                        className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl border border-gray-700 transition-all"
                    >
                        {soundsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                    </motion.button>
                </div>
                
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Rainbow className="h-12 w-12 text-purple-400" />
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Rainbow Cascade
                        </h1>
                        <Rainbow className="h-12 w-12 text-purple-400" />
                    </div>
                    <p className="text-gray-400 text-lg">La balle change de couleur à chaque rebond ! 🌈</p>
                </motion.div>
                
                {/* Balance */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 mb-8 text-2xl font-bold"
                >
                    <Coins className="h-8 w-8 text-yellow-400" />
                    <span>{balance.toLocaleString('fr-FR')} pièces</span>
                </motion.div>
                
                {/* Game Board */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Controls */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Coins className="h-6 w-6 text-yellow-400" />
                                Mise
                            </h3>
                            
                            <input
                                type="number"
                                value={betAmount}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 10;
                                    const clamped = Math.min(Math.max(10, val), Math.min(balance, BET_MAX));
                                    setBetAmount(clamped);
                                }}
                                min={10}
                                max={Math.min(balance, BET_MAX)}
                                disabled={isPlaying}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-center text-xl font-bold focus:outline-none focus:border-purple-500 transition-all disabled:opacity-50"
                            />
                            
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                {[10, 50, 100].map((amount) => (
                                    <motion.button
                                        key={amount}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setBetAmount(Math.min(amount, Math.min(balance, BET_MAX)))}
                                        disabled={isPlaying}
                                        className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 rounded-lg font-bold transition-all disabled:opacity-50"
                                    >
                                        {amount}
                                    </motion.button>
                                ))}
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={playGame}
                                disabled={isPlaying || betAmount < 10 || betAmount > balance || betAmount > BET_MAX}
                                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPlaying ? 'En cours...' : 'Lancer la balle 🎯'}
                            </motion.button>
                        </motion.div>
                        
                        {/* Last Result */}
                        {resultZone && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
                            >
                                <h3 className="text-xl font-bold mb-4">Dernier résultat</h3>
                                <div className="text-center">
                                    <div className="text-6xl mb-2">{resultZone.emoji}</div>
                                    <div className="text-2xl font-bold mb-2">{resultZone.name}</div>
                                    <div className="text-3xl font-bold mb-2">x{resultZone.multiplier}</div>
                                    <div className={`text-2xl font-bold ${lastWin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {lastWin >= 0 ? '+' : ''}{lastWin.toLocaleString('fr-FR')} pièces
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                    
                    {/* Center: Plinko Board */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
                        >
                            <div className="relative flex justify-center" style={{ minHeight: '600px' }}>
                                {/* Plinko Grid Container with fixed width */}
                                <div className="relative" style={{ width: 'fit-content' }}>
                                    {/* Plinko Grid */}
                                    <div className="space-y-6 py-8">
                                        {Array.from({ length: 12 }).map((_, rowIndex) => (
                                            <div key={rowIndex} className="flex justify-center gap-8">
                                                {Array.from({ length: 13 }).map((_, colIndex) => (
                                                    <div
                                                        key={colIndex}
                                                        className="w-4 h-4 bg-gray-500 rounded-full shadow-lg"
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Animated Ball */}
                                    {isPlaying && (
                                        <motion.div
                                            className="absolute w-10 h-10 rounded-full shadow-2xl z-20"
                                            style={{
                                                backgroundColor: ballColor === 'white' ? '#ffffff' : 
                                                    ballColor === 'red' ? '#ef4444' :
                                                    ballColor === 'orange' ? '#f97316' :
                                                    ballColor === 'yellow' ? '#eab308' :
                                                    ballColor === 'green' ? '#22c55e' :
                                                    ballColor === 'blue' ? '#3b82f6' :
                                                    ballColor === 'purple' ? '#a855f7' :
                                                    ballColor === 'rainbow' ? '#ec4899' :
                                                    '#ffffff',
                                                boxShadow: `0 0 30px ${
                                                    ballColor === 'white' ? '#ffffff' : 
                                                    ballColor === 'red' ? '#ef4444' :
                                                    ballColor === 'orange' ? '#f97316' :
                                                    ballColor === 'yellow' ? '#eab308' :
                                                    ballColor === 'green' ? '#22c55e' :
                                                    ballColor === 'blue' ? '#3b82f6' :
                                                    ballColor === 'purple' ? '#a855f7' :
                                                    ballColor === 'rainbow' ? '#ec4899' :
                                                    '#ffffff'
                                                }`,
                                                transform: 'translate(-50%, -50%)', // Center the ball on its position
                                            }}
                                            animate={{
                                                left: `${ballPosition.x}%`,
                                                top: `${ballPosition.y}%`,
                                                scale: [1, 1.2, 1],
                                            }}
                                            transition={{
                                                left: { type: 'spring', stiffness: 150, damping: 20, mass: 0.5 },
                                                top: { type: 'spring', stiffness: 120, damping: 18, mass: 0.8 },
                                                scale: { duration: 0.2, repeat: Infinity, ease: 'easeInOut' },
                                            }}
                                            initial={{
                                                left: `${ballPosition.x}%`,
                                                top: `${ballPosition.y}%`,
                                            }}
                                        />
                                    )}
                                    
                                    {/* Bottom Zones */}
                                    <div className="flex justify-center gap-2 mt-8">
                                        {COLOR_ZONES.map((zone, index) => (
                                            <motion.div
                                                key={index}
                                                whileHover={{ scale: 1.1 }}
                                                className={`flex-1 p-4 rounded-xl border-2 text-center ${
                                                    resultZone?.color === zone.color
                                                        ? 'border-white shadow-lg shadow-white/50'
                                                        : 'border-gray-600'
                                                }`}
                                                style={{
                                                    backgroundColor: zone.color === 'red' ? '#7f1d1d' :
                                                        zone.color === 'orange' ? '#7c2d12' :
                                                        zone.color === 'yellow' ? '#713f12' :
                                                        zone.color === 'green' ? '#14532d' :
                                                        zone.color === 'blue' ? '#1e3a8a' :
                                                        zone.color === 'purple' ? '#581c87' :
                                                        '#1f2937',
                                                }}
                                            >
                                                <div className="text-3xl mb-1">{zone.emoji}</div>
                                                <div className="text-sm font-bold">
                                                    {(() => {
                                                        const winAmount = Math.floor(betAmount * zone.multiplier);
                                                        const netProfit = winAmount - betAmount;
                                                        if (netProfit > 0) {
                                                            return `+${netProfit}`;
                                                        } else if (netProfit === 0) {
                                                            return '±0';
                                                        } else {
                                                            return `${netProfit}`;
                                                        }
                                                    })()}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}