"use client";
import { useEffect, useState } from "react";
import { fetchPoints, fetchCurrency, updatePoints, updateCurrency } from "@/utils/api";

export default function UserStats({ userId }: { userId: string }) {
  const [points, setPoints] = useState<number | null>(null);
  const [coins, setCoins] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const currencyData = await fetchCurrency(userId);
        setCoins(currencyData.balance != null ? String(currencyData.balance) : '0');

        const pointsData = await fetchPoints(userId);
        setPoints(pointsData.points ?? 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const handleUpdate = async () => {
    if (points === null) {
      alert("âŒ Points non chargÃ©s.");
      return;
    }
    const coinsNumber = Number(coins);
    if (isNaN(coinsNumber)) {
      alert("âŒ La valeur des piÃ¨ces n'est pas un nombre valide.");
      return;
    }
    try {
      setUpdating(true);
      await updatePoints(userId, points);
      await updateCurrency(userId, coinsNumber);
      alert("âœ… Mise Ã  jour rÃ©ussie !");
    } catch (error) {
      alert("âŒ Erreur lors de la mise Ã  jour : " + (error as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || points === null) {
    return (
      <p className="text-gray-400 italic text-center py-6">
        Chargement des donnÃ©es utilisateur...
      </p>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-[#12151d] p-6 rounded-2xl shadow-lg border border-cyan-700 space-y-6">
      <h2 className="text-2xl font-semibold text-cyan-400 text-center">
        Statistiques de <span className="font-mono">{userId}</span>
      </h2>

      <div>
        <label
          htmlFor="points"
          className="block mb-2 text-sm font-medium text-cyan-300"
        >
          Points KIP
        </label>
        <input
          id="points"
          type="number"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          className="w-full px-4 py-2 rounded-lg bg-[#1a1d24] border border-cyan-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          min={0}
        />
      </div>

      <div>
        <label
          htmlFor="coins"
          className="block mb-2 text-sm font-medium text-cyan-300"
        >
          PiÃ¨ces
        </label>
        <input
          id="coins"
          type="text"
          value={coins}
          onChange={(e) => setCoins(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-[#1a1d24] border border-cyan-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </div>

      <button
        onClick={handleUpdate}
        disabled={updating}
        className={`w-full py-3 rounded-xl font-semibold text-white transition
          ${updating
            ? "bg-cyan-800 cursor-not-allowed"
            : "bg-cyan-600 hover:bg-cyan-700 active:scale-95"
          }`}
        aria-busy={updating}
      >
        {updating ? "Mise Ã  jour..." : "Enregistrer"}
      </button>
    </div>
  );
}
