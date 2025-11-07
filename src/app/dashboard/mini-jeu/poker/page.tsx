"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, PlusCircle, LogIn, Info, AlertTriangle, CheckCircle, Coins } from 'lucide-react';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { fetchCurrency } from '@/utils/api';

const BOT_URL = "http://193.70.34.25:20007";

// --- Composant de Notification ---
const Notification = ({ message, type }: { message: string; type: 'info' | 'error' | 'success' }) => {
  const config = {
    info: { icon: <Info />, color: 'bg-blue-600/90 border-blue-400' },
    error: { icon: <AlertTriangle />, color: 'bg-red-600/90 border-red-400' },
    success: { icon: <CheckCircle />, color: 'bg-green-600/90 border-green-400' },
  };

  return (
    <motion.div
      layout
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed top-5 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-xl shadow-2xl z-50 text-white font-semibold backdrop-blur-md border ${config[type].color}`}
    >
      {config[type].icon}
      {message}
    </motion.div>
  );
};

const PokerLobbyPage = () => {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [minBuyIn, setMinBuyIn] = useState(1000);
  const [buyInAmount, setBuyInAmount] = useState(1000);
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'error' | 'success' } | null>(null);

  useEffect(() => {
    const newSocket = io(BOT_URL, {
      transports: ['websocket'],
      upgrade: false
    });

    newSocket.on('connect', () => {
      console.log('Connecté au serveur de jeu Poker !');
      setIsConnecting(false);
    });

    // Événement reçu après avoir créé OU rejoint une table
    newSocket.on('poker_table_joined', (tableState) => {
      console.log(`Rejoint la table ${tableState.code} avec succès. Redirection...`, tableState);
      // On passe l'état de la table dans l'historique de navigation
      // pour que la page de la table puisse le récupérer sans refaire d'appel.
      window.history.pushState({ tableState }, '', `/dashboard/mini-jeu/poker/${tableState.code}`);
      router.push(`/dashboard/mini-jeu/poker/${tableState.code}`, { scroll: false });
    });

    newSocket.on('poker_error', ({ message }) => {
      showNotification(message, 'error');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [router]);

  useEffect(() => {
    const fetchUserCurrency = async () => {
        if (!session?.user?.id) return;
        setLoadingBalance(true);
        try {
            const data = await fetchCurrency(session.user.id);
            setBalance(data.balance || 0);
        } catch (error) {
            console.error("Erreur de récupération du solde:", error);
            showNotification("Impossible de charger votre solde.", 'error');
        } finally {
            setLoadingBalance(false);
        }
    };

    fetchUserCurrency();
  }, [session]);

  const handleCreateTable = () => {
    if (socket && session?.user) {
      console.log("Demande de création d'une nouvelle table...");
      socket.emit('poker_create_table', { 
        user: { id: session.user.id, name: session.user.name, image: session.user.image },
        minBuyIn: minBuyIn,
        buyInAmount: buyInAmount
      });
    }
  };

  const handleJoinTable = () => {
    if (!joinCode.trim()) {
      console.log("Le code de la table ne peut pas être vide.");
      return;
    }
    if (socket && session?.user) {
      console.log(`Tentative de rejoindre la table avec le code : ${joinCode}`);
      socket.emit('poker_join_table', { tableCode: joinCode, user: { id: session.user.id, name: session.user.name, image: session.user.image }, buyInAmount: buyInAmount });
    }
  };

  const showNotification = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000); // Disparaît après 4 secondes
  };

  return (
    <div className="min-h-screen w-full bg-transparent text-white p-4 md:p-8 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-0"></div>
      <div className="fixed inset-0 bg-[url('/bg/noise-texture.png')] opacity-[0.03] z-0"></div>
      <div className="fixed top-[-50%] left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_rgba(107,33,168,0.15)_0%,transparent_60%)] z-0"></div>

      {/* Conteneur de notification */}
      <AnimatePresence>
        {notification && <Notification message={notification.message} type={notification.type} />}
      </AnimatePresence>

      <div className="w-full max-w-2xl mx-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              POKER EN LIGNE
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-black/50 px-4 py-2 rounded-full flex items-center gap-2 border border-purple-700/50">
              <Coins className="text-yellow-400" />
              <span className="font-bold text-lg">{loadingBalance ? '...' : balance.toLocaleString()}</span>
            </div>
          </div>
          <Link href="/dashboard/mini-jeu/casino-vip">
            <motion.button
              className="p-3 bg-black/50 rounded-full border border-purple-700/50"
              whileHover={{ scale: 1.1, rotate: -15 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft />
            </motion.button>
          </Link>
        </div>

        {/* Main Content */}
        <motion.div
          className="bg-gray-900/50 border-2 border-purple-800/50 rounded-[30px] p-8 md:p-12 shadow-2xl shadow-black/50 backdrop-blur-sm"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="text-center mb-8">
            <Users className="mx-auto h-16 w-16 text-purple-400 mb-4" />
            <h2 className="text-3xl font-bold text-white">Rejoindre ou Créer une Partie</h2>
            <p className="text-gray-400 mt-2">Invitez vos amis et montrez qui est le maître du bluff !</p>
          </div>

          <div className="space-y-8">
            {/* Create Table */}
            <div className="bg-black/20 p-4 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-center mb-4">Configurer votre table</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex flex-col items-center">
                  <label className="text-xs text-gray-400 mb-1">Pot de départ (min)</label>
                  <input 
                    type="number" 
                    value={minBuyIn} 
                    onChange={(e) => setMinBuyIn(Number(e.target.value))}
                    className="w-24 p-2 bg-gray-800/70 border border-gray-700 rounded-lg text-center font-bold" />
                </div>
                <div className="flex flex-col items-center">
                  <label className="text-xs text-gray-400 mb-1">Votre Cave</label>
                  <input 
                    type="number" 
                    value={buyInAmount} 
                    onChange={(e) => setBuyInAmount(Number(e.target.value))}
                    className="w-24 p-2 bg-gray-800/70 border border-gray-700 rounded-lg text-center font-bold" />
                </div>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.02 }}>
              <button
                onClick={handleCreateTable}
                disabled={isConnecting || !socket || !session}
                className="w-full flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl rounded-2xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/40"
              >
                <PlusCircle />
                Créer une nouvelle table
              </button>
            </motion.div>

            <div className="flex items-center gap-4">
              <hr className="flex-grow border-gray-700" />
              <span className="text-gray-500 font-semibold">OU</span>
              <hr className="flex-grow border-gray-700" />
            </div>

            {/* Join Table */}
            <div className="space-y-4">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="CODE DE LA TABLE"
                maxLength={6}
                className="w-full p-4 bg-gray-800/70 border-2 border-gray-700 rounded-xl text-center text-2xl font-bold tracking-[0.3em] placeholder:tracking-normal focus:border-pink-500 focus:ring-pink-500 transition-colors duration-300"
              />
              <motion.div whileHover={{ scale: 1.02 }}>
                <button
                  onClick={handleJoinTable}
                  disabled={isConnecting || !socket || !session || !joinCode.trim()}
                  className="w-full flex items-center justify-center gap-3 p-5 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold text-lg rounded-2xl shadow-lg transition-all duration-300 enabled:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogIn />
                  Rejoindre la table
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PokerLobbyPage;