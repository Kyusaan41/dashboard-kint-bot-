'use client';

import { useState, useEffect, FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getInventory, useItem, getUsers } from '@/utils/api';
import { socket } from '@/lib/socket';
import { Gem, Loader2, CheckCircle, XCircle, Package, AlertTriangle, X, Swords } from 'lucide-react';

// --- Types ---
type InventoryItem = { id: string; name: string; quantity: number; icon?: string; description?: string; };
type User = { id: string; username: string; avatar: string; };
type Notification = { show: boolean; message: string; type: 'success' | 'error'; };
interface ChallengeData {
    itemId: string;
    itemName: string;
    fromUser: { id: string, name: string };
    champName?: string;
}

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
            <p className="text-sm text-gray-400 text-center mb-2">Quantité: {item.quantity}</p>
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
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [lottoNumbers, setLottoNumbers] = useState('');
    const [targetPlayer, setTargetPlayer] = useState('');
    const [champName, setChampName] = useState('');
    const [challenge, setChallenge] = useState<ChallengeData | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [inventoryData, membersData] = await Promise.all([getInventory(), getUsers()]);
            setInventory(Array.isArray(inventoryData) ? inventoryData : []);
            setMembers(Array.isArray(membersData) ? membersData : []);
        } catch (err) {
            setError("Impossible de charger les données.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchData();
            if (!socket.connected) {
                socket.connect();
                socket.on('connect', () => {
                    socket.emit('register', session.user.id);
                });
            }
            const onChallengeReceived = (data: ChallengeData) => setChallenge(data);
            socket.on('challenge_received', onChallengeReceived);
            return () => {
                socket.off('challenge_received', onChallengeReceived);
            };
        }
    }, [session]);
    
    const handleOpenModal = (item: InventoryItem) => {
        setSelectedItem(item);
        setActiveModal(item.id);
    };
    
    const handleCloseModal = () => {
        setActiveModal(null);
        setSelectedItem(null);
        setLottoNumbers('');
        setTargetPlayer('');
        setChampName('');
    };

    const handleSubmitUse = async () => {
        if (!selectedItem) return;
        setIsSubmitting(true);
        
        let extraData = {};
        if (selectedItem.id === 'Ticket Coin Million') extraData = { numbers: lottoNumbers };
        if (selectedItem.id === 'My Champ') extraData = { targetUserId: targetPlayer, champName: champName };
        if (selectedItem.id === 'Swap Lane') extraData = { targetUserId: targetPlayer };

        try {
            const result = await useItem(selectedItem.id, extraData);
            showNotification(result.message || 'Action effectuée !', 'success');
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
        if (!selectedItem) return null;
        switch (selectedItem.id) {
            case 'Épée du KINT':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Confirmer l'utilisation</h3>
                        <p className="text-gray-300">Voulez-vous activer l'Épée du KINT pour doubler vos gains de points pendant 2 heures ?</p>
                    </div>
                );
            case 'Ticket Coin Million':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Jouer au Loto</h3>
                        <p className="text-gray-400 mb-2">Entrez 5 numéros (1-50) séparés par des espaces.</p>
                        <input type="text" value={lottoNumbers} onChange={(e) => setLottoNumbers(e.target.value)} placeholder="ex: 5 12 23 34 45" className="w-full p-2 rounded bg-[#12151d] border border-white/20"/>
                    </div>
                );
            case 'My Champ':
            case 'Swap Lane':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">{selectedItem.name}</h3>
                        <p className="text-gray-400 mb-2">Choisissez un joueur :</p>
                        <select value={targetPlayer} onChange={(e) => setTargetPlayer(e.target.value)} className="w-full p-2 rounded bg-[#12151d] border border-white/20 mb-4">
                            <option value="">Sélectionnez un joueur</option>
                            {members.filter(m => m.id !== session?.user?.id).map(member => (
                                <option key={member.id} value={member.id}>{member.username}</option>
                            ))}
                        </select>
                        {selectedItem.id === 'My Champ' && (
                            <>
                                <p className="text-gray-400 mb-2">Nom du champion :</p>
                                <input type="text" value={champName} onChange={(e) => setChampName(e.target.value)} placeholder="ex: Yasuo" className="w-full p-2 rounded bg-[#12151d] border border-white/20"/>
                             </>
                        )}
                        <p className="text-xs text-amber-400 mt-4">Note : La demande sera envoyée au joueur s'il est connecté au dashboard.</p>
                    </div>
                );
            default: return <p>Cet objet n'a pas d'action définie.</p>;
        }
    };

    const handleChallengeResponse = (accepted: boolean) => {
        console.log(`Défi ${accepted ? 'accepté' : 'refusé'}`);
        setChallenge(null);
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="h-10 w-10 text-cyan-400 animate-spin" /></div>;
    if (error) return <div className="text-center text-red-400 p-8 flex flex-col items-center gap-4"><AlertTriangle size={40} /><p>{error}</p></div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3"><Package /> Mon Inventaire</h1>
            {inventory.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {inventory.map(item => <InventoryItemCard key={item.id} item={item} onUse={handleOpenModal} />)}
                </div>
            ) : (<Card className="text-center py-16"><p className="text-gray-500">Votre inventaire est vide.</p></Card>)}
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#1c222c] p-6 rounded-2xl border border-cyan-700 w-full max-w-md shadow-2xl">
                           <div className="flex justify-end"><button onClick={handleCloseModal}><X size={20} className="text-gray-500"/></button></div>
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
            <AnimatePresence>
                {challenge && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-purple-900 to-cyan-900 p-8 rounded-2xl border border-cyan-500 w-full max-w-md shadow-2xl text-center">
                           <h2 className="text-2xl font-bold text-white mb-2">⚔️ Nouveau Défi ! ⚔️</h2>
                           <p className="text-lg text-gray-200 mb-6">
                               <span className="font-bold text-cyan-400">{challenge.fromUser.name}</span> vous défie !
                           </p>
                           <div className="bg-black/30 p-4 rounded-lg">
                               <p className="font-bold text-xl">{challenge.itemName}</p>
                               {challenge.champName && <p className="text-gray-300">Champion imposé : <span className="font-bold">{challenge.champName}</span></p>}
                           </div>
                           <div className="flex justify-center gap-4 mt-8">
                                <button onClick={() => handleChallengeResponse(false)} className="px-8 py-3 bg-red-600 rounded-lg hover:bg-red-700 font-bold transition">Refuser</button>
                                <button onClick={() => handleChallengeResponse(true)} className="px-8 py-3 bg-green-600 rounded-lg hover:bg-green-700 font-bold transition">Accepter</button>
                           </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}