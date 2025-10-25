'use client';

import { useState, useEffect, useMemo, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { getShopItems, buyItem, fetchCurrency, getKshieldStatus, getInventory } from '@/utils/api';
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

// --- NYXBOT SHOP COMPONENTS ---
const NyxCard: FC<{ children: ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        className={`nyx-card ${className}`}
    >
        {children}
    </motion.div>
);

const ShopItemCard: FC<{ 
    item: ShopItem, 
    onAddToCart: (item: ShopItem) => void, 
    isOwned: boolean, 
    kshieldStatus: KShieldStatus,
    index: number 
}> = ({ item, onAddToCart, isOwned, kshieldStatus, index }) => {
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
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`relative overflow-hidden group cursor-pointer`}
        >
            {/* Glow Effect */}
            <div className={`absolute inset-0 ${rarity.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100`}></div>
            
            {/* Main Card */}
            <div className={`relative nyx-card border ${rarity.border} hover:border-opacity-100 transition-all duration-300`}>
                {/* Rarity Badge */}
                <div className={`absolute top-4 right-4 ${rarity.bg} ${rarity.border} border rounded-lg px-2 py-1 z-10`}>
                    <span className="text-xs font-bold flex items-center gap-1">
                        <span>{rarity.icon}</span>
                        <span className={rarity.color}>{item.category}</span>
                    </span>
                </div>

                <div className="p-6">
                    {/* Item Image */}
                    <div className="relative mb-4">
                        <div className={`w-20 h-20 mx-auto rounded-xl ${rarity.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300`}>
                            <Image 
                                src={item.icon || '/default-icon.png'} 
                                alt={item.name} 
                                width={48} 
                                height={48} 
                                className="object-contain" 
                            />
                        </div>
                        
                        {/* Sparkle Effect */}
                        <motion.div 
                            className="absolute top-0 left-1/2 transform -translate-x-1/2 text-purple-secondary"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles size={16} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                    </div>

                    {/* Item Info */}
                    <h3 className="text-lg font-bold text-white text-center mb-2 group-hover:text-purple-secondary transition-colors duration-300">
                        {item.name}
                    </h3>
                    <p className="text-sm text-gray-400 text-center mb-4 h-10 line-clamp-2">
                        {item.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="flex items-center gap-1 px-3 py-1 bg-gradient-purple rounded-lg">
                            <Coins size={16} className="text-yellow-400" />
                            <span className="text-lg font-bold text-white">
                                {item.price.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <motion.button
                        onClick={() => !isDisabled && onAddToCart(item)}
                        disabled={isDisabled}
                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${buttonClass}`}
                        whileHover={!isDisabled ? { scale: 1.05 } : {}}
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    >
                        <ButtonIcon size={18} />
                        <span>{buttonText}</span>
                    </motion.button>
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
    return (
        <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            className="nyx-card sticky top-8"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-purple flex items-center justify-center">
                    <ShoppingCart size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Panier</h2>
                <div className="ml-auto px-2 py-1 bg-purple-primary/20 text-purple-secondary text-sm rounded-lg">
                    {cart.length} articles
                </div>
            </div>

            {cart.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                        <ShoppingCart size={24} className="text-gray-500" />
                    </div>
                    <p className="text-gray-500">Votre panier est vide</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                        {cart.map((item, index) => (
                            <motion.div 
                                key={`${item.id}-${index}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 p-3 bg-purple-primary/5 rounded-lg border border-purple-primary/20"
                            >
                                <Image 
                                    src={item.icon || '/default-icon.png'} 
                                    alt={item.name} 
                                    width={32} 
                                    height={32} 
                                    className="rounded"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">{item.name}</p>
                                    <p className="text-sm text-purple-secondary flex items-center gap-1">
                                        <Coins size={14} />
                                        {item.price.toLocaleString()}
                                    </p>
                                </div>
                                <motion.button
                                    onClick={() => onRemoveItem(index)}
                                    className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X size={14} />
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="border-t border-purple-primary/20 pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-bold text-white">Total</span>
                            <div className="flex items-center gap-2 text-xl font-bold text-purple-secondary">
                                <Coins size={20} />
                                {cartTotal.toLocaleString()}
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                                <span>Solde actuel</span>
                                <span className="flex items-center gap-1">
                                    <Coins size={14} />
                                    {userBalance?.toLocaleString() || '0'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span>Solde après achat</span>
                                <span className={`flex items-center gap-1 font-medium ${
                                    (userBalance || 0) >= cartTotal ? 'text-green-400' : 'text-red-400'
                                }`}>
                                    <Coins size={14} />
                                    {((userBalance || 0) - cartTotal).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <motion.button
                            onClick={onPurchase}
                            disabled={isPurchasing || (userBalance !== null && userBalance < cartTotal)}
                            className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                                isPurchasing || (userBalance !== null && userBalance < cartTotal)
                                    ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                                    : 'btn-nyx-primary'
                            }`}
                            whileHover={!isPurchasing && (userBalance === null || userBalance >= cartTotal) ? { scale: 1.02 } : {}}
                            whileTap={!isPurchasing && (userBalance === null || userBalance >= cartTotal) ? { scale: 0.98 } : {}}
                        >
                            {isPurchasing ? (
                                <><Loader2 className="animate-spin" size={18} /> Traitement...</>
                            ) : (userBalance !== null && userBalance < cartTotal) ? (
                                <>❌ Fonds insuffisants</>
                            ) : (
                                <>🛒 Confirmer l'achat</>
                            )}
                        </motion.button>
                    </div>
                </>
            )}
        </motion.div>
    );
};


export default function ShopPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<ShopItem[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [ownedTitles, setOwnedTitles] = useState<string[]>([]);
    const [activeMainCategory, setActiveMainCategory] = useState<string>('Kint');
    const [activeRarity, setActiveRarity] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<ShopItem[]>([]);
    const [userBalance, setUserBalance] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [kshieldStatus, setKshieldStatus] = useState<KShieldStatus>({ canPurchase: true });
    const [showSuccess, setShowSuccess] = useState(false);

    const fetchData = async () => {
        if (!session?.user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const [shopData, currencyData, kshieldData, inventoryData, titlesData] = await Promise.all([
                getShopItems(),
                fetchCurrency(session.user.id),
                getKshieldStatus(session.user.id),
                getInventory(),
                fetch(`/api/titres/${session.user.id}`).then(res => res.json())
            ]);
            setItems(Array.isArray(shopData) ? shopData : []);
            setUserBalance(currencyData.balance);
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
        return itemsToShow;
    }, [items, activeMainCategory, activeRarity]);

    const addToCart = (item: ShopItem) => setCart(prev => [...prev, item]);
    const removeFromCart = (itemIndex: number) => setCart(cart.filter((_, i) => i !== itemIndex));
    const cartTotal = cart.reduce((total, item) => total + item.price, 0);

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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-purple flex items-center justify-center">
                            <Store size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gradient-purple">NyxBot Shop</h1>
                            <p className="text-gray-400 mt-1">Découvrez nos articles exclusifs</p>
                        </div>
                    </motion.div>

                    {userBalance !== null && (
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="nyx-card px-6 py-4 bg-gradient-purple-soft"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-purple flex items-center justify-center">
                                    <Coins size={18} className="text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Pièces</p>
                                    <p className="text-2xl font-bold text-white">{userBalance.toLocaleString()}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Category Navigation */}
                        <NyxCard>
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Filter size={18} className="text-purple-secondary" />
                                    Catégories
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {mainCategories.map((cat, index) => (
                                        <motion.button
                                            key={cat.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => { setActiveMainCategory(cat.id); setActiveRarity('all'); }}
                                            className={`relative overflow-hidden p-4 rounded-xl transition-all duration-300 ${
                                                activeMainCategory === cat.id
                                                    ? 'bg-gradient-purple text-white shadow-lg shadow-purple-primary/20'
                                                    : 'bg-purple-primary/5 hover:bg-purple-primary/10 text-gray-300'
                                            }`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-r ${cat.gradient} opacity-0 transition-opacity duration-300 ${
                                                activeMainCategory === cat.id ? 'opacity-20' : 'group-hover:opacity-10'
                                            }`}></div>
                                            <div className="relative flex items-center justify-center gap-2">
                                                <cat.icon size={20} />
                                                <span className="font-semibold">{cat.label}</span>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Rarity Filter */}
                            <div className="border-t border-purple-primary/20 pt-6">
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">Filtrer par rareté</h3>
                                <div className="flex flex-wrap gap-2">
                                    {subCategories.map(rarity => {
                                        const rarityInfo = rarityConfig[rarity as keyof typeof rarityConfig];
                                        return (
                                            <motion.button
                                                key={rarity}
                                                onClick={() => setActiveRarity(rarity)}
                                                className={`px-3 py-2 text-sm rounded-lg transition-all duration-300 flex items-center gap-2 ${
                                                    activeRarity === rarity
                                                        ? 'bg-purple-primary text-white shadow-md'
                                                        : 'bg-purple-primary/10 text-gray-400 hover:bg-purple-primary/20 hover:text-white'
                                                }`}
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
                    </div>

                    {/* Sidebar with Cart */}
                    <div className="lg:col-span-1">
                        <CartCard
                            cart={cart}
                            cartTotal={cartTotal}
                            userBalance={userBalance}
                            onRemoveItem={removeFromCart}
                            onPurchase={handlePurchase}
                            isPurchasing={isPurchasing}
                        />
                    </div>
                </div>
            </div>
        </WithMaintenanceCheck>
    );
}