'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
// Assurez-vous que les fonctions d'API sont bien exportées et que les chemins sont corrects
import { getPointsLeaderboard } from '@/utils/api'; 
// import { getAllMembers } from '@/utils/api'; // Vous aurez besoin d'une fonction comme celle-ci

// On définit un type pour les entrées du classement
type LeaderboardData = {
    userId: string;
    points: number;
    // Ajoutez d'autres propriétés si nécessaire
};

// On définit un type pour les données enrichies (avec nom et avatar)
type EnrichedLeaderboardEntry = {
    userId: string;
    points: number;
    name: string;
    avatar: string;
};

export default function KintMiniGamePage() {
    const { data: session } = useSession();
    const [leaderboard, setLeaderboard] = useState<EnrichedLeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Récupère le classement des points
                const leaderboardPoints: LeaderboardData[] = await getPointsLeaderboard();
                
                // Vous aurez besoin d'une fonction pour récupérer tous les membres du serveur
                // const allMembers = await getAllMembers(); 

                // Pour l'exemple, on utilise des membres factices
                const allMembers = [
                    { id: '1206053705149841428', username: 'Kyusa', avatar: '...' },
                    { id: '123456789', username: 'TestUser', avatar: '...' },
                ];

                // On enrichit le top 10 avec les infos des membres
                const top10 = leaderboardPoints.slice(0, 10);
                
                // --- CORRECTION ICI ---
                // On type explicitement le paramètre 'entry'
                const enriched: EnrichedLeaderboardEntry[] = top10.map((entry: LeaderboardData) => {
                    const user = allMembers.find((m) => m.id === entry.userId);
                    return {
                        userId: entry.userId,
                        points: entry.points,
                        name: user?.username || 'Utilisateur inconnu',
                        avatar: user?.avatar || '/default-avatar.png',
                    };
                });

                setLeaderboard(enriched);

            } catch (error) {
                console.error("Erreur lors du chargement du classement:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return <div className="text-center text-gray-400">Chargement du mini-jeu...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-6">Classement du Mini-Jeu Kint</h1>
            <div className="bg-gray-800 p-4 rounded-lg">
                <ul className="space-y-3">
                    {leaderboard.map((player, index) => (
                        <li key={player.userId} className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                            <div className="flex items-center">
                                <span className="font-bold text-lg mr-4">{index + 1}.</span>
                                <p>{player.name}</p>
                            </div>
                            <p className="font-semibold text-yellow-400">{player.points} Points</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}