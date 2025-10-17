'use client';

import { useState, useEffect, useMemo, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { getShopItems, buyItem, fetchCurrency, getKshieldStatus, getInventory } from '@/utils/api';
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { 
    ShoppingCart, X, Coins, RefreshCw, Lock, CheckCircle, Sword, Palette, Wrench, 
    Loader2, Store, Filter, Package, Sparkles
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

// --- ShopItemCard Component ---
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
            className="relative overflow-hidden group cursor-pointer"
        >
            <div className={`absolute inset-0 ${rarity.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100`}></div>
            <div className={`relative nyx-card border ${rarity.border} hover:border-opacity-100 transition-all duration-300`}>
                <div className={`absolute top-4 right-4 ${rarity.bg} ${rarity.border} border rounded-lg px-2 py-1 z-10`}>
                    <span className="text-xs font-bold flex items-center gap-1">
                        <span>{rarity.icon}</span>
                        <span className={rarity.color}>{item.category}</span>
                    </span>
                </div>

                <div className="p-6">
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

                        <motion.div 
                            className="absolute top-0 left-1/2 transform -translate-x-1/2 text-purple-secondary"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles size={16} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                    </div>

                    <h3 className="text-lg font-bold text-white text-center mb-2 group-hover:text-purple-secondary transition-colors duration-300">
                        {item.name}
                    </h3>
                    <p className="text-sm text-gray-400 text-center mb-4 h-10 line-clamp-2">
                        {item.description}
                    </p>

                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="flex items-center gap-1 px-3 py-1 bg-gradient-purple rounded-lg">
                            <Coins size={16} className="text-yellow-400" />
                            <span className="text-lg font-bold text-white">
                                {item.price.toLocaleString()}
                            </span>
                        </div>
                    </div>

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

// --- Composant principal ---
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
        } catch {
            setError("Impossible de charger les données de la boutique.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (session) fetchData(); }, [session]);

    // Reste du code inchangé...
    return (
        <WithMaintenanceCheck>
            {/* ton contenu existant */}
        </WithMaintenanceCheck>
    );
}
