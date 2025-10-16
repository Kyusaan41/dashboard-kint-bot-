'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCollection, AnimeCollection } from '@/types/collection';
import { ANIME_CARDS, AnimeCard, RARITY_COLORS } from '../cards';
import { getCharacterImage } from '../jikanService';

export default function CollectionPage() {
    const [collection, setCollection] = useState<UserCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAnime, setSelectedAnime] = useState<string>('all');
    const [cardImages, setCardImages] = useState<{ [key: string]: string }>({});

    // Simuler un userId (dans un vrai cas, ça viendrait de l'authentification)
    const userId = '123456789'; // Remplacer par le vrai userId Discord

    useEffect(() => {
        loadCollection();
    }, []);

    const loadCollection = async () => {
        try {
            const response = await fetch(`/api/gacha/collection?userId=${userId}`);
            const data = await response.json();
            if (data.success) {
                setCollection(data.data);
                // Charger les images des cartes
                await loadCardImages(data.data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la collection:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCardImages = async (userCollection: UserCollection) => {
        const images: { [key: string]: string } = {};
        for (const animeCollection of userCollection.collections) {
            for (const cardInCollection of animeCollection.cards) {
                const card = ANIME_CARDS.find(c => c.id === cardInCollection.cardId);
                if (card && card.malId) {
                    try {
                        const imageUrl = await getCharacterImage(card.malId);
                        images[card.id] = imageUrl;
                    } catch (error) {
                        console.error(`Erreur chargement image ${card.name}:`, error);
                    }
                }
            }
        }
        setCardImages(images);
    };

    const getAnimeList = (): string[] => {
        if (!collection) return [];
        return collection.collections.map(c => c.anime);
    };

    const getFilteredCollections = (): AnimeCollection[] => {
        if (!collection) return [];
        if (selectedAnime === 'all') return collection.collections;
        return collection.collections.filter(c => c.anime === selectedAnime);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-2xl">Chargement de votre collection...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        📚 Ma Collection
                    </h1>
                    <div className="flex justify-center gap-8 text-white">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                            <div className="text-2xl font-bold">{collection?.totalCards || 0}</div>
                            <div className="text-sm opacity-80">Cartes Total</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                            <div className="text-2xl font-bold">{collection?.uniqueCards || 0}</div>
                            <div className="text-sm opacity-80">Cartes Uniques</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                            <div className="text-2xl font-bold">{getAnimeList().length}</div>
                            <div className="text-sm opacity-80">Animes</div>
                        </div>
                    </div>
                </div>

                {/* Filtres */}
                <div className="mb-6 flex gap-2 flex-wrap justify-center">
                    <button
                        onClick={() => setSelectedAnime('all')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            selectedAnime === 'all'
                                ? 'bg-white text-purple-900'
                                : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                    >
                        Tous les animes
                    </button>
                    {getAnimeList().map(anime => (
                        <button
                            key={anime}
                            onClick={() => setSelectedAnime(anime)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                selectedAnime === anime
                                    ? 'bg-white text-purple-900'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                        >
                            {anime}
                        </button>
                    ))}
                </div>

                {/* Collections par anime */}
                {getFilteredCollections().length === 0 ? (
                    <div className="text-center text-white text-xl mt-12">
                        Aucune carte dans votre collection. Commencez à tirer des cartes ! 🎴
                    </div>
                ) : (
                    <div className="space-y-8">
                        {getFilteredCollections().map(animeCollection => (
                            <div key={animeCollection.anime} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <h2 className="text-3xl font-bold text-white mb-4">
                                    {animeCollection.anime}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {animeCollection.cards.map(cardInCollection => {
                                        const card = ANIME_CARDS.find(c => c.id === cardInCollection.cardId);
                                        if (!card) return null;

                                        const rarityColors = RARITY_COLORS[card.rarity];
                                        const imageUrl = cardImages[card.id];

                                        return (
                                            <motion.div
                                                key={card.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`relative bg-gradient-to-br ${rarityColors.bg} rounded-xl p-4 border-2 ${rarityColors.border} shadow-lg ${rarityColors.glow}`}
                                            >
                                                {/* Compteur de doublons */}
                                                {cardInCollection.count > 1 && (
                                                    <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full font-bold text-sm z-10">
                                                        x{cardInCollection.count}
                                                    </div>
                                                )}

                                                {/* Image */}
                                                <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden bg-black/30">
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={card.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-white/50">
                                                            Chargement...
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="text-white">
                                                    <h3 className="font-bold text-lg mb-1">{card.name}</h3>
                                                    <p className={`text-sm ${rarityColors.text} font-semibold mb-2`}>
                                                        {card.rarity}
                                                    </p>
                                                    <p className="text-xs opacity-80 mb-2">{card.description}</p>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm">⚡ {card.power}</span>
                                                        <span className="text-xs opacity-60">
                                                            {new Date(cardInCollection.obtainedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Bouton retour */}
                <div className="mt-8 text-center">
                    <a
                        href="/dashboard/mini-jeu/gacha"
                        className="inline-block bg-white text-purple-900 px-8 py-3 rounded-lg font-bold hover:bg-purple-100 transition-colors"
                    >
                        ← Retour au Gacha
                    </a>
                </div>
            </div>
        </div>
    );
}