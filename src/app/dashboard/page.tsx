'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Award, BarChart2, Coins, Crown, Gift, MessageSquare, Star, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

// --- Le Composant Principal ---
export default function DashboardHomePage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [successes, setSuccesses] = useState<string[]>([]);
  const [patchNotes, setPatchNotes] = useState<PatchNote | null>(null);
  const [messageData, setMessageData] = useState<MessageData[]>([]);
  const [availableTitles, setAvailableTitles] = useState<string[]>([]);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [claimStatus, setClaimStatus] = useState({ canClaim: false, timeLeft: '00:00:00' });

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const fetchData = async () => {
        try {
          const [statsRes, messagesRes, successRes, patchnoteRes, titlesRes, currencyRes] = await Promise.all([
            fetch(`/api/stats/me`),
            fetch(`/api/messages/${session.user.id}`),
            fetch(`/api/success/${session.user.id}`),
            fetch(`/api/patchnote`),
            fetch(`/api/titres/${session.user.id}`),
            fetch(`/api/currency/${session.user.id}`)
          ]);

          const statsData = await statsRes.json();
          const messagesData = await messagesRes.json();
          const successData = await successRes.json();
          const patchnoteData = await patchnoteRes.json();
          const titlesData = await titlesRes.json();
          const currencyData = await currencyRes.json();

          setStats(statsData);
          setSuccesses(successData.succes || []);
          setPatchNotes(patchnoteData);
          setAvailableTitles(titlesData.titresPossedes || []);
          setSelectedTitle(statsData.equippedTitle || '');
          
          const formattedMessageData = (messagesData.messagesLast7Days || []).map((count: number, index: number) => ({
            day: `Jour ${index + 1}`,
            messages: count,
          }));
          setMessageData(formattedMessageData);

          const now = Date.now();
          const twentyFourHours = 24 * 60 * 60 * 1000;
          if (!currencyData.lastClaim || (now - currencyData.lastClaim >= twentyFourHours)) {
              setClaimStatus({ canClaim: true, timeLeft: '' });
          } else {
              const timeLeft = twentyFourHours - (now - currencyData.lastClaim);
              setClaimStatus({ canClaim: false, timeLeft: new Date(timeLeft).toISOString().substr(11, 8) });
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
    if (!claimStatus.canClaim) return;
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
    }
  };

  if (loading || status === 'loading') {
    return <div className="text-center text-gray-400 animate-pulse">Chargement de vos exploits...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Bienvenue sur KTS</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#1e2530] p-6 rounded-lg space-y-4">
            <div className="flex items-center space-x-4">
              <Image src={session?.user?.image || '/default-avatar.png'} alt="Avatar" width={64} height={64} className="rounded-full" />
              <div>
                <p className="font-bold text-lg">{session?.user?.name}</p>
                <p className="text-sm text-purple-400 font-semibold">♕ {session?.user?.role === 'admin' ? 'Administrateur' : 'Membre'}</p>
              </div>
            </div>
            {/* --- CORRECTION ICI : Ajout de '?? 0' comme valeur par défaut --- */}
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
            <h2 className="font-bold mb-4 flex items-center"><MessageSquare className="h-5 w-5 mr-2"/>Messages sur 7 jours</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={messageData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} /><YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} cursor={{fill: 'rgba(100, 116, 139, 0.1)'}}/><Bar dataKey="messages" name="Messages" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-[#1e2530] p-6 rounded-lg text-center">
          <h2 className="font-bold text-lg flex items-center justify-center"><Gift className="h-6 w-6 mr-2 text-yellow-400"/>Récompense quotidienne</h2>
          <p className="text-gray-400 text-sm my-2">Connecte-toi chaque jour pour obtenir un bonus de 500 pièces !</p>
          <button onClick={handleClaimReward} disabled={!claimStatus.canClaim} className={`px-5 py-2 rounded-md font-bold transition ${ claimStatus.canClaim ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed' }`}>
            {claimStatus.canClaim ? 'Réclamer ma récompense' : `Prochaine récompense dans ${claimStatus.timeLeft}`}
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