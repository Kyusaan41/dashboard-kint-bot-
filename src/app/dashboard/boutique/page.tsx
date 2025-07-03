'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getShopItems, buyItem, fetchCurrency } from '@/utils/api';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart, X, Coins, RefreshCw } from 'lucide-react';

// Type pour les objets de la boutique
type ShopItem = {
    id: string;
    name: string;
    price: number;
    description: string;
    icon: string;
    category: string;
};

export default function ShopPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<ShopItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [loading, setLoading] = useState(true);
    
    // États pour le panier, le solde, l'erreur et la confirmation d'achat
    const [cart, setCart] = useState<ShopItem[]>([]);
    const [userBalance, setUserBalance] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    // Fonction pour charger les données de la boutique et de l'utilisateur
    const fetchData = async () => {
        if (!session?.user?.id) return;
        
        setLoading(true);
        setError(null); // Réinitialise l'erreur avant chaque tentative

        try {
            const [shopData, currencyData] = await Promise.all([
                getShopItems(),
                fetchCurrency(session.user.id)
            ]);
            
            const typedShopData: ShopItem[] = Array.isArray(shopData) ? shopData : [];
            const allCategories = [...new Set(typedShopData.map(item => item.category || 'Divers'))];
            
            setItems(typedShopData);
            setCategories(allCategories);
            if (allCategories.length > 0) {
                setActiveCategory(allCategories[0]);
            }
            setUserBalance(currencyData.balance);
        } catch (err) {
            console.error("Erreur de chargement de la boutique:", err);
            setError("Impossible de charger les données de la boutique.");
        } finally {
            setLoading(false);
        }
    };

    // Charge les données lorsque la session est disponible
    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]);

    // Fonctions de gestion du panier
    const addToCart = (item: ShopItem) => setCart(prevCart => [...prevCart, item]);
    
    const removeFromCart = (itemIndex: number) => {
        const newCart = cart.filter((_, index) => index !== itemIndex);
        setCart(newCart);
        if (newCart.length === 0) {
            setIsConfirming(false); // Annule la confirmation si le panier devient vide
        }
    };
    
    const cartTotal = cart.reduce((total, item) => total + item.price, 0);

    // Fonction pour gérer l'achat final
    const handlePurchase = async () => {
        if (cart.length === 0) return;
        if (userBalance !== null && userBalance < cartTotal) {
            alert("Vous n'avez pas assez de pièces !");
            setIsConfirming(false); // Réinitialise l'état
            return;
        }

        const itemIds = cart.map(item => item.id);

        try {
            await buyItem(itemIds);
            alert("Achat réussi !");
            setCart([]);
            // Rafraîchit le solde de l'utilisateur après l'achat
            const currencyData = await fetchCurrency(session!.user!.id);
            setUserBalance(currencyData.balance);
        } catch (err) {
            alert(`Échec de l'achat : ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        } finally {
            setIsConfirming(false); // Réinitialise l'état après l'achat
        }
    };

    // Affiche un message de chargement
    if (loading) {
        return <p className="text-center text-gray-400 p-8 animate-pulse">Chargement de la boutique...</p>;
    }
    
    // Affiche un message d'erreur avec un bouton pour réessayer
    if (error) {
        return (
            <div className="text-center text-red-400 p-8">
                <p>{error}</p>
                <button 
                    onClick={fetchData} 
                    className="mt-4 flex items-center gap-2 mx-auto bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <RefreshCw size={18} />
                    Réessayer
                </button>
            </div>
        );
    }
    
    const filteredItems = items.filter(item => (item.category || 'Divers') === activeCategory);

    return (
        <div className="p-4 sm:p-8 text-white">
            <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold text-cyan-400">Boutique</h1>
                {userBalance !== null && (
                    <div className="flex items-center gap-2 bg-[#1e2530] px-4 py-2 rounded-lg">
                        <Coins className="text-yellow-400"/>
                        <span className="text-lg font-semibold">{userBalance.toLocaleString()}</span>
                    </div>
                )}
            </header>

            <nav className="flex space-x-2 sm:space-x-4 border-b border-gray-700 mb-8 overflow-x-auto pb-2">
                {categories.map(category => (
                    <button key={category} onClick={() => setActiveCategory(category)} className={`flex-shrink-0 px-3 py-2 font-semibold transition-colors duration-200 ${activeCategory === category ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}>
                        {category}
                    </button>
                ))}
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredItems.map(item => (
                        <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#1e2530] border border-gray-700 rounded-lg p-4 flex flex-col text-center shadow-lg">
                            <div className="flex-grow">
                                <Image src={item.icon || '/default-icon.png'} alt={item.name} width={80} height={80} className="mx-auto object-contain h-20"/>
                                <h2 className="text-xl font-bold mt-4">{item.name}</h2>
                                <p className="text-sm text-gray-400 mt-1 h-10">{item.description}</p>
                            </div>
                            <div className="mt-4">
                                <p className="text-lg font-semibold text-yellow-400">{item.price} Pièces</p>
                                <button onClick={() => addToCart(item)} className="mt-2 w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition">Ajouter au panier</button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            
            <AnimatePresence>
            {cart.length > 0 && (
                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-4 right-4 bg-[#1e2530] border border-cyan-500 rounded-lg shadow-2xl w-80 p-4 z-50">
                    <h3 className="text-lg font-bold flex items-center gap-2"><ShoppingCart/> Panier ({cart.length})</h3>
                    <div className="my-3 space-y-2 max-h-40 overflow-y-auto pr-2">
                        {cart.map((item, index) => (
                            <div key={`${item.id}-${index}`} className="flex justify-between items-center text-sm">
                                <span>{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-400">{item.price}</span>
                                    <button onClick={() => removeFromCart(index)} className="text-gray-500 hover:text-red-500"><X size={16}/></button>
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
                                            <button onClick={handlePurchase} className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition">Confirmer</button>
                                            <button onClick={() => setIsConfirming(false)} className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition">Annuler</button>
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
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}