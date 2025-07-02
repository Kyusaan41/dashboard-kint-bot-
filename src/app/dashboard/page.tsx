'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import TitreSelector from '@/components/TitreSelector';

type ServerInfo = {
  guildIcon?: string | null;
  guildName?: string;
  guildId?: string;
};

type User = {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
};

interface UserStats {
  xp: number;
  level: number;
  coins: number;
  points: number;
  xpRank: number;
  coinsRank: number;
  kintsRank: number;
}

type PatchnoteType = {
  title: string;
  description: string;
  ajouts: string[];
  corrections: string[];
  suppressions: string[];
  systeme: string[];
  ajustements: string[];
  footer: string;
};


export default function DashboardPage() {
  const { data: session, status } = useSession();
  console.log('Session data:', session);

  const [user, setUser] = useState<User | null>(null);
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [userSuccesses, setUserSuccesses] = useState<string[]>([]);
  const [userMessagesLast7Days, setUserMessagesLast7Days] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  const barData = userMessagesLast7Days.map((count, idx) => ({
    day: `Jour ${idx + 1}`,
    messages: count,
  }));

  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    coins: 0,
    points: 0,
    xpRank: 0,
    coinsRank: 0,
    kintsRank: 0,
  });


  useEffect(() => {
  if (!user) return;

  fetch(`/api/success/${user.id}`)
    .then(res => {
      if (!res.ok) throw new Error('Erreur fetch succès');
      return res.json();
    })
    .then(data => setUserSuccesses(data.succes || [])) // ou data.successes selon ce que tu choisis
    .catch(console.error);
}, [user]);

  useEffect(() => {
    if (session?.user) {
      // session.user.name contient username#discriminator
      const splitName = session.user.name?.split('#') || ['User', '0000'];
      const username = splitName[0];
      const discriminator = splitName[1] ?? '0000';
      const avatar = (session.user as any).avatar || null;

      const userData: User = {
        id: session.user.id as string,
        username,
        discriminator,
        avatar,
      };
      setUser(userData);

      fetch('/api/stats/me', {
        headers: { 'x-user-id': userData.id }
      })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.text();
          console.error('Erreur API stats:', err);
          return;
        }
        const data = await res.json();
        setStats(data);
      })
      .catch(console.error);

      // Fetch messages envoyés sur 7 jours
      fetch(`/api/messages/${userData.id}`)
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.text();
            console.error('Erreur API messages:', err);
            return;
          }
          const data = await res.json();
          setUserMessagesLast7Days(data.messagesLast7Days);
        })
        .catch(console.error);
    }
  }, [session]);

const [titresPossedes, setTitresPossedes] = useState<string[]>([]);
const [titreActuel, setTitreActuel] = useState<string | null>(null);

useEffect(() => {
  if (!user) return;

  fetch(`/api/titres/${user.id}`)
    .then(res => {
      if (!res.ok) throw new Error('Erreur fetch titres');
      return res.json();
    })
    .then(data => {
      setTitresPossedes(data.titresPossedes ?? []);
      setTitreActuel(data.titreActuel ?? null);
    })
    .catch(err => console.error('Erreur récupération titres:', err));
}, [user]);

  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [rewardCooldown, setRewardCooldown] = useState<number | null>(null);

  async function claimDailyReward() {
  if (!user) return;

  try {
    const res = await fetch(`/api/recompense/${user.id}`, { method: 'POST' });

    // Si la réponse n'est pas ok, on récupère le texte brut (souvent une erreur HTML ou message d'erreur)
    if (!res.ok) {
      const text = await res.text();
      console.error('Erreur API:', text);

      // Essaye de parser un message JSON si possible (exemple)
      try {
        const data = JSON.parse(text);
        if (res.status === 429 && data.timeLeft) {
          setRewardCooldown(data.timeLeft);
        }
        alert(data.message || 'Erreur lors de la récupération de la récompense.');
      } catch {
        alert('Erreur lors de la récupération de la récompense.');
      }
      return;
    }

    // Si tout va bien, on parse le JSON normalement
    const data = await res.json();

    // Mise à jour de l'état local des stats et cooldown
    setStats((prev) => ({ ...prev, coins: prev.coins + 500 }));
    setRewardClaimed(true);
    alert(data.message);
  } catch (err) {
    console.error('Erreur fetch:', err);
    alert('Une erreur réseau ou serveur est survenue.');
  }
}


useEffect(() => {
  if (!user) return;

  // Exemple : appel à une route pour savoir si récompense dispo
  fetch(`/api/recompense/${user.id}`)
    .then(async (res) => {
      if (!res.ok) return;

      const data = await res.json();

      if (data.canClaim === false && data.retryIn) {
        setRewardCooldown(data.retryIn);
        setRewardClaimed(false);
      } else if (data.canClaim === true) {
        setRewardClaimed(false);
        setRewardCooldown(null);
      }
    })
    .catch(console.error);
}, [user]);



  const [patchnote, setPatchnote] = useState<PatchnoteType | null>(null);

  useEffect(() => {
    fetch('http://51.83.103.24:20077/api/patchnote') // URL corrigée ici
      .then(res => {
        if (!res.ok) throw new Error('Erreur fetch patchnote');
        return res.json();
      })
      .then(data => setPatchnote(data))
      .catch(err => console.error('Erreur de chargement du patchnote:', err));
  }, []);

  if (status === 'loading') return <p>Chargement...</p>;
  if (!session) return <p>Non connecté.</p>;

  // Gestion avatar Discord avec gif pour avatar animé + fallback dynamique
  const avatarUrl = session.user.image ?? `https://cdn.discordapp.com/embed/avatars/${parseInt(session.user.id) % 5}.png`;

  console.log('Avatar URL:', avatarUrl);

  

  return (
    <div className="flex min-h-screen bg-[#0b0d13] text-white">

      {/* Main content */}
      <main className="flex-1 p-10 max-w-7xl mx-auto overflow-auto">
          <>
            <h1 className="text-3xl font-bold mb-6 flex items-center space-x-4">
           {serverInfo?.guildIcon && serverInfo.guildId ? (
  <img
    src={`https://cdn.discordapp.com/icons/950136485867307088/150fa2c886cd2c0952bc77743016ef99.png?size=128`}
    alt={serverInfo.guildName || 'Serveur'}
    className="w-10 h-10 rounded-full"
    
              />
           ) : (
  <img
    src="https://cdn.discordapp.com/icons/950136485867307088/150fa2c886cd2c0952bc77743016ef99.png?size=128"
    alt="Icône par défaut"
    className="w-10 h-10 rounded-full"
  />
)}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              Bienvenue sur {serverInfo?.guildName || 'KTS'}
            </span>
          </h1>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Carte utilisateur */}
              <div className="relative bg-gradient-to-br from-[#1f1f2e] to-[#151522] p-6 rounded-2xl shadow-lg w-full flex flex-col items-center">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full border border-white/20"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://cdn.discordapp.com/embed/avatars/${parseInt(user?.discriminator ?? '0') % 5}.png`;
                    }}
                  />
                  <div>
                    <div className="text-sm text-purple-400 font-semibold">👑 Administrateur</div>
                    <h2 className="text-xl font-bold text-white">
                      {user?.username}#{user?.discriminator}
                    </h2>
                  </div>
                </div>
                <div className="space-y-4 text-white text-lg text-center">
                  <p>
                    🪙 <strong className="text-2xl">{stats.coinsRank}ᵉ</strong> plus riche avec{' '}
                    <span className="text-yellow-300 font-semibold text-2xl">{stats.coins} pièces</span>
                  </p>
                  <p>
                    🧠 <strong className="text-2xl">{stats.kintsRank}ᵉ</strong> en KINTS avec{' '}
                    <span className="text-blue-400 font-semibold text-2xl">{stats.points} points</span>
                  </p>
                  <p>
                    📚 <strong className="text-2xl">{stats.xpRank}ᵉ</strong> en XP avec{' '}
                    <span className="text-green-400 font-semibold text-2xl">{stats.xp} XP</span>
                  </p>
                </div>
                <div className="mt-6 w-full">
                  {/* Remplacement du bouton par ton composant TitreSelector */}
                  <TitreSelector userId={user?.id ?? ''} />
                </div>
              </div>

              {/* Graphique messages */}
              <div className="bg-[#12151d] p-6 rounded-2xl shadow-lg w-full">
                <h2 className="text-xl font-semibold mb-4">📊 Messages envoyés sur 7 jours</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <XAxis dataKey="day" stroke="#ccc" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="messages" fill="#00C49F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Récompense quotidienne */}
            <div className="bg-[#12151d] p-6 rounded-2xl shadow-lg mt-10 text-center">
            <h2 className="text-xl font-semibold mb-2">🎁 Récompense quotidienne</h2>
            <p className="mb-4">Connecte-toi chaque jour pour obtenir un bonus !</p>

            {rewardClaimed ? (
              <p className="text-green-400 font-semibold">Récompense réclamée ! Reviens demain 🌞</p>
            ) : rewardCooldown ? (
              <p className="text-yellow-400 font-semibold">
                Déjà réclamé ! Reviens dans {Math.floor(rewardCooldown / 1000)} secondes
              </p>
            ) : (
              <button
                onClick={claimDailyReward}
                className="px-5 py-2 bg-green-600 rounded hover:bg-green-700 transition"
              >
                Réclamer ma récompense du jour
              </button>
            )}
          </div>

            {/* Patchnote / actu serveur */}
            {patchnote && (
              <div className="bg-[#12151d] p-6 rounded-2xl shadow-lg mt-10">
                <h2 className="text-xl font-semibold mb-2">📢 {patchnote.title}</h2>
                <p className="mb-4">{patchnote.description}</p>

                {patchnote.ajouts.length > 0 && (
                  <>
                    <h3 className="font-semibold text-cyan-400 mb-1">Ajouts</h3>
                    <ul className="list-disc list-inside mb-4">
                      {patchnote.ajouts.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}

                {patchnote.corrections.length > 0 && (
                  <>
                    <h3 className="font-semibold text-green-400 mb-1">Corrections</h3>
                    <ul className="list-disc list-inside mb-4">
                      {patchnote.corrections.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}

                {patchnote.suppressions.length > 0 && (
                  <>
                    <h3 className="font-semibold text-red-400 mb-1">Suppressions</h3>
                    <ul className="list-disc list-inside mb-4">
                      {patchnote.suppressions.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}

                {patchnote.systeme.length > 0 && (
                  <>
                    <h3 className="font-semibold text-yellow-400 mb-1">Système</h3>
                    <ul className="list-disc list-inside mb-4 whitespace-pre-line">
                      {patchnote.systeme.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}

                {patchnote.ajustements.length > 0 && (
                  <>
                    <h3 className="font-semibold text-blue-400 mb-1">Ajustements</h3>
                    <ul className="list-disc list-inside mb-4">
                      {patchnote.ajustements.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}

                <p className="mt-6 text-gray-400 text-sm">{patchnote.footer}</p>
              </div>
            )}

          

            {/* Succès débloqués */}
            <div className="bg-[#12151d] p-6 rounded-2xl shadow-lg mt-10">
          <h2 className="text-xl font-semibold mb-4">🎖 Succès débloqués</h2>
          <div className="flex gap-4 flex-wrap">
            {userSuccesses.length === 0 ? (
              <p className="text-gray-400">Aucun succès débloqué pour le moment.</p>
            ) : (
              userSuccesses.map((success, i) => (
                <div key={i} className="bg-[#1d1f2b] px-4 py-2 rounded shadow border border-cyan-700 text-sm">
                  {success}
                </div>
              ))
            )}
          </div>
        </div>
          </>
        

      </main>
    </div>
  );
}
