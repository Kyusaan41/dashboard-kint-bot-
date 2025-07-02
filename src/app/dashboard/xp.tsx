'use client';

import { useEffect, useState } from 'react';
// On importe le bon nom de fonction pour le classement
import { getXPLeaderboard, getXPByUser, updateXP } from '@/utils/api';

// On définit un type pour les données du classement
type XPData = {
    userId: string;
    xp: number;
    username?: string; // Le nom d'utilisateur est optionnel mais utile
};

export default function XPDashboard() {
    const [xpData, setXpData] = useState<XPData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchXPData = async () => {
            try {
                // On appelle la bonne fonction pour récupérer le classement
                const leaderboard = await getXPLeaderboard();
                setXpData(leaderboard);
            } catch (error) {
                console.error("Erreur lors de la récupération du classement XP:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchXPData();
    }, []);

    if (loading) {
        return <div className="text-center text-gray-400">Chargement du classement XP...</div>;
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Classement par Points d'Expérience</h2>
            <ul className="space-y-2">
                {xpData.length > 0 ? (
                    xpData.map((user, index) => (
                        <li key={user.userId} className="flex justify-between items-center bg-gray-700 p-3 rounded-md transition hover:bg-gray-600">
                            <span className="font-medium">
                                {index + 1}. {user.username || user.userId}
                            </span>
                            <span className="font-semibold text-yellow-400">{user.xp} XP</span>
                        </li>
                    ))
                ) : (
                    <p className="text-gray-500">Aucune donnée de classement à afficher.</p>
                )}
            </ul>
        </div>
    );
}