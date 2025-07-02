'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getUsers, giveItem, giveKip, giveMoney } from '@/utils/api';
import Image from 'next/image';

type UserProfile = {
    id: string;
    username: string;
    avatar: string;
}; 

export default function AdminPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [amount, setAmount] = useState('');
    const [itemName, setItemName] = useState('');

    useEffect(() => {
        if (session && session.user.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [session, router]);

    useEffect(() => {
        async function fetchUsers() {
            if (session?.user.role === 'admin') {
                try {
                    const data = await getUsers();
                    setUsers(data);
                } catch (error) {
                    console.error("Erreur lors de la récupération des utilisateurs:", error);
                    alert("Impossible de charger la liste des utilisateurs.");
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchUsers();
    }, [session]);

    const handleAction = async (action: (userId: string, value: any) => Promise<any>, value: any, clearValue: () => void) => {
        if (!selectedUser || !value) {
            alert("Veuillez sélectionner un utilisateur et spécifier une valeur.");
            return;
        }
        try {
            await action(selectedUser.id, value);
            alert("Action réussie !");
            setSelectedUser(null);
            clearValue();
        } catch (error) {
            console.error("Erreur lors de l'action admin:", error);
            alert(`Une erreur est survenue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    };

    if (!session || session.user.role !== 'admin') {
        return <p className="text-white p-8">Vérification des permissions...</p>;
    }

    if (loading) {
        return <p className="text-white p-8">Chargement des données administrateur...</p>;
    }

    return (
        <div className="p-8 text-white">
            <h1 className="text-3xl font-bold mb-6">Panneau d'Administration</h1>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl mb-4">Liste des Utilisateurs</h2>
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {users.map((user) => (
                        <li 
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            <Image 
                                src={user.avatar} 
                                alt={`Avatar de ${user.username}`}
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                            <span className="ml-4 font-semibold">{user.username}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {selectedUser && (
                <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl mb-4">Actions pour <span className="font-bold text-yellow-400">{selectedUser.username}</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="moneyAmount" className="block">Donner de l'argent :</label>
                            <input
                                id="moneyAmount"
                                type="number"
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Montant"
                                className="w-full bg-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button onClick={() => handleAction(giveMoney, parseInt(amount), () => setAmount(''))} className="w-full bg-green-600 hover:bg-green-700 p-2 rounded-md font-bold transition-transform transform hover:scale-105">
                                Confirmer
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="kipAmount" className="block">Donner des Points KIP :</label>
                            <input
                                id="kipAmount"
                                type="number"
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Montant"
                                className="w-full bg-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button onClick={() => handleAction(giveKip, parseInt(amount), () => setAmount(''))} className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded-md font-bold transition-transform transform hover:scale-105">
                                Confirmer
                            </button>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                             <label htmlFor="itemName" className="block">Donner un objet :</label>
                            <input
                                id="itemName"
                                type="text"
                                onChange={(e) => setItemName(e.target.value)}
                                placeholder="Nom de l'objet"
                                className="w-full bg-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button onClick={() => handleAction(giveItem, itemName, () => setItemName(''))} className="w-full bg-yellow-600 hover:bg-yellow-700 p-2 rounded-md font-bold transition-transform transform hover:scale-105">
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}