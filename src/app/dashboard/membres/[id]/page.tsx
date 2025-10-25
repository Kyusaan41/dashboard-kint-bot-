'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Star, Coins, Trophy, Calendar, Activity, Award, Crown,
    Zap, Package, Heart, Shield, TrendingUp, BarChart3, Clock,
    Sparkles, Gem, Target, Flame, MessageCircle
} from 'lucide-react';

// Types
type UserProfile = {
    id: string;
    name: string;
    avatar?: string;
    xp: number;
    level: number;
    coins: number;
    points: number;
    joinedAt: string;
    lastActive: string;
    title?: string;
    bio?: string;
    badges: string[];
    stats: {
        messagesCount: number;
        commandsUsed: number;
        timeSpent: number;
        favoriteCommand: string;
    };
    achievements: Array<{
        id: string;
        name: string;
        description: string;
        unlockedAt: string;
        rarity: 'common' | 'rare' | 'epic' | 'legendary';
    }>;
    inventory: Array<{
        id: string;
        name: string;
        quantity: number;
        icon?: string;
    }>;
};

// Helper Components
const NyxCard = ({ children, className = '', delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        className={`nyx-card ${className}`}
    >
        {children}
    </motion.div>
);

const StatCard = ({ icon: Icon, label, value, color = 'text-purple-secondary', delay = 0 }: {
    icon: any,
    label: string,
    value: string | number,
    color?: string,
    delay?: number
}) => (
    <NyxCard delay={delay} className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-purple opacity-5 rounded-full blur-2xl"></div>
        <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-purple flex items-center justify-center">
                    <Icon size={24} className="text-white" />
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                    <p className={`text-sm ${color}`}>{label}</p>
                </div>
            </div>
        </div>
    </NyxCard>
);

const AchievementCard = ({ achievement, index }: { achievement: UserProfile['achievements'][0], index: number }) => {
    const rarityConfig = {
        common: { color: 'text-gray-400', bg: 'bg-gray-500/20', icon: '⚪' },
        rare: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: '💎' },
        epic: { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: '💜' },
        legendary: { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: '✨' }
    };
    
    const config = rarityConfig[achievement.rarity];
    
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`p-4 rounded-xl border border-purple-primary/20 ${config.bg} hover:scale-105 transition-transform duration-300 cursor-pointer`}
        >
            <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">{config.icon}</span>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{achievement.name}</h4>
                    <p className={`text-xs ${config.color} capitalize`}>{achievement.rarity}</p>
                </div>
            </div>
            <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
            <p className="text-xs text-gray-500">Débloqué le {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR')}</p>
        </motion.div>
    );
};

export default function MemberPage(props: any) {
    const id = props?.params?.id;
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                // Simulation de données - remplacer par des vrais appels API
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const mockData: UserProfile = {
                    id: id,
                    name: `Membre#${id}`,
                    avatar: `https://cdn.discordapp.com/embed/avatars/${parseInt(id.slice(-1)) % 5}.png`,
                    xp: 15420,
                    level: 42,
                    coins: 8750,
                    points: 2340,
                    joinedAt: '2023-06-15T10:30:00Z',
                    lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
                    title: 'Maître NyxBot',
                    bio: 'Explorateur passionné de l\'univers NyxBot ! 🚀',
                    badges: ['early-adopter', 'active-member', 'helper'],
                    stats: {
                        messagesCount: 1542,
                        commandsUsed: 892,
                        timeSpent: 12450, // minutes
                        favoriteCommand: '/aide'
                    },
                    achievements: [
                        { id: '1', name: 'Premier Pas', description: 'Première connexion au serveur', unlockedAt: '2023-06-15T10:30:00Z', rarity: 'common' },
                        { id: '2', name: 'Bavard', description: 'Envoyé 1000 messages', unlockedAt: '2023-07-01T14:20:00Z', rarity: 'rare' },
                        { id: '3', name: 'Collectionneur', description: 'Possède 50 objets différents', unlockedAt: '2023-08-15T16:45:00Z', rarity: 'epic' },
                        { id: '4', name: 'Légende NyxBot', description: 'Maîtrise totale du système', unlockedAt: '2023-12-01T12:00:00Z', rarity: 'legendary' }
                    ],
                    inventory: [
                        { id: 'sword', name: 'Épée mystique', quantity: 1, icon: '⚔️' },
                        { id: 'potion', name: 'Potion de force', quantity: 5, icon: '🧪' },
                        { id: 'gem', name: 'Gemme rare', quantity: 3, icon: '💎' }
                    ]
                };
                
                setUserData(mockData);

            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="nyx-spinner mb-4"></div>
                    <p className="text-gray-300 text-lg">Chargement du profil NyxBot...</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <User size={32} className="text-red-400" />
                </div>
                <p className="text-red-400 text-lg">Profil introuvable</p>
                <p className="text-gray-500">Ce membre n'existe pas ou n'est plus accessible.</p>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: '📊 Vue d\'ensemble', icon: BarChart3 },
        { id: 'achievements', label: '🏆 Succès', icon: Trophy },
        { id: 'inventory', label: '🎒 Inventaire', icon: Package }
    ];

    return (
        <div className="space-y-8">
            {/* Header Profile */}
            <NyxCard className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-purple opacity-5 rounded-full blur-3xl"></div>
                <div className="relative p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                        {/* Avatar Section */}
                        <div className="flex-shrink-0">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-2xl bg-gradient-purple p-1">
                                    <Image
                                        src={userData.avatar || '/default-avatar.png'}
                                        alt={userData.name}
                                        width={124}
                                        height={124}
                                        className="rounded-[14px] object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-gradient-purple rounded-xl p-3">
                                    <span className="text-white font-bold text-lg">{userData.level}</span>
                                </div>
                                {/* Status Indicator */}
                                <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-bg-primary flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl font-bold text-white">{userData.name}</h1>
                                    <div className="flex items-center gap-2">
                                        {userData.badges.map(badge => (
                                            <div key={badge} className="w-6 h-6 rounded-full bg-gradient-purple flex items-center justify-center">
                                                <Crown size={12} className="text-white" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {userData.title && (
                                    <div className="inline-block px-3 py-1 bg-purple-primary/20 text-purple-secondary rounded-lg text-sm font-medium mb-3">
                                        👑 {userData.title}
                                    </div>
                                )}
                                {userData.bio && (
                                    <p className="text-gray-400 text-lg">{userData.bio}</p>
                                )}
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-purple-secondary">{userData.level}</p>
                                    <p className="text-sm text-gray-400">Niveau</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-yellow-400">{userData.coins.toLocaleString()}</p>
                                    <p className="text-sm text-gray-400">Pièces</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-400">{userData.xp.toLocaleString()}</p>
                                    <p className="text-sm text-gray-400">Expérience</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-400">{userData.points.toLocaleString()}</p>
                                    <p className="text-sm text-gray-400">Points</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </NyxCard>

            {/* Tab Navigation */}
            <NyxCard delay={0.1}>
                <div className="flex flex-wrap gap-2 p-2 bg-purple-primary/5 rounded-xl">
                    {tabs.map((tab, index) => (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-fit px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                                activeTab === tab.id
                                    ? 'bg-gradient-purple text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-purple-primary/10'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <tab.icon size={18} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </motion.button>
                    ))}
                </div>
            </NyxCard>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={MessageCircle} label="Messages" value={userData.stats.messagesCount} delay={0.2} />
                            <StatCard icon={Zap} label="Commandes" value={userData.stats.commandsUsed} delay={0.3} />
                            <StatCard icon={Clock} label="Temps actif" value={`${Math.floor(userData.stats.timeSpent / 60)}h`} delay={0.4} />
                            <StatCard icon={Target} label="Commande favorite" value={userData.stats.favoriteCommand} color="text-yellow-400" delay={0.5} />
                        </div>

                        {/* Activity & Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Activity */}
                            <NyxCard delay={0.6}>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Activity size={20} className="text-purple-secondary" />
                                        Activité récente
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-purple-primary/5 rounded-lg">
                                            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                                <Flame size={16} className="text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">Série de connexion</p>
                                                <p className="text-sm text-gray-400">Actif depuis 7 jours</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-purple-primary/5 rounded-lg">
                                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                                <Trophy size={16} className="text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">Nouveau succès</p>
                                                <p className="text-sm text-gray-400">Il y a 2 heures</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </NyxCard>

                            {/* Member Info */}
                            <NyxCard delay={0.7}>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Calendar size={20} className="text-purple-secondary" />
                                        Informations
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Membre depuis</span>
                                            <span className="text-white font-medium">
                                                {new Date(userData.joinedAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Dernière activité</span>
                                            <span className="text-white font-medium">
                                                {new Date(userData.lastActive).toLocaleTimeString('fr-FR', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Rang</span>
                                            <span className="text-purple-secondary font-medium">#42</span>
                                        </div>
                                    </div>
                                </div>
                            </NyxCard>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'achievements' && (
                    <motion.div
                        key="achievements"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <NyxCard delay={0.2}>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Trophy size={20} className="text-purple-secondary" />
                                        Succès débloqués
                                    </h3>
                                    <div className="px-3 py-1 bg-purple-primary/20 text-purple-secondary rounded-lg text-sm">
                                        {userData.achievements.length} succès
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {userData.achievements.map((achievement, index) => (
                                        <AchievementCard 
                                            key={achievement.id} 
                                            achievement={achievement} 
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </div>
                        </NyxCard>
                    </motion.div>
                )}

                {activeTab === 'inventory' && (
                    <motion.div
                        key="inventory"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <NyxCard delay={0.2}>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Package size={20} className="text-purple-secondary" />
                                        Inventaire
                                    </h3>
                                    <div className="px-3 py-1 bg-purple-primary/20 text-purple-secondary rounded-lg text-sm">
                                        {userData.inventory.length} objets
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {userData.inventory.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="p-4 bg-purple-primary/5 rounded-xl border border-purple-primary/20 hover:bg-purple-primary/10 transition-colors duration-300"
                                        >
                                            <div className="text-center">
                                                <div className="text-3xl mb-2">{item.icon || '📦'}</div>
                                                <h4 className="font-semibold text-white mb-1">{item.name}</h4>
                                                <div className="inline-block px-2 py-1 bg-purple-primary/20 text-purple-secondary rounded text-xs">
                                                    x{item.quantity}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </NyxCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
