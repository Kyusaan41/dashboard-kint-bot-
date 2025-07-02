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
type Success = { id: string; name: string; };
type PatchNote = { title: string; ajouts: string[]; ajustements: string[]; };
type MessageData = { day: string; messages: number; };

// --- Le Composant Principal ---
export default function DashboardHomePage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [successes, setSuccesses] = useState<Success[]>([]);
  const [patchNotes, setPatchNotes] = useState<PatchNote | null>(null);
  const [messageData, setMessageData] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const fetchData = async () => {
        try {
          const [statsRes, messagesRes, successRes, patchnoteRes] = await Promise.all([
            fetch(`/api/stats/me`),
            fetch(`/api/messages/${session.user.id}`),
            fetch(`/api/success/${session.user.id}`),
            fetch(`/api/patchnote`),
          ]);

          const statsData = await statsRes.json();
          const messagesData = await messagesRes.json();
          const successData = await successRes.json();
          const patchnoteData = await patchnoteRes.json();

          setStats(statsData);
          setSuccesses(successData.succes || []);
          setPatchNotes(patchnoteData);
          
          const formattedMessageData = (messagesData.messagesLast7Days || []).map((count: number, index: number) => ({
            day: `Jour ${index + 1}`,
            messages: count,
          }));
          setMessageData(formattedMessageData);

        } catch (error) {
          console.error("Erreur de chargement du dashboard:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [status, session]);

  if (loading || status === 'loading') {
    return <div className="text-center text-gray-400 animate-pulse">Chargement de vos données...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bienvenue sur KTS</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Profil */}
        <div className="lg:col-span-2 bg-[#1e2530] p-6 rounded-lg space-y-4">
          <div className="flex items-center space-x-4">
            <Image src={session?.user?.image || '/default-avatar.png'} alt="Avatar" width={64} height={64} className="rounded-full" />
            <div>
              <p className="font-bold text-lg">{session?.user?.name}</p>
              <p className="text-sm text-purple-400 font-semibold">♕ {session?.user?.role === 'admin' ? 'Administrateur' : 'Membre'}</p>
            </div>
          </div>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center"><Coins className="h-5 w-5 text-yellow-400 mr-3" /> {stats?.currencyRank === 1 ? 'Le plus riche avec' : 'Possède'} <span className="font-bold text-yellow-400 mx-2">{stats?.currency?.toLocaleString()}</span> pièces</li>
            <li className="flex items-center"><Zap className="h-5 w-5 text-cyan-400 mr-3" /> {stats?.pointsRank === 1 ? '1er en KINTS avec' : 'Possède'} <span className="font-bold text-cyan-400 mx-2">{stats?.points}</span> points</li>
            <li className="flex items-center"><Star className="h-5 w-5 text-green-400 mr-3" /> {stats?.xpRank === 1 ? '1er en XP avec' : 'Possède'} <span className="font-bold text-green-400 mx-2">{stats?.xp?.toLocaleString()}</span> XP</li>
          </ul>
          <div className="flex items-center pt-4 border-t border-gray-700">
            <p>Titre actuel: <span className="font-semibold ml-2">{stats?.equippedTitle || 'Aucun'}</span></p>
            <button className="ml-auto bg-cyan-600 px-3 py-1 rounded-md text-sm font-semibold hover:bg-cyan-700">Changer le titre</button>
          </div>
        </div>

        {/* Colonne Graphique */}
        <div className="bg-[#1e2530] p-6 rounded-lg">
            <h2 className="font-bold mb-4 flex items-center"><MessageSquare className="h-5 w-5 mr-2"/>Messages envoyés sur 7 jours</h2>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={messageData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} cursor={{fill: 'rgba(100, 116, 139, 0.1)'}}/>
                    <Bar dataKey="messages" name="Messages" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#1e2530] p-6 rounded-lg text-center">
        <h2 className="font-bold text-lg flex items-center justify-center"><Gift className="h-6 w-6 mr-2 text-yellow-400"/>Récompense quotidienne</h2>
        <p className="text-gray-400 text-sm my-2">Connecte-toi chaque jour pour obtenir un bonus !</p>
        <button className="bg-green-600 px-5 py-2 rounded-md font-bold hover:bg-green-700">Réclamer ma récompense du jour</button>
      </div>

      {patchNotes && (
        <div className="bg-[#1e2530] p-6 rounded-lg">
          <h2 className="font-bold text-lg mb-4">📢 {patchNotes.title}</h2>
          <div className="space-y-4 text-gray-300">
            {patchNotes.ajouts && <div>
              <h3 className="font-semibold text-cyan-400 mb-2">Ajouts</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {patchNotes.ajouts.map((note, i) => <li key={i}>{note}</li>)}
              </ul>
            </div>}
            {patchNotes.ajustements && <div>
              <h3 className="font-semibold text-green-400 mb-2">Ajustements</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {patchNotes.ajustements.map((note, i) => <li key={i}>{note}</li>)}
              </ul>
            </div>}
          </div>
        </div>
      )}

      <div className="bg-[#1e2530] p-6 rounded-lg">
        <h2 className="font-bold text-lg mb-4">🏆 Succès débloqués</h2>
        {successes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {successes.map(s => <div key={s.id} className="bg-gray-700 p-3 rounded-md text-center"><p>{s.name}</p></div>)}
            </div>
        ) : (
            <p className="text-gray-500 text-sm">Aucun succès débloqué pour le moment.</p>
        )}
      </div>
    </div>
  );
}