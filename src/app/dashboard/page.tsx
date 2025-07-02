'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Award, BarChart2, Coins, Crown, Gift, MessageSquare, Star, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- Définition des Types pour nos données ---
type UserStats = {
  currency: number;
  currencyRank: number | null;
  xp: number;
  points: number;
  equippedTitle: string | null;
};

type Success = {
  id: string;
  name: string;
};

type PatchNote = {
  title: string;
  ajouts: string[];
  ajustements: string[];
};

type MessageData = {
  day: string;
  messages: number;
};

// --- Le Composant Principal ---
export default function DashboardHomePage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [successes, setSuccesses] = useState<Success[]>([]);
  const [patchNotes, setPatchNotes] = useState<PatchNote | null>(null);
  const [messageData, setMessageData] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Chargement de toutes les données ---
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const fetchData = async () => {
        try {
          // Dans une application réelle, vous feriez vos appels API ici
          // const [statsData, rankData, ...] = await Promise.all([...]);
          
          // Données factices pour correspondre à votre capture d'écran
          setStats({
            currency: 59539,
            currencyRank: 1,
            xp: 139246,
            points: 432,
            equippedTitle: null,
          });

          setMessageData([
            { day: 'Jour 1', messages: 4 },
            { day: 'Jour 2', messages: 6 },
            { day: 'Jour 3', messages: 10 },
            { day: 'Jour 4', messages: 20 },
            { day: 'Jour 5', messages: 22 },
            { day: 'Jour 6', messages: 11 },
            { day: 'Jour 7', messages: 8 },
          ]);

          setPatchNotes({
            title: 'Mise à jour 3.2.2',
            ajouts: [
              "Nouveau système d'anniversaire : entre ta date avec '/profile', ton anniversaire sera célébré par le bot avec un message personnalisé et peut-être un 🎁 cadeau surprise !",
              "Système de création automatique de salons vocaux : clique sur 'Créer ton vocal' pour générer ton propre salon vocal temporaire, ce qui aide à garder le serveur propre et organisé ✨."
            ],
            ajustements: [
                "Simplification de la commande `/utilise` pour une meilleure expérience utilisateur.",
                "Affichage allégé des items afin d'éviter la confusion chez les membres."
            ]
          });

          // Pour l'instant, aucun succès débloqué comme sur l'image
          setSuccesses([]);

        } catch (error) {
          console.error("Erreur lors du chargement des données:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [status, session]);

  if (loading || status === 'loading') {
    return <div className="text-center text-gray-400 animate-pulse">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bienvenue sur KTS</h1>

      {/* Grille principale (Profil + Graphique) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche : Profil */}
        <div className="lg:col-span-2 bg-[#1e2530] p-6 rounded-lg space-y-4">
          <div className="flex items-center space-x-4">
            <Image src={session?.user?.image || '/default-avatar.png'} alt="Avatar" width={64} height={64} className="rounded-full" />
            <div>
              <p className="font-bold text-lg">{session?.user?.name || 'Utilisateur'}#0000</p>
              <p className="text-sm text-purple-400 font-semibold">♕ Administrateur</p>
            </div>
          </div>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center"><Coins className="h-5 w-5 text-yellow-400 mr-3" /> Le plus riche avec <span className="font-bold text-yellow-400 mx-2">{stats?.currency.toLocaleString()}</span> pièces</li>
            <li className="flex items-center"><Zap className="h-5 w-5 text-cyan-400 mr-3" /> 1er en KINTS avec <span className="font-bold text-cyan-400 mx-2">{stats?.points}</span> points</li>
            <li className="flex items-center"><Star className="h-5 w-5 text-green-400 mr-3" /> 1er en XP avec <span className="font-bold text-green-400 mx-2">{stats?.xp.toLocaleString()}</span> XP</li>
          </ul>
          <div className="flex items-center pt-4 border-t border-gray-700">
            <p>Titre actuel: <span className="font-semibold ml-2">{stats?.equippedTitle || 'Aucun'}</span></p>
            <button className="ml-auto bg-cyan-600 px-3 py-1 rounded-md text-sm font-semibold hover:bg-cyan-700">Changer le titre</button>
          </div>
        </div>

        {/* Colonne de droite : Graphique */}
        <div className="bg-[#1e2530] p-6 rounded-lg">
            <h2 className="font-bold mb-4 flex items-center"><MessageSquare className="h-5 w-5 mr-2"/>Messages envoyés sur 7 jours</h2>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={messageData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} cursor={{fill: 'rgba(100, 116, 139, 0.1)'}}/>
                    <Bar dataKey="messages" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Bloc Récompense quotidienne */}
      <div className="bg-[#1e2530] p-6 rounded-lg text-center">
        <h2 className="font-bold text-lg flex items-center justify-center"><Gift className="h-6 w-6 mr-2 text-yellow-400"/>Récompense quotidienne</h2>
        <p className="text-gray-400 text-sm my-2">Connecte-toi chaque jour pour obtenir un bonus !</p>
        <button className="bg-green-600 px-5 py-2 rounded-md font-bold hover:bg-green-700">Réclamer ma récompense du jour</button>
      </div>

      {/* Bloc Mise à jour */}
      {patchNotes && (
        <div className="bg-[#1e2530] p-6 rounded-lg">
          <h2 className="font-bold text-lg mb-4">📢 Mise à jour</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-cyan-400 mb-2">Ajouts</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {patchNotes.ajouts.map((note, i) => <li key={i}>{note}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-green-400 mb-2">Ajustements</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {patchNotes.ajustements.map((note, i) => <li key={i}>{note}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Bloc Succès */}
      <div className="bg-[#1e2530] p-6 rounded-lg">
        <h2 className="font-bold text-lg mb-4">🏆 Succès débloqués</h2>
        <p className="text-gray-500 text-sm">Aucun succès débloqué pour le moment.</p>
      </div>

    </div>
  );
}