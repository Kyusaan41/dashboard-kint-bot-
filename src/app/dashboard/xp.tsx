'use client';

import { useEffect, useState } from 'react';
import { getXP, getXPByUser, updateXP } from '@/utils/api';

export default function XPDashboard() {
  const [xpData, setXPData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getXP().then(data => {
      setXPData(data);
      setLoading(false);
    });
  }, []);

  const handleXPChange = async (userId: string, newXP: number) => {
    try {
      await updateXP(userId, newXP);
      const updatedUserXP = await getXPByUser(userId);
      setXPData(prev => ({ ...prev, [userId]: updatedUserXP }));
    } catch (err) {
      console.error('Erreur lors de la mise à jour XP:', err);
    }
  };

  if (loading) return <p className="p-6 text-white">Chargement...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Gestion des XP</h1>
      <ul className="space-y-4">
        {Object.entries(xpData).map(([userId, xp]) => (
          <li key={userId} className="bg-gray-800 rounded p-4 flex justify-between items-center">
            <span>{userId} : {xp} XP</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleXPChange(userId, xp + 10)}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
              >
                +10
              </button>
              <button
                onClick={() => handleXPChange(userId, xp - 10)}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
              >
                -10
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
