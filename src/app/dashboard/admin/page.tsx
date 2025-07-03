'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// On importe la nouvelle fonction et une icône pour le rafraîchissement
import { getUsers, giveMoney, giveKip, restartBot, getBotLogs } from '@/utils/api'; 
import Image from 'next/image';
import { Power, RefreshCw } from 'lucide-react';

// Types pour les données
type UserEntry = { id: string; username: string; avatar: string; };
type LogEntry = { timestamp: string; log: string; };

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<UserEntry[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserEntry | null>(null);
    const [moneyAmount, setMoneyAmount] = useState<number | ''>('');
    const [pointsAmount, setPointsAmount] = useState<number | ''>('');
    
    // State pour les logs
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Effet pour vérifier les permissions
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [session, status, router]);

    // Effet pour charger les utilisateurs et les logs
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'admin') {
            getUsers()
                .then(setUsers)
                .catch(err => alert("Impossible de charger les utilisateurs."))
                .finally(() => setLoadingUsers(false));

            const fetchLogs = () => {
                getBotLogs()
                    // CORRECTION ICI : Accéder à data.logs avant d'appeler reverse()
                    .then(data => setLogs(data.logs.reverse())) 
                    .catch(err => console.error("Erreur de chargement des logs:", err))
                    .finally(() => setLoadingLogs(false));
            };

            fetchLogs();
            const logInterval = setInterval(fetchLogs, 5000);

            return () => clearInterval(logInterval);
        }
    }, [status, session]);
    
    // Effet pour scroller au bas des logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleStatAction = async (action: (userId: string, amount: number) => Promise<any>, amount: number | '', isRemoval: boolean = false) => {
        if (!selectedUser || amount === '') return;
        const finalAmount = isRemoval ? -Math.abs(amount) : amount;
        try {
            await action(selectedUser.id, finalAmount);
            alert(`Action réussie pour ${selectedUser.username}`);
        } catch (error) {
            alert(`Échec de l'action : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    };

    const handleRestart = async () => {
        if (!confirm("Êtes-vous sûr de vouloir redémarrer le bot ?")) return;
        try {
            const res = await restartBot();
            alert(res.message);
        } catch (error) {
            alert(`Échec du redémarrage : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    };

    if (status === 'loading') return <p className="text-center animate-pulse">Chargement...</p>;
    if (session?.user?.role !== 'admin') return <p className="text-center">Accès refusé.</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-cyan-400">Panneau d'Administration</h1>
                <button onClick={handleRestart} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105">
                    <Power className="h-5 w-5"/> Redémarrer le Bot
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="bg-[#1e2530] p-6 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4">Utilisateurs</h2>
                        {loadingUsers ? <p>Chargement...</p> : (
                            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                                {users.map((user) => (
                                    <div key={user.id} onClick={() => setSelectedUser(user)} className={`flex items-center p-2 rounded-md cursor-pointer ${selectedUser?.id === user.id ? 'bg-cyan-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
                                        <Image src={user.avatar || '/default-avatar.png'} alt={user.username} width={40} height={40} className="rounded-full" />
                                        <span className="ml-3">{user.username}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {selectedUser && (
                        <div className="bg-[#1e2530] p-6 rounded-lg border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4">Actions pour : <span className="text-cyan-400">{selectedUser.username}</span></h2>
                            <div className="space-y-6 pt-2">
                                <div>
                                    <label className="block mb-2 font-medium">Gérer l'Argent</label>
                                    <div className="flex gap-2"><input type="number" placeholder="Montant..." value={moneyAmount} onChange={e => setMoneyAmount(Number(e.target.value))} className="w-full bg-gray-800 p-2 rounded-md" /><button onClick={() => handleStatAction(giveMoney, moneyAmount)} className="px-4 bg-green-600 rounded-md font-semibold hover:bg-green-700">Ajouter</button><button onClick={() => handleStatAction(giveMoney, moneyAmount, true)} className="px-4 bg-red-600 rounded-md font-semibold hover:bg-red-700">Enlever</button></div>
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium">Gérer les Points KIP</label>
                                    <div className="flex gap-2"><input type="number" placeholder="Montant..." value={pointsAmount} onChange={e => setPointsAmount(Number(e.target.value))} className="w-full bg-gray-800 p-2 rounded-md" /><button onClick={() => handleStatAction(giveKip, pointsAmount)} className="px-4 bg-green-600 rounded-md font-semibold hover:bg-green-700">Ajouter</button><button onClick={() => handleStatAction(giveKip, pointsAmount, true)} className="px-4 bg-red-600 rounded-md font-semibold hover:bg-red-700">Enlever</button></div>
                                                            </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-[#12151d] p-6 rounded-lg border border-gray-700 flex flex-col">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <RefreshCw className={`h-5 w-5 mr-2 ${loadingLogs ? 'animate-spin' : ''}`} /> Logs du Bot
                    </h2>
                    {loadingLogs ? <p>Chargement des logs...</p> : (
                        <div className="flex-1 bg-black/50 p-4 rounded-md overflow-y-auto font-mono text-xs text-gray-300 h-96">
                            {logs.length > 0 ? logs.map((log, index) => (
                                <p key={index} className="whitespace-pre-wrap break-all">
                                    <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString('fr-FR')}</span>
                                    <span className="ml-2">{log.log}</span>
                                </p>
                            )) : <p>Aucun log à afficher.</p>}
                            <div ref={logsEndRef} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Le fichier `app/api/logs/route.ts` ne change pas car le problème était côté client.
// Cependant, pour la complétude, je le réinclus ici :

// app/api/logs/route.ts
// import { NextResponse } from 'next/server';

// export async function GET() {
//   try {
//     // L'URL de ton bot hébergé sur Katabump
//     const response = await fetch('http://51.83.103.24:20077/api/logs');

//     if (!response.ok) {
//       return NextResponse.json(
//         { error: 'Erreur côté bot lors de la récupération des logs' },
//         { status: 500 }
//       );
//     }

//     const data = await response.json();
//     return NextResponse.json({ logs: data.logs || [] });
//   } catch (error) {
//     console.error('Erreur dans l\'API logs (route.ts) :', error);
//     return NextResponse.json(
//       { error: 'Impossible de récupérer les logs du bot.' },
//       { status: 500 }
//     );
//   }
// }