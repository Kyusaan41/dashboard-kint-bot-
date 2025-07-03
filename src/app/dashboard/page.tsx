'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Award, BarChart2, Coins, Crown, Gift, MessageSquare, Star, Zap, Loader2, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getInventory } from '@/utils/api'; // Assurez-vous d'avoir cette fonction dans vos utils

// --- Définition des Types pour les données ---
type UserStats = {
    currency: number;
    currencyRank: number | null;
    xp: number;
    xpRank: number | null;
    points: number;
    pointsRank: number | null;
    equippedTitle: string | null;
};
type PatchNote = { title: string; ajouts: string[]; ajustements: string[]; };
type MessageData = { day: string; messages: number; };
type ServerInfo = {
    id: string;
    name: string;
    icon: string | null;
};
type InventoryItem = {
    id: string;
    name: string;
    quantity: number;
    icon?: string;
};
type SuccessData = { succes: string[] };
type TitlesData = { titresPossedes: string[] };
type CurrencyData = { balance: number; lastClaim: number | null };
type MessagesApiResponse = { messagesLast7Days: number[] };


// --- Le Composant Principal ---
export default function DashboardHomePage() {
    const { data: session, status } = useSession();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [successes, setSuccesses] = useState<string[]>([]);
    const [patchNotes, setPatchNotes] = useState<PatchNote | null>(null);
    const [messageData, setMessageData] = useState<MessageData[]>([]);
    const [availableTitles, setAvailableTitles] = useState<string[]>([]);
    const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
    const [selectedTitle, setSelectedTitle] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [claimStatus, setClaimStatus] = useState({ canClaim: false, timeLeft: '00:00:00' });
    const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
    const [isClaiming, setIsClaiming] = useState(false);

    // --- Chargement de toutes les données nécessaires ---
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const results = await Promise.allSettled([
                        fetch(`/api/stats/me`),
                        fetch(`/api/messages/${session.user.id}`),
                        fetch(`/api/success/${session.user.id}`),
                        fetch(`/api/patchnote`),
                        fetch(`/api/titres/${session.user.id}`),
                        fetch(`/api/currency/${session.user.id}`),
                        fetch(`/api/server/info`),
                        getInventory(), // Nouvel appel pour l'inventaire
                    ]);

                    const processData = async (promiseResult: PromiseSettledResult<any>, setter: Function) => {
                        if (promiseResult.status === 'fulfilled') {
                            const value = promiseResult.value.ok ? await promiseResult.value.json() : promiseResult.value;
                            setter(value);
                            return value;
                        }
                        return null;
                    };
                    
                    const statsData = await processData(results[0], setStats);
                    await processData(results[1], (data: MessagesApiResponse) => setMessageData((data.messagesLast7Days || []).map((c: number, i: number) => ({ day: `Jour ${i + 1}`, messages: c }))));
                    await processData(results[2], (data: SuccessData) => setSuccesses(data.succes || []));
                    await processData(results[3], setPatchNotes);
                    await processData(results[4], (data: TitlesData) => setAvailableTitles(data.titresPossedes || []));
                    await processData(results[5], (data: CurrencyData) => {
                        if (!data) return;
                        const now = Date.now();
                        const twentyFourHours = 24 * 60 * 60 * 1000;
                        if (!data.lastClaim || (now - data.lastClaim >= twentyFourHours)) {
                            setClaimStatus({ canClaim: true, timeLeft: '' });
                        } else {
                            const timeLeft = twentyFourHours - (now - data.lastClaim);
                            setClaimStatus({ canClaim: false, timeLeft: new Date(timeLeft).toISOString().substr(11, 8) });
                        }
                    });
                    await processData(results[6], setServerInfo);
                    await processData(results[7], setInventory);


                    if (statsData) {
                        setSelectedTitle(statsData.equippedTitle || '');
                    }

                } catch (error) {
                    console.error("Erreur de chargement du dashboard:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [status, session]);

    // --- Compte à rebours, changement de titre, etc. ---
    useEffect(() => {
        if (claimStatus.canClaim || !claimStatus.timeLeft) return;
        const interval = setInterval(() => {
            const parts = claimStatus.timeLeft.split(':').map(Number);
            if(parts.length !== 3) { clearInterval(interval); return; }
            const totalSeconds = (parts[0] * 3600) + (parts[1] * 60) + parts[2] - 1;
            if (totalSeconds < 0) {
                setClaimStatus({ canClaim: true, timeLeft: '' });
                clearInterval(interval);
            } else {
                const newTime = new Date(totalSeconds * 1000).toISOString().substr(11, 8);
                setClaimStatus(prev => ({ ...prev, timeLeft: newTime }));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [claimStatus]);
    
    const handleEquipTitle = async () => {
        if (!selectedTitle || !session?.user?.id) return;
        try {
            await fetch(`/api/titres/${session.user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nouveauTitre: selectedTitle })
            });
            setStats(prev => prev ? { ...prev, equippedTitle: selectedTitle } : null);
            setIsTitleModalOpen(false);
        } catch (error) {
            console.error("Erreur lors du changement de titre:", error);
            alert("Une erreur est survenue.");
        }
    };
    const formatRank = (rank: number | null) => {
        if (!rank) return <span className="text-gray-400">(Non classé)</span>;
        if (rank === 1) return <span className="font-bold text-yellow-400">(1er)</span>;
        if (rank === 2) return <span className="font-bold text-gray-300">(2e)</span>;
        if (rank === 3) return <span className="font-bold text-yellow-600">(3e)</span>;
        return <span className="text-sm text-gray-400">({rank}<sup>e</sup>)</span>;
    };
    const handleClaimReward = async () => {
        if (!claimStatus.canClaim || isClaiming) return;
        
        setIsClaiming(true);
        try {
            const res = await fetch('/api/claim-reward', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                alert(data.message || "Récompense réclamée !");
                setStats(prev => prev ? { ...prev, currency: data.newBalance } : null);
                setClaimStatus({ canClaim: false, timeLeft: '23:59:59' });
            } else {
                alert(data.error || "Impossible de réclamer la récompense maintenant.");
                if (data.timeLeft) {
                    setClaimStatus({ canClaim: false, timeLeft: new Date(data.timeLeft).toISOString().substr(11, 8) });
                }
            }
        } catch (error) {
            alert("Une erreur de communication est survenue.");
        } finally {
            setIsClaiming(false);
        }
    };

    if (loading || status === 'loading') {
        return <div className="flex h-full items-center justify-center text-gray-400"><Loader2 className="h-8 w-8 animate-spin mr-3"/> Chargement de vos exploits...</div>;
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    {serverInfo && serverInfo.id && serverInfo.icon && (
                        <Image
                            src={`https://cdn.discordapp.com/icons/${serverInfo.id}/${serverInfo.icon}.png`}
                            alt="Icône du serveur"
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                    )}
                    <h1 className="text-2xl font-bold">Bienvenue sur {serverInfo?.name || 'KTS'}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1e2530] p-6 rounded-lg space-y-4">
                        <div className="flex items-center space-x-4">
                            <Image src={session?.user?.image || '/default-avatar.png'} alt="Avatar" width={64} height={64} className="rounded-full" />
                            <div>
                                <p className="font-bold text-lg">{session?.user?.name}</p>
                                <p className="text-sm text-purple-400 font-semibold">♕ {session?.user?.role === 'admin' ? 'Administrateur' : 'Membre'}</p>
                            </div>
                        </div>
                        <ul className="space-y-2 text-gray-300">
                            <li className="flex items-center"><Coins className="h-5 w-5 text-yellow-400 mr-3" /> Possède <span className="font-bold text-yellow-400 mx-2">{(stats?.currency ?? 0).toLocaleString()}</span> pièces <span className="ml-2">{formatRank(stats?.currencyRank ?? null)}</span></li>
                            <li className="flex items-center"><Zap className="h-5 w-5 text-cyan-400 mr-3" /> Possède <span className="font-bold text-cyan-400 mx-2">{stats?.points ?? 0}</span> points <span className="ml-2">{formatRank(stats?.pointsRank ?? null)}</span></li>
                            <li className="flex items-center"><Star className="h-5 w-5 text-green-400 mr-3" /> Possède <span className="font-bold text-green-400 mx-2">{(stats?.xp ?? 0).toLocaleString()}</span> XP <span className="ml-2">{formatRank(stats?.xpRank ?? null)}</span></li>
                        </ul>
                        <div className="flex items-center pt-4 border-t border-gray-700">
                            <p>Titre actuel: <span className="font-semibold ml-2">{stats?.equippedTitle || 'Aucun'}</span></p>
                            <button onClick={() => setIsTitleModalOpen(true)} className="ml-auto bg-cyan-600 px-3 py-1 rounded-md text-sm font-semibold hover:bg-cyan-700">Changer le titre</button>
                        </div>
                    </div>
                    <div className="bg-[#1e2530] p-6 rounded-lg">
                        <h2 className="font-bold text-lg mb-4 flex items-center"><Package className="h-5 w-5 mr-2"/>Inventaire rapide</h2>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {inventory.length > 0 ? (
                                inventory.map(item => (
                                    <div key={item.id} className="flex items-center bg-gray-800/50 p-2 rounded-md">
                                        <div className="w-10 h-10 bg-black/20 rounded-md flex items-center justify-center mr-3">
                                            <Package size={20} className="text-gray-400"/>
                                        </div>
                                        <span className="flex-1 font-semibold">{item.name}</span>
                                        <span className="text-xs font-bold bg-cyan-800 text-cyan-200 px-2 py-1 rounded-full">x{item.quantity}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">Votre inventaire est vide.</p>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="bg-[#1e2530] p-6 rounded-lg text-center">
                    <h2 className="font-bold text-lg flex items-center justify-center"><Gift className="h-6 w-6 mr-2 text-yellow-400"/>Récompense quotidienne</h2>
                    <p className="text-gray-400 text-sm my-2">Connecte-toi chaque jour pour obtenir un bonus de 500 pièces !</p>
                    <button onClick={handleClaimReward} disabled={!claimStatus.canClaim || isClaiming} className={`mx-auto px-5 py-2 rounded-md font-bold transition flex items-center justify-center ${ (claimStatus.canClaim && !isClaiming) ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed' }`}>
                        {isClaiming && <Loader2 className="h-5 w-5 animate-spin mr-2"/>}
                        {claimStatus.canClaim ? (isClaiming ? 'Réclamation...' : 'Réclamer ma récompense') : `Prochaine récompense dans ${claimStatus.timeLeft}`}
                    </button>
                </div>

                {patchNotes && (
                    <div className="bg-[#1e2530] p-6 rounded-lg">
                        <h2 className="font-bold text-lg mb-4">📢 {patchNotes.title}</h2>
                        <div className="space-y-4 text-gray-300">
                            {patchNotes.ajouts && <div><h3 className="font-semibold text-cyan-400 mb-2">Ajouts</h3><ul className="list-disc list-inside space-y-1 text-sm">{patchNotes.ajouts.map((note, i) => <li key={i}>{note}</li>)}</ul></div>}
                            {patchNotes.ajustements && <div><h3 className="font-semibold text-green-400 mb-2">Ajustements</h3><ul className="list-disc list-inside space-y-1 text-sm">{patchNotes.ajustements.map((note, i) => <li key={i}>{note}</li>)}</ul></div>}
                        </div>
                    </div>
                )}

                <div className="bg-[#1e2530] p-6 rounded-lg">
                    <h2 className="font-bold text-lg mb-4">🏆 Succès débloqués</h2>
                    {successes.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{successes.map(succesName => <div key={succesName} className="bg-gray-700 p-3 rounded-md text-center"><p>{succesName}</p></div>)}</div>
                    ) : (<p className="text-gray-500 text-sm">Aucun succès débloqué pour le moment.</p>)}
                </div>
            </div>

            {isTitleModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#1e2530] p-8 rounded-lg border border-cyan-700 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">Changer de titre</h2>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {availableTitles && availableTitles.length > 0 ? availableTitles.map(titre => (
                                <label key={titre} className="flex items-center p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                                    <input type="radio" name="title" value={titre} checked={selectedTitle === titre} onChange={(e) => setSelectedTitle(e.target.value)} className="form-radio h-5 w-5 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500"/>
                                    <span className="ml-4 text-lg">{titre}</span>
                                </label>
                            )) : <p className="text-gray-400">Vous ne possédez aucun titre pour le moment.</p>}
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setIsTitleModalOpen(false)} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700">Annuler</button>
                            <button onClick={handleEquipTitle} className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-700 font-bold">Équiper</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}