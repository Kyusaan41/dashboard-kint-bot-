'use client';

import { useState, useEffect, useMemo, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { getShopItems, buyItem, fetchCurrency, getKshieldStatus, getInventory } from '@/utils/api';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart, X, Coins, RefreshCw, Lock, CheckCircle, Sword, Palette, Wrench, Check, Gem, Loader2 } from 'lucide-react';

// --- Types (inchangés) ---
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

// --- Constantes & Helpers (inchangés) ---
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
    { id: 'Kint', label: 'Kint', icon: Sword },
    { id: 'Utilitaire', label: 'Utilitaire', icon: Wrench },
    { id: 'Personnalisation', label: 'Personnalisation', icon: Palette },
];

const rarityConfig = {
    'Légendaire': { color: 'text-orange-400', border: 'border-orange-400', glow: 'shadow-orange-400/30' },
    'Épique': { color: 'text-purple-400', border: 'border-purple-400', glow: 'shadow-purple-400/30' },
    'Rare': { color: 'text-blue-400', border: 'border-blue-400', glow: 'shadow-blue-400/30' },
    'Commun': { color: 'text-gray-400', border: 'border-gray-400', glow: 'shadow-gray-400/20' },
    'Divers': { color: 'text-gray-500', border: 'border-gray-500', glow: 'shadow-gray-500/20' }
};
const rarityOrder = Object.keys(rarityConfig);

// --- COMPOSANTS UI REDÉSIGNÉS ---
const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`futuristic-card rounded-xl shadow-lg relative overflow-hidden group ${className}`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
        <div className="relative z-10">{children}</div>
    </div>
);

const ShopItemCard: FC<{ item: ShopItem, onAddToCart: (item: ShopItem) => void, isOwned: boolean, kshieldStatus: KShieldStatus }> = ({ item, onAddToCart, isOwned, kshieldStatus }) => {
    const rarity = rarityConfig[item.category as keyof typeof rarityConfig] || rarityConfig['Divers'];
    let isDisabled = false;
    let buttonText = "Ajouter au panier";
    let ButtonIcon = ShoppingCart;

    if (isOwned) {
        isDisabled = true;
        buttonText = "Possédé";
        ButtonIcon = CheckCircle;
    } else if (item.id === 'KShield' && !kshieldStatus.canPurchase) {
        isDisabled = true;
        buttonText = `Dans ${formatTimeLeft(kshieldStatus.timeLeft || 0)}`;
        ButtonIcon = Lock;
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`futuristic-card flex flex-col group !p-0 overflow-hidden ${rarity.border}`}
        >
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                    <div className={`w-24 h-24 mx-auto rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:${rarity.glow}`}>
                        <Image src={item.icon || '/default-icon.png'} alt={item.name} width={64} height={64} className="object-contain" />
                    </div>
                    <h2 className="text-xl font-bold text-white text-center">{item.name}</h2>
                    <p className={`text-sm font-bold text-center ${rarity.color} mb-2`}>{item.category}</p>
                    <p className="text-sm text-gray-400 text-center h-12">{item.description}</p>
                </div>
                <div className="mt-6 text-center">
                    <p className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-2">
                        <Coins size={20}/> {item.price.toLocaleString()}
                    </p>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAddToCart(item)}
                        disabled={isDisabled}
                        className={`mt-4 w-full font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                            isDisabled ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' : 'futuristic-button'
                        }`}
                    >
                        <ButtonIcon size={18}/> {buttonText}
                    </motion.button>
                </div>
            </div>
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
        setLoading(true); setError(null);
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

    if (loading) return <p className="text-center text-gray-400 p-8 animate-pulse">Chargement de la boutique...</p>;
    if (error) return (
        <div className="text-center text-red-400 p-8">
            <p>{error}</p>
            <button onClick={fetchData} className="mt-4 flex items-center gap-2 mx-auto futuristic-button">
                <RefreshCw size={18} /> Réessayer
            </button>
        </div>
    );

    return (
        <div className="space-y-8">
            <AnimatePresence>
                {showSuccess && <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50">
                    <CheckCircle /> <span className="font-semibold">Achat réussi !</span>
                </motion.div>}
            </AnimatePresence>

            <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3"><Gem /> Boutique</h1>
                {userBalance !== null && (
                    <div className="flex items-center gap-2 futuristic-card px-4 py-2 rounded-lg">
                        <Coins className="text-yellow-400" />
                        <span className="text-lg font-semibold">{userBalance.toLocaleString()}</span>
                    </div>
                )}
            </header>
            
            <div className="futuristic-card p-4 space-y-4">
                <div className="p-1 bg-black/20 rounded-lg flex gap-1 relative">
                    {mainCategories.map(cat => (
                        <button 
                            key={cat.id} 
                            onClick={() => { setActiveMainCategory(cat.id); setActiveRarity('all'); }} 
                            className={`w-full relative flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-md transition-colors duration-300 z-10 ${ activeMainCategory === cat.id ? 'text-white' : 'text-gray-400 hover:text-white' }`}
                        >
                            <cat.icon size={18} /> <span>{cat.label}</span>
                        </button>
                    ))}
                    <AnimatePresence>
                        {activeMainCategory && (
                            <motion.div
                                layoutId="active-main-cat-indicator"
                                className="absolute inset-0 bg-cyan-600/30 rounded-md"
                                style={{ width: `${100 / mainCategories.length}%`, left: `${(mainCategories.findIndex(t => t.id === activeMainCategory) * 100) / mainCategories.length}%` }}
                                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                            />
                        )}
                    </AnimatePresence>
                </div>
                 
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                     {subCategories.map(rarity => (
                        <button key={rarity} onClick={() => setActiveRarity(rarity)} className={`px-3 py-1 text-sm rounded-full transition-colors whitespace-nowrap ${ activeRarity === rarity ? 'bg-white text-black font-semibold' : 'bg-white/5 text-gray-300 hover:bg-white/10' }`}>
                            {rarity === 'all' ? 'Toutes les raretés' : rarity}
                        </button>
                    ))}
                </div>
            </div>

            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => {
                            const isInventoryOwned = inventory.some(invItem => invItem.id === item.id);
                            const isTitleOwned = item.type === 'Personnalisation' && ownedTitles.some(ownedTitle => ownedTitle.trim().toLowerCase() === item.name.trim().toLowerCase());
                            const isOwned = isInventoryOwned || isTitleOwned;
                            
                            return <ShopItemCard key={item.id} item={item} onAddToCart={addToCart} isOwned={isOwned} kshieldStatus={kshieldStatus} />;
                        })
                    ) : (
                        <p className="col-span-full text-center text-gray-500 py-16">Aucun objet ne correspond à cette sélection.</p>
                    )}
                </AnimatePresence>
            </motion.div>
            
            {/* ▼▼▼ PANIER FINALISÉ ▼▼▼ */}
            <AnimatePresence>
                {cart.length > 0 && (
                    <motion.div 
                        initial={{ x: "110%", opacity: 0 }} 
                        animate={{ x: 0, opacity: 1 }} 
                        exit={{ x: "110%", opacity: 0 }} 
                        transition={{ type: 'spring', stiffness: 250, damping: 30 }} 
                        className="fixed top-24 right-6 futuristic-card border-cyan-500 rounded-xl shadow-2xl w-96 p-6 z-50"
                    >
                        <h3 className="text-xl font-bold flex items-center gap-3"><ShoppingCart /> Panier ({cart.length})</h3>
                        <div className="my-4 space-y-2 max-h-64 overflow-y-auto pr-2">
                            {cart.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="flex justify-between items-center text-sm bg-black/20 p-2 rounded-md">
                                    <span className="font-medium">{item.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-yellow-400 font-semibold">{item.price.toLocaleString()}</span>
                                        <button onClick={() => removeFromCart(index)} className="text-gray-500 hover:text-red-500"><X size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-white/10 pt-4 mt-4">
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span className="text-yellow-400 flex items-center gap-2">{cartTotal.toLocaleString()} <Coins size={18}/></span>
                            </div>
                            <motion.button whileTap={{scale: 0.95}} onClick={handlePurchase} disabled={isPurchasing || (userBalance !== null && userBalance < cartTotal)} className={`w-full mt-4 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${isPurchasing || (userBalance !== null && userBalance < cartTotal) ? 'bg-gray-600 cursor-not-allowed' : 'futuristic-button bg-green-600'}`}>
                                {isPurchasing && <Loader2 className="animate-spin" size={18}/>}
                                {isPurchasing ? 'Achat en cours...' : (userBalance !== null && userBalance < cartTotal) ? 'Fonds insuffisants' : `Valider l'achat`}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}