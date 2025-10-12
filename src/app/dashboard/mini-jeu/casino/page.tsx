"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Crown, Target, Flame, Sparkles } from 'lucide-react';

// Slot Machine page using real currency via /api/currency/me

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

export default function CasinoSlotPage() {
    const [balance, setBalance] = useState<number>(0);
    const [loadingBalance, setLoadingBalance] = useState<boolean>(true);
    const [bet, setBet] = useState<number>(10);
    const [reels, setReels] = useState<Reel[]>([randomReel(), randomReel(), randomReel()]);
    const [spinning, setSpinning] = useState(false);
    const [message, setMessage] = useState<string>('Bonne chance !');
    const [jackpot, setJackpot] = useState<number>(10000);
    const [showConfetti, setShowConfetti] = useState(false);
    const [winAnimation, setWinAnimation] = useState(false);
    const [loseAnimation, setLoseAnimation] = useState(false);
    const [lastWinAmount, setLastWinAmount] = useState(0);
    const [biggestWin, setBiggestWin] = useState<number>(0);
    const [biggestLoss, setBiggestLoss] = useState<number>(0);
    const { width, height } = useWindowSizeLocal();
    const spinTimeouts = useRef<any[]>([]);

    const HOUSE_EDGE = 0.06;

    useEffect(() => {
        return () => spinTimeouts.current.forEach((t) => clearTimeout(t));
    }, []);

    const setInitialReels = () => setReels([randomReel(20), randomReel(20), randomReel(20)]);

    useEffect(() => {
        setInitialReels();

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
    }, []);

    const computeResult = (finalSymbols: string[], currentBet: number) => {
        const [s1, s2, s3] = finalSymbols;
        if (s1 === s2 && s2 === s3) {
            const multiplier = PAYOUTS[s1] || 1;
            if (s1 === '7️⃣') return { win: true, amount: Math.max(jackpot, currentBet * multiplier) };
            return { win: true, amount: Math.max(1, Math.floor(currentBet * multiplier * (1 - HOUSE_EDGE))) };
        }

        if (s1 === s2 || s2 === s3 || s1 === s3) {
            const sym = s1 === s2 ? s1 : s2 === s3 ? s2 : s1 === s3 ? s1 : s2;
            const multiplier = PAYOUTS[sym] ? Math.max(1, Math.floor(PAYOUTS[sym] / 4)) : 1;
            return { win: true, amount: Math.max(1, Math.floor(currentBet * multiplier * (1 - HOUSE_EDGE))) };
        }

        return { win: false, amount: 0 };
    };

    const triggerWinAnimation = (amount: number) => {
        setLastWinAmount(amount);
        setWinAnimation(true);
        setTimeout(() => setWinAnimation(false), 3000);
    };

    const triggerLoseAnimation = () => {
        setLoseAnimation(true);
        setTimeout(() => setLoseAnimation(false), 2000);
    };

    const handleSpin = async () => {
        if (spinning) return;
        if (bet <= 0) {
            setMessage('Mise invalide');
            return;
        }

        // Reserve funds server-side: deduct bet before spinning
        try {
            setSpinning(true);
            setMessage('Réservation en cours...');

            const reserve = await fetch('/api/currency/me', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: -Math.abs(bet) })
            });

            if (reserve.ok) {
                const json = await reserve.json();
                if (typeof json.balance === 'number') setBalance(json.balance);
            } else {
                // fallback: optimistic local deduction
                setBalance((b) => b - bet);
            }
        } catch (e) {
            console.error('Erreur réservation:', e);
            setBalance((b) => b - bet);
        }

        setMessage('Spinning...');

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

                if (idx === delays.length - 1) {
                    // Stop spinning first
                    setSpinning(false);
                    
                    // Wait a bit before showing result
                    setTimeout(async () => {
                        const result = computeResult(finalSymbols as string[], bet);
                        if (result.win) {
                            // Update biggest win
                            if (result.amount > biggestWin) {
                                setBiggestWin(result.amount);
                            }
                            
                            if (result.amount >= jackpot) {
                                setMessage(`JACKPOT! +${result.amount} Pièces`);
                                setShowConfetti(true);
                                setTimeout(() => setShowConfetti(false), 8000);
                                setJackpot(1000);
                                triggerWinAnimation(result.amount);
                            } else {
                                setMessage(`Gagné +${result.amount} Pièces`);
                                setJackpot((j) => Math.max(1000, j - Math.floor(result.amount / 10)));
                                triggerWinAnimation(result.amount);
                            }

                            // Credit winnings server-side
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
                            // Update biggest loss
                            if (bet > biggestLoss) {
                                setBiggestLoss(bet);
                            }
                            
                            setMessage('Perdu...');
                            setJackpot((j) => j + Math.max(1, Math.floor(bet * 0.2)));
                            triggerLoseAnimation();
                            // Already deducted on reserve; nothing else to do.
                        }
                    }, 300);
                }
            }, d);
            spinTimeouts.current.push(t);
        });
    };

    const formatMoney = (n: number) => n.toLocaleString('fr-FR');

    const reelDisplay = (reel: Reel, index: number) => (
        <div className="relative w-32 h-40 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border-2 border-purple-500/30 shadow-2xl overflow-hidden">
            {/* Glow effect when spinning */}
            {spinning && (
                <motion.div 
                    className="absolute inset-0 bg-purple-500/20 rounded-2xl"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                />
            )}
            
            <motion.div 
                className="flex flex-col items-center justify-center h-full relative z-10"
                animate={spinning ? {
                    y: [0, -280]
                } : {}}
                transition={spinning ? {
                    duration: 0.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: index * 0.2
                } : {}}
            >
                {reel.map((s, i) => (
                    <motion.div 
                        key={`${s}-${i}`} 
                        className={`flex items-center justify-center h-14 w-full transition-all duration-300 ${
                            i === reel.length - 1 && !spinning 
                                ? 'bg-gradient-to-r from-purple-500/30 via-purple-400/30 to-purple-500/30 border-y-2 border-purple-400/50 shadow-lg shadow-purple-500/50' 
                                : ''
                        }`}
                        animate={i === reel.length - 1 && !spinning ? {
                            scale: [1, 1.1, 1],
                        } : {}}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.1
                        }}
                    >
                        <span className="text-4xl drop-shadow-lg leading-none flex items-center justify-center">{s}</span>
                    </motion.div>
                ))}
            </motion.div>
            
            {/* Enhanced overlay effects */}
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none z-20" />
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-20" />
            <div className="absolute inset-0 border-2 border-white/5 rounded-2xl pointer-events-none z-20" />
            
            {/* Side glow effects */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-purple-400/50 to-transparent pointer-events-none z-20" />
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-purple-400/50 to-transparent pointer-events-none z-20" />
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 text-white relative overflow-hidden">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 items-start relative z-10">
                {/* Main Slot Machine */}
                <div className="lg:col-span-3 futuristic-card rounded-3xl p-6 md:p-8 shadow-purple relative overflow-hidden">
                    {/* Decorative corner elements */}
                    <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-purple-500/30 rounded-tl-3xl" />
                    <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-purple-500/30 rounded-tr-3xl" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-purple-500/30 rounded-bl-3xl" />
                    <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-purple-500/30 rounded-br-3xl" />
                    
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between mb-8 relative z-10"
                    >
                        <div className="flex items-center gap-4">
                            <motion.div 
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/50"
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Sparkles size={28} className="text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 bg-clip-text text-transparent">
                                    Slot Machine
                                </h1>
                                <p className="text-gray-400 text-sm md:text-base">Tentez votre chance et gagnez gros !</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="relative bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl p-5 border border-green-500/30 shadow-lg overflow-hidden group hover:shadow-green-500/20 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="flex items-center gap-4 relative z-10">
                                <motion.div 
                                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Zap size={24} className="text-white" />
                                </motion.div>
                                <div className="flex-1">
                                    <p className="text-xs md:text-sm text-gray-400 font-medium mb-1">Votre Solde</p>
                                    <p className="text-xl md:text-2xl font-bold text-green-400 tracking-tight">
                                        {loadingBalance ? (
                                            <motion.span
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                Chargement...
                                            </motion.span>
                                        ) : (
                                            `${formatMoney(balance)} 💰`
                                        )}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative bg-gradient-to-br from-yellow-500/10 to-orange-600/5 rounded-2xl p-5 border border-yellow-500/30 shadow-lg overflow-hidden group hover:shadow-yellow-500/20 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <motion.div 
                                className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                            <div className="flex items-center gap-4 relative z-10">
                                <motion.div 
                                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30"
                                    animate={{ rotate: [0, -10, 10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Crown size={24} className="text-white" />
                                </motion.div>
                                <div className="flex-1">
                                    <p className="text-xs md:text-sm text-gray-400 font-medium mb-1">Jackpot</p>
                                    <motion.p 
                                        className="text-xl md:text-2xl font-bold text-yellow-400 tracking-tight"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        {formatMoney(jackpot)} 🏆
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Slot Machine Reels */}
                    <motion.div 
                        className="relative mb-8 p-6 md:p-10 bg-gradient-to-br from-gray-900/80 via-purple-900/20 to-gray-900/80 rounded-3xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(139, 92, 246, 0.1) 10px, rgba(139, 92, 246, 0.1) 20px)'
                            }} />
                        </div>
                        
                        {/* Glow effect when spinning */}
                        {spinning && (
                            <motion.div 
                                className="absolute inset-0 bg-purple-500/10"
                                animate={{ opacity: [0.1, 0.3, 0.1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                        )}
                        
                        <div className="flex items-center justify-center gap-4 md:gap-8 mb-6 relative z-10">
                            {reels.map((r, i) => (
                                <motion.div 
                                    key={i} 
                                    className="flex items-center justify-center"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                >
                                    {reelDisplay(r, i)}
                                </motion.div>
                            ))}
                        </div>
                        
                        {/* Enhanced winning line indicators */}
                        <motion.div 
                            className="absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent transform -translate-y-1/2 rounded-full"
                            animate={spinning ? { opacity: [0.4, 0.8, 0.4] } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                        <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent transform -translate-y-1/2 rounded-full blur-sm" />
                        
                        {/* Corner decorations */}
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-purple-400/30 rounded-tl-lg" />
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-400/30 rounded-tr-lg" />
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-400/30 rounded-bl-lg" />
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-purple-400/30 rounded-br-lg" />
                    </motion.div>

                    {/* Controls */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-6 relative z-10">
                        <motion.div 
                            className="flex items-center gap-3 bg-gradient-to-br from-gray-900/90 to-gray-800/90 px-5 py-4 rounded-2xl border-2 border-purple-500/30 shadow-lg backdrop-blur-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.5)' }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Target size={22} className="text-purple-400" />
                            </motion.div>
                            <label className="text-sm text-gray-300 font-semibold">Mise</label>
                            <input
                                type="number"
                                min={1}
                                max={Math.max(1, balance)}
                                value={bet}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow empty input for editing
                                    if (value === '') {
                                        setBet(0);
                                        return;
                                    }
                                    const numValue = Number(value);
                                    // Allow any number input, validation happens on spin
                                    if (!isNaN(numValue)) {
                                        setBet(numValue);
                                    }
                                }}
                                onBlur={(e) => {
                                    // Validate on blur to ensure valid range
                                    const numValue = Number(e.target.value);
                                    if (isNaN(numValue) || numValue < 1) {
                                        setBet(1);
                                    } else if (numValue > balance) {
                                        setBet(Math.max(1, balance));
                                    }
                                }}
                                disabled={spinning || loadingBalance}
                                className="nyx-input w-28 text-center font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </motion.div>

                        <motion.button
                            onClick={handleSpin}
                            disabled={spinning || loadingBalance || bet > balance}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: spinning ? 1 : 1.08 }}
                            whileTap={{ scale: spinning ? 1 : 0.92 }}
                            className={`relative px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl flex items-center gap-3 overflow-hidden transition-all duration-300 ${
                                spinning 
                                    ? 'bg-gray-700 cursor-not-allowed' 
                                    : bet > balance
                                    ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                    : 'btn-nyx-primary'
                            }`}
                        >
                            {!spinning && !loadingBalance && bet <= balance && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/20 to-purple-400/0"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                            )}
                            {spinning ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="text-2xl"
                                    >
                                        🎰
                                    </motion.div>
                                    <span>Rotation...</span>
                                </>
                            ) : (
                                <>
                                    <motion.div
                                        animate={{ rotate: [0, 15, -15, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Sparkles size={22} />
                                    </motion.div>
                                    <span>JOUER</span>
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Message Display */}
                    <motion.div 
                        className="text-center min-h-12 mb-2 relative z-10"
                        key={message}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className={`inline-block px-6 py-3 rounded-2xl font-bold text-lg md:text-xl ${
                                message.includes('Gagné') || message.includes('JACKPOT')
                                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 text-green-400 shadow-lg shadow-green-500/30'
                                    : message.includes('Perdu')
                                    ? 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-2 border-red-500/50 text-red-400 shadow-lg shadow-red-500/30'
                                    : 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-500/50 text-purple-300 shadow-lg shadow-purple-500/30'
                            }`}
                            animate={message.includes('JACKPOT') ? { 
                                scale: [1, 1.1, 1],
                                rotate: [0, 2, -2, 0]
                            } : {}}
                            transition={{ duration: 0.5, repeat: message.includes('JACKPOT') ? Infinity : 0 }}
                        >
                            {message}
                        </motion.div>
                    </motion.div>

                    {/* Win/Lose Animations */}
                    <AnimatePresence>
                        {winAnimation && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                            >
                                <motion.div
                                    className="relative"
                                    animate={{ 
                                        y: [0, -20, 0],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 0.6, repeat: 3 }}
                                >
                                    <div className="text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-2xl">
                                        +{formatMoney(lastWinAmount)} 💰
                                    </div>
                                    <motion.div
                                        className="absolute -inset-4 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded-3xl blur-2xl"
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                    />
                                </motion.div>
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-yellow-400/10 rounded-3xl"
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                />
                            </motion.div>
                        )}
                        
                        {loseAnimation && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                            >
                                <motion.div
                                    animate={{ 
                                        x: [-10, 10, -10, 10, 0],
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="text-3xl md:text-5xl font-bold text-gray-400 drop-shadow-lg">
                                        Essayez encore! 🎲
                                    </div>
                                </motion.div>
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-gray-600/10 to-gray-700/10 rounded-3xl"
                                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                                    transition={{ duration: 0.5, repeat: 3 }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Statistics Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="relative bg-gradient-to-br from-emerald-500/10 to-green-600/5 rounded-2xl p-5 border border-emerald-500/30 shadow-lg overflow-hidden group hover:shadow-emerald-500/20 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="flex items-center gap-4 relative z-10">
                                <motion.div 
                                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                                    whileHover={{ scale: 1.1, rotate: 360 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Trophy size={24} className="text-white" />
                                </motion.div>
                                <div className="flex-1">
                                    <p className="text-xs md:text-sm text-gray-400 font-medium mb-1">Plus Gros Gain</p>
                                    <motion.p 
                                        className="text-xl md:text-2xl font-bold text-emerald-400 tracking-tight"
                                        key={biggestWin}
                                        initial={{ scale: 1.2, color: '#10b981' }}
                                        animate={{ scale: 1, color: '#34d399' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {biggestWin > 0 ? `${formatMoney(biggestWin)} 🏆` : '- -'}
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="relative bg-gradient-to-br from-red-500/10 to-rose-600/5 rounded-2xl p-5 border border-red-500/30 shadow-lg overflow-hidden group hover:shadow-red-500/20 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="flex items-center gap-4 relative z-10">
                                <motion.div 
                                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30"
                                    whileHover={{ scale: 1.1, rotate: -360 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Flame size={24} className="text-white" />
                                </motion.div>
                                <div className="flex-1">
                                    <p className="text-xs md:text-sm text-gray-400 font-medium mb-1">Plus Grosse Perte</p>
                                    <motion.p 
                                        className="text-xl md:text-2xl font-bold text-red-400 tracking-tight"
                                        key={biggestLoss}
                                        initial={{ scale: 1.2, color: '#ef4444' }}
                                        animate={{ scale: 1, color: '#f87171' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {biggestLoss > 0 ? `${formatMoney(biggestLoss)} 💸` : '- -'}
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Sidebar */}
                <motion.div 
                    className="futuristic-card rounded-3xl p-6 shadow-purple relative overflow-hidden"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
                    
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <motion.div 
                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/50"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Trophy size={22} className="text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Règles du Jeu</h3>
                            <p className="text-xs text-gray-400">Comment gagner</p>
                        </div>
                    </div>

                    <ul className="text-sm text-gray-300 space-y-3 mb-6 relative z-10">
                        <motion.li 
                            className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-all"
                            whileHover={{ x: 5 }}
                        >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                                <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                            <span className="font-medium">3 symboles identiques = Gros gain</span>
                        </motion.li>
                        <motion.li 
                            className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 hover:bg-yellow-500/10 transition-all"
                            whileHover={{ x: 5 }}
                        >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/30">
                                <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                            <span className="font-medium">7️⃣ = Jackpot instantané</span>
                        </motion.li>
                        <motion.li 
                            className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-all"
                            whileHover={{ x: 5 }}
                        >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                                <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                            <span className="font-medium">2 symboles identiques = Petit gain</span>
                        </motion.li>
                        <motion.li 
                            className="flex items-start gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 hover:bg-purple-500/10 transition-all"
                            whileHover={{ x: 5 }}
                        >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                                <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                            <span className="font-medium">Chaque perte alimente le jackpot</span>
                        </motion.li>
                    </ul>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Flame size={20} className="text-orange-400" />
                            </motion.div>
                            <h4 className="text-lg font-bold text-white">Multiplicateurs</h4>
                        </div>
                        <div className="grid gap-2">
                            {Object.entries(PAYOUTS).map(([sym, mult], index) => (
                                <motion.div 
                                    key={sym} 
                                    className="flex justify-between items-center bg-gradient-to-r from-gray-900/80 to-gray-800/80 px-4 py-3 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all shadow-lg backdrop-blur-sm group"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.05 }}
                                    whileHover={{ scale: 1.03, x: 5 }}
                                >
                                    <span className="text-2xl group-hover:scale-110 transition-transform">{sym}</span>
                                    <motion.span 
                                        className="text-yellow-400 font-bold bg-gradient-to-r from-yellow-400/20 to-orange-400/20 px-4 py-1.5 rounded-lg border border-yellow-400/30 shadow-lg shadow-yellow-500/20"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        x{mult}
                                    </motion.span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Confetti */}
            <AnimatePresence>
                {showConfetti && (
                    <EmojiConfetti key="emoji-confetti" count={150} area={{ width, height }} />
                )}
            </AnimatePresence>
        </div>
    );
}

// Enhanced Emoji Confetti
function EmojiConfetti({ count = 80, area = { width: 1200, height: 800 } }: { count?: number; area?: { width: number; height: number } }) {
    type Particle = { id: number; left: number; delay: number; duration: number; emoji: string; size: number; rotation: number };
    const particles: Particle[] = useMemo(() => Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * area.width,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 4,
        emoji: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        size: 20 + Math.random() * 30,
        rotation: Math.random() * 360
    })), [count, area.width]);

    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ 
                        y: -100, 
                        opacity: 0, 
                        x: p.left,
                        rotate: 0
                    }}
                    animate={{ 
                        y: area.height + 100, 
                        opacity: [0, 1, 1, 0],
                        rotate: p.rotation + 360,
                        x: p.left + (Math.random() - 0.5) * 200
                    }}
                    transition={{ 
                        delay: p.delay, 
                        duration: p.duration, 
                        ease: 'easeOut' 
                    }}
                    style={{ 
                        left: p.left,
                        fontSize: `${p.size}px`
                    }}
                    className="absolute"
                >
                    {p.emoji}
                </motion.div>
            ))}
        </div>
    );
}