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
  // Nouvel état pour la quantité de points à ajouter/retirer
  const [manualPointsAmount, setManualPointsAmount] = useState<number | ''>(''); 

  // Fonction pour récupérer les données du jeu
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
      // Afficher une alerte ou un message à l'utilisateur si la récupération échoue
      // alert("Impossible de charger les données du jeu. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Optionnel: rafraîchir les données toutes les X secondes
    // const interval = setInterval(fetchData, 10000); // Rafraîchit toutes les 10 secondes
    // return () => clearInterval(interval);
  }, [session]);

  // Gère l'interaction de jeu (ajout/retrait de points)
  const handleGameAction = async (amount: number) => {
    if (userPoints === null || !session?.user?.id) {
      alert("Erreur: Impossible de mettre à jour les points. Vérifiez votre session ou les points.");
      return;
    }
    
    // Assurez-vous que l'ajout ne rend pas les points négatifs si ce n'est pas souhaité
    const newPoints = userPoints + amount;
    // Si vous voulez empêcher les points de descendre en dessous de zéro:
    // const newPoints = Math.max(0, userPoints + amount);

    // Mettre à jour l'état local immédiatement pour une meilleure réactivité
    setUserPoints(newPoints);

    try {
      await updatePoints(session.user.id, newPoints);
      // Rafraîchir le classement après la mise à jour réussie
      const newLeaderboard = await getPointsLeaderboard();
      setLeaderboard(newLeaderboard.slice(0, 10));
    } catch (error) {
      console.error("Erreur lors de la mise à jour des points:", error);
      alert(`Échec de la mise à jour des points : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      // Revenir à la valeur initiale en cas d'échec de l'API
      setUserPoints(userPoints); 
    }
  };

  // Gère l'ajout/retrait de points depuis le champ de saisie
  const handleManualPointsAction = async (actionType: 'add' | 'subtract') => {
    if (manualPointsAmount === '' || isNaN(Number(manualPointsAmount))) {
      alert("Veuillez entrer un montant valide.");
      return;
    }
    const amount = Number(manualPointsAmount);
    if (actionType === 'subtract') {
      await handleGameAction(-amount);
    } else {
      await handleGameAction(amount);
    }
    setManualPointsAmount(''); // Réinitialiser le champ après l'action
  };

  if (loading) {
    return <div className="text-center text-gray-400 animate-pulse">Chargement du classement Kint...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/3 bg-[#12151d] p-6 rounded-lg border border-cyan-700 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Votre Score</h2>
        <div className="text-6xl font-bold text-white my-8">
          {userPoints !== null ? userPoints : '...'}
        </div>
        
        {/* Section pour les boutons +5 et -5 */}
        <div className="flex justify-around w-full mb-6">
          <button onClick={() => handleGameAction(-5)} className="px-6 py-3 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition">-5 Points</button>
          <button onClick={() => handleGameAction(5)} className="px-6 py-3 bg-green-600 rounded-lg font-bold hover:bg-green-700 transition">+5 Points</button>
        </div>

        {/* Nouvelle section pour l'ajout/retrait manuel */}
        <div className="w-full space-y-4">
            <h3 className="text-xl font-semibold text-gray-300">Gérer Manuellement les Points</h3>
            <div className="flex gap-2">
                <input
                    type="number"
                    placeholder="Montant..."
                    value={manualPointsAmount}
                    onChange={e => setManualPointsAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="flex-1 bg-gray-800 p-3 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <button 
                    onClick={() => handleManualPointsAction('add')} 
                    className="px-4 py-3 bg-green-600 rounded-lg font-bold hover:bg-green-700 transition"
                    disabled={manualPointsAmount === '' || isNaN(Number(manualPointsAmount))}
                >
                    Ajouter
                </button>
                <button 
                    onClick={() => handleManualPointsAction('subtract')} 
                    className="px-4 py-3 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition"
                    disabled={manualPointsAmount === '' || isNaN(Number(manualPointsAmount))}
                >
                    Enlever
                </button>
            </div>
        </div>

      </div>

      <div className="lg:w-2/3 bg-[#12151d] p-6 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Top 10</h2>
        <ul className="space-y-3">
          {leaderboard.map((player, index) => (
            <li key={player.userId} className={`flex items-center p-3 rounded-md transition ${player.userId === session?.user?.id ? 'bg-cyan-600/50 border border-cyan-500' : 'bg-gray-700'}`}>
              <span className="font-bold text-lg w-10 text-center">{index + 1}.</span>
              <Image src={player.avatar || '/default-avatar.png'} alt={player.username || 'Avatar'} width={40} height={40} className="rounded-full mx-4" />
              <span className="font-medium flex-1">{player.username || 'Utilisateur Inconnu'}</span>
              <span className="font-semibold text-yellow-400">{player.points} pts</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}