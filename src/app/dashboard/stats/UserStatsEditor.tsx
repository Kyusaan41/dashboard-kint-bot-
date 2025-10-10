'use client';

import { useState } from 'react';
import { getXPByUser, updateXP, fetchPoints, fetchCurrency, updateCurrency, updatePoints } from '@/utils/api';

export default function UserStatsEditor() {
  const [userId, setUserId] = useState('');
  const [xp, setXp] = useState<number | null>(null);
  const [currency, setCurrency] = useState<number | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchStats = async () => {
    if (!userId) return;
    setLoading(true);
    setMessage('');
    try {
      const xpData = await getXPByUser(userId);
      const currencyData = await fetchCurrency(userId);
      const pointsData = await fetchPoints(userId);
      setXp(xpData.xp ?? 0);
      setCurrency(currencyData.coins ?? 0);  // <- correction ici
      setPoints(pointsData.points ?? 0);
    } catch (err) {
      setMessage('Erreur lors de la rÃ©cupÃ©ration des donnÃ©es.');
    }
    setLoading(false);
  };


  const updateStats = async () => {
    if (!userId) return;
    setLoading(true);
    setMessage('');
    try {
      await updateXP(userId, xp ?? 0);
      await updateCurrency(userId, currency ?? 0);
      await updatePoints(userId, points ?? 0);
      setMessage('Statistiques mises Ã  jour !');
    } catch (err) {
      setMessage('Erreur lors de la mise Ã  jour.');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-md w-full max-w-xl mx-auto mt-10 space-y-4">
      <h2 className="text-xl font-semibold">Ã‰diteur de statistiques utilisateur</h2>
      <input
        type="text"
        placeholder="ID utilisateur Discord"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="w-full p-2 rounded bg-zinc-800 text-white"
      />

      <button
        onClick={fetchStats}
        className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700"
        disabled={loading}
      >
        Charger les donnÃ©es
      </button>

      {xp !== null && (
        <div className="space-y-3">
          <div>
            <label className="block">XP :</label>
            <input
              type="number"
              value={xp}
              onChange={(e) => setXp(Number(e.target.value))}
              className="w-full p-2 rounded bg-zinc-800 text-white"
            />
          </div>
          <div>
            <label className="block">PiÃ¨ces :</label>
            <input
              type="number"
              value={currency ?? 0}
              onChange={(e) => setCurrency(Number(e.target.value))}
              className="w-full p-2 rounded bg-zinc-800 text-white"
            />
          </div>
          <div>
            <label className="block">Points KIP :</label>
            <input
              type="number"
              value={points ?? 0}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full p-2 rounded bg-zinc-800 text-white"
            />
          </div>

          <button
            onClick={updateStats}
            className="px-4 py-2 bg-green-600 rounded text-white hover:bg-green-700"
            disabled={loading}
          >
            Mettre Ã  jour
          </button>
        </div>
      )}

      {message && <p className="mt-2 text-sm text-center text-yellow-400">{message}</p>}
    </div>
  );
}
