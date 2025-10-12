"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
                    const result = computeResult(finalSymbols as string[], bet);
                    if (result.win) {
                        if (result.amount >= jackpot) {
                            setMessage(`JACKPOT! +${result.amount} Pièces`);
                            setShowConfetti(true);
                            setTimeout(() => setShowConfetti(false), 8000);
                            setJackpot(1000);
                            triggerWinAnimation(result.amount);
                        } else {
                            setMessage(`Gagné +${result.amount}`);
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
                        setMessage('Perdu...');
                        setJackpot((j) => j + Math.max(1, Math.floor(bet * 0.2)));
                        triggerLoseAnimation();
                        // Already deducted on reserve; nothing else to do.
                    }
                    setSpinning(false);
                }
            }, d);
            spinTimeouts.current.push(t);
        });
    };

    const formatMoney = (n: number) => n.toLocaleString('fr-FR');

    const reelDisplay = (reel: Reel, index: number) => (
        <div className="relative w-28 h-28 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 border-yellow-600/50 shadow-lg overflow-hidden">
            <motion.div 
                className="flex flex-col items-center justify-center h-full"
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
                    <div 
                        key={`${s}-${i}`} 
                        className={`flex items-center justify-center h-14 w-full ${
                            i === reel.length - 1 ? 'bg-yellow-500/20 border-y-2 border-yellow-400' : ''
                        }`}
                    >
                        <span className="text-3xl">{s}</span>
                    </div>
                ))}
            </motion.div>
            
            {/* Overlay effects */}
            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 border-2 border-white/10 rounded-xl pointer-events-none" />
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-indigo-900/80 text-white relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-conic from-transparent via-purple-500/10 to-transparent animate-spin-slow" />
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-conic from-transparent via-blue-500/10 to-transparent animate-spin-slow" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative z-10">
                <div className="md:col-span-2 bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-2xl">
                    <h2 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        Slot Machine
                    </h2>

                    <div className="flex items-center justify-between mb-8">
                        <div className="text-center flex-1">
                            <p className="text-sm text-gray-400 mb-1">Solde</p>
                            <motion.p 
                                className="text-3xl font-bold text-green-400"
                                key={balance}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {loadingBalance ? 'Chargement...' : `${formatMoney(balance)} Pièces`}
                            </motion.p>
                        </div>
                        <div className="text-center flex-1">
                            <p className="text-sm text-gray-400 mb-1">Jackpot</p>
                            <motion.p 
                                className="text-3xl font-bold text-yellow-400"
                                key={jackpot}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {formatMoney(jackpot)} Pièces
                            </motion.p>
                        </div>
                    </div>

                    {/* Slot Machine Reels */}
                    <div className="relative mb-8 p-6 bg-gray-800/50 rounded-2xl border border-gray-600 shadow-inner">
                        <div className="flex items-center justify-center gap-6 mb-4">
                            {reels.map((r, i) => (
                                <div key={i} className="flex items-center justify-center">
                                    {reelDisplay(r, i)}
                                </div>
                            ))}
                        </div>
                        
                        {/* Winning line indicators */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-yellow-400/30 transform -translate-y-1/2 rounded-full" />
                        <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-yellow-400/20 transform -translate-y-1/2 rounded-full" />
                        <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-yellow-400/20 transform -translate-y-1/2 rounded-full" />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-6 mb-6">
                        <div className="flex items-center gap-3 bg-gray-800/80 px-4 py-3 rounded-xl border border-gray-600">
                            <label className="text-sm text-gray-300 font-medium">Mise</label>
                            <input
                                type="number"
                                min={1}
                                max={Math.max(1, balance)}
                                value={bet}
                                onChange={(e) => setBet(Math.max(1, Math.min(Math.max(1, balance), Number(e.target.value || 0))))}
                                className="w-20 text-center bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg font-bold"
                            />
                        </div>

                        <motion.button
                            onClick={handleSpin}
                            disabled={spinning || loadingBalance || bet > balance}
                            whileHover={{ scale: spinning ? 1 : 1.05 }}
                            whileTap={{ scale: spinning ? 1 : 0.95 }}
                            className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg ${
                                spinning 
                                    ? 'bg-gray-600 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400'
                            } ${bet > balance ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            {spinning ? (
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    🎰
                                </motion.span>
                            ) : (
                                'SPIN'
                            )}
                        </motion.button>
                    </div>

                    {/* Message Display */}
                    <motion.div 
                        className="text-center text-xl font-semibold min-h-8 mb-2"
                        key={message}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {message}
                    </motion.div>

                    {/* Win/Lose Animations */}
                    <AnimatePresence>
                        {winAnimation && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                                <div className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                    +{formatMoney(lastWinAmount)} KIP!
                                </div>
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-2xl"
                                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                />
                            </motion.div>
                        )}
                        
                        {loseAnimation && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                                <div className="text-5xl font-bold text-gray-400">
                                    Essayez encore!
                                </div>
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-2xl"
                                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar */}
                <aside className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-2xl">
                    <h3 className="text-2xl font-bold mb-4 text-yellow-400">Règles du Jeu</h3>
                    <ul className="text-sm text-gray-300 space-y-3 mb-6">
                        <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>Triple symbole = gros gain (7️⃣ = jackpot)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>Deux symboles identiques = petit gain</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>Chaque perte alimente le jackpot</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">ℹ</span>
                            <span>House edge: 6% approximatif</span>
                        </li>
                    </ul>

                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-yellow-400 mb-3">Coefficients</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {Object.entries(PAYOUTS).map(([sym, mult]) => (
                                <motion.div 
                                    key={sym} 
                                    className="flex justify-between items-center bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <span className="text-xl">{sym}</span>
                                    <span className="text-yellow-300 font-bold">x{mult}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6">
                        <motion.button 
                            onClick={() => { setBalance(500); setJackpot(10000); setMessage('Reset effectué'); }} 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 text-sm font-semibold"
                        >
                            Réinitialiser
                        </motion.button>
                    </div>
                </aside>
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