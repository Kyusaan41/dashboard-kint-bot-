'use client';

import { useEffect, useState } from 'react';

// On utilise 'any' pour les props pour contourner l'erreur de build de Vercel.
export default function MemberPage(props: any) {
    // On extrait les 'params' à l'intérieur, de manière sécurisée.
    const id = props?.params?.id; 

    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        };

        const fetchUserData = async () => {
            try {
                // Mettez ici votre logique d'appel API
                console.log(`Récupération des données pour l'utilisateur : ${id}`);

                const data = {
                    id: id,
                    name: 'Utilisateur ' + id,
                    xp: 1234,
                    coins: 5678,
                };
                
                setUserData(data);

            } catch (error) {
                console.error("Erreur lors de la récupération des données de l'utilisateur:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id]);

    if (loading) {
        return <div className="text-center text-gray-400">Chargement du profil...</div>;
    }

    if (!userData) {
        return <div className="text-center text-red-500">Impossible de trouver les informations pour cet utilisateur.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-cyan-400 mb-6">Profil de {userData.name}</h1>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <p>ID: {userData.id}</p>
                <p>XP: {userData.xp}</p>
                <p>Pièces: {userData.coins}</p>
            </div>
        </div>
    );
}