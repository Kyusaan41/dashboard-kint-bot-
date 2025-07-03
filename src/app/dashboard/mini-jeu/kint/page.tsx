'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getPointsLeaderboard, fetchPoints, updatePoints } from '@/utils/api';
import Image from 'next/image';
import { motion } from 'framer-motion'; // Import de Framer Motion

// Types pour les données
type LeaderboardEntry = {
  userId: string;
  points: number;
  username?: string; // Garde comme optionnel si le bot ne le fournit pas toujours
  avatar?: string;   // Garde comme optionnel si le bot ne le fournit pas toujours
};

export default function KintMiniGamePage() {
  const { data: session, status } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [manualPointsAmount, setManualPointsAmount] = useState<number | ''>(''); 
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null);

  // Fonction pour récupérer les données du jeu
  const fetchData = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    setMaintenanceMessage(null);
    try {
      const [leaderboardData, pointsData] = await Promise.all([
        getPointsLeaderboard(), // Récupère le classement
        fetchPoints(session.user.id), // Récupère les points de l'utilisateur connecté
      ]);

      setLeaderboard(leaderboardData.slice(0, 10)); // Prend le top 10
      setUserPoints(pointsData.points); // Définit les points de l'utilisateur
    } catch (error: any) {
      console.error("Erreur lors de la récupération des données du jeu:", error);
      if (error.message.includes('maintenance') || error.message.includes('indisponible')) {
          setMaintenanceMessage(error.message);
      } else {
          alert("Impossible de charger les données du jeu. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  // Gère l'interaction de jeu (ajout/retrait de points)
  const handleGameAction = async (amount: number) => {
    if (userPoints === null || !session?.user?.id) {
      alert("Erreur: Impossible de mettre à jour les points. Vérifiez votre session ou les points.");
      return;
    }
    
    const newPoints = userPoints + amount;
    setUserPoints(newPoints); // Mise à jour optimiste

    try {
      await updatePoints(session.user.id, newPoints);
      const newLeaderboard = await getPointsLeaderboard();
      setLeaderboard(newLeaderboard.slice(0, 10));
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour des points:", error);
      if (error.message.includes('maintenance') || error.message.includes('indisponible')) {
          alert(error.message);
          setMaintenanceMessage(error.message);
      } else {
          alert(`Échec de l'action : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
      setUserPoints(userPoints); // Retour à la valeur initiale en cas d'échec
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

  if (maintenanceMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-[#0b0d13] text-white p-8 text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Maintenance en cours</h1>
        <p className="text-lg text-gray-300">{maintenanceMessage}</p>
        <p className="text-md text-gray-400 mt-4">Seuls les administrateurs peuvent accéder aux fonctionnalités du bot actuellement.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Bloc pour gérer les points de l'utilisateur connecté */}
      <div className="lg:w-1/3 bg-[#12151d] p-6 rounded-lg border border-cyan-700 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Votre Score</h2>
        <div className="text-6xl font-bold text-white my-8">
          {userPoints !== null ? userPoints : '...'}
        </div>
        
        {/* Ancien bloc des boutons +5 et -5 - SUPPRIMÉ */}
        {/* <div className="flex justify-around w-full mb-6">
          <button onClick={() => handleGameAction(-5)} className="px-6 py-3 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition">-5 Points</button>
          <button onClick={() => handleGameAction(5)} className="px-6 py-3 bg-green-600 rounded-lg font-bold hover:bg-green-700 transition">+5 Points</button>
        </div>
        */}

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

      {/* Bloc du classement KINT (avec animations) */}
      <div className="lg:w-2/3 bg-[#12151d] p-6 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Top 10 KINT</h2>
        <ul className="space-y-3">
          {leaderboard.length > 0 ? (
            leaderboard.map((player, index) => (
              <motion.li
                key={player.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex items-center p-3 rounded-md transition ${player.userId === session?.user?.id ? 'bg-cyan-600/50 border border-cyan-500' : 'bg-gray-700'}`}
              >
                {/* Affichage de l'avatar de l'utilisateur */}
                <Image 
                  src={player.avatar || '/default-avatar.png'} // Utilise l'avatar du joueur ou un avatar par défaut
                  alt={player.username || 'Avatar'} 
                  width={40} 
                  height={40} 
                  className="rounded-full mr-4" 
                />
                <span className="font-bold text-lg w-10 text-center">{index + 1}.</span>
                {/* Affichage du pseudo de l'utilisateur */}
                <span className="font-medium flex-1">{player.username || 'Utilisateur Inconnu'}</span>
                <span className="font-semibold text-yellow-400">{player.points} pts</span>
              </motion.li>
            ))
          ) : (
            <p className="text-gray-500 text-center">Aucun joueur dans le classement pour le moment.</p>
          )}
        </ul>
      </div>
    </div>
  );
}