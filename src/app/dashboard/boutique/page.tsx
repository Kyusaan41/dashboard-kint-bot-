'use client';

import { useState, useEffect } from 'react';
import { getShopItems, buyItem } from '@/utils/api';
import Image from 'next/image';

// Définir un type pour l'item
type ShopItem = {
    id: string;
    name: string;
    price: number;
    description: string;
    icon: string; // URL de l'icône
};

export default function ShopPage() {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchShopItems() {
            try {
                const data = await getShopItems();
                setItems(data);
            } catch (error) {
                console.error("Erreur lors de la récupération des items du shop:", error);
                alert("Impossible de charger le shop.");
            } finally {
                setLoading(false);
            }
        }
        fetchShopItems();
    }, []);

    const handleBuy = async (itemId: string) => {
        const confirmation = confirm("Êtes-vous sûr de vouloir acheter cet objet ?");
        if (!confirmation) return;

        try {
            await buyItem(itemId);
            alert("Achat réussi ! L'objet a été ajouté à votre inventaire.");
            // Idéalement, ici, on mettrait à jour le solde de l'utilisateur affiché quelque part.
        } catch (error) {
            console.error("Erreur lors de l'achat:", error);
            // L'API devrait retourner un message d'erreur clair
            alert(`Échec de l'achat : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    };

    if (loading) {
        return <p className="text-white p-8">Chargement du magasin...</p>;
    }

    return (
        <div className="p-8 text-white">
            <h1 className="text-4xl font-bold mb-8 text-yellow-400">Magasin</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                    <div 
                        key={item.id} // Correction: Ajout de la clé unique
                        className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col justify-between shadow-lg hover:shadow-yellow-400/20 hover:border-yellow-400 transition-all duration-300"
                    >
                        <div>
                            <div className="flex justify-center mb-4">
                                <Image 
                                    src={item.icon || '/default-icon.png'} // Utiliser une icône par défaut si aucune n'est fournie
                                    alt={`Icône de ${item.name}`}
                                    width={80}
                                    height={80}
                                    className="object-contain"
                                />
                            </div>
                            <h2 className="text-2xl font-bold text-center mb-2">{item.name}</h2>
                            <p className="text-gray-400 text-center mb-4">{item.description}</p>
                        </div>
                        <div className="text-center">
                             <p className="text-xl font-semibold text-yellow-400 mb-4">{item.price} Pièces</p>
                            <button 
                                onClick={() => handleBuy(item.id)}
                                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
                            >
                                Acheter
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}