"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { Zap, Trophy, Crown, Target, Flame, Sparkles, Star, Coins, TrendingUp, TrendingDown, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { CASINO_ENDPOINTS } from '@/config/api';
import Link from 'next/link';
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck';
import { FavoriteToggleButton } from '@/components/FavoriteToggleButton';

// Slot Machine page using real currency via /api/currency/me


// Particule individuelle pour l'aurore (désactivée pour performance)
const AuroraParticle = ({ color, index }: { color: string, index: number }) => {
    // Désactivé pour éviter le lag
    return null;
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
    '🍀': 6,     // Moyen
    '🍒': 5,     // Classique
    '🍇': 4,     // Modéré
    '🍓': 3,     // Petit gain
    '🍋': 2      // Faible
};

// ✨ NOUVEAU: Multiplicateurs spécifiques pour 2 symboles identiques
const PAYOUTS_TWO_SYMBOLS: { [symbol: string]: number } = {
    '7️⃣': 7,   // Gain spécial élevé
    '💎': 4,     // Maintien d'un gain correct
    '💰': 3,     // Maintien d'un gain correct
    '🍀': 2,     // Maintien d'un gain correct
    '🍒': 1.6,   // 1800 pour une mise de 1000
    '🍇': 1.5,   // 1700 pour une mise de 1000
    '🍓': 1.4,   // 1600 pour une mise de 1000
    '🍋': 1.3    // 1500 pour une mise de 1000
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

// Confetti component (désactivé pour performance)

// Composant pour une seule pièce (désactivé pour performance)
const Coin = () => {
    // Désactivé pour éviter le lag
    return null;
};

// Coin rain effect (désactivé pour performance)
const CoinRain = ({ amount }: { amount: number }) => {
    // Désactivé pour éviter le lag
    return null;
};

// Free Spin Unlock Animation (simplifiée pour performance)
const FreeSpinUnlockAnimation = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
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
                    <div className="text-6xl font-black mb-4">
                        🎉 FREE SPINS ! 🎉
                    </div>
                    <div className="text-3xl font-bold">3 Victoires Consécutives !</div>
                    <div className="text-5xl font-black mt-4 text-yellow-200">
                        +3 TOURS GRATUITS
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Laughing emojis effect when losing (désactivé pour performance)
const LaughingEmojis = () => {
    // Désactivé pour éviter le lag
    return null;
};

const DevilModeOverlay = () => {
    // Désactivé pour éviter le lag
    return null;
};

const DemonicSigil = () => {
    // Désactivé pour éviter le lag
    return null;
};

// ... (rest of the code remains the same)

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

// ... (rest of the code remains the same)
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
    
    
    const [showCoinRain, setShowCoinRain] = useState(false);
    const [showLaughingEmojis, setShowLaughingEmojis] = useState(false);
    const [reelsStopped, setReelsStopped] = useState([false, false, false]);
    const [winningLineType, setWinningLineType] = useState<'three' | 'two-left' | 'two-middle' | 'two-right' | null>(null);
    const { width, height } = useWindowSizeLocal();
    const isMobile = width < 768;
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




    const SYMBOLS = isDevilMode ? DEVIL_SYMBOLS : NORMAL_SYMBOLS;

    useEffect(() => {
        return () => spinTimeouts.current.forEach((t) => clearTimeout(t));
    }, []);


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

    // Fonction pour charger le niveau et XP du joueur depuis l'API
    const loadPlayerLevel = async () => {
        if (!session?.user?.name) {
            // Valeurs par défaut si pas de session
            setPlayerLevel(1);
            setPlayerXp(0);
            setXpForNextLevel(1000);
            return;
        }

        try {
            // On peut utiliser l'API XP pour récupérer le niveau actuel
            const res = await fetch(CASINO_ENDPOINTS.xp, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: session.user.name, xpToAdd: 0 }),
            });

            if (res.ok) {
                const data = await res.json();
                setPlayerLevel(data.level || 1);
                setPlayerXp(data.xp || 0);
                setXpForNextLevel(data.xpForNextLevel || 1000);
                console.log('[LEVEL] Chargé depuis l\'API:', data.level, 'XP:', data.xp);
            } else {
                // Valeurs par défaut si l'API échoue
                console.warn('[LEVEL] API échouée, utilisation des valeurs par défaut');
                setPlayerLevel(1);
                setPlayerXp(0);
                setXpForNextLevel(1000);
            }
        } catch (e) {
            console.error('Erreur fetch level', e);
            // Valeurs par défaut en cas d'erreur
            setPlayerLevel(1);
            setPlayerXp(0);
            setXpForNextLevel(1000);
        }
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

    // Load balance and jackpot from API on mount
    useEffect(() => {
        // ✨ CORRECTION: Appeler fetchUserBalances pour charger les soldes ET le niveau/XP au démarrage.
        fetchUserBalances();

        // Charger le niveau et XP du joueur
        loadPlayerLevel();

        // Charger le jackpot initial
        setJackpotLoading(true);
        loadJackpot();

        // Charger les top wins initial
        loadTopWins();
    }, [fetchUserBalances]); // fetchUserBalances est mémorisé avec useCallback, donc cela ne se déclenchera qu'une fois.

    



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

            const maxWinMultiplier = 30;
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
        if (jetonsBalance < bet) {
            setMessage('Solde de jetons insuffisant !');
            return;
        }

        // 🎰 FREE SPIN: Vérifier si on utilise un free spin
        let isUsingFreeSpin = false;

        // 🔒 ANTI-TRICHE: Capturer la mise au début du spin pour éviter
        // que l'utilisateur ne la change pendant le spinning
        let lockedBet = bet;

        // 🎰 JACKPOT FORCE: Vérifier si l'utilisateur est marqué pour gagner le jackpot
        let forceJackpot = false;
        let forceType: 'jackpot' | 'test' = 'jackpot';
        if (session?.user?.id) {
            try {
                const forceCheck = await fetch('/api/super-admin/jackpot-force', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: session.user.id, action: 'check' })
                });

                if (forceCheck.ok) {
                    const forceData = await forceCheck.json();
                    forceJackpot = forceData.forceWin || false;
                    forceType = forceData.type || 'jackpot';
                    console.log('[JACKPOT FORCE] Vérification réussie:', forceData);
                } else {
                    console.warn('[JACKPOT FORCE] Erreur API:', forceCheck.status, forceCheck.statusText);
                    // Essayer de lire le body d'erreur si possible
                    try {
                        const errorData = await forceCheck.text();
                        console.warn('[JACKPOT FORCE] Body erreur:', errorData);
                    } catch (e) {
                        console.warn('[JACKPOT FORCE] Impossible de lire le body d\'erreur');
                    }
                }
            } catch (error) {
                console.error('[JACKPOT FORCE] Erreur réseau:', error);
            }
        } else {
            console.log('[JACKPOT FORCE] Utilisateur non connecté, pas de vérification');
        }

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
                
                // Garder seulement les 3 dernières mises
                return updated.slice(-3);
            });

            // 🎯 DISTRIBUER DES POINTS AU SEASON PASS (très peu comme demandé)
            // NOTE: Points drastiquement réduits pour rendre le season pass progressif
            if (!isUsingFreeSpin && session?.user?.id) {
                try {
                    // Distribuer 0.1 à 1 point par spin (aléatoire pour varier)
                    const seasonPassPoints = Math.random() * 0.9 + 0.1; // 0.1 à 1.0 point

                    await fetch('/api/season-pass', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'add_points',
                            userId: session.user.id,
                            amount: seasonPassPoints,
                            source: 'casino_spin'
                        })
                    });

                    console.log(`[SEASON-PASS] ${session.user.name} gagne ${seasonPassPoints.toFixed(1)} points du casino`);
                } catch (error) {
                    console.error('[SEASON-PASS] Erreur distribution points casino:', error);
                }
            }
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

                // ⚖️ Taux global de pertes : 0.84 = environ 16% de victoires
                const GLOBAL_LOSS_RATE = 0.87; // 1 - 0.80 = 20% de chances de victoire

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

                    // Moins punitif : +0.04 au lieu de +0.07
                    if (Math.random() < (GLOBAL_LOSS_RATE + 0.04)) {
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





        // 🎰 JACKPOT FORCE: Si l'utilisateur est marqué, forcer les symboles
        let newReels;
        if (forceJackpot) {
            const forcedSymbol = forceType === 'jackpot' ? '7️⃣' : '🍀';
            console.log(`[JACKPOT FORCÉ] Forçage des ${forcedSymbol} pour l'utilisateur marqué (${forceType})!`);
            // Créer des reels avec les symboles forcés
            const forcedReel = () => {
                const reel = makeWeightedReel();
                // Forcer le symbole gagnant (index -13) à être le symbole forcé
                reel[reel.length - 13] = forcedSymbol;
                return reel;
            };
            newReels = [forcedReel(), forcedReel(), forcedReel()];
        } else {
            newReels = [makeWeightedReel(), makeWeightedReel(), makeWeightedReel()];
        }
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

                            // On modifie le résultat pour en faire une victoire de consolation
                            spinResult = { win: true, amount: consolationAmount, isJackpot: false, lineType: null, isPityWin: true };
                            setResult(spinResult);

                            setMessage(`QUASIMENT ! +${formatMoney(consolationAmount)} jetons !`);
                            // Jouer un son spécifique pour cet événement
                        }

                        // ✨ NOUVEAU: Ajouter au début de l'historique des spins
                        setSpinHistory(prev => [
                            { ...spinResult, symbols: finalSymbols, bet: lockedBet, timestamp: Date.now() },
                            ...prev
                        ].slice(0, 5)); // Garder les 5 derniers

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

                             // Augmenter le jackpot global via l'API NyxNode (100% de la mise perdue en jetons)
                             const jackpotIncreaseAmount = Math.max(1, Math.floor(lockedBet)); // Mise perdue directement en jetons
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

                         // 🎯 BONUS POINTS SEASON PASS POUR LES VICTOIRES
                         if (spinResult.win && !isUsingFreeSpin && session?.user?.id) {
                             try {
                                 // Bonus de 1-3 points pour les victoires selon le multiplicateur
                                 let victoryBonus = 1;
                                 if (spinResult.amount >= lockedBet * 5) victoryBonus = 3; // Gros gains
                                 else if (spinResult.amount >= lockedBet * 2) victoryBonus = 2; // Gains moyens

                                 await fetch('/api/season-pass', {
                                     method: 'POST',
                                     headers: { 'Content-Type': 'application/json' },
                                     body: JSON.stringify({
                                         action: 'add_points',
                                         userId: session.user.id,
                                         amount: victoryBonus,
                                         source: 'casino_win'
                                     })
                                 });

                                 console.log(`[SEASON-PASS] ${session.user.name} bonus victoire: +${victoryBonus} points`);
                             } catch (error) {
                                 console.error('[SEASON-PASS] Erreur bonus victoire:', error);
                             }
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
                className="relative w-28 h-36 md:w-36 md:h-48 rounded-3xl overflow-hidden"
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
                            y: [-64, -832],  // Animation simplifiée
                        } : {
                            y: -64
                        }}
                        transition={spinning && !isStopped ? {
                            duration: 0.8, // Durée légèrement augmentée pour moins de calculs
                            repeat: Infinity,
                            ease: "linear",
                            repeatType: "loop"
                        } : {
                            duration: 0.5,
                            ease: "easeOut"
                        }}
                        // Flou réduit pour performance
                        style={{
                            filter: spinning && !isStopped ? 'blur(1px)' : 'blur(0px)', // Blur réduit et simplifié
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
                                    className="text-4xl md:text-5xl relative z-10 flex items-center justify-center"
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
                    
                    {/* Corner sparkles (désactivés sur mobile) */}
                    {!spinning && (
                        <>
                            <motion.div
                                className={`absolute top-2 left-2 ${isDevilMode ? 'text-red-400' : 'text-purple-400'} md:block hidden`}
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
                                className={`absolute top-2 right-2 ${isDevilMode ? 'text-red-400' : 'text-purple-400'} md:block hidden`}
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
            <div className="w-full text-white p-2 md:p-4 lg:p-8 relative overflow-hidden">
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
                        {/* Effets de fond simplifiés (désactivés pour performance) */}
                        <div className="fixed inset-0 z-0" /> 

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
                    className={`lg:col-span-3 bg-black/40 backdrop-blur-xl rounded-3xl p-4 md:p-6 lg:p-8 ${isDevilMode && !isMobile ? 'devil-chromatic-aberration' : ''} relative overflow-hidden border ${isDevilMode ? 'border-red-500/30' : 'border-purple-500/20'} shadow-2xl`}
                    animate={isDevilMode && !isMobile ? {
                        x: spinning ? [0, -1, 1, -2, 2, -1, 1, 0] : 0, // @ts-ignore
                        y: spinning ? [0, 1, -1, 2, -2, 1, -1, 0] : 0,
                        rotate: spinning ? [0, 0.1, -0.1, 0.2, -0.2, 0.1, -0.1, 0] : 0,
                        '--glitch-x': spinning ? `${Math.random() * 4 - 2}px` : '0px',
                        '--glitch-y': spinning ? `${Math.random() * 4 - 2}px` : '0px',
                        boxShadow: "0 0 60px rgba(239, 68, 68, 0.5), inset 0 0 15px rgba(239, 68, 68, 0.3)"
                    } : {
                        x: 0, y: 0, rotate: 0,
                        boxShadow: isDevilMode ? "0 0 60px rgba(239, 68, 68, 0.5), inset 0 0 15px rgba(239, 68, 68, 0.3)" : "0 0 40px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.15)"
                    }}
                    transition={{
                        x: { duration: 0.4, repeat: Infinity },
                        y: { duration: 0.4, repeat: Infinity },
                        rotate: { duration: 0.4, repeat: Infinity },
                        boxShadow: { duration: 3, repeat: isDevilMode ? Infinity : 0, ease: 'easeInOut' },
                        '--glitch-x': { duration: 0.1, repeat: Infinity }, '--glitch-y': { duration: 0.1, repeat: Infinity }
                    }}
                >
                    {/* Corner elements statiques pour performance */}
                    <div
                        className={`absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 ${isDevilMode ? 'border-red-500/40' : 'border-purple-500/40'} rounded-tl-3xl transition-colors duration-500`}
                    />
                    <div
                        className={`absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 ${isDevilMode ? 'border-red-500/40' : 'border-purple-500/40'} rounded-tr-3xl transition-colors duration-500`}
                    />
                    <div
                        className={`absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 ${isDevilMode ? 'border-red-500/40' : 'border-purple-500/40'} rounded-bl-3xl transition-colors duration-500`}
                    />
                    <div
                        className={`absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 ${isDevilMode ? 'border-red-500/40' : 'border-purple-500/40'} rounded-br-3xl transition-colors duration-500`}
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
                                <motion.h1 className={`text-2xl md:text-3xl lg:text-4xl font-black bg-clip-text text-transparent transition-all duration-500 ${
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
                                <p className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent mb-4">
                                    {formatMoney(piecesBalance)} 💰
                                </p>
                                <p className="text-sm text-gray-400 font-semibold mb-1">Vos Jetons</p>
                                <p className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent mb-2">
                                    {loadingBalance ? '...' : formatMoney(displayJetonsBalance)} 💎
                                </p>
                                <p className="text-sm text-gray-400 font-semibold mb-1">Niveau</p>
                                <p className="text-lg md:text-xl lg:text-2xl font-black bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                                    {playerLevel} - {getLevelTitle(playerLevel)}
                                </p>
                                <div className="mt-2">
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <motion.div
                                            className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(playerXp / xpForNextLevel) * 100}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                    <p className="text-xs text-purple-300 mt-1">
                                        XP: {formatMoney(playerXp)} / {formatMoney(xpForNextLevel)}
                                    </p>
                                </div>

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
                        <motion.div className={`relative bg-black/50 rounded-3xl p-4 md:p-6 lg:p-8 border-4 ${isDevilMode ? 'border-red-500/30' : 'border-purple-500/30'} shadow-2xl transition-colors duration-500`}>
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
                            
                            {/* Reels - ✨ Indicateur de Free Spin amélioré */}
                            <div className="flex justify-center items-center gap-3 md:gap-6 mb-6 relative">
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
                                        <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-white px-4 md:px-6 py-2 rounded-full font-black text-sm md:text-lg shadow-2xl border-2 border-yellow-300">
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
                                    className={`inline-block px-6 md:px-8 py-3 md:py-4 rounded-2xl font-black text-lg md:text-xl lg:text-2xl shadow-lg backdrop-blur-sm ${
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
                            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 mt-6 md:mt-8">
                                <motion.div
                                    className={`flex items-center gap-2 md:gap-3 bg-black/50 px-4 md:px-6 py-3 md:py-4 rounded-2xl border-2 ${isDevilMode ? 'border-red-500/30' : 'border-purple-500/30'} shadow-lg backdrop-blur-sm transition-colors duration-500`}
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
                                        <Target size={20} className={`md:w-6 md:h-6 ${isDevilMode ? 'text-red-400' : 'text-purple-400'}`} />
                                    </motion.div>
                                    <label className="text-xs md:text-sm text-gray-300 font-bold">Mise</label>
                                    <input
                                        type="number"
                                        min={1}
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
                                            setBet(numValue);
                                        }
                                    }}
                                        onBlur={(e) => {
                                        if (spinning) return;

                                        const numValue = Number(e.target.value);
                                        if (isNaN(numValue) || numValue < 1) {
                                            setBet(1);
                                        } else {
                                            setBet(Math.max(1, numValue));
                                        }
                                    }}
                                        disabled={spinning || loadingBalance || isFreeSpinMode || freeSpins > 0}
                                        className={`nyx-input w-24 md:w-32 text-center font-bold text-lg md:text-xl disabled:opacity-50 disabled:cursor-not-allowed ${
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
                                             if (action === 'x2') newBet = Math.min(bet * 2, jetonsBalance);
                                             if (action === 'MIN') newBet = 1;
                                             if (action === 'MAX') newBet = jetonsBalance;
                                             setBet(newBet);
                                         };

                                        const isDisabled = spinning || isFreeSpinMode ||
                                            (action === 'x2' && bet * 2 > jetonsBalance) ||
                                            (action === '/2' && bet <= 1) ||
                                            (action === 'MAX' && jetonsBalance === 0)

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
                                <motion.button
                                    onClick={handleSpin}
                                    disabled={spinning || loadingBalance || bet > jetonsBalance}
                                    className={`relative px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-lg md:text-xl shadow-2xl flex items-center gap-2 md:gap-3 overflow-hidden transition-all duration-300 ${
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
                                    {/* ✨ Effet de reflet sur le bouton (désactivé sur mobile) */}
                                    {!spinning && !isDevilMode && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent md:block hidden"
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
                                    {/* ✨ Effet de lueur pulsante en Devil Mode (désactivé sur mobile) */}
                                    {isDevilMode && !spinning && (
                                        <motion.div
                                            className="absolute inset-0 md:block hidden"
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
                                            repeat: spinning ? Infinity : 0,
                                            ease: "linear"
                                        }}
                                    >
                                        {isDevilMode ? <Flame size={20} className="md:w-6 md:h-6" /> : <Zap size={20} className="md:w-6 md:h-6" />}
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
                        className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
                    >
                        {/* Biggest Win */}
                        <motion.div
                            className="relative bg-gradient-to-br from-emerald-900/50 via-black/30 to-emerald-900/50 rounded-2xl p-4 md:p-6 border-2 border-emerald-500/30 shadow-lg overflow-hidden"
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
                                            className="text-xl md:text-2xl font-black text-emerald-400"
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
                            className="relative bg-gradient-to-br from-red-900/50 via-black/30 to-red-900/50 rounded-2xl p-4 md:p-6 border-2 border-red-500/30 shadow-lg overflow-hidden"
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
                                            className="text-xl md:text-2xl font-black text-red-400"
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
                        {/* Bordure statique pour performance */}
                        <div className={`absolute inset-0 rounded-xl pointer-events-none border-2 ${
                            isDevilMode ? 'border-red-500/30' : 'border-yellow-500/30'
                        }`} />
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
                                className={`text-2xl md:text-3xl font-black bg-clip-text text-transparent ${isDevilMode ? 'bg-gradient-to-r from-red-400 via-orange-400 to-red-400' : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400'} transition-all duration-500`}
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



                    {/* Payouts Table */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`relative bg-black/30 backdrop-blur-2xl rounded-2xl p-1 border-2 border-transparent transition-shadow duration-500 overflow-hidden ${isDevilMode ? 'shadow-red-500/40' : 'shadow-purple-500/30'}`}
                    >
                        {/* Bordure statique pour performance */}
                        <div className={`absolute inset-0 rounded-xl pointer-events-none border-2 ${
                            isDevilMode ? 'border-red-500/30' : 'border-purple-500/30'
                        }`} />
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
