"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Crown, Target, Flame, Sparkles, Star, Coins, TrendingUp, TrendingDown, Volume2, VolumeX } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { CASINO_ENDPOINTS } from '@/config/api';

// Slot Machine page using real currency via /api/currency/me

// Hook personnalisé pour gérer les sons du casino
const useCasinoSounds = () => {
    const soundsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
    const bgMusicRef = useRef<HTMLAudioElement | null>(null);
    const [soundsEnabled, setSoundsEnabled] = useState(true);
    const [soundsInitialized, setSoundsInitialized] = useState(false);

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

    return { playSound, soundsEnabled, toggleSounds };
};

const SYMBOLS = ['🍒', '🍇', '🍊', '🍋', '💎', '💰', '7️⃣', '🍀'];
type Reel = string[];

function randomReel(length = 20) {
    return Array.from({ length }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
}

const PAYOUTS: { [symbol: string]: number } = {
    '7️⃣': 50,
    '💎': 10,
    '💰': 8,
    '🍀': 5,
    '🍒': 3,
    '🍇': 3,
    '🍊': 2,
    '🍋': 2
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

// Floating particles component
const FloatingParticles = ({ count = 20 }: { count?: number }) => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
                    initial={{
                        x: Math.random() * 100 + '%',
                        y: Math.random() * 100 + '%',
                    }}
                    animate={{
                        y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                        x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                    }}
                    transition={{
                        duration: Math.random() * 3 + 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                    }}
                />
            ))}
        </div>
    );
};

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
    const { playSound, soundsEnabled, toggleSounds } = useCasinoSounds();
    const [balance, setBalance] = useState<number>(0);
    const [loadingBalance, setLoadingBalance] = useState<boolean>(true);
    const [bet, setBet] = useState<number>(10);
    const [reels, setReels] = useState<Reel[]>([randomReel(), randomReel(), randomReel()]);
    const [spinning, setSpinning] = useState(false);
    const [message, setMessage] = useState<string>('Bonne chance !');
    
    // Jackpot global (chargé depuis l'API)
    const [jackpot, setJackpot] = useState<number>(10000);
    const [jackpotLoading, setJackpotLoading] = useState<boolean>(true);
    
    // Top wins des joueurs
    const [topWins, setTopWins] = useState<Array<{ username: string; biggestWin: number }>>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    
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

    const HOUSE_EDGE = 0.06;

    useEffect(() => {
        return () => spinTimeouts.current.forEach((t) => clearTimeout(t));
    }, []);

    const setInitialReels = () => setReels([randomReel(20), randomReel(20), randomReel(20)]);

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
    const loadTopWins = async () => {
        try {
            const res = await fetch(CASINO_ENDPOINTS.topWins);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.players) && data.players.length > 0) {
                    setTopWins(data.players);
                    console.log('[TOP WINS] Chargé depuis l\'API:', data.players.length, 'joueurs');
                }
            }
        } catch (e) {
            console.error('Erreur fetch top wins', e);
        }
    };

    // Fonction pour enregistrer un gain
    const recordWin = async (username: string, winAmount: number) => {
        try {
            await fetch(CASINO_ENDPOINTS.topWins, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, winAmount }),
            });
            // Recharger les top wins après enregistrement
            loadTopWins();
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
        
        // 3 symboles identiques = GROS GAIN
        if (s1 === s2 && s2 === s3) {
            const multiplier = PAYOUTS[s1] || 1;
            
            // JACKPOT avec 7️⃣
            if (s1 === '7️⃣') {
                return { win: true, amount: Math.max(jackpot, currentBet * multiplier), isJackpot: true, lineType: 'three' as const };
            }
            
            // Gain normal avec 3 symboles identiques
            // On garantit au minimum le double de la mise
            const baseAmount = Math.floor(currentBet * multiplier * (1 - HOUSE_EDGE));
            const finalAmount = Math.max(currentBet * 2, baseAmount);
            return { win: true, amount: finalAmount, isJackpot: false, lineType: 'three' as const };
        }

        // 2 symboles identiques = PETIT GAIN
        if (s1 === s2 || s2 === s3 || s1 === s3) {
            const sym = s1 === s2 ? s1 : s2 === s3 ? s2 : s1 === s3 ? s1 : s2;
            const multiplier = PAYOUTS[sym] ? Math.max(1, Math.floor(PAYOUTS[sym] / 4)) : 1;
            
            // Déterminer le type de ligne selon les symboles qui matchent
            let lineType: 'two-left' | 'two-middle' | 'two-right' = 'two-left';
            if (s1 === s2) lineType = 'two-left';
            else if (s2 === s3) lineType = 'two-middle';
            else if (s1 === s3) lineType = 'two-right';
            
            // On garantit au minimum la mise (remboursement)
            const baseAmount = Math.floor(currentBet * multiplier * (1 - HOUSE_EDGE));
            const finalAmount = Math.max(currentBet, baseAmount);
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

        // Reserve funds server-side: deduct bet before spinning
        try {
            setSpinning(true);
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
        } catch (e) {
            console.error('Erreur réservation:', e);
            setBalance((b) => b - bet);
        }

        const makeWeightedReel = () => {
            const arr: string[] = [];
            for (let i = 0; i < 25; i++) {
                const r = Math.random();
                if (r > 0.985) arr.push('7️⃣');
                else arr.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
            }
            return arr;
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
                const final = reel[reel.length - 1];
                finalSymbols[idx] = final;
                
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
                            if (session?.user?.name) {
                                recordWin(session.user.name, result.amount);
                            }
                            
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
                            
                            if (bet > biggestLoss) {
                                setBiggestLoss(bet);
                            }
                            
                            setMessage('💔 Perdu...');
                            
                            // Augmenter le jackpot global via l'API NyxNode
                            const jackpotIncrease = Math.max(1, Math.floor(bet * 0.2));
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
                    }, 300);
                }
            }, d);
            spinTimeouts.current.push(t);
        });
    };

    const formatMoney = (n: number) => n.toLocaleString('fr-FR');

    const reelDisplay = (reel: Reel, index: number) => {
        const isStopped = reelsStopped[index];
        
        return (
            <motion.div 
                className="relative w-36 h-48 rounded-3xl overflow-hidden"
                animate={isStopped ? {
                    scale: [1, 1.05, 1],
                } : {}}
                transition={{ duration: 0.3 }}
            >
                {/* Outer glow container */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-purple-500/10 to-purple-600/20 rounded-3xl blur-xl" />
                
                {/* Main reel container */}
                <div className="relative w-full h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-3xl border-4 border-purple-500/40 shadow-2xl overflow-hidden">
                    {/* Animated border glow */}
                    <motion.div 
                        className="absolute inset-0 rounded-3xl"
                        style={{
                            background: 'linear-gradient(45deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
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
                    
                    {/* Spinning glow effect */}
                    {spinning && (
                        <motion.div 
                            className="absolute inset-0 bg-gradient-to-b from-purple-500/30 via-transparent to-purple-500/30"
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
                    
                    {/* Reel symbols */}
                    <motion.div 
                        className="flex flex-col items-center justify-center h-full relative z-10"
                        animate={spinning ? {
                            y: [0, -320]
                        } : {}}
                        transition={spinning ? {
                            duration: 0.4,
                            repeat: Infinity,
                            ease: "linear",
                            delay: index * 0.15
                        } : {}}
                    >
                        {reel.map((s, i) => (
                            <motion.div 
                                key={`${s}-${i}`} 
                                className={`flex items-center justify-center h-16 w-full transition-all duration-300 ${
                                    i === reel.length - 1 && !spinning 
                                        ? 'relative' 
                                        : ''
                                }`}
                            >
                                {/* Winning symbol highlight */}
                                {i === reel.length - 1 && !spinning && (
                                    <>
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"
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
                                        <div className="absolute inset-0 border-y-4 border-purple-400/60 shadow-lg shadow-purple-500/50" />
                                        <motion.div
                                            className="absolute -left-2 -right-2 -top-2 -bottom-2"
                                            animate={{
                                                boxShadow: [
                                                    '0 0 20px rgba(139, 92, 246, 0.3)',
                                                    '0 0 40px rgba(139, 92, 246, 0.6)',
                                                    '0 0 20px rgba(139, 92, 246, 0.3)',
                                                ],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                            }}
                                        />
                                    </>
                                )}
                                
                                <motion.span 
                                    className="text-5xl drop-shadow-2xl leading-none flex items-center justify-center relative z-10"
                                    animate={i === reel.length - 1 && !spinning ? {
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 5, -5, 0],
                                    } : {}}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1
                                    }}
                                    style={{
                                        filter: i === reel.length - 1 && !spinning 
                                            ? 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.8))' 
                                            : 'none'
                                    }}
                                >
                                    {s}
                                </motion.span>
                            </motion.div>
                        ))}
                    </motion.div>
                    
                    {/* Enhanced overlay effects */}
                    <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-20" />
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-20" />
                    
                    {/* Corner sparkles */}
                    {!spinning && (
                        <>
                            <motion.div
                                className="absolute top-2 left-2 text-purple-400"
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
                                className="absolute top-2 right-2 text-purple-400"
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
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-purple-400/70 to-transparent pointer-events-none z-20" />
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-purple-400/70 to-transparent pointer-events-none z-20" />
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 text-white relative overflow-hidden">
            {/* Animated background particles */}
            <FloatingParticles count={30} />
            
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
            
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 items-start relative z-10">
                {/* Main Slot Machine */}
                <div className="lg:col-span-3 futuristic-card rounded-3xl p-6 md:p-8 shadow-purple relative overflow-hidden">
                    {/* Animated corner elements */}
                    <motion.div 
                        className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-purple-500/40 rounded-tl-3xl"
                        animate={{
                            borderColor: ['rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.4)'],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div 
                        className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-purple-500/40 rounded-tr-3xl"
                        animate={{
                            borderColor: ['rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.4)'],
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.div 
                        className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-purple-500/40 rounded-bl-3xl"
                        animate={{
                            borderColor: ['rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.4)'],
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                    <motion.div 
                        className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-purple-500/40 rounded-br-3xl"
                        animate={{
                            borderColor: ['rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.4)'],
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
                                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/50 relative overflow-hidden"
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
                                <Zap size={32} className="text-white relative z-10" />
                            </motion.div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 bg-clip-text text-transparent">
                                    Casino Slot
                                </h1>
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
                                    Prêt à défier la chance ? | Casino conçu par Kyû.
                                </motion.p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
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
                            
                            {/* Sound Toggle Button */}
                            <motion.button
                                onClick={toggleSounds}
                                className={`p-3 rounded-xl transition-all duration-300 ${
                                    soundsEnabled 
                                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' 
                                        : 'bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                                } shadow-lg`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                title={soundsEnabled ? "Désactiver les sons" : "Activer les sons"}
                            >
                                {soundsEnabled ? (
                                    <Volume2 size={24} className="text-white" />
                                ) : (
                                    <VolumeX size={24} className="text-white" />
                                )}
                            </motion.button>
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
                        <div className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 border-4 border-purple-500/30 shadow-2xl">
                            {/* Top decorative bar */}
                            <motion.div 
                                className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 px-8 py-3 rounded-full border-4 border-purple-400/50 shadow-lg shadow-purple-500/50"
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
                                    <Star className="text-yellow-300" size={20} />
                                    <span className="text-white font-black text-lg">SLOT MACHINE</span>
                                    <Star className="text-yellow-300" size={20} />
                                </motion.div>
                            </motion.div>
                            
                            {/* Reels */}
                            <div className="flex justify-center items-center gap-6 mb-6 relative">
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
                                            : loseAnimation
                                            ? 'bg-gradient-to-r from-red-500 via-red-400 to-red-500 text-white'
                                            : 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border-2 border-purple-500/30'
                                    }`}
                                    animate={winAnimation ? {
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
                                    className="flex items-center gap-3 bg-gradient-to-br from-gray-900/90 to-gray-800/90 px-6 py-4 rounded-2xl border-2 border-purple-500/30 shadow-lg backdrop-blur-sm"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ scale: 1.03, borderColor: 'rgba(139, 92, 246, 0.6)' }}
                                >
                                    <motion.div
                                        animate={{ 
                                            rotate: [0, 15, -15, 0],
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Target size={24} className="text-purple-400" />
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
                                        disabled={spinning || loadingBalance}
                                        className="nyx-input w-32 text-center font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </motion.div>

                                <motion.button
                                    onClick={handleSpin}
                                    disabled={spinning || loadingBalance || bet > balance}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    whileHover={{ scale: spinning ? 1 : 1.1 }}
                                    whileTap={{ scale: spinning ? 1 : 0.95 }}
                                    className={`relative px-12 py-5 rounded-2xl font-black text-xl shadow-2xl flex items-center gap-3 overflow-hidden transition-all duration-300 ${
                                        spinning 
                                            ? 'bg-gray-700 cursor-not-allowed' 
                                            : bet > balance
                                            ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                            : 'btn-nyx-primary'
                                    }`}
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
                                        <Zap size={24} />
                                    </motion.div>
                                    <span className="relative z-10">
                                        {spinning ? 'SPINNING...' : 'SPIN'}
                                    </span>
                                </motion.button>
                            </div>
                        </div>
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
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Jackpot Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="futuristic-card rounded-2xl p-6 shadow-purple relative overflow-hidden"
                        whileHover={{ scale: 1.03 }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/50"
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
                                <h3 className="text-xl font-black text-yellow-400">JACKPOT</h3>
                            </div>
                            <motion.p 
                                className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent"
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
                            
                            {/* Affichage du joueur avec le plus gros gain (rotation) */}
                            <AnimatePresence mode="wait">
                                {topWins.length > 0 && (
                                    <motion.div
                                        key={currentPlayerIndex}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.5 }}
                                        className="mt-3 pt-3 border-t border-yellow-500/20"
                                    >
                                        <p className="text-xs text-yellow-300 font-bold">
                                            🏆 {topWins[currentPlayerIndex].username} › Plus gros gain : {formatMoney(topWins[currentPlayerIndex].biggestWin)} 💰
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Payouts Table */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="futuristic-card rounded-2xl p-6 shadow-purple"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <motion.div
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/50"
                                animate={{
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Coins size={20} className="text-white" />
                            </motion.div>
                            <h3 className="text-lg font-black text-purple-300">Gains</h3>
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
                                        className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all"
                                        whileHover={{ scale: 1.03, x: 5 }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{symbol}</span>
                                            <span className="text-xs text-gray-400 font-semibold">x3</span>
                                        </div>
                                        <motion.span 
                                            className="text-sm font-black text-purple-300"
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
    );
}