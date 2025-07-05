'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Coins, Gift, Loader2, Package, MessageSquare, Star, Zap, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getInventory, getAllAchievements } from '@/utils/api';

// --- Définition des Types ---
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
type UnlockedSuccessData = { succes: string[] };
type TitlesData = { titresPossedes: string[] };
type CurrencyData = { balance: number; lastClaim: number | null };
type MessagesApiResponse = { messagesLast7Days: number[] };
type AllAchievements = {
    [key: string]: {
        name: string;
        description: string;
    }
};

// --- Le Composant Principal ---
export default function DashboardHomePage() {
    const { data: session, status } = useSession();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [unlockedSuccesses, setUnlockedSuccesses] = useState<string[]>([]);
    const [allAchievements, setAllAchievements] = useState<AllAchievements>({});
    const [patchNotes, setPatchNotes] = useState<PatchNote | null>(null);
    const [messageData, setMessageData] = useState<MessageData[]>([]);
    const [availableTitles, setAvailableTitles] = useState<string[]>([]);
    const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
    const [selectedTitle, setSelectedTitle] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [claimStatus, setClaimStatus] = useState({ canClaim: false, timeLeft: '00:00:00' });
    const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
    const [isClaiming, setIsClaiming] = useState(false);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [statsData, messages, successData, patchnoteData, titles, currency, server, inventoryData, allAchievementsData] = await Promise.all([
                        fetch(`/api/stats/me`).then(res => res.json()),
                        fetch(`/api/messages/${session.user.id}`).then(res => res.json()),
                        fetch(`/api/success/${session.user.id}`).then(res => res.json()),
                        fetch(`/api/patchnote`).then(res => res.json()),
                        fetch(`/api/titres/${session.user.id}`).then(res => res.json()),
                        fetch(`/api/currency/${session.user.id}`).then(res => res.json()),
                        fetch(`/api/server/info`).then(res => res.json()),
                        getInventory(),
                        getAllAchievements()
                    ]);

                    setStats(statsData);
                    setMessageData((messages.messagesLast7Days || []).map((c: number, i: number) => ({ day: `Jour ${i + 1}`, messages: c })));
                    setUnlockedSuccesses(successData.succes || []);
                    setAllAchievements(allAchievementsData || {});
                    setPatchNotes(patchnoteData);
                    setAvailableTitles(titles.titresPossedes || []);
                    setServerInfo(server);
                    setInventory(inventoryData || []);

                    if (currency) {
                        const now = Date.now();
                        const twentyFourHours = 24 * 60 * 60 * 1000;
                        if (!currency.lastClaim || (now - currency.lastClaim >= twentyFourHours)) {
                            setClaimStatus({ canClaim: true, timeLeft: '' });
                        } else {
                            const timeLeft = twentyFourHours - (now - currency.lastClaim);
                            setClaimStatus({ canClaim: false, timeLeft: new Date(timeLeft).toISOString().substr(11, 8) });
                        }
                    }

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

    const totalAchievementsCount = Object.keys(allAchievements).length;

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Bloc 1 : Profil Utilisateur */}
                    <div className="bg-[#1e2530] p-6 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <Image src={session?.user?.image || '/default-avatar.png'} alt="Avatar" width={64} height={64} className="rounded-full" />
                            <div>
                                <p className="font-bold text-lg">{session?.user?.name}</p>
                                <p className="text-sm text-purple-400 font-semibold">♕ {session?.user?.role === 'admin' ? 'Administrateur' : 'Membre'}</p>
                            </div>
                        </div>
                        <ul className="space-y-2 text-gray-300 mt-4">
                            <li className="flex items-center"><Coins className="h-5 w-5 text-yellow-400 mr-3" /> Possède <span className="font-bold text-yellow-400 mx-2">{(stats?.currency ?? 0).toLocaleString()}</span> pièces <span className="ml-2">{formatRank(stats?.currencyRank ?? null)}</span></li>
                            <li className="flex items-center"><Zap className="h-5 w-5 text-cyan-400 mr-3" /> Possède <span className="font-bold text-cyan-400 mx-2">{stats?.points ?? 0}</span> points <span className="ml-2">{formatRank(stats?.pointsRank ?? null)}</span></li>
                            <li className="flex items-center"><Star className="h-5 w-5 text-green-400 mr-3" /> Possède <span className="font-bold text-green-400 mx-2">{(stats?.xp ?? 0).toLocaleString()}</span> XP <span className="ml-2">{formatRank(stats?.xpRank ?? null)}</span></li>
                        </ul>
                        <div className="flex items-center pt-4 mt-4 border-t border-gray-700">
                            <p>Titre actuel: <span className="font-semibold ml-2">{stats?.equippedTitle || 'Aucun'}</span></p>
                            <button onClick={() => setIsTitleModalOpen(true)} className="ml-auto bg-cyan-600 px-3 py-1 rounded-md text-sm font-semibold hover:bg-cyan-700">Changer le titre</button>
                        </div>
                    </div>

                    {/* Bloc 2 : Inventaire Rapide */}
                    <div className="bg-[#1e2530] p-6 rounded-lg">
                         <h2 className="font-bold text-lg mb-4 flex items-center"><Package className="h-5 w-5 mr-2"/>Inventaire rapide</h2>
                        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                            {inventory && inventory.length > 0 ? (
                                inventory.map(item => (
                                    <div key={item.id} className="flex items-center bg-gray-800/50 p-2 rounded-md">
                                        <div className="w-10 h-10 bg-black/20 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                                            {item.icon ? (
                                                <Image src={item.icon} alt={item.name} width={24} height={24} />
                                            ) : (
                                                <Package size={20} className="text-gray-400"/>
                                            )}
                                        </div>
                                        <span className="flex-1 font-semibold truncate">{item.name}</span>
                                        <span className="text-xs font-bold bg-cyan-800 text-cyan-200 px-2 py-1 rounded-full">x{item.quantity}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 pt-16">Votre inventaire est vide.</p>
                            )}
                        </div>
                    </div>

                    {/* Bloc 3 : Messages sur 7 jours */}
                    <div className="bg-[#1e2530] p-6 rounded-lg lg:col-span-1 md:col-span-2">
                        <h2 className="font-bold mb-4 flex items-center"><MessageSquare className="h-5 w-5 mr-2"/>Messages sur 7 jours</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={messageData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} /><YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} cursor={{fill: 'rgba(100, 116, 139, 0.1)'}}/><Bar dataKey="messages" name="Messages" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
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
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        🏆
                        Succès débloqués ({unlockedSuccesses.length}/{totalAchievementsCount})
                    </h2>
                    {unlockedSuccesses.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {unlockedSuccesses.map(successId => (
                                <div key={successId} className="bg-gray-700 p-3 rounded-md text-center truncate" title={allAchievements[successId]?.description || 'Succès secret'}>
                                    <p>{allAchievements[successId]?.name || successId}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Aucun succès débloqué pour le moment.</p>
                    )}
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