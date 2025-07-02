'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getUsers, giveItem, giveKip, giveMoney } from '@/utils/api';
import Image from 'next/image';

// Type pour les utilisateurs listés
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
            router.push('/dashboard');
        }
    }, [session, status, router]);

    // Effet pour charger la liste des utilisateurs si l'utilisateur est admin
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const data = await getUsers();
                setUsers(data);
            } catch (error) {
                console.error("Erreur lors du chargement des utilisateurs:", error);
                // C'est l'alerte que vous aviez vue
                alert("Impossible de charger la liste des utilisateurs. L'API du bot est peut-être inaccessible ou une erreur est survenue.");
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated' && session?.user?.role === 'admin') {
            fetchUsers();
        }
    }, [status, session]);

    // Fonction pour gérer les actions
    const handleAction = async (action: (userId: string, value: any) => Promise<any>, value: any, isItem: boolean = false) => {
        if (!selectedUser) {
            alert("Veuillez d'abord sélectionner un utilisateur.");
            return;
        }
        if (!value) {
            alert("Veuillez spécifier une valeur (montant ou nom de l'objet).");
            return;
        }
        
        try {
            await action(selectedUser.id, value);
            alert(`Action réussie !`);
            // Réinitialiser les champs après l'action
            if (isItem) {
                setItemName('');
            } else {
                setAmount('');
            }
            setSelectedUser(null);
        } catch (error) {
            console.error("Erreur lors de l'action admin:", error);
            alert(`Une erreur est survenue : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    };

    if (status === 'loading' || (status === 'authenticated' && session.user.role !== 'admin')) {
        return <p className="text-center text-gray-400 animate-pulse">Vérification des accès...</p>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-cyan-400">Panneau d'Administration</h1>
            
            {/* Colonne de gauche : Liste des utilisateurs */}
            <div className="bg-[#12151d] p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Liste des Utilisateurs</h2>
                {loading ? (
                    <p className="text-gray-400">Chargement...</p>
                ) : (
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedUser?.id === user.id ? 'bg-cyan-600 ring-2 ring-cyan-400' : 'bg-gray-800 hover:bg-gray-700'}`}
                            >
                                <Image 
                                    src={user.avatar || '/default-avatar.png'}
                                    alt={user.username}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                                <span className="ml-4">{user.username}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Colonne de droite : Actions */}
            {selectedUser && (
                 <div className="bg-[#12151d] p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4">Actions pour : <span className="text-cyan-400">{selectedUser.username}</span></h2>
                    <div className="grid grid-cols-1 gap-6">
                        {/* Donner Argent & Points */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant..." className="flex-grow bg-gray-800 p-2 rounded-md"/>
                            <button onClick={() => handleAction(giveMoney, parseInt(amount))} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Donner Argent</button>
                            <button onClick={() => handleAction(giveKip, parseInt(amount))} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Donner Points</button>
                        </div>
                        {/* Donner Objet */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Nom de l'objet..." className="flex-grow bg-gray-800 p-2 rounded-md"/>
                            <button onClick={() => handleAction(giveItem, itemName, true)} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Donner Objet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}