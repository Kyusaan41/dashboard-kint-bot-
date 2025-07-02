'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type GuildDetails = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  // ajoute d'autres infos serveur si besoin
};

export default function GuildPage() {
  const router = useRouter();
  const pathname = usePathname();
  const guildId = pathname.split('/').pop() || '';

  const [guild, setGuild] = useState<GuildDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [prefix, setPrefix] = useState(''); // exemple paramètre à modifier

  useEffect(() => {
    async function fetchGuild() {
      setLoading(true);
      setError(null);
      try {
        // Récupérer token depuis localStorage
        const tokenData = localStorage.getItem('token');
        if (!tokenData) {
          setError('Token non trouvé');
          setLoading(false);
          return;
        }
        const token = JSON.parse(tokenData);

        const res = await fetch(`/api/guilds/${guildId}`, {
          headers: {
            Authorization: `${token.token_type} ${token.access_token}`,
          },
        });
        if (!res.ok) {
          setError('Erreur lors de la récupération du serveur');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setGuild(data);
        // Exemple: récupérer le préfixe courant du serveur
        setPrefix(data.prefix || '!');
      } catch (err) {
        setError('Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }
    fetchGuild();
  }, [guildId]);

  async function handleSavePrefix() {
    // Appel API pour sauvegarder le préfixe
    const tokenData = localStorage.getItem('token');
    if (!tokenData) return alert('Token manquant');
    const token = JSON.parse(tokenData);

    const res = await fetch(`/api/guilds/${guildId}/settings/prefix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token.token_type} ${token.access_token}`,
      },
      body: JSON.stringify({ prefix }),
    });

    if (res.ok) alert('Préfixe mis à jour !');
    else alert('Erreur lors de la mise à jour');
  }

  if (loading) return <p className="p-4 text-white">Chargement...</p>;
  if (error) return <p className="p-4 text-red-500">Erreur : {error}</p>;
  if (!guild) return <p className="p-4 text-gray-400">Serveur introuvable</p>;

  return (
    <div className="min-h-screen bg-[#0b0d13] text-white p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 flex items-center space-x-4">
        {guild.icon ? (
          <img
            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
            alt={guild.name}
            className="w-16 h-16 rounded"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-600 rounded" />
        )}
        <span>{guild.name}</span>
      </h1>

      <section className="bg-[#12151d] p-6 rounded-2xl shadow-xl max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">Paramètres du serveur</h2>

        <div className="mb-4">
          <label htmlFor="prefix" className="block mb-2 text-gray-400">
            Préfixe du bot
          </label>
          <input
            id="prefix"
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="w-full rounded bg-gray-700 p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <button
          onClick={handleSavePrefix}
          className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded font-semibold"
        >
          Enregistrer
        </button>
      </section>
    </div>
  );
}
