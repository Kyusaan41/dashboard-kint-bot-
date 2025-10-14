"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, TrendingUp, Flame, Zap, Volume2, VolumeX, ArrowLeft, Trophy, Target, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// Crash Game - Le multiplicateur monte jusqu'au crash !
// Using real currency via /api/currency/me

// Hook pour gérer les sons du Crash Game
const useCrashSounds = () => {
    const soundsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
    const bgMusicRef = useRef<HTMLAudioElement | null>(null);
    const [soundsEnabled, setSoundsEnabled] = useState(true);
    const [soundsInitialized, setSoundsInitialized] = useState(false);

    useEffect(() => {
        // Créer les objets Audio pour chaque son
        // Les fichiers doivent être placés dans /public/soundFXCasino/
        soundsRef.current = {
            bet: new Audio('/soundFXCasino/spin_sound.mp3'),           // Son quand on place une mise
            rising: new Audio('/soundFXCasino/reel_stop.mp3'),         // Son pendant la montée (en boucle)
            cashout: new Audio('/soundFXCasino/win_sound.mp3'),        // Son quand on cash out
            crash: new Audio('/soundFXCasino/lose_sound.mp3'),         // Son du crash
            bigwin: new Audio('/soundFXCasino/jackpot_sound.mp3'),     // Son pour gros gains (x10+)
        };

        // Musique de fond
        bgMusicRef.current = new Audio('/soundFXCasino/bg_sound.mp3');
        bgMusicRef.current.loop = true;
        bgMusicRef.current.volume = 0.08;

        Object.values(soundsRef.current).forEach(audio => {
            audio.volume = 0.3;
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
            bgMusicRef.current.play().catch(err => console.log('Erreur lecture musique:', err));
            setSoundsInitialized(true);
        }
    };

    const playSound = (soundName: string, loop = false) => {
        if (!soundsEnabled) return;
        
        initializeSounds();
        
        const sound = soundsRef.current[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.loop = loop;
            sound.play().catch(err => console.log('Erreur lecture son:', err));
        }
    };

    const stopSound = (soundName: string) => {
        const sound = soundsRef.current[soundName];
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
            sound.loop = false;
        }
    };

    const toggleSounds = () => {
        setSoundsEnabled(prev => {
            const newState = !prev;
            
            if (bgMusicRef.current) {
                if (newState) {
                    bgMusicRef.current.play().catch(err => console.log('Erreur lecture musique:', err));
                    setSoundsInitialized(true);
                } else {
                    bgMusicRef.current.pause();
                }
            }
            
            return newState;
        });
    };

    return { playSound, stopSound, soundsEnabled, toggleSounds };
};

// Composant d'explosion au crash
const CrashExplosion = () => {
    const colors = ['#ef4444', '#f97316', '#fbbf24', '#fb923c'];
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 80 }).map((_, i) => {
                const angle = (i / 80) * Math.PI * 2;
                const distance = 100 + Math.random() * 200;
                const xOffset = Math.cos(angle) * distance;
                const yOffset = Math.sin(angle) * distance;
                
                return (
                    <motion.div
                        key={i}
                        className="absolute w-3 h-3 rounded-full"
                        style={{
                            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                            left: '50%',
                            top: '50%',
                        }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                            x: xOffset,
                            y: yOffset,
                            opacity: [1, 1, 0],
                            scale: [1, 1.5, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            ease: 'easeOut',
                        }}
                    />
                );
            })}
            
            {/* Message CRASHED */}
            <motion.div
                className="absolute text-6xl font-black text-red-500"
                style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    textShadow: '0 0 30px rgba(239, 68, 68, 0.8)',
                }}
                initial={{ opacity: 0, scale: 0, rotate: -20 }}
                animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.5, 1.3, 1],
                    rotate: [-20, 5, -5, 0],
                }}
                transition={{
                    duration: 2,
                    ease: 'easeOut',
                }}
            >
                💥 CRASHED! 💥
            </motion.div>
        </div>
    );
};

// Composant de célébration pour cash out
const CashOutCelebration = ({ multiplier }: { multiplier: number }) => {
    const isBigWin = multiplier >= 10;
    
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: isBigWin ? 60 : 30 }).map((_, i) => (
                <motion.div
                    key={i}
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
                        scale: [0, 1, 1, 0],
                        x: (Math.random() - 0.5) * 100,
                    }}
                    transition={{
                        duration: Math.random() * 1.5 + 1.5,
                        ease: 'easeIn',
                        delay: Math.random() * 0.3,
                    }}
                >
                    {isBigWin ? '🎉' : '💰'}
                </motion.div>
            ))}
            
            {/* Message de gain */}
            <motion.div
                className={`absolute text-4xl font-black ${isBigWin ? 'text-yellow-400' : 'text-green-400'}`}
                style={{
                    left: '50%',
                    top: '40%',
                    transform: 'translate(-50%, -50%)',
                    textShadow: isBigWin ? '0 0 30px rgba(250, 204, 21, 0.8)' : '0 0 20px rgba(34, 197, 94, 0.6)',
                }}
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.3, 1.2, 1],
                    y: [0, -20, -40, -60],
                }}
                transition={{
                    duration: 2.5,
                    ease: 'easeOut',
                }}
            >
                {isBigWin ? '🚀 BIG WIN! 🚀' : '✅ CASH OUT! ✅'}
            </motion.div>
        </div>
    );
};



type GameState = 'WAITING' | 'RISING' | 'CRASHED' | 'CASHED_OUT';

export default function CrashGamePage() {
    const { data: session } = useSession();
    const [balance, setBalance] = useState<number>(0);
    const [loadingBalance, setLoadingBalance] = useState<boolean>(true);
    const [betAmount, setBetAmount] = useState<number>(50);
    const [gameState, setGameState] = useState<GameState>('WAITING');
    const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.00);
    const [crashPoint, setCrashPoint] = useState<number>(0);
    const [cashedOutAt, setCashedOutAt] = useState<number>(0);
    const [winAmount, setWinAmount] = useState<number>(0);
    const [showExplosion, setShowExplosion] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [history, setHistory] = useState<number[]>([]);
    const [message, setMessage] = useState<string>('');
    
    const { playSound, stopSound, soundsEnabled, toggleSounds } = useCrashSounds();
    const animationFrameRef = useRef<number>();

    // Charger le solde depuis l'API currency
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                setLoadingBalance(true);
                const res = await fetch('/api/currency/me');
                if (res.ok) {
                    const data = await res.json();
                    if (typeof data.balance === 'number') {
                        setBalance(data.balance);
                    }
                } else {
                    console.warn('Impossible de récupérer le solde, status:', res.status);
                }
            } catch (error) {
                console.error('Erreur chargement solde:', error);
            } finally {
                setLoadingBalance(false);
            }
        };
        fetchBalance();
    }, []);

    // Générer un point de crash aléatoire (entre 1.01x et 100x)
    const generateCrashPoint = () => {
        // Distribution: 
        // 50% entre 1.01 et 2.00
        // 30% entre 2.00 et 5.00
        // 15% entre 5.00 et 10.00
        // 5% entre 10.00 et 100.00
        const rand = Math.random();
        
        if (rand < 0.5) {
            return 1.01 + Math.random() * 0.99; // 1.01 - 2.00
        } else if (rand < 0.8) {
            return 2.00 + Math.random() * 3.00; // 2.00 - 5.00
        } else if (rand < 0.95) {
            return 5.00 + Math.random() * 5.00; // 5.00 - 10.00
        } else {
            return 10.00 + Math.random() * 90.00; // 10.00 - 100.00
        }
    };

    // Démarrer le jeu
    const startGame = async () => {
        if (betAmount < 10) {
            setMessage('❌ Mise minimum: 10 pièces');
            return;
        }
        if (betAmount > balance) {
            setMessage('❌ Solde insuffisant');
            return;
        }

        // Déduire la mise via l'API currency
        try {
            setMessage('🚀 Mise en cours...');
            
            const res = await fetch('/api/currency/me', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: -Math.abs(betAmount) }),
            });

            if (res.ok) {
                const data = await res.json();
                if (typeof data.balance === 'number') {
                    setBalance(data.balance);
                }
            } else {
                // Fallback: déduire localement
                setBalance((b) => b - betAmount);
            }
        } catch (error) {
            console.error('Erreur mise:', error);
            // Fallback: déduire localement
            setBalance((b) => b - betAmount);
        }

        playSound('bet');
        setMessage('');
        setGameState('RISING');
        setCurrentMultiplier(1.00);
        setCashedOutAt(0);
        setWinAmount(0);
        setShowExplosion(false);
        setShowCelebration(false);
        
        const crash = generateCrashPoint();
        setCrashPoint(crash);
        
        // Animation de montée
        const startTime = Date.now();
        const duration = crash * 1000; // 1 seconde par multiplicateur
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                // CRASH!
                setCurrentMultiplier(crash);
                setGameState('CRASHED');
                stopSound('rising');
                playSound('crash');
                setShowExplosion(true);
                setMessage(`💥 CRASHED à ${crash.toFixed(2)}x ! Vous avez perdu ${betAmount} pièces.`);
                setHistory(prev => [crash, ...prev.slice(0, 9)]);
                return;
            }
            
            const newMultiplier = 1.00 + (crash - 1.00) * progress;
            setCurrentMultiplier(newMultiplier);
            
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        
        animate();
    };

    // Cash out
    const cashOut = async () => {
        if (gameState !== 'RISING') return;
        
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        
        setGameState('CASHED_OUT');
        setCashedOutAt(currentMultiplier);
        stopSound('rising');
        
        const win = Math.floor(betAmount * currentMultiplier);
        setWinAmount(win);
        
        // Ajouter les gains via l'API currency
        try {
            const res = await fetch('/api/currency/me', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: win }),
            });

            if (res.ok) {
                const data = await res.json();
                if (typeof data.balance === 'number') {
                    setBalance(data.balance);
                }
            } else {
                // Fallback: ajouter localement
                setBalance((b) => b + win);
            }
        } catch (error) {
            console.error('Erreur ajout gains:', error);
            // Fallback: ajouter localement
            setBalance((b) => b + win);
        }
        
        if (currentMultiplier >= 10) {
            playSound('bigwin');
        } else {
            playSound('cashout');
        }
        
        setShowCelebration(true);
        setMessage(`🎉 Cash out à ${currentMultiplier.toFixed(2)}x ! Vous avez gagné ${win} pièces !`);
        setHistory(prev => [currentMultiplier, ...prev.slice(0, 9)]);
    };

    // Nettoyer l'animation
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Couleur du multiplicateur selon la valeur
    const getMultiplierColor = () => {
        if (currentMultiplier < 2) return 'text-green-400';
        if (currentMultiplier < 5) return 'text-yellow-400';
        if (currentMultiplier < 10) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className="min-h-screen w-full text-white p-8 relative overflow-hidden">
            {/* Animations */}
            <AnimatePresence>
                {showExplosion && <CrashExplosion />}
                {showCelebration && <CashOutCelebration multiplier={cashedOutAt} />}
            </AnimatePresence>

            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
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

                    <div className="flex items-center gap-4">
                        <div className="px-6 py-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-2 border-yellow-500/50 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-400" />
                                <span className="text-yellow-300 font-bold">
                                    {loadingBalance ? 'Chargement...' : `${balance.toLocaleString()} pièces`}
                                </span>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleSounds}
                            className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700 transition-colors"
                        >
                            {soundsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Rocket className="h-12 w-12 text-orange-500" />
                        <h1 className="text-6xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                            CRASH GAME
                        </h1>
                        <Flame className="h-12 w-12 text-red-500" />
                    </div>
                    <p className="text-gray-400 text-lg">
                        Encaissez avant le crash ! Plus vous attendez, plus vous gagnez... 🚀
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Zone de jeu principale */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl border-2 border-gray-700/50 p-8 relative overflow-hidden"
                        >
                            {/* Background effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5" />
                            
                            {/* Multiplicateur géant */}
                            <div className="relative z-10 flex items-center justify-center h-96">
                                <motion.div
                                    animate={{
                                        scale: gameState === 'RISING' ? [1, 1.05, 1] : 1,
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: gameState === 'RISING' ? Infinity : 0,
                                    }}
                                    className="text-center"
                                >
                                    <motion.div
                                        className={`text-9xl font-black ${getMultiplierColor()} mb-4`}
                                        style={{
                                            textShadow: '0 0 40px currentColor',
                                        }}
                                        animate={{
                                            scale: gameState === 'CRASHED' ? [1, 0.8, 1.2, 0] : 1,
                                        }}
                                    >
                                        {currentMultiplier.toFixed(2)}x
                                    </motion.div>
                                    
                                    {gameState === 'RISING' && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center justify-center gap-2 text-2xl text-orange-400"
                                        >
                                            <TrendingUp className="h-8 w-8" />
                                            <span className="font-bold">EN COURS...</span>
                                            <Zap className="h-8 w-8" />
                                        </motion.div>
                                    )}
                                    
                                    {gameState === 'CRASHED' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-4xl text-red-500 font-black"
                                        >
                                            💥 CRASHED! 💥
                                        </motion.div>
                                    )}
                                    
                                    {gameState === 'CASHED_OUT' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-4xl text-green-400 font-black"
                                        >
                                            ✅ CASH OUT! ✅
                                        </motion.div>
                                    )}
                                    
                                    {gameState === 'WAITING' && (
                                        <motion.div
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="text-2xl text-gray-400"
                                        >
                                            Placez votre mise pour commencer
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Message */}
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 p-4 bg-black/50 rounded-xl border border-gray-700 text-center text-lg"
                                >
                                    {message}
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* Panneau de contrôle */}
                    <div className="space-y-6">
                        {/* Mise */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border-2 border-gray-700/50 p-6"
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Target className="h-5 w-5 text-orange-400" />
                                Votre Mise
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Montant (min: 10)</label>
                                    <input
                                        type="number"
                                        value={betAmount}
                                        onChange={(e) => setBetAmount(Math.max(10, parseInt(e.target.value) || 10))}
                                        disabled={gameState === 'RISING'}
                                        className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-orange-500 disabled:opacity-50"
                                        min="10"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {[50, 100, 500].map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => setBetAmount(amount)}
                                            disabled={gameState === 'RISING'}
                                            className="px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                        >
                                            {amount}
                                        </button>
                                    ))}
                                </div>

                                {/* Boutons d'action */}
                                {gameState === 'WAITING' || gameState === 'CRASHED' || gameState === 'CASHED_OUT' ? (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={startGame}
                                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 rounded-xl font-black text-lg shadow-lg shadow-orange-500/50 transition-all"
                                    >
                                        🚀 LANCER LE JEU
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={cashOut}
                                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-xl font-black text-lg shadow-lg shadow-green-500/50 transition-all animate-pulse"
                                    >
                                        💰 CASH OUT ({Math.floor(betAmount * currentMultiplier)} pièces)
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>

                        {/* Historique */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border-2 border-gray-700/50 p-6"
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-yellow-400" />
                                Historique
                            </h3>
                            
                            <div className="space-y-2">
                                {history.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">Aucun historique</p>
                                ) : (
                                    history.map((mult, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`px-4 py-2 rounded-lg font-bold text-center ${
                                                mult < 2 ? 'bg-red-900/30 text-red-400' :
                                                mult < 5 ? 'bg-yellow-900/30 text-yellow-400' :
                                                mult < 10 ? 'bg-orange-900/30 text-orange-400' :
                                                'bg-green-900/30 text-green-400'
                                            }`}
                                        >
                                            {mult.toFixed(2)}x
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}