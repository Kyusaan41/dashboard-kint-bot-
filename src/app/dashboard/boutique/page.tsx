'use client';

import { useState, useEffect, useMemo, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/context/ThemeContext';
import { getShopItems, getTokenShopItems, buyItem, fetchCurrency, getKshieldStatus, getInventory } from '@/utils/api';
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { 
    ShoppingCart, X, Coins, RefreshCw, Lock, CheckCircle, Sword, Palette, Wrench, 
    Check, Gem, Loader2, Store, Filter, Search, Star, Sparkles, Crown, Zap, Package
} from 'lucide-react';

// --- Types ---
type ShopItem = {
    id: string;
    name: string;
    price: number;
    description: string;
    icon: string;
    type: 'Kint' | 'Utilitaire' | 'Personnalisation' | string;
    category: 'Légendaire' | 'Épique' | 'Rare' | 'Commun' | string;
    action?: string;
};

type InventoryItem = { id: string; name: string; quantity: number; icon?: string; };
type KShieldStatus = { canPurchase: boolean; timeLeft?: number; };

type TokenOffer = {
    id: string;
    label: string;
    priceInTokens: number; // jetons dépensés
    orbsReceived: number;  // orbs obtenues
    description: string;
    highlight?: string;
};

// --- Helpers ---
const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return 'Indisponible';
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
};

const mainCategories = [
    { id: 'Kint', label: '⚔️ Combat', icon: Sword, gradient: 'from-red-500 to-orange-500' },
    { id: 'Utilitaire', label: '🔧 Utilitaire', icon: Wrench, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'Personnalisation', label: '👑 Style', icon: Palette, gradient: 'from-purple-500 to-pink-500' },
];

const rarityConfig = {
    'Légendaire': { 
        color: 'text-orange-400', 
        bg: 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20', 
        border: 'border-orange-500/50', 
        glow: 'shadow-orange-500/30',
        icon: '✨'
    },
    'Épique': { 
        color: 'text-purple-400', 
        bg: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20', 
        border: 'border-purple-500/50', 
        glow: 'shadow-purple-500/30',
        icon: '💜'
    },
    'Rare': { 
        color: 'text-blue-400', 
        bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20', 
        border: 'border-blue-500/50', 
        glow: 'shadow-blue-500/30',
        icon: '💎'
    },
    'Commun': { 
        color: 'text-gray-400', 
        bg: 'bg-gradient-to-br from-gray-500/20 to-gray-600/20', 
        border: 'border-gray-500/50', 
        glow: 'shadow-gray-500/20',
        icon: '⚪'
    },
    'Divers': { 
        color: 'text-gray-500', 
        bg: 'bg-gradient-to-br from-gray-600/20 to-gray-700/20', 
        border: 'border-gray-600/50', 
        glow: 'shadow-gray-600/20',
        icon: '📦'
    }
};
const rarityOrder = Object.keys(rarityConfig);

// Les offres de la boutique de jetons viennent du bot via /api/token-shop

// --- NYXBOT SHOP COMPONENTS ---
const NyxCard: FC<{ children: ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
    const { themeConfig } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay, ease: 'easeOut' }}
            className={`relative overflow-hidden rounded-2xl border shadow-md ${className}`}
            style={{
                borderColor: themeConfig.colors.border,
                backgroundColor: `${themeConfig.colors.surface}f0`,
                boxShadow: `0 0 24px ${themeConfig.colors.primary}22`,
            }}
        >
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
};

// Carte spéciale pour la boutique de jetons (style VIP mais aligné dashboard)
const VipCard: FC<{ children: ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay, ease: 'easeOut' }}
        className={`relative overflow-hidden rounded-2xl border border-amber-500/40 bg-slate-950/95 shadow-md ${className}`}
    >
        <div className="relative z-10">{children}</div>
    </motion.div>
);

const ShopItemCard: FC<{ 
    item: ShopItem, 
    onAddToCart: (item: ShopItem) => void, 
    isOwned: boolean, 
    kshieldStatus: KShieldStatus,
    index: number 
}> = ({ item, onAddToCart, isOwned, kshieldStatus, index }) => {
    const { themeConfig } = useTheme();
    const rarity = rarityConfig[item.category as keyof typeof rarityConfig] || rarityConfig['Divers'];
    let isDisabled = false;
    let buttonText = "Acheter";
    let ButtonIcon = ShoppingCart;
    let buttonClass = 'btn-nyx-primary';

    if (isOwned) {
        isDisabled = true;
        buttonText = "Possédé";
        ButtonIcon = CheckCircle;
        buttonClass = 'bg-green-500/20 text-green-400 cursor-not-allowed border border-green-500/30';
    } else if (item.id === 'KShield' && !kshieldStatus.canPurchase) {
        isDisabled = true;
        buttonText = `Disponible dans ${formatTimeLeft(kshieldStatus.timeLeft || 0)}`;
        ButtonIcon = Lock;
        buttonClass = 'bg-gray-700/50 text-gray-400 cursor-not-allowed';
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className={`relative overflow-hidden group cursor-pointer h-full`}
        >
            {/* Glow Effect allégé */}
            <div className={`absolute inset-0 ${rarity.bg} rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-all duration-300 scale-100 group-hover:scale-105`}></div>

            {/* Main Card */}
            <div
                className={`relative rounded-2xl border ${rarity.border} overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-200 h-full flex flex-col`}
                style={{
                    background: `${themeConfig.colors.surface}f2`,
                    boxShadow: `0 0 24px ${themeConfig.colors.primary}33`,
                }}
            >
                {/* Rarity Strip */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-slate-100/40 to-transparent" />

                {/* Rarity Badge */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 border border-slate-600/60 backdrop-blur">
                    <span className="text-xs">{rarity.icon}</span>
                    <span className={`text-xs font-semibold tracking-wide uppercase ${rarity.color}`}>{item.category}</span>
                </div>

                <div className="p-5 md:p-6 pt-10 md:pt-12 flex flex-col gap-4 md:gap-5 pb-6 md:pb-7">
                    {/* Item Image */}
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-2xl ${rarity.bg} border ${rarity.border} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                            <Image
                                src={item.icon || '/default-icon.png'}
                                alt={item.name}
                                width={40}
                                height={40}
                                className="object-contain drop-shadow-lg"
                            />
                            <motion.div
                                className="absolute -top-1 -right-1 rounded-full bg-slate-900/90 p-1 border border-slate-600/50"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 + index * 0.03 }}
                            >
                                <Sparkles size={12} className="text-purple-300" />
                            </motion.div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                            <h3 className="text-sm md:text-base font-semibold text-white truncate flex items-center gap-2">
                                {item.name}
                            </h3>
                            <p className="text-xs text-gray-400 line-clamp-2 md:line-clamp-3">
                                {item.description}
                            </p>
                        </div>
                    </div>

                    {/* Price & Action */}
                    <div className="mt-auto flex items-end justify-between gap-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] text-gray-500 uppercase tracking-wide">Prix</span>
                            <div
                                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 min-w-[120px] justify-between border"
                                style={{
                                    backgroundColor: `${themeConfig.colors.background}cc`,
                                    borderColor: themeConfig.colors.border,
                                }}
                            >
                                <Coins size={16} style={{ color: themeConfig.colors.accent }} />
                                <span className="text-base md:text-lg font-bold text-white">
                                    {item.price.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <motion.button
                            onClick={() => !isDisabled && onAddToCart(item)}
                            disabled={isDisabled}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 border ${
                                isDisabled
                                    ? 'bg-slate-800/80 text-gray-500 border-slate-700 cursor-not-allowed'
                                    : 'text-white'
                            }`}
                            style={
                                !isDisabled
                                    ? {
                                          background: themeConfig.colors.gradient,
                                          borderColor: themeConfig.colors.secondary,
                                          boxShadow: `0 0 28px ${themeConfig.colors.primary}cc`,
                                      }
                                    : undefined
                            }
                            whileHover={!isDisabled ? { scale: 1.04, y: -1 } : {}}
                            whileTap={!isDisabled ? { scale: 0.96, y: 0 } : {}}
                        >
                            <ButtonIcon size={16} />
                            <span className="whitespace-nowrap text-xs md:text-sm">{buttonText}</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Cart Component
const CartCard: FC<{ 
    cart: ShopItem[], 
    cartTotal: number, 
    userBalance: number | null,
    onRemoveItem: (index: number) => void,
    onPurchase: () => void,
    isPurchasing: boolean
}> = ({ cart, cartTotal, userBalance, onRemoveItem, onPurchase, isPurchasing }) => {
    const { themeConfig } = useTheme();
    return (
        <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-8"
        >
            <NyxCard className="h-full">
                <div className="flex items-center gap-3 mb-6 pt-3">
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-[0_0_25px_rgba(129,140,248,0.9)]">
                        <ShoppingCart size={18} className="text-white" />
                        <motion.div
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400/90 flex items-center justify-center border border-emerald-900/70"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Check size={10} className="text-emerald-950" />
                        </motion.div>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-sm font-semibold tracking-wide text-gray-200 uppercase">Panier</h2>
                        <p className="text-xs text-gray-500">Résumé de tes achats en cours</p>
                    </div>
                    <div
                        className="ml-auto px-2 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 border"
                        style={{
                            backgroundColor: `${themeConfig.colors.primary}26`,
                            borderColor: themeConfig.colors.primary,
                            color: themeConfig.colors.textSecondary,
                        }}
                    >
                        <span>{cart.length}</span>
                        <span>article{cart.length > 1 ? 's' : ''}</span>
                    </div>
                </div>

                {cart.length === 0 ? (
                    <div className="text-center py-10 flex flex-col items-center justify-center gap-3">
                        <div className="relative w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700/70">
                            <ShoppingCart size={24} className="text-slate-500" />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/10 to-indigo-500/10" />
                        </div>
                        <p className="text-sm text-gray-400">Ton panier est vide pour le moment.</p>
                        <p className="text-xs text-gray-500 max-w-[180px]">
                            Parcours la boutique et ajoute des articles pour voir ici un récap complet.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
                            {cart.map((item, index) => (
                                <motion.div 
                                    key={`${item.id}-${index}`}
                                    initial={{ opacity: 0, scale: 0.9, y: 6 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/70 hover:border-purple-400/60 transition-colors duration-300"
                                >
                                    <div className="relative w-9 h-9 rounded-lg bg-slate-900/80 flex items-center justify-center overflow-hidden border border-slate-700/70">
                                        <Image 
                                            src={item.icon || '/default-icon.png'} 
                                            alt={item.name} 
                                            width={28} 
                                            height={28} 
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-100 truncate">{item.name}</p>
                                        <p className="text-xs text-purple-300 flex items-center gap-1 mt-0.5">
                                            <Coins size={12} />
                                            {item.price.toLocaleString()}
                                        </p>
                                    </div>
                                    <motion.button
                                        onClick={() => onRemoveItem(index)}
                                        className="w-7 h-7 rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/40 transition-colors flex items-center justify-center"
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.92 }}
                                    >
                                        <X size={13} />
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>

                        <div className="border-t border-slate-700/70 pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-wide text-gray-400">Total panier</span>
                                <div className="flex items-center gap-2 text-lg font-bold text-purple-200">
                                    <Coins size={18} />
                                    {cartTotal.toLocaleString()}
                                </div>
                            </div>

                            <div className="rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 py-3 space-y-2">
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Solde actuel</span>
                                    <span className="flex items-center gap-1 text-gray-200">
                                        <Coins size={12} />
                                        {userBalance?.toLocaleString() || '0'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span>Solde après achat</span>
                                    <span className={`flex items-center gap-1 font-semibold ${
                                        (userBalance || 0) >= cartTotal ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                        <Coins size={12} />
                                        {((userBalance || 0) - cartTotal).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <motion.button
                                onClick={onPurchase}
                                disabled={isPurchasing || (userBalance !== null && userBalance < cartTotal)}
                                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 border ${
                                    isPurchasing || (userBalance !== null && userBalance < cartTotal)
                                        ? 'bg-slate-800/80 text-gray-500 border-slate-700 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-500 text-white border-purple-300/70 shadow-[0_0_30px_rgba(129,140,248,0.9)] hover:shadow-[0_0_40px_rgba(129,140,248,1)]'
                                }`}
                                whileHover={!isPurchasing && (userBalance === null || userBalance >= cartTotal) ? { scale: 1.03, y: -1 } : {}}
                                whileTap={!isPurchasing && (userBalance === null || userBalance >= cartTotal) ? { scale: 0.97, y: 0 } : {}}
                            >
                                {isPurchasing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        <span>Traitement...</span>
                                    </>
                                ) : (userBalance !== null && userBalance < cartTotal) ? (
                                    <span>❌ Fonds insuffisants</span>
                                ) : (
                                    <>
                                        <ShoppingCart size={16} />
                                        <span>Confirmer l'achat</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </>
                )}
            </NyxCard>
        </motion.div>
    );
};


export default function ShopPage() {
    const { data: session } = useSession();
    const { themeConfig } = useTheme();
    const [items, setItems] = useState<ShopItem[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [ownedTitles, setOwnedTitles] = useState<string[]>([]);
    const [activeMainCategory, setActiveMainCategory] = useState<string>('Kint');
    const [activeRarity, setActiveRarity] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<ShopItem[]>([]);
    const [userBalance, setUserBalance] = useState<number | null>(null);
    const [userTokensBalance, setUserTokensBalance] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [kshieldStatus, setKshieldStatus] = useState<KShieldStatus>({ canPurchase: true });
    const [showSuccess, setShowSuccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState<'rarity' | 'price-asc' | 'price-desc'>('rarity');
    const [activeTab, setActiveTab] = useState<'items' | 'tokens'>('items');
    const [tokenOffers, setTokenOffers] = useState<TokenOffer[]>([]);

    const fetchData = async () => {
        if (!session?.user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const [shopData, tokenShopData, currencyData, kshieldData, inventoryData, titlesData] = await Promise.all([
                getShopItems(),
                getTokenShopItems(),
                fetchCurrency(session.user.id),
                getKshieldStatus(session.user.id),
                getInventory(),
                fetch(`/api/titres/${session.user.id}`).then(res => res.json())
            ]);
            setItems(Array.isArray(shopData) ? shopData : []);
            setTokenOffers(Array.isArray(tokenShopData) ? tokenShopData : []);
            setUserBalance(currencyData.balance);
            if (typeof currencyData.tokens === 'number') {
                setUserTokensBalance(currencyData.tokens);
            }
            setKshieldStatus(kshieldData);
            setInventory(Array.isArray(inventoryData) ? inventoryData : []);
            setOwnedTitles(titlesData.titresPossedes || []);
        } catch (err) {
            setError("Impossible de charger les données de la boutique.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => { if (session) fetchData(); }, [session]);
    
    const subCategories = useMemo(() => {
        const itemsInCategory = items.filter(item => item.type === activeMainCategory);
        const rarities = [...new Set(itemsInCategory.map(item => item.category || 'Divers'))];
        return ['all', ...rarities.sort((a, b) => rarityOrder.indexOf(a) - rarityOrder.indexOf(b))];
    }, [items, activeMainCategory]);

    const filteredItems = useMemo(() => {
        let itemsToShow = items.filter(item => item.type === activeMainCategory);
        if (activeRarity !== 'all') {
            itemsToShow = itemsToShow.filter(item => (item.category || 'Divers') === activeRarity);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            itemsToShow = itemsToShow.filter(item =>
                item.name.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q)
            );
        }

        if (sortOption === 'price-asc') {
            itemsToShow = [...itemsToShow].sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price-desc') {
            itemsToShow = [...itemsToShow].sort((a, b) => b.price - a.price);
        } else if (sortOption === 'rarity') {
            itemsToShow = [...itemsToShow].sort((a, b) =>
                rarityOrder.indexOf(a.category) - rarityOrder.indexOf(b.category)
            );
        }

        return itemsToShow;
    }, [items, activeMainCategory, activeRarity, searchQuery, sortOption]);

    const addToCart = (item: ShopItem) => setCart(prev => [...prev, item]);
    const removeFromCart = (itemIndex: number) => setCart(cart.filter((_, i) => i !== itemIndex));
    const cartTotal = cart.reduce((total, item) => total + item.price, 0);

    const isTokensTab = activeTab === 'tokens';
    const itemsEnabled = true; // Passe à false pour afficher "Ça arrive bientôt !" pour la boutique d'objets
    const tokensEnabled = false; // Passe à false pour afficher "Ça arrive bientôt !" pour la boutique de jetons
    const currentBalance = isTokensTab ? userTokensBalance : userBalance;

    const handleBuyTokenOffer = (offer: TokenOffer) => {
        // Placeholder: à remplacer par un appel API dédié à la conversion jetons -> orbs
        alert(`Conversion de ${offer.priceInTokens.toLocaleString()} jetons en ${offer.orbsReceived} orbe(s) à implémenter.`);
    };

    const handlePurchase = async () => {
        if (cart.length === 0 || isPurchasing) return;
        if (userBalance !== null && userBalance < cartTotal) {
            alert("Fonds insuffisants !");
            return;
        }
        setIsPurchasing(true);
        try {
            await buyItem(cart.map(item => item.id));
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            setCart([]);
            await fetchData();
        } catch (err) {
            alert(`Échec de l'achat : ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        } finally {
            setIsPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="nyx-spinner mb-4"></div>
                    <p className="text-gray-300 text-lg">NyxBot Shop se charge...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Store size={32} className="text-red-400" />
                </div>
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <motion.button 
                    onClick={fetchData} 
                    className="btn-nyx-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <RefreshCw size={18} /> Réessayer
                </motion.button>
            </div>
        );
    }

    return (
        <WithMaintenanceCheck pageId="boutique">
            <div className="space-y-8">
                {/* Success Notification */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div 
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 0.9 }}
                            className="fixed top-8 right-8 z-50 bg-green-500/20 border border-green-500/30 text-green-300 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-xl flex items-center gap-3"
                        >
                            <CheckCircle size={20} />
                            <span className="font-semibold">Achat réalisé avec succès !</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <div
                    className="relative overflow-hidden rounded-3xl border px-6 py-6 lg:px-10 lg:py-8 bg-black/20 backdrop-blur-xl"
                    style={{
                        borderColor: themeConfig.colors.border,
                        boxShadow: `0 0 40px ${themeConfig.colors.primary}33`,
                    }}
                >

                    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 lg:gap-6"
                        >
                            <div className="relative">
                                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.8)]">
                                    <Store size={34} className="text-white" />
                                </div>
                                <motion.div
                                    className="absolute -top-2 -right-2 rounded-full bg-yellow-400/90 p-1.5 shadow-lg"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Crown size={16} className="text-purple-900" />
                                </motion.div>
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold mb-2"
                                     style={{
                                         borderColor: themeConfig.colors.secondary,
                                         backgroundColor: `${themeConfig.colors.primary}33`,
                                         color: themeConfig.colors.textSecondary,
                                     }}
                                >
                                    <Sparkles size={14} className="text-yellow-300" />
                                    <span>Boutique premium NyxBot</span>
                                </div>
                                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-gradient-purple">
                                    NyxBot Shop
                                </h1>
                                <p className="text-gray-300 mt-2 max-w-xl text-sm lg:text-base">
                                    Débloque des avantages, utilitaires et cosmétiques exclusifs pour personnaliser ton expérience avec NyxBot.
                                </p>
                            </div>
                        </motion.div>

                        {currentBalance !== null && (
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="nyx-card relative px-5 py-4 lg:px-6 lg:py-5 bg-gradient-to-br from-purple-600/40 via-purple-500/20 to-indigo-500/30 border border-purple-300/40 shadow-[0_0_50px_rgba(168,85,247,0.6)]"
                            >
                                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(250,250,250,0.14),_transparent_60%)] pointer-events-none" />
                                <div className="relative flex flex-col gap-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-gradient-purple flex items-center justify-center">
                                                <Coins size={18} className={isTokensTab ? 'text-emerald-300' : 'text-yellow-300'} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-purple-100/80 uppercase tracking-wide">
                                                    {isTokensTab ? 'Solde de jetons' : 'Solde disponible'}
                                                </p>
                                                <p className="text-2xl font-extrabold text-white leading-tight">{currentBalance.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <Star size={22} className="text-yellow-300 drop-shadow-md" />
                                    </div>
                                    <p className="text-[11px] text-purple-100/80 flex items-center gap-1.5">
                                        <Zap size={14} className={isTokensTab ? 'text-emerald-300' : 'text-yellow-300'} />
                                        {isTokensTab
                                            ? 'Utilise tes jetons pour les conversions orbs et avantages casino premium.'
                                            : 'Utilise tes pièces pour booster tes combats, sécuriser ton compte ou débloquer des titres uniques.'
                                        }
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
                {/* Onglets Objets / Jetons */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center rounded-full bg-slate-900/70 border border-slate-700/80 p-1">
                        <button
                            onClick={() => setActiveTab('items')}
                            className={`px-4 py-1.5 text-xs md:text-sm rounded-full font-medium transition-all ${
                                activeTab === 'items'
                                    ? 'text-white shadow-[0_0_22px_rgba(129,140,248,0.9)]'
                                    : 'text-gray-400 hover:text-gray-100 hover:bg-slate-800/80'
                            }`}
                            style={activeTab === 'items' ? { background: themeConfig.colors.gradient, boxShadow: `0 0 22px ${themeConfig.colors.primary}e6` } : {}}
                        >
                            Boutique d'objets
                        </button>
                        <button
                            onClick={() => setActiveTab('tokens')}
                            className={`px-4 py-1.5 text-xs md:text-sm rounded-full font-medium transition-all ${
                                activeTab === 'tokens'
                                    ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-black shadow-[0_0_26px_rgba(250,204,21,0.9)] border border-yellow-400/80'
                                    : 'text-gray-400 hover:text-gray-100 hover:bg-slate-800/80'
                            }`}
                        >
                            Boutique de jetons
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {activeTab === 'items' && itemsEnabled ? (
                            <>
                                {/* Category Navigation - nouvelle toolbar de filtres */}
                                <NyxCard>
                                    <div className="flex flex-col gap-3">
                                        {/* Ligne du haut : label + tri */}
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                                <Filter size={14} style={{ color: themeConfig.colors.primary }} />
                                                <span>Filtres rapides</span>
                                            </div>
                                            <select
                                                value={sortOption}
                                                onChange={(e) => setSortOption(e.target.value as any)}
                                                className="rounded-full px-3 py-1.5 text-[11px] text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent"
                                                style={{
                                                    backgroundColor: `${themeConfig.colors.background}cc`,
                                                    borderColor: themeConfig.colors.border,
                                                }}
                                            >
                                                <option value="rarity">Rareté</option>
                                                <option value="price-asc">Prix croissant</option>
                                                <option value="price-desc">Prix décroissant</option>
                                            </select>
                                        </div>

                                        {/* Ligne centrale : recherche */}
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                            <input
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Rechercher un article..."
                                                className="w-full rounded-full pl-8 pr-3 py-2 text-xs md:text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:border-transparent"
                                                style={{
                                                    backgroundColor: `${themeConfig.colors.background}cc`,
                                                    borderColor: themeConfig.colors.border,
                                                    boxShadow: `0 0 0 1px ${themeConfig.colors.border}80`,
                                                }}
                                            />
                                        </div>

                                        {/* Ligne du bas : chips catégories + raretés mélangées */}
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {mainCategories.map((cat, index) => (
                                                <motion.button
                                                    key={cat.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    onClick={() => { setActiveMainCategory(cat.id); setActiveRarity('all'); }}
                                                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                                        activeMainCategory === cat.id ? 'text-white' : 'text-gray-300'
                                                    }`}
                                                    style={
                                                        activeMainCategory === cat.id
                                                            ? {
                                                                  background: themeConfig.colors.gradient,
                                                                  boxShadow: `0 0 14px ${themeConfig.colors.primary}80`,
                                                              }
                                                            : {
                                                                  backgroundColor: `${themeConfig.colors.background}80`,
                                                              }
                                                    }
                                                    whileHover={{ y: -1, scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                >
                                                    <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${cat.gradient}`}>
                                                        <cat.icon size={12} />
                                                    </div>
                                                    <span>{cat.label}</span>
                                                </motion.button>
                                            ))}

                                            {subCategories.map(rarity => {
                                                const rarityInfo = rarityConfig[rarity as keyof typeof rarityConfig];
                                                return (
                                                    <motion.button
                                                        key={rarity}
                                                        onClick={() => setActiveRarity(rarity)}
                                                        className={`rounded-full px-3 py-1 text-[11px] transition-all flex items-center gap-1 ${
                                                            activeRarity === rarity ? 'text-white' : 'text-gray-400'
                                                        }`}
                                                        style={
                                                            activeRarity === rarity
                                                                ? {
                                                                      background: themeConfig.colors.gradient,
                                                                      boxShadow: `0 0 10px ${themeConfig.colors.primary}80`,
                                                                  }
                                                                : {
                                                                      backgroundColor: `${themeConfig.colors.background}80`,
                                                                  }
                                                        }
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        {rarity !== 'all' && rarityInfo && (
                                                            <span>{rarityInfo.icon}</span>
                                                        )}
                                                        <span>{rarity === 'all' ? 'Toutes' : rarity}</span>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </NyxCard>

                                {/* Items Grid */}
                                <AnimatePresence mode="wait">
                                    {filteredItems.length > 0 ? (
                                        <motion.div
                                            key={`${activeMainCategory}-${activeRarity}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                                        >
                                            {filteredItems.map((item, index) => {
                                                const isInventoryOwned = inventory.some(invItem => invItem.id === item.id);
                                                const isTitleOwned = item.type === 'Personnalisation' && ownedTitles.some(ownedTitle => 
                                                    ownedTitle.trim().toLowerCase() === item.name.trim().toLowerCase()
                                                );
                                                const isOwned = isInventoryOwned || isTitleOwned;
                                                
                                                return (
                                                    <ShopItemCard 
                                                        key={item.id} 
                                                        item={item} 
                                                        onAddToCart={addToCart} 
                                                        isOwned={isOwned} 
                                                        kshieldStatus={kshieldStatus}
                                                        index={index}
                                                    />
                                                );
                                            })}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-16"
                                        >
                                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
                                                <Package size={32} className="text-gray-500" />
                                            </div>
                                            <p className="text-gray-500 text-lg">Aucun article dans cette catégorie</p>
                                            <p className="text-gray-600 text-sm mt-2">Essayez une autre catégorie ou rareté</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        ) : activeTab === 'items' && !itemsEnabled ? (
                            <NyxCard>
                                <div className="py-10 flex flex-col items-center justify-center gap-3 text-center">
                                    <Store size={32} className="text-gray-400" />
                                    <p className="text-sm md:text-base text-gray-200 font-medium">La boutique d'objets arrive bientôt !</p>
                                    <p className="text-xs md:text-sm text-gray-500 max-w-sm">
                                        Reviens un peu plus tard, de nouveaux objets exclusifs seront bientôt disponibles ici.
                                    </p>
                                </div>
                            </NyxCard>
                        ) : activeTab === 'tokens' && !tokensEnabled ? (
                            <NyxCard>
                                <div className="py-10 flex flex-col items-center justify-center gap-3 text-center">
                                    <Coins size={32} className="text-yellow-400" />
                                    <p className="text-sm md:text-base text-gray-200 font-medium">La boutique de jetons arrive bientôt !</p>
                                    <p className="text-xs md:text-sm text-gray-500 max-w-sm">
                                        Cette section sera bientôt disponible avec des offres spéciales.
                                    </p>
                                </div>
                            </NyxCard>
                        ) : (
                            <>
                                <VipCard>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between gap-3 flex-wrap">
                                            <div>
                                                <h2 className="text-lg font-bold text-yellow-100 flex items-center gap-2">
                                                    <Coins size={18} className="text-yellow-400" />
                                                    Boutique de jetons
                                                </h2>
                                                <p className="text-xs md:text-sm text-gray-300 mt-1 max-w-xl">
                                                    Dépense tes jetons durement gagnés pour obtenir des orbs et des avantages VIP exclusifs. Bienvenue dans le salon privé de NyxBot.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </VipCard>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {tokenOffers.map((offer, index) => (
                                        <motion.div
                                            key={offer.id}
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: index * 0.08 }}
                                            whileHover={{ y: -6, scale: 1.02 }}
                                            className="relative"
                                        >
                                            <VipCard className="h-full">
                                                <div className="flex flex-col gap-4 p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-400/80">Offre VIP</p>
                                                            <h3 className="text-lg font-bold text-yellow-50">{offer.label}</h3>
                                                        </div>
                                                        {offer.highlight && (
                                                            <span className="text-[10px] px-2 py-1 rounded-full bg-yellow-500/15 border border-yellow-400/40 text-yellow-200 font-medium">
                                                                {offer.highlight}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-end justify-between gap-3">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[11px] text-gray-400 uppercase tracking-wide">Coût en jetons</span>
                                                            <div className="text-2xl font-extrabold text-yellow-300 flex items-baseline gap-1 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]">
                                                                {offer.priceInTokens.toLocaleString()}
                                                                <span className="text-[11px] text-gray-400">jetons</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-[11px] text-gray-400 uppercase tracking-wide">Orbs obtenues</span>
                                                            <div className="inline-flex items-center gap-2 rounded-xl bg-black/70 border border-yellow-500/40 px-3 py-1.5">
                                                                <Gem size={14} className="text-yellow-200" />
                                                                <span className="text-sm font-semibold text-yellow-50">{offer.orbsReceived} orbe(s)</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-gray-300 line-clamp-2">{offer.description}</p>

                                                    <motion.button
                                                        onClick={() => handleBuyTokenOffer(offer)}
                                                        className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl w-full py-2.5 text-sm font-semibold bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-black border border-yellow-300/80 shadow-[0_0_28px_rgba(250,204,21,0.9)] hover:shadow-[0_0_38px_rgba(250,204,21,1)] transition-all"
                                                        whileHover={{ scale: 1.03, y: -1 }}
                                                        whileTap={{ scale: 0.97, y: 0 }}
                                                    >
                                                        <ShoppingCart size={16} />
                                                        <span>Dépenser {offer.priceInTokens.toLocaleString()} jetons</span>
                                                    </motion.button>
                                                </div>
                                            </VipCard>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Sidebar with Cart */}
                    <div className="lg:col-span-1 mt-4 lg:mt-2">
                        {activeTab === 'items' ? (
                            <CartCard
                                cart={cart}
                                cartTotal={cartTotal}
                                userBalance={userBalance}
                                onRemoveItem={removeFromCart}
                                onPurchase={handlePurchase}
                                isPurchasing={isPurchasing}
                            />
                        ) : (
                            <VipCard>
                                <div className="space-y-3 p-4 text-sm text-gray-200">
                                    <h3 className="text-base font-semibold text-yellow-100 flex items-center gap-2">
                                        <Gem size={16} className="text-yellow-300" />
                                        Salon VIP des jetons
                                    </h3>
                                    <p className="text-xs text-gray-300">
                                        Les jetons sont utilisés pour les jeux de casino et autres fonctionnalités ludiques de NyxBot.
                                    </p>
                                    <p className="text-xs text-gray-300">
                                        Utilise cette boutique pour dépenser tes jetons et acheter des objets premium comme des orbes et d'autres privilèges.
                                    </p>
                                </div>
                            </VipCard>
                        )}
                    </div>
                </div>
            </div>
        </WithMaintenanceCheck>
    );
}