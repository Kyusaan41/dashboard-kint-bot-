'use client';

import React, { useEffect, useState } from 'react';

interface TitreSelectorProps {
  userId: string;
}

export default function TitreSelector({ userId }: TitreSelectorProps) {
  const [titres, setTitres] = useState<string[]>([]);
  const [titreActuel, setTitreActuel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTitres, setShowTitres] = useState(false);  // état pour afficher/cacher la liste

  useEffect(() => {
    if (!userId) return;

    async function fetchTitres() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/titres/${userId}`);
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Erreur lors du chargement des titres: ${errorText}`);
        }
        const data = await res.json();
        setTitres(data.titresPossedes ?? []);
        setTitreActuel(data.titreActuel ?? null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchTitres();
  }, [userId]);

  async function handleChangeTitre(newTitre: string) {
    try {
      const res = await fetch(`/api/titres/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nouveauTitre: newTitre }),
      });
      if (!res.ok) throw new Error('Erreur lors du changement de titre');
      const data = await res.json();
      setTitreActuel(data.titreActuel ?? newTitre);
      setShowTitres(false);  // on peut cacher la liste après le changement
    } catch (err) {
      alert((err as Error).message);
    }
  }

  if (loading) return <p>Chargement des titres...</p>;
  if (error) return <p>Erreur: {error}</p>;

  return (
    <div className="text-center">
      <h3 className="mb-2 font-semibold text-white">Titre actuel: {titreActuel ?? 'Aucun'}</h3>

      <button
        onClick={() => setShowTitres(!showTitres)}
         className="mb-4 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
      >
        {showTitres ? '👀 Cacher les titres' : '🎨 Changer le titre'}
      </button>

      {showTitres && (
        <div className="flex justify-center gap-4 flex-wrap">
          {titres.map((titre) => (
            <button
              key={titre}
              onClick={() => handleChangeTitre(titre)}
              disabled={titre === titreActuel}
              className={`px-3 py-1 rounded ${
                titre === titreActuel ? 'bg-green-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'
              } text-white`}
            >
              {titre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
