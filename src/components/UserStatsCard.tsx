// components/UserStatsCard.tsx
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function UserStatsCard() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;

    fetch("/api/stats/me", {
      headers: {
        "x-user-id": userId,
      },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Erreur stats:", err));
  }, [userId]);

  if (!stats || !session?.user) return <p>Chargement...</p>;

  return (
    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl shadow">
      <img
        src={session.user.image || "/default-avatar.png"} // met un fallback si pas dâ€™image
        alt="avatar"
        className="rounded-full w-16 h-16 border border-white/20"
      />
      <div>
        <p className="text-lg font-semibold">{session.user.name}</p>
        <p className="text-sm text-gray-300">XP : {stats.xp}</p>
        <p className="text-sm text-gray-300">Level : {stats.level}</p>
      </div>
    </div>
  );
}
