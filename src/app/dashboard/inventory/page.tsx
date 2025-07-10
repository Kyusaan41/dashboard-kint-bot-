'use client';

import { useState, useEffect, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getInventory, useItem } from '@/utils/api';
import { Gem, Loader2, CheckCircle, XCircle, Package, AlertTriangle } from 'lucide-react';

// --- Types ---
type InventoryItem = {
    id: string;
    name: string;
    quantity: number;
    icon?: string;
    description?: string;
    type?: string;
};

type Notification = {
    show: boolean;
    message: string;
    type: 'success' | 'error';
};

// --- Composant Card (pour la cohérence) ---
const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-[#1c222c] border border-white/10 rounded-xl shadow-lg relative overflow-hidden group ${className}`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
        <div className="relative z-10">{children}</div>
    </div>
);

// --- Composant pour un article de l'inventaire ---
const InventoryItemCard: FC<{ item: InventoryItem; onUseItem: (itemId: string, itemName: string) => void; isUsing: boolean; }> = ({ item, onUseItem, isUsing }) => {
    // MODIFICATION ICI : On considère tous les objets comme utilisables pour l'exemple.
    // Vous pouvez affiner cette logique, par exemple : const isUsable = item.type === 'Consommable';
    const isUsable = true; 

    return (
        <Card className="flex flex-col !p-0 overflow-hidden">
            <div className="p-6 flex flex-col flex-grow">
                <div className="w-24 h-24 mx-auto bg-black/20 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                    <Image src={item.icon || '/default-icon.png'} alt={item.name} width={64} height={64} className="object-contain" />
                </div>
                <h2 className="text-xl font-bold text-white text-center">{item.name}</h2>
                <p className="text-sm text-gray-400 text-center mb-2">Quantité: {item.quantity}</p>
                <p className="text-sm text-gray-400 text-center h-12 flex-grow">{item.description || 'Aucune description disponible.'}</p>
                
                {isUsable && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onUseItem(item.id, item.name)}
                        disabled={isUsing}
                        className="mt-4 w-full font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                    >
                        {isUsing ? <Loader2 className="animate-spin" size={18}/> : 'Utiliser'}
                    </motion.button>
                )}
            </div>
        </Card>
    );
};


export default function InventoryPage() {
    const { data: session } = useSession();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUsingItem, setIsUsingItem] = useState(false);
    const [notification, setNotification] = useState<Notification>({ show: false, message: '', type: 'success' });

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
    };

    const fetchInventory = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const inventoryData = await getInventory();
            setInventory(Array.isArray(inventoryData) ? inventoryData : []);
        } catch (err) {
            setError("Impossible de charger l'inventaire.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [session]);

    const handleUseItem = async (itemId: string, itemName: string) => {
        if (!confirm(`Voulez-vous vraiment utiliser "${itemName}" ?`)) return;

        setIsUsingItem(true);
        try {
            const result = await useItem(itemId);
            showNotification(result.message || 'Objet utilisé avec succès!', 'success');
            await fetchInventory();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue.';
            showNotification(errorMessage, 'error');
        } finally {
            setIsUsingItem(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-10 w-10 text-cyan-400 animate-spin" /></div>;
    }
    
    if (error) {
        return <div className="text-center text-red-400 p-8 flex flex-col items-center gap-4"><AlertTriangle size={40} /><p>{error}</p></div>;
    }

    return (
        <div className="space-y-8">
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full shadow-lg z-50 text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
                    >
                        {notification.type === 'success' ? <CheckCircle /> : <XCircle />}
                        <span className="font-semibold">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3"><Package /> Mon Inventaire</h1>

            {inventory.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {inventory.map(item => (
                        <InventoryItemCard 
                            key={item.id} 
                            item={item} 
                            onUseItem={handleUseItem}
                            isUsing={isUsingItem}
                        />
                    ))}
                </div>
            ) : (
                <Card className="text-center py-16">
                    <p className="text-gray-500">Votre inventaire est vide pour le moment.</p>
                </Card>
            )}

            <style jsx global>{`.bg-grid-pattern { background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 20px 20px; }`}</style>
        </div>
    );
}