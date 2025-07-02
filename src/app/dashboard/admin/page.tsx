'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getUsers, giveItem, giveKip, giveMoney } from '@/utils/api';
import Image from 'next/image';

// On définit un type pour les utilisateurs listés
type UserEntry = {
    id: string;
    username: string;
    avatar: string;
};

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<UserEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserEntry | null>(null);
    const [amount, setAmount] = useState('');
    const [itemName, setItemName] = useState('');

    // Effet pour vérifier les permissions de l'administrateur
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/dashboard'); // Redirige si l'utilisateur n'est pas admin
        }
    }, [session, status, router]);

    // Effet pour charger la liste des utilisateurs
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsers();
                setUsers(data);
            } catch (error) {
                console.error("Erreur lors du chargement des utilisateurs:", error);
                alert("Impossible de charger la liste des utilisateurs. Vérifiez les logs de Vercel.");
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.role === 'admin') {
            fetchUsers();
        }
    }, [session]);

    // Gère l'exécution des actions admin
    const handleAction = async (action: (userId: string, value: any) => Promise<any>, value: any) => {
        if (!selectedUser || !value) {
            alert("Veuillez sélectionner un utilisateur et spécifier une valeur.");
            return;
        }
        try {
            await action(selectedUser.id, value);
            alert("Action réussie !");
            setSelectedUser(null);
            setAmount('');
            setItemName('');
        } catch (error) {
            console.error("Erreur lors de l'action admin:", error);
            alert(`Une erreur est survenue : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    };

    if (status === 'loading' || !session) {
        return <p className="text-center text-gray-400 animate-pulse">Vérification des permissions...</p>;
    }

    return (
        <div className="p-4 sm:p-8 text-white">
            <h1 className="text-3xl font-bold mb-6">Panneau d'Administration</h1>
            
            <div className="bg-[#12151d] border border-gray-700 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl mb-4">Sélectionner un utilisateur</h2>
                {loading ? <p>Chargement de la liste...</p> : (
                    <ul className="space-y-2 max-h-80 overflow-y-auto">
                        {users.map((user) => (
                            <li 
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-cyan-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                <Image 
                                    src={user.avatar || '/default-avatar.png'} 
                                    alt={`Avatar de ${user.username}`}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                                <span className="ml-4 font-semibold">{user.username}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {selectedUser && (
                <div className="mt-6 bg-[#12151d] border border-gray-700 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl mb-4">Actions pour <span className="font-bold text-cyan-400">{selectedUser.username}</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="moneyAmount" className="block">Donner de l'argent :</label>
                            <input id="moneyAmount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant" className="w-full bg-gray-700 p-2 rounded-md"/>
                            <button onClick={() => handleAction(giveMoney, parseInt(amount))} className="w-full bg-green-600 hover:bg-green-700 p-2 rounded-md font-bold">Confirmer</button>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="kipAmount" className="block">Donner des Points KIP :</label>
                            <input id="kipAmount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant" className="w-full bg-gray-700 p-2 rounded-md"/>
                            <button onClick={() => handleAction(giveKip, parseInt(amount))} className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded-md font-bold">Confirmer</button>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                             <label htmlFor="itemName" className="block">Donner un objet :</label>
                            <input id="itemName" type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Nom de l'objet" className="w-full bg-gray-700 p-2 rounded-md"/>
                            <button onClick={() => handleAction(giveItem, itemName)} className="w-full bg-yellow-600 hover:bg-yellow-700 p-2 rounded-md font-bold">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}