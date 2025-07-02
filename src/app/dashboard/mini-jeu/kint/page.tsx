'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getPointsLeaderboard, fetchPoints, updatePoints } from '@/utils/api';
import Image from 'next/image';

// Types pour les données
type LeaderboardEntry = {
  userId: string;
  points: number;
  username?: string;
  avatar?: string;
};

export default function KintMiniGamePage() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer toutes les données nécessaires à la page
  const fetchData = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const [leaderboardData, pointsData] = await Promise.all([
        getPointsLeaderboard(),
        fetchPoints(session.user.id),
      ]);

      setLeaderboard(leaderboardData.slice(0, 10));
      setUserPoints(pointsData.points);

    } catch (error) {
      console.error("Erreur lors de la récupération des données du jeu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const handleGameAction = async (amount: number) => {
    if (userPoints === null || !session?.user?.id) return;
    
    const newPoints = userPoints + amount;
    setUserPoints(newPoints); // Met à jour l'interface immédiatement pour la réactivité

    try {
      // Met à jour les points en arrière-plan
      await updatePoints(session.user.id, newPoints);
      // Rafraîchit le classement après la mise à jour
      const newLeaderboard = await getPointsLeaderboard();
      setLeaderboard(newLeaderboard.slice(0, 10));
    } catch (error) {
      console.error("Erreur lors de la mise à jour des points:", error);
      setUserPoints(userPoints); // En cas d'erreur, on revient à la valeur d'origine
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400 animate-pulse">Chargement du mini-jeu Kint...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Colonne de jeu */}
      <div className="lg:w-1/3 bg-[#12151d] p-6 rounded-lg border border-cyan-700">
        <h2 className="text-2xl font-bold text-center text-cyan-400 mb-4">Votre Score</h2>
        <div className="text-6xl font-bold text-center text-white my-8 animate-pulse">
          {userPoints !== null ? userPoints : '...'}
        </div>
        <div className="flex justify-around">
          <button
            onClick={() => handleGameAction(-5)}
            className="px-6 py-3 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition"
          >
            -5 Points
          </button>
          <button
            onClick={() => handleGameAction(5)}
            className="px-6 py-3 bg-green-600 rounded-lg font-bold hover:bg-green-700 transition"
          >
            +5 Points
          </button>
        </div>
      </div>

      {/* Colonne classement */}
      <div className="lg:w-2/3 bg-[#12151d] p-6 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Top 10</h2>
        <ul className="space-y-3">
          {leaderboard.map((player, index) => (
            <li
              key={player.userId}
              className={`flex items-center p-3 rounded-md transition ${player.userId === session?.user?.id ? 'bg-cyan-600/50 border border-cyan-500' : 'bg-gray-700'}`}
            >
              <span className="font-bold text-lg w-10 text-center">{index + 1}.</span>
              <Image
                src={player.avatar || '/default-avatar.png'}
                alt={player.username || 'Avatar'}
                width={40}
                height={40}
                className="rounded-full mx-4"
              />
              <span className="font-medium flex-1">{player.username || 'Utilisateur Inconnu'}</span>
              <span className="font-semibold text-yellow-400">{player.points} pts</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}