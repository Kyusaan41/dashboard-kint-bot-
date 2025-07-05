'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { getShopItems, buyItem, fetchCurrency, getKshieldStatus, getInventory } from '@/utils/api';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart, X, Coins, RefreshCw, Lock, CheckCircle, Sword, Palette, Wrench } from 'lucide-react';

// --- Types ---
type ShopItem = {
    id: string;
    name: string;
    price: number;
    description: string;
    icon: string;
    type: 'Kint' | 'Utilitaire' | 'Personnalisation' | string;
    category: 'Légendaire' | 'Épique' | 'Rare' | 'Commun' | string;
};

type InventoryItem = {
    id: string;
    name: string;
    quantity: number;
    icon?: string;
};

type KShieldStatus = {
    canPurchase: boolean;
    timeLeft?: number;
};

// --- Constantes ---
const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return '';
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (days > 0) return `dans ${days}j ${hours}h`;
    if (hours > 0) return `dans ${hours}h ${minutes}m`;
    return `dans ${minutes}m`;
};

const mainCategories = [
    { id: 'Kint', label: 'Kint', icon: Sword },
    { id: 'Utilitaire', label: 'Utilitaire', icon: Wrench },
    { id: 'Personnalisation', label: 'Personnalisation', icon: Palette },
];

const rarityOrder = ['Légendaire', 'Épique', 'Rare', 'Commun', 'Divers'];


export default function ShopPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<ShopItem[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [activeMainCategory, setActiveMainCategory] = useState<string>('Kint');
    const [activeRarity, setActiveRarity] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<ShopItem[]>([]);
    const [userBalance, setUserBalance] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [kshieldStatus, setKshieldStatus] = useState<KShieldStatus>({ canPurchase: true });
    const [showSuccess, setShowSuccess] = useState(false);

    const fetchData = async () => {
        if (!session?.user?.id) return;
        setLoading(true); setError(null);
        try {
            const [shopData, currencyData, kshieldData, inventoryData] = await Promise.all([
                getShopItems(),
                fetchCurrency(session.user.id),
                getKshieldStatus(session.user.id),
                getInventory() // On récupère l'inventaire
            ]);
            setItems(Array.isArray(shopData) ? shopData : []);
            setUserBalance(currencyData.balance);
            setKshieldStatus(kshieldData);
            setInventory(Array.isArray(inventoryData) ? inventoryData : []); // On stocke l'inventaire
        } catch (err) {
            console.error(err);
            setError("Impossible de charger les données de la boutique.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => { if (session) fetchData(); }, [session]);
    
    const subCategories = useMemo(() => {
        const itemsInCategory = items.filter(item => item.type === activeMainCategory);
        const rarities = [...new Set(itemsInCategory.map(item => item.category || 'Divers'))];
        return rarities.sort((a, b) => rarityOrder.indexOf(a) - rarityOrder.indexOf(b));
    }, [items, activeMainCategory]);

    const filteredItems = useMemo(() => {
        let itemsToShow = items.filter(item => item.type === activeMainCategory);
        if (activeRarity !== 'all') {
            itemsToShow = itemsToShow.filter(item => (item.category || 'Divers') === activeRarity);
        }
        return itemsToShow;
    }, [items, activeMainCategory, activeRarity]);


    const addToCart = (item: ShopItem) => {
        if (item.id === 'KShield' && !kshieldStatus.canPurchase) return;
        const isOwned = inventory.some(invItem => invItem.id === item.id);
        // On considère les articles de personnalisation comme uniques
        if (item.type === 'Personnalisation' && isOwned) return; 
        setCart(prev => [...prev, item]);
    };
    const removeFromCart = (itemIndex: number) => {
        const newCart = cart.filter((_, i) => i !== itemIndex);
        setCart(newCart);
        if (newCart.length === 0) setIsConfirming(false);
    };
    const cartTotal = cart.reduce((total, item) => total + item.price, 0);
    const handlePurchase = async () => {
        if (cart.length === 0) return;
        if (userBalance !== null && userBalance < cartTotal) {
            alert("Fonds insuffisants !");
            setIsConfirming(false);
            return;
        }
        try {
            await buyItem(cart.map(item => item.id));
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 4000);
            setCart([]);
            await fetchData();
        } catch (err) {
            alert(`Échec : ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        } finally {
            setIsConfirming(false);
        }
    };

    const handleMainCategoryClick = (categoryId: string) => {
        setActiveMainCategory(categoryId);
        setActiveRarity('all');
    };


    if (loading) {
        return <p className="text-center text-gray-400 p-8 animate-pulse">Chargement...</p>;
    }
    if (error) {
        return (
            <div className="text-center text-red-400 p-8">
                <p>{error}</p>
                <button
                    onClick={fetchData}
                    className="mt-4 flex items-center gap-2 mx-auto bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                    <RefreshCw size={18} /> Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 text-white">
            <AnimatePresence>
                <motion.div
                    key="success-message" 
                    initial={{ opacity: 0, y: -50, scale: 0.8 }}
                    animate={{ 
                        opacity: showSuccess ? 1 : 0, 
                        y: showSuccess ? 0 : -50, 
                        scale: showSuccess ? 1 : 0.8,
                        pointerEvents: showSuccess ? 'auto' : 'none'
                    }}
                    exit={{ opacity: 0, y: -50, scale: 0.8 }} 
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{ visibility: showSuccess ? 'visible' : 'hidden' }}
                    className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50"
                >
                    <CheckCircle />
                    <span className="font-semibold">ACHAT RÉUSSI</span>
                </motion.div>
            </AnimatePresence>

            <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold text-cyan-400">Boutique</h1>
                {userBalance !== null && (
                    <div className="flex items-center gap-2 bg-[#1e2530] px-4 py-2 rounded-lg">
                        <Coins className="text-yellow-400" />
                        <span className="text-lg font-semibold">{userBalance.toLocaleString()}</span>
                    </div>
                )}
            </header>

            <nav className="flex justify-center border-b border-gray-700">
                {mainCategories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => handleMainCategoryClick(cat.id)}
                        className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors duration-200 ${
                            activeMainCategory === cat.id
                                ? 'text-cyan-400 border-b-2 border-cyan-400'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <cat.icon size={18} />
                        <span>{cat.label}</span>
                    </button>
                ))}
            </nav>

            <AnimatePresence>
                <motion.nav
                    key={activeMainCategory}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                        opacity: subCategories.length > 1 ? 1 : 0,
                        height: subCategories.length > 1 ? 'auto' : 0,
                        pointerEvents: subCategories.length > 1 ? 'auto' : 'none'
                    }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center items-center gap-2 mt-6 flex-wrap"
                    style={{ overflow: 'hidden' }}
                >
                    {subCategories.length > 1 && (
                        <>
                            <button
                                onClick={() => setActiveRarity('all')}
                                className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                                    activeRarity === 'all' ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            >
                                Tous
                            </button>
                            {subCategories.map(rarity => (
                                <button
                                    key={rarity}
                                    onClick={() => setActiveRarity(rarity)}
                                    className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                                        activeRarity === rarity ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                                    }`}
                                >
                                    {rarity}
                                </button>
                            ))}
                        </>
                    )}
                </motion.nav>
            </AnimatePresence>

            <div className="mt-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeMainCategory + activeRarity}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredItems.length > 0 ? (
                            filteredItems.map(item => {
                                const isKshield = item.id === 'KShield';
                                const isOwned = inventory.some(invItem => invItem.id === item.id);
                                // Les articles de personnalisation sont uniques
                                const isUniqueAndOwned = item.type === 'Personnalisation' && isOwned;
                                
                                const isDisabled = (isKshield && !kshieldStatus.canPurchase) || isUniqueAndOwned;

                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-[#1e2530] border border-gray-700 rounded-lg p-4 flex flex-col text-center shadow-lg"
                                    >
                                        <div className="flex-grow">
                                            <Image src={item.icon || '/default-icon.png'} alt={item.name} width={80} height={80} className="mx-auto object-contain h-20" />
                                            <h2 className="text-xl font-bold mt-4">{item.name}</h2>
                                            <p className="text-sm text-gray-400 mt-1 h-10">{item.description}</p>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-lg font-semibold text-yellow-400">{item.price} Pièces</p>
                                            <button
                                                onClick={() => addToCart(item)}
                                                disabled={isDisabled}
                                                className={`mt-2 w-full font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 ${
                                                    isDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'
                                                }`}
                                            >
                                                {isUniqueAndOwned ? (
                                                    <>
                                                      <CheckCircle size={16} /> Possédé
                                                    </>
                                                ) : isKshield && !kshieldStatus.canPurchase ? (
                                                    <>
                                                        <Lock size={16} />
                                                        {formatTimeLeft(kshieldStatus.timeLeft || 0)}
                                                    </>
                                                ) : (
                                                    'Ajouter au panier'
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <p className="col-span-full text-center text-gray-500 py-16">Aucun objet ne correspond à cette sélection.</p>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
            
            <AnimatePresence>
                <motion.div
                    key="shopping-cart-summary"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ 
                        y: cart.length > 0 ? 0 : 100, 
                        opacity: cart.length > 0 ? 1 : 0,
                        pointerEvents: cart.length > 0 ? 'auto' : 'none'
                    }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    style={{ visibility: cart.length > 0 ? 'visible' : 'hidden' }}
                    className="fixed bottom-4 right-4 bg-[#1e2530] border border-cyan-500 rounded-lg shadow-2xl w-80 p-4 z-50"
                >
                    {cart.length > 0 && ( 
                        <>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <ShoppingCart /> Panier ({cart.length})
                            </h3>
                            <div className="my-3 space-y-2 max-h-40 overflow-y-auto pr-2">
                                {cart.map((item, index) => (
                                    <div key={`${item.id}-${index}`} className="flex justify-between items-center text-sm">
                                        <span>{item.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-yellow-400">{item.price}</span>
                                            <button onClick={() => removeFromCart(index)} className="text-gray-500 hover:text-red-500">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-700 pt-3 mt-3">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>{cartTotal} Pièces</span>
                                </div>

                                <div className="mt-3">
                                    <AnimatePresence mode="wait">
                                        {isConfirming ? (
                                            <motion.div
                                                key="confirm"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="space-y-2"
                                            >
                                                <p className="text-center text-sm text-gray-300">Confirmer l'achat ?</p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handlePurchase}
                                                        className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition"
                                                    >
                                                        Confirmer
                                                    </button>
                                                    <button
                                                        onClick={() => setIsConfirming(false)}
                                                        className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition"
                                                    >
                                                        Annuler
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.button
                                                key="pay"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                onClick={() => setIsConfirming(true)}
                                                className="w-full bg-cyan-600 text-white font-bold py-2 rounded-lg hover:bg-cyan-700 transition"
                                            >
                                                Payer
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}