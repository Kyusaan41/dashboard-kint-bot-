// src/app/dashboard/inventory/page.tsx (version finale corrigÃ©e)

'use client';

import { useState, useEffect, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getInventory, useItem, getServerMembers } from '@/utils/api';
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck';
import InteractionPopup from '@/components/InteractionPopup'; // Assurez-vous que ce composant existe
import { Gem, Loader2, CheckCircle, XCircle, Package, AlertTriangle, X, Ticket, Swords } from 'lucide-react';

// --- Types ---
type InventoryItem = { id: string; name: string; quantity: number; icon?: string; description?: string; };
type User = { id: string; username: string; avatar: string; };
type Notification = { show: boolean; message: string; type: 'success' | 'error'; };

// --- Composants UI ---
const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-[#1c222c] border border-white/10 rounded-xl shadow-lg relative overflow-hidden group ${className}`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
        <div className="relative z-10">{children}</div>
    </div>
);

const InventoryItemCard: FC<{ item: InventoryItem; onUse: (item: InventoryItem) => void; }> = ({ item, onUse }) => (
    <Card className="flex flex-col !p-0 overflow-hidden">
        <div className="p-6 flex flex-col flex-grow">
            <div className="w-24 h-24 mx-auto bg-black/20 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                <Image src={item.icon || '/default-icon.png'} alt={item.name} width={64} height={64} className="object-contain" />
            </div>
            <h2 className="text-xl font-bold text-white text-center">{item.name}</h2>
            <p className="text-sm text-gray-400 text-center mb-2">QuantitÃ©: {item.quantity}</p>
            <p className="text-sm text-gray-400 text-center h-12 flex-grow">{item.description || 'Aucune description disponible.'}</p>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onUse(item)}
                className="mt-4 w-full font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700"
            >
                Utiliser
            </motion.button>
        </div>
    </Card>
);

// --- La Page d'Inventaire ---
export default function InventoryPage() {
    const { data: session } = useSession();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<Notification>({ show: false, message: '', type: 'success' });
    const [activeModal, setActiveModal] = useState<InventoryItem | null>(null);

    // Ã‰tats pour les formulaires dans la modale
    const [targetPlayer, setTargetPlayer] = useState('');
    const [champName, setChampName] = useState('');
    const [lotteryNumbers, setLotteryNumbers] = useState('');

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
    };

    const fetchData = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const [inventoryData, membersData] = await Promise.all([getInventory(), getServerMembers()]);
            setInventory(Array.isArray(inventoryData) ? inventoryData : []);
            setMembers(Array.isArray(membersData) ? membersData : []);
        } catch (err) {
            setError("Impossible de charger les donnÃ©es.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(session) {
            fetchData();
        }
    }, [session]);
    
    const handleCloseModal = () => {
        setActiveModal(null);
        setTargetPlayer('');
        setChampName('');
        setLotteryNumbers('');
    };

    const handleSubmitUse = async () => {
        if (!activeModal) return;

        let extraData: any = {};
        const normalizedItemId = activeModal.name.toLowerCase();

        // Validation pour les objets interactifs
        if (normalizedItemId === 'my champ' || normalizedItemId === 'swap lane') {
            if (!targetPlayer) {
                showNotification('Veuillez sÃ©lectionner un joueur cible.', 'error');
                return;
            }
            extraData.targetUserId = targetPlayer;
            if (normalizedItemId === 'my champ') {
                if (!champName.trim()) {
                    showNotification('Veuillez entrer un nom de champion.', 'error');
                    return;
                }
                extraData.champName = champName;
            }
        }

        // Validation pour le ticket de loterie
        if (normalizedItemId === 'ticket coin million') {
            const numbers = lotteryNumbers.split(' ').map(n => parseInt(n)).filter(n => !isNaN(n));
            if (numbers.length !== 5 || numbers.some(n => n < 1 || n > 50)) {
                showNotification('Veuillez entrer 5 numÃ©ros valides entre 1 et 50.', 'error');
                return;
            }
            extraData.numbers = numbers;
        }

        setIsSubmitting(true);
        try {
            const result = await useItem(activeModal.name, extraData);
            showNotification(result.message || 'Action effectuÃ©e avec succÃ¨s !', 'success');
            await fetchData();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue.';
            showNotification(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
            handleCloseModal();
        }
    };
    
    const renderModalContent = () => {
        if (!activeModal) return null;
        
        const normalizedItemId = activeModal.name.toLowerCase();

        switch (normalizedItemId) {
            case 'Ã©pÃ©e du kint':
                return ( <div> <h3 className="text-lg font-bold text-white mb-4">Confirmer l'utilisation</h3> <p className="text-gray-300">Voulez-vous activer l'Ã‰pÃ©e du KINT pour doubler vos gains de points KINT pendant 2 heures ?</p> </div> );
            
            case 'my champ':
            case 'swap lane':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">{activeModal.name}</h3>
                        <p className="text-gray-400 mb-2">Choisissez un joueur sur le serveur :</p>
                        <select value={targetPlayer} onChange={(e) => setTargetPlayer(e.target.value)} className="w-full p-2 rounded bg-[#12151d] border border-white/20 mb-4">
                            <option value="">SÃ©lectionnez un joueur</option>
                            {members.filter(m => m.id !== session?.user?.id).map(member => ( <option key={member.id} value={member.id}>{member.username}</option> ))}
                        </select>
                        {normalizedItemId === 'my champ' && (
                            <>
                                <p className="text-gray-400 mb-2">Nom du champion :</p>
                                <input type="text" value={champName} onChange={(e) => setChampName(e.target.value)} placeholder="ex: Yasuo" className="w-full p-2 rounded bg-[#12151d] border border-white/20"/>
                             </>
                        )}
                        <p className="text-xs text-amber-400 mt-4">Note : Une notification sera envoyÃ©e Ã  l'utilisateur sur son dashboard.</p>
                    </div>
                );

            case 'ticket coin million':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">ðŸŽŸï¸ Ticket Coin Million</h3>
                        <p className="text-gray-400 mb-2">Entrez vos 5 numÃ©ros (de 1 Ã  50), sÃ©parÃ©s par des espaces.</p>
                        <input
                            type="text"
                            value={lotteryNumbers}
                            onChange={(e) => setLotteryNumbers(e.target.value)}
                            placeholder="ex: 5 12 23 35 48"
                            className="w-full p-2 rounded bg-[#12151d] border border-white/20"
                        />
                         <p className="text-xs text-gray-500 mt-2">Le tirage a lieu Ã  une date dÃ©finie. Bonne chance !</p>
                    </div>
                );

            default:
                return <p>Cet objet n'a pas d'action dÃ©finie sur le dashboard pour le moment.</p>;
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="h-10 w-10 text-cyan-400 animate-spin" /></div>;
    if (error) return <div className="text-center text-red-400 p-8 flex flex-col items-center gap-4"><AlertTriangle size={40} /><p>{error}</p></div>;

    return (
        <WithMaintenanceCheck pageId="inventory">
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3"><Package /> Mon Inventaire</h1>
            
            <AnimatePresence>
                {notification.show && (
                    <motion.div initial={{ opacity: 0, y: 50, scale: 0.3 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }} className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full shadow-lg z-50 text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                        {notification.type === 'success' ? <CheckCircle /> : <XCircle />}
                        <span className="font-semibold">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {inventory.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {inventory.map(item => <InventoryItemCard key={item.id} item={item} onUse={() => setActiveModal(item)} />)}
                </div>
            ) : (
                <Card className="text-center py-16"><p className="text-gray-500">Votre inventaire est vide.</p></Card>
            )}

            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#1c222c] p-6 rounded-2xl border border-cyan-700 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                           <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold">{activeModal.name}</h2>
                                <button onClick={handleCloseModal}><X size={20} className="text-gray-500 hover:text-white"/></button>
                           </div>
                            {renderModalContent()}
                            <div className="flex justify-end gap-4 mt-6">
                                <button onClick={handleCloseModal} className="px-5 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition">Annuler</button>
                                <button onClick={handleSubmitUse} disabled={isSubmitting} className="px-5 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 font-bold transition disabled:opacity-50">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirmer"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            </div>
        </WithMaintenanceCheck>
    );
}
