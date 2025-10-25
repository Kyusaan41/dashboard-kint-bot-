"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Loader, BookOpen, Star, Layers, Hash, Filter, ChevronDown } from 'lucide-react';
import { CardImage } from '../CardImage';
import { AnimeCard } from '../cards';

// --- TYPES ---
interface CollectedCard {
    cardId: string;
    count: number;
    cardInfo: AnimeCard;
}

interface AnimeCollection {
    anime: string;
    cards: CollectedCard[];
}

interface UserCollection {
    userId: string;
    username: string;
    collections: AnimeCollection[];
    totalCards: number;
    uniqueCards: number;
}

const RARITY_STYLES: { [key: string]: string } = {
    'Commun': 'border-gray-500 bg-gray-800/50 shadow-gray-500/10',
    'Rare': 'border-green-500 bg-green-800/50 shadow-green-500/30',
    'Épique': 'border-blue-500 bg-blue-800/50 shadow-blue-500/40',
    'Légendaire': 'border-purple-500 bg-purple-800/50 shadow-purple-500/50',
    'Mythique': 'border-yellow-500 bg-yellow-800/50 shadow-yellow-500/60',
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number | string }) => (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4">
        <div className="bg-purple-500/20 text-purple-300 p-3 rounded-lg">{icon}</div>
        <div>
            <div className="text-sm text-gray-400">{label}</div>
            <div className="text-xl font-bold text-white">{value}</div>
        </div>
    </div>
);

export default function CollectionPage() {
    const { data: session } = useSession();
    const [collection, setCollection] = useState<UserCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ✨ NOUVEAU: États pour le filtrage et le tri
    const [rarityFilter, setRarityFilter] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<string>('rarity_desc');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

    useEffect(() => {
        if (session?.user?.id) {
            const fetchCollection = async () => {
                try {
                    setLoading(true);
                    const response = await fetch('/api/gacha/collection');
                    if (!response.ok) {
                        throw new Error("Impossible de charger la collection.");
                    }
                    const data = await response.json();
                    if (data.success) {
                        setCollection(data.data);
                    } else {
                        throw new Error(data.error || "Une erreur est survenue.");
                    }
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchCollection();
        }
    }, [session]);

    // ✨ NOUVEAU: Logique de filtrage et de tri avec useMemo pour la performance
    const filteredAndSortedCollections = useMemo(() => {
        if (!collection) return [];

        const rarityOrder: { [key: string]: number } = { 'Mythique': 5, 'Légendaire': 4, 'Épique': 3, 'Rare': 2, 'Commun': 1 };

        return collection.collections
            .map(animeCollection => {
                let cards = [...animeCollection.cards];

                // 1. Filtrage par rareté
                if (rarityFilter !== 'all') {
                    cards = cards.filter(c => c.cardInfo && c.cardInfo.rarity === rarityFilter);
                }

                // 2. Tri
                cards.sort((a, b) => {
                    if (!a.cardInfo || !b.cardInfo) return 0;
                    switch (sortOrder) {
                        case 'rarity_asc':
                            return (rarityOrder[a.cardInfo.rarity] || 0) - (rarityOrder[b.cardInfo.rarity] || 0);
                        case 'power_desc':
                            return b.cardInfo.power - a.cardInfo.power;
                        case 'power_asc':
                            return a.cardInfo.power - b.cardInfo.power;
                        case 'name_asc':
                            return a.cardInfo.name.localeCompare(b.cardInfo.name);
                        case 'name_desc':
                            return b.cardInfo.name.localeCompare(a.cardInfo.name);
                        case 'rarity_desc':
                        default:
                            return (rarityOrder[b.cardInfo.rarity] || 0) - (rarityOrder[a.cardInfo.rarity] || 0);
                    }
                });
                return { ...animeCollection, cards };
            }).filter(ac => ac.cards.length > 0); // Ne pas afficher les animes sans cartes après filtrage
    }, [collection, rarityFilter, sortOrder]);

    if (loading) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                <Loader className="w-12 h-12 animate-spin text-purple-400 mb-4" />
                <p className="text-lg">Chargement de votre collection...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                <p className="text-lg text-red-400">{error}</p>
                <Link href="/dashboard/mini-jeu/gacha" className="mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                    Retour au Gacha
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-purple-400" />
                        Ma Collection
                    </h1>
                    <Link href="/dashboard/mini-jeu/gacha" className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                        <ArrowLeft size={16} />
                        Retour
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <StatCard icon={<Hash size={24} />} label="Cartes Uniques" value={collection?.uniqueCards || 0} />
                    <StatCard icon={<Layers size={24} />} label="Total (avec doublons)" value={collection?.totalCards || 0} />
                    <StatCard icon={<Star size={24} />} label="Animes Complétés" value={"0 / 9"} />
                </div>

                {/* ✨ NOUVEAU: Barre de filtres et de tri */}
                <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter size={16} className="text-gray-400" />
                        <span className="font-semibold mr-2">Filtrer par rareté:</span>
                        {['all', 'Commun', 'Rare', 'Épique', 'Légendaire', 'Mythique'].map(rarity => (
                            <button
                                key={rarity}
                                onClick={() => setRarityFilter(rarity)}
                                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                                    rarityFilter === rarity
                                        ? `text-black ${rarity === 'all' ? 'bg-white' : `bg-gradient-to-r ${Object.values(RARITY_STYLES[rarity] || {})[0] || 'from-gray-400 to-gray-600'}`}`
                                        : 'bg-black/30 text-white/70 hover:bg-white/20'
                                }`}
                            >
                                {rarity === 'all' ? 'Tout' : rarity}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors">
                            Trier par
                            <ChevronDown size={16} className={`transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isSortDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-white/20 rounded-lg shadow-lg z-10">
                                <a onClick={() => { setSortOrder('rarity_desc'); setIsSortDropdownOpen(false); }} className="block px-4 py-2 text-sm hover:bg-purple-600/50 cursor-pointer">Rareté (décroissant)</a>
                                <a onClick={() => { setSortOrder('rarity_asc'); setIsSortDropdownOpen(false); }} className="block px-4 py-2 text-sm hover:bg-purple-600/50 cursor-pointer">Rareté (croissant)</a>
                                <a onClick={() => { setSortOrder('power_desc'); setIsSortDropdownOpen(false); }} className="block px-4 py-2 text-sm hover:bg-purple-600/50 cursor-pointer">Puissance (décroissant)</a>
                                <a onClick={() => { setSortOrder('power_asc'); setIsSortDropdownOpen(false); }} className="block px-4 py-2 text-sm hover:bg-purple-600/50 cursor-pointer">Puissance (croissant)</a>
                                <a onClick={() => { setSortOrder('name_asc'); setIsSortDropdownOpen(false); }} className="block px-4 py-2 text-sm hover:bg-purple-600/50 cursor-pointer">Nom (A-Z)</a>
                                <a onClick={() => { setSortOrder('name_desc'); setIsSortDropdownOpen(false); }} className="block px-4 py-2 text-sm hover:bg-purple-600/50 cursor-pointer">Nom (Z-A)</a>
                            </div>
                        )}
                    </div>
                </div>

                {filteredAndSortedCollections && filteredAndSortedCollections.length > 0 ? (
                    <div className="space-y-10">
                        {filteredAndSortedCollections.map((animeCollection) => (
                            <div key={animeCollection.anime}>
                                <h2 className="text-2xl font-semibold border-b-2 border-purple-500/50 pb-2 mb-6">
                                    {animeCollection.anime}
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {animeCollection.cards.map(({ cardId, count, cardInfo }) => (
                                        cardInfo && ( // S'assurer que cardInfo existe
                                        <motion.div
                                            key={cardId}
                                            layout
                                            className={`relative rounded-xl border-2 overflow-hidden flex flex-col h-64 ${RARITY_STYLES[cardInfo.rarity] || RARITY_STYLES['Commun']}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                            whileHover={{ y: -5, scale: 1.03, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                        > 
                                            <div className="flex-grow">
                                                <CardImage card={cardInfo} className="object-cover" />
                                            </div>
                                            <div className="p-2 bg-black/40 backdrop-blur-sm">
                                                <p className="font-bold text-sm truncate text-white">{cardInfo.name}</p>
                                                <p className="text-xs text-gray-300">{cardInfo.rarity}</p>
                                            </div>
                                            {count > 1 && (
                                                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-slate-800">
                                                    x{count}
                                                </div>
                                            )}
                                        </motion.div>)
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-lg">
                        <h2 className="text-2xl font-bold mb-2">Votre collection est vide.</h2>
                        <p className="text-gray-400 mb-6">Il est temps de faire votre premier souhait !</p>
                        <Link href="/dashboard/mini-jeu/gacha" className="px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                            Faire un vœu
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}