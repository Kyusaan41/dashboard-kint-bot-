'use client';

import { useEffect, useState } from "react";

type XPData = {
  userId: string;
  username: string;
  xp: number;
};

export default function XPPage() {
  const [xpData, setXpData] = useState<XPData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchXP() {
      const token = "MTMzOTY0MzEzOTQxMjk4Mzk1MA.hJflv07deCgHXz0LF6Sm0TMoSDkD9i";

      try {
        const res = await fetch("http://localhost:20579/api/xp", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);

        const data = await res.json();
        setXpData(data);
      } catch (err: any) {
        setError(err.message);
      }
    }

    fetchXP();
  }, []);

  if (error) return <p className="text-red-500 p-4">Erreur : {error}</p>;
  if (!xpData.length) return <p className="p-4">Chargement des XP...</p>;

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">XP des utilisateurs</h1>
      <table className="w-full text-left border-collapse border border-gray-700">
        <thead>
          <tr>
            <th className="border border-gray-700 px-4 py-2">Utilisateur</th>
            <th className="border border-gray-700 px-4 py-2">XP</th>
          </tr>
        </thead>
        <tbody>
          {xpData.map(({ userId, username, xp }) => (
            <tr key={userId} className="hover:bg-gray-800">
              <td className="border border-gray-700 px-4 py-2">{username}</td>
              <td className="border border-gray-700 px-4 py-2">{xp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
