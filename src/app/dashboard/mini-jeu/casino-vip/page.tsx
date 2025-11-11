'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
    Coins, Crown, Dices, Sparkles, Star, 
    PlayCircle, Lock, Zap, TrendingUp, Flame, Diamond, Users
} from 'lucide-react'
import { NyxCard } from '@/components/ui/NyxCard'
import { useState, useEffect } from 'react'

// Game Statistics Component
const GameStats = ({ icon, label, value, color = "text-yellow-400" }: {
    icon: React.ReactNode, 
    label: string, 
    value: string | number,
    color?: string
}) => (
    <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-yellow-600/30">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`font-bold ${color}`}>{value}</p>
        </div>
    </div>
);

// VIP Casino Game Card Component
const VIPGameCard = ({ 
    href, 
    icon, 
    title, 
    description, 
    isAvailable = true, 
    minBet,
    maxWin,
    isNew = false,
    isHot = false
}: { 
    href: string, 
    icon: React.ReactNode, 
    title: string, 
    description: string,
    isAvailable?: boolean,
    minBet?: string,
    maxWin?: string,
    isNew?: boolean,
    isHot?: boolean
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const CardContent = (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            whileHover={isAvailable ? { scale: 1.03, y: -5 } : {}}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                relative overflow-hidden h-full backdrop-blur-sm rounded-2xl border-2 transition-all duration-500 group
                ${
                    isAvailable 
                        ? 'bg-gradient-to-br from-yellow-900/20 via-black/80 to-yellow-800/20 border-yellow-600/50 hover:border-yellow-400/80 hover:shadow-2xl hover:shadow-yellow-500/30 cursor-pointer' 
                        : 'bg-gray-900/50 border-gray-700/30 cursor-not-allowed opacity-75'
                }
            `}
        >
            {/* Luxury Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-yellow-600 to-amber-500 rounded-full blur-2xl" />
            </div>
            
            {/* Animated sparkles */}
            {isAvailable && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                            }}
                        />
                    ))}
                </div>
            )}
            
            {/* Status Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                {isNew && (
                    <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                        <Sparkles className="h-3 w-3" />
                        NOUVEAU
                    </div>
                )}
                {isHot && (
                    <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                        <Flame className="h-3 w-3" />
                        POPULAIRE
                    </div>
                )}
                {!isAvailable && (
                    <div className="px-3 py-1 bg-gray-700/90 text-gray-300 text-xs font-bold rounded-full flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        BIENTÔT
                    </div>
                )}
            </div>

            <div className="relative p-8 h-full flex flex-col z-10">
                {/* Game Icon */}
                <motion.div 
                    animate={isHovered && isAvailable ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`
                        w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl border-2 text-4xl
                        ${
                            isAvailable 
                                ? 'bg-gradient-to-br from-yellow-500 to-orange-600 border-yellow-400/50 text-white shadow-2xl shadow-yellow-500/50' 
                                : 'bg-gray-700/50 border-gray-600/50 text-gray-400'
                        }
                    `}
                >
                    {icon}
                </motion.div>

                
                
                {/* Game Title */}
                <h2 className={`text-3xl font-bold text-center mb-3 ${
                    isAvailable ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500' : 'text-gray-400'
                }`}>
                    {title}
                </h2>
                
                {/* Description */}
                <p className="text-gray-300 text-center text-sm mb-6 flex-grow leading-relaxed">
                    {description}
                </p>
                
                {/* Game Stats */}
                <div className="space-y-3 mb-6">
                    {minBet && (
                        <GameStats 
                            icon={<Coins className="h-4 w-4 text-yellow-400" />} 
                            label="Mise minimum" 
                            value={minBet}
                            color="text-yellow-400"
                        />
                    )}
                    {maxWin && (
                        <GameStats 
                            icon={<TrendingUp className="h-4 w-4 text-green-400" />} 
                            label="Gain maximum" 
                            value={maxWin}
                            color="text-green-400"
                        />
                    )}
                </div>
                
                {/* Action Button */}
                <motion.div 
                    whileHover={isAvailable ? { scale: 1.05 } : {}}
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                    className={`
                        mt-auto p-4 rounded-xl text-center font-bold transition-all duration-300 flex items-center justify-center gap-3
                        ${
                            isAvailable 
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-400 hover:to-orange-500 shadow-lg hover:shadow-yellow-500/50' 
                                : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    {isAvailable ? (
                        <>
                            <PlayCircle className="h-5 w-5" />
                            Jouer maintenant
                        </>
                    ) : (
                        <>
                            <Lock className="h-5 w-5" />
                            Bientôt disponible
                        </>
                    )}
                </motion.div>
            </div>
            
            {/* Hover Glow Effect */}
            {isAvailable && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 0.2 : 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl"
                />
            )}
        </motion.div>
    );

    return isAvailable ? (
        <Link href={href} className="block h-full">
            {CardContent}
        </Link>
    ) : CardContent;
};

// Floating gold particles
const FloatingGoldParticle = ({ delay }: { delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ 
            opacity: [0, 1, 0], 
            y: [-20, -100],
            x: [0, Math.random() * 100 - 50]
        }}
        transition={{
            duration: 4,
            repeat: Infinity,
            delay: delay,
            ease: "easeOut"
        }}
        className="absolute w-2 h-2 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50"
        style={{
            left: `${Math.random() * 100}%`,
            bottom: '10%'
        }}
    />
);

export default function CasinoVIPHome() {
    const [currentTime, setCurrentTime] = useState('');
    const [buyAmount, setBuyAmount] = useState<number>(100);
    const [loadingExchange, setLoadingExchange] = useState<boolean>(false);
    const [exchangeMessage, setExchangeMessage] = useState<string>('');
    const [coinsBalance, setCoinsBalance] = useState<number>(0);
    
    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(new Date().toLocaleTimeString('fr-FR'));
        };
        
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Charger le solde de pièces pour afficher ce que l'utilisateur peut dépenser
    useEffect(() => {
        const loadCurrency = async () => {
            try {
                const res = await fetch('/api/currency/me');
                if (!res.ok) return;
                const data = await res.json();
                if (typeof data.balance === 'number') setCoinsBalance(data.balance);
            } catch {}
        };
        loadCurrency();
    }, []);

    return (
        <div className="min-h-screen w-full text-white relative">
            
            <div className="relative z-10 px-8 py-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="text-center mb-16"
                >
                    {/* Main Title */}
                    <div className="mb-6 flex items-center justify-center gap-6">
                        <motion.div 
                            animate={{ 
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                            className="p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-2xl shadow-yellow-500/50"
                        >
                            <Crown className="h-12 w-12 text-white" />
                        </motion.div>
                        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                            Carré VIP
                        </h1>
                        <motion.div 
                            animate={{ 
                                rotate: [0, -10, 10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse",
                                delay: 1
                            }}
                            className="p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-2xl shadow-yellow-500/50"
                        >
                            <Diamond className="h-12 w-12 text-white" />
                        </motion.div>
                    </div>
                    
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
                    >
                        Bienvenue dans l'espace exclusif du casino. Découvrez nos jeux de luxe et tentez de remporter le jackpot ! 🎰✨
                    </motion.p>
                    
                    {/* VIP Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                        className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border-2 border-yellow-500/50 rounded-full backdrop-blur-sm"
                    >
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="text-yellow-300 font-bold">Accès VIP Exclusif</span>
                        <Star className="h-5 w-5 text-yellow-400" />
                    </motion.div>
                    
                    {/* Status Bar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 }}
                        className="flex items-center justify-center gap-8 text-sm text-gray-400 mt-6"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span>Casino ouvert 24/7</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            <span>{currentTime}</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Jetons - Achat (VIP) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="max-w-6xl mx-auto mt-4"
                >
                    <div className="relative bg-black/30 backdrop-blur-2xl rounded-2xl p-1 border-2 border-transparent overflow-hidden transition-all duration-300 shadow-yellow-500/20">
                        <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
                            style={{
                                border: '2px solid transparent',
                                background: 'conic-gradient(from var(--angle), rgba(234,179,8,0.5), rgba(249,115,22,0.3), rgba(234,179,8,0.5)) border-box',
                                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                maskComposite: 'exclude',
                                ['--angle' as any]: '0deg',
                            }}
                            animate={{ ['--angle' as any]: '360deg' }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        />
                        <div className="relative z-10 p-4 rounded-xl bg-gradient-to-br from-yellow-900/15 to-black/40 border border-yellow-600/20">
                            <div className="flex flex-col gap-3 items-center text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 shadow-yellow-500/40 flex items-center justify-center shadow">
                                            <Coins className="text-white" size={18} />
                                        </div>
                                        <h3 className="text-sm font-extrabold tracking-wide text-yellow-300">Acheter des Jetons</h3>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center">
                                        <span className="text-[11px] px-2 py-1 rounded-full border border-yellow-600/40 text-yellow-300/90 bg-yellow-500/10 whitespace-nowrap">Taux: 1000 💎 = 500 💰</span>
                                        <span className="text-[11px] text-gray-400 whitespace-nowrap">Solde: {coinsBalance.toLocaleString('fr-FR')} 💰</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 justify-center">
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-yellow-400 text-xs">💎</span>
                                        <input
                                            type="number"
                                            min={1}
                                            value={buyAmount}
                                            onChange={(e) => setBuyAmount(Math.max(1, Number(e.target.value)))}
                                            className="nyx-input pl-7 pr-3 h-10 w-32 text-sm text-center font-bold"
                                            disabled={loadingExchange}
                                        />
                                    </div>
                                    <motion.button
                                        disabled={loadingExchange || buyAmount <= 0 || Math.ceil(Math.max(1, buyAmount) * 0.5) > coinsBalance}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={async () => {
                                            if (buyAmount <= 0 || loadingExchange) return;
                                            setLoadingExchange(true);
                                            setExchangeMessage('');
                                            try {
                                                const res = await fetch('/api/jetons/exchange', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ action: 'buy', amount: buyAmount })
                                                });
                                                const data = await res.json();
                                                if (res.ok) {
                                                    setExchangeMessage(`Acheté ${data.bought?.toLocaleString('fr-FR')} jetons pour ${data.cost?.toLocaleString('fr-FR')} pièces.`);
                                                    if (typeof data.currencyBalance === 'number') setCoinsBalance(data.currencyBalance);
                                                } else {
                                                    setExchangeMessage(data.error || 'Achat impossible.');
                                                }
                                            } catch (e) {
                                                setExchangeMessage('Erreur interne.');
                                            } finally {
                                                setLoadingExchange(false);
                                            }
                                        }}
                                        className="h-10 px-4 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow hover:from-yellow-400 hover:to-orange-500 disabled:opacity-50"
                                    >
                                        {loadingExchange ? '...' : 'Acheter'}
                                    </motion.button>
                                </div>

                                {/* Presets rapides */}
                                <div className="flex items-center gap-2 justify-center">
                                    {([100, 500, 1000] as number[]).map((p) => {
                                        const cost = Math.ceil(p * 0.5);
                                        const disabled = coinsBalance < cost || loadingExchange;
                                        return (
                                            <motion.button
                                                key={p}
                                                disabled={disabled}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => setBuyAmount(p)}
                                                className={`h-8 px-3 rounded-md text-xs font-bold border ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'} bg-yellow-500/10 text-yellow-300 border-yellow-600/30`}
                                            >
                                                +{p.toLocaleString('fr-FR')} 💎
                                            </motion.button>
                                        );
                                    })}
                                    <motion.button
                                        disabled={coinsBalance <= 0 || loadingExchange}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setBuyAmount(Math.max(1, Math.floor(coinsBalance * 2)))}
                                        className={`h-8 px-3 rounded-md text-xs font-bold border ${coinsBalance <= 0 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'} bg-yellow-500/10 text-yellow-300 border-yellow-600/30`}
                                        title="Utiliser le maximum disponible"
                                    >
                                        MAX
                                    </motion.button>
                                </div>

                                {/* Barre d'accessibilité du coût */}
                                <div className="space-y-1 w-full max-w-md">
                                    <div className="h-2 w-full rounded-full bg-black/30 border border-yellow-600/20 overflow-hidden mx-auto">
                                        {(() => {
                                            const cost = Math.ceil(Math.max(1, buyAmount) * 0.5);
                                            const ratio = coinsBalance > 0 ? Math.min(100, Math.floor((cost / coinsBalance) * 100)) : 0;
                                            return (
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${ratio}%` }}
                                                    transition={{ duration: 0.3 }}
                                                    className={`h-full ${cost <= coinsBalance ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
                                                />
                                            );
                                        })()}
                                    </div>
                                    <div className="flex items-center justify-center gap-4 text-[11px]">
                                        <span className={`font-medium ${Math.ceil(Math.max(1, buyAmount) * 0.5) <= coinsBalance ? 'text-emerald-300' : 'text-red-300'}`}>
                                            Coût: {(Math.ceil(Math.max(1, buyAmount) * 0.5)).toLocaleString('fr-FR')} 💰
                                        </span>
                                        <span className="text-gray-400">Max: {(Math.max(0, Math.floor(coinsBalance * 2))).toLocaleString('fr-FR')} 💎</span>
                                    </div>
                                </div>

                                {/* Message retour */}
                                {exchangeMessage && (
                                    <div className="text-[11px] font-semibold text-yellow-300 truncate text-center max-w-md">
                                        {exchangeMessage}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Games Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.8 }}
                    className="max-w-6xl mx-auto"
                >
                    <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
                        <Sparkles className="h-8 w-8 text-yellow-400" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500">
                            Nos Jeux Exclusifs
                        </span>
                    </h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Slot Machine - Available */}
                        <VIPGameCard 
                            href="/dashboard/mini-jeu/casino"
                            icon={<span className="text-4xl">🎰</span>}
                            title="Slot Machine"
                            description="La machine à sous classique ! Alignez les symboles et remportez des gains incroyables. Jackpot progressif disponible !"
                            isAvailable={true}
                            minBet="10 pièces"
                            maxWin="x50 multiplicateur"
                            isHot={true}
                        />
                        
                       

                        {/* Blackjack - NEW */}
                        <VIPGameCard
                            href="/dashboard/mini-jeu/blackjack"
                            icon={<Dices />}
                            title="Blackjack"
                            description="Le classique du casino. Affrontez le croupier, visez 21 et montrez votre maîtrise de la stratégie."
                            isAvailable={true}
                            minBet="100 pièces"
                            maxWin="x2.5 (Blackjack)"
                            isNew={true}
                        />

                    


                    </div>
                </motion.div>


                {/* Coming Soon Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="mt-20 text-center"
                >
                    <NyxCard delay={0}>
                        <div className="p-8 text-center bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-2 border-yellow-600/30 rounded-2xl">
                            <Crown className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 mb-3">
                                Plus de Jeux à Venir
                            </h3>
                            <p className="text-gray-300 mb-6">
                                Nous préparons d'autres jeux exclusifs pour le carré VIP. Blackjack, Poker, Roulette et bien plus encore !
                            </p>
                            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-400" />
                                    <span>Jackpots progressifs</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-yellow-400" />
                                    <span>Bonus quotidiens</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Crown className="h-4 w-4 text-yellow-400" />
                                    <span>Tournois VIP</span>
                                </div>
                            </div>
                        </div>
                    </NyxCard>
                </motion.div>
            </div>
        </div>
    );
}