"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Crown, Play, Coins, User, Bot, Spade, Hand, XCircle, Info, AlertTriangle, CheckCircle, Trophy, LogOut, Eye, EyeOff } from 'lucide-react';
import { fetchCurrency } from '@/utils/api';

const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL || "http://localhost:20007";

interface Player {
  id: string;
  username: string;
  avatar: string;
  stack: number;
  isHost: boolean;
  userId: string;
  hand?: { 
    suit: '♥' | '♦' | '♣' | '♠'; 
    rank: string 
  }[];
  handDetails?: { handName: string };
  hasFolded?: boolean;
  isSpectating?: boolean;
}

interface TableState {
  code: string;
  players: Player[];
  state: 'waiting' | 'playing' | 'finished';
  currentPlayerId?: string; // ID du joueur dont c'est le tour
  pot?: number;
  minBuyIn?: number;
  currentBet?: number;
  communityCards?: { suit: string; rank: string }[];
}

interface WinnerInfo {
  winner: Player;
  handRank: string;
}

// --- Composant pour afficher une carte ---
const Card = ({ card, hidden }: { card?: { suit: string; rank: string }; hidden?: boolean }) => {
  if (hidden || !card) {
    return (
      <div className="w-12 h-16 md:w-14 md:h-20 rounded-md bg-gradient-to-br from-purple-600 to-indigo-700 border-2 border-purple-400 flex items-center justify-center shadow-md">
        <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center">
          <Spade className="text-purple-300" />
        </div>
      </div>
    );
  }

  const isRed = card.suit === '♥' || card.suit === '♦';
  const suitColor = isRed ? 'text-red-500' : 'text-gray-800';

  return (
    <motion.div
      className="w-12 h-16 md:w-14 md:h-20 rounded-md bg-white border-2 border-gray-300 shadow-lg p-1 flex flex-col justify-between"
      initial={{ rotateY: 180 }}
      animate={{ rotateY: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`text-lg md:text-xl font-bold ${suitColor}`}>{card.rank}</div>
      <div className={`text-xl md:text-2xl text-center ${suitColor}`}>{card.suit}</div>
      <div className={`text-lg md:text-xl font-bold self-end transform rotate-180 ${suitColor}`}>{card.rank}</div>
    </motion.div>
  );
};



const PokerTablePage = () => {
  const params = useParams();
  const tableCode = params.tableCode as string;
  const router = useRouter();
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [tableState, setTableState] = useState<TableState | null>(null);
  const [balance, setBalance] = useState(0);
  const [showBuyInModal, setShowBuyInModal] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [winnerInfo, setWinnerInfo] = useState<WinnerInfo | null>(null);

  const amIHost = useMemo(() => {
    if (!tableState || !socket) return false;
    return tableState.players.some(p => p.id === socket.id && p.isHost);
  }, [tableState, socket]);

  const amISpectating = useMemo(() => {
    if (!tableState || !socket) return true; // Par défaut, on est spectateur
    const me = tableState.players.find(p => p.id === socket.id);
    return me ? me.isSpectating : true;
  }, [tableState, socket]);

  const fetchUserCurrency = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoadingBalance(true);
    try {
        const data = await fetchCurrency(session.user.id);
        setBalance(data.balance || 0);
    } catch (error) {
        console.error("Erreur de récupération du solde:", error);
    } finally {
        setLoadingBalance(false);
    }
  }, [session]);

  useEffect(() => {
    fetchUserCurrency();
  }, [fetchUserCurrency]);

  useEffect(() => {
    if (!session?.user) return;

    const newSocket = io(BOT_URL, {
      transports: ['websocket'],
      upgrade: false
    });
    setSocket(newSocket);

    newSocket.on('poker_table_joined', (initialTableState: TableState) => {
      console.log('État initial de la table reçu:', initialTableState);
      setTableState(initialTableState);
    });

    newSocket.on('connect', () => {
      console.log('Connecté au serveur de jeu ! Envoi des infos pour rejoindre la table...');
      newSocket.emit('poker_join_table', {
        tableCode,
        user: { id: session.user.id, name: session.user.name, image: session.user.image }
      });
    });

    newSocket.on('poker_player_joined', (newPlayer: Player) => {
      console.log('Un nouveau joueur a rejoint:', newPlayer);
      setTableState(prevState => {
        if (!prevState || prevState.players.some(p => p.id === newPlayer.id)) return prevState;
        return { ...prevState, players: [...prevState.players, newPlayer] };
      });
    });

    newSocket.on('poker_table_joined', (initialTableState: TableState) => {
      console.log('État initial de la table reçu:', initialTableState);
      setTableState(initialTableState);
    });

    newSocket.on('poker_player_left', ({ playerId }: { playerId: string }) => {
      console.log(`Le joueur ${playerId} a quitté.`);
      setTableState(prevState => prevState ? { ...prevState, players: prevState.players.filter(p => p.id !== playerId) } : null);
    });

    newSocket.on('poker_game_started', (updatedTableState: TableState) => {
      console.log('La partie a commencé !', updatedTableState);
      setTableState(updatedTableState);
    });

    newSocket.on('poker_table_state_update', (updatedTableState: TableState) => {
      console.log('Mise à jour de l\'état de la table reçue:', updatedTableState);
      setWinnerInfo(null); // Réinitialiser le gagnant au début d'une nouvelle main
      fetchUserCurrency(); // Mettre à jour le solde après le prélèvement des blinds
      setTableState(updatedTableState);
    });

    newSocket.on('poker_game_over', ({ table, winnerInfo }) => {
      console.log('La partie est terminée !', { table, winnerInfo });
      setTableState(table);
      setWinnerInfo(winnerInfo);
      fetchUserCurrency(); // Mettre à jour le solde après le gain
    });

    newSocket.on('poker_error', ({ message }: { message: string }) => {
      alert(`Erreur: ${message}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [tableCode, session, router]);

  const handleStartGame = () => {
    if (socket && amIHost) {
      console.log('Demande de lancement de la partie...');
      socket.emit('poker_start_game', { tableCode });
    }
  };

  const handlePlayerAction = (action: { type: 'fold' | 'check' | 'bet', amount?: number }) => {
    if (socket) {
      socket.emit('poker_player_action', { tableCode, action });
    }
  };

  const handleLeaveTable = () => {
    if (socket) {
      socket.emit('poker_leave_table', { tableCode });
      router.push('/dashboard/mini-jeu/poker');
    }
  };

  const handleToggleSpectate = (isSpectating: boolean, buyInAmount?: number) => {
    if (socket) {
      socket.emit('poker_toggle_spectate', { tableCode, isSpectating, buyInAmount });
      setShowBuyInModal(false);
    }
  };

  const handleNextHand = () => {
    if (socket && amIHost) {
      console.log('Demande pour la prochaine main...');
      socket.emit('poker_next_hand', { tableCode });
    }
  };

  // --- Composant pour les boutons d'action ---
  const ActionButtons = () => {
    const isMyTurn = tableState?.currentPlayerId === socket?.id;
    const [betAmount, setBetAmount] = useState(10);
    const currentBet = tableState?.currentBet || 0;
    const hasBet = currentBet > 0;

    if (tableState?.state !== 'playing' || !isMyTurn) return null;

    return (
      <motion.div 
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-20"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <button onClick={() => handlePlayerAction({ type: 'fold' })} className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
          <div className="flex items-center gap-2"><XCircle size={20} /> Se Coucher</div>
        </button>

        {hasBet ? (
          <button onClick={() => handlePlayerAction({ type: 'bet', amount: currentBet })} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center gap-2"><Coins size={20} /> Suivre ({currentBet})</div>
          </button>
        ) : (
          <button onClick={() => handlePlayerAction({ type: 'check' })} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center gap-2"><Hand size={20} /> Parole</div>
          </button>
        )}

        <div className="flex items-center gap-2 p-1 pr-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-full shadow-lg">
          <input 
            type="number" 
            value={betAmount < currentBet * 2 ? currentBet * 2 : betAmount}
            onChange={(e) => setBetAmount(parseInt(e.target.value, 10) || 0)}
            className="w-20 bg-transparent text-white text-center font-bold focus:outline-none" 
          />
          <button onClick={() => handlePlayerAction({ type: 'bet', amount: betAmount })} className="font-bold hover:scale-110 transition-transform">
            {hasBet ? 'Relancer' : 'Miser'}
          </button>
        </div>
      </motion.div>
    );
  };

  const WinnerDisplay = () => {
    if (!winnerInfo || tableState?.state !== 'finished') return null;

    return (
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[200px] z-20"
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
      >
        <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl border-4 border-yellow-300 shadow-2xl text-center">
          <div className="flex items-center justify-center gap-3">
            <Trophy />
            <p className="text-2xl font-black tracking-wider">
              {winnerInfo.winner.username} gagne !
            </p>
          </div>
          <p className="text-lg font-semibold text-yellow-200 mt-1">
            Avec {winnerInfo.handRank}
          </p>
        </div>
      </motion.div>
    );
  };

  const BuyInModal = () => {
    const minBuyIn = tableState?.minBuyIn || 1000;
    const [buyIn, setBuyIn] = useState(minBuyIn);

    if (!showBuyInModal) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div 
          className="bg-gray-800 p-8 rounded-2xl border border-purple-700 shadow-lg w-full max-w-md"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <h2 className="text-2xl font-bold text-center mb-4">Choisir votre Cave</h2>
          <p className="text-center text-gray-400 mb-6">Le minimum pour cette table est de {minBuyIn.toLocaleString()} pièces.</p>
          <div className="flex flex-col items-center gap-4">
            <input 
              type="number"
              value={buyIn}
              min={minBuyIn}
              onChange={(e) => setBuyIn(Number(e.target.value))}
              className="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg text-center text-2xl font-bold focus:border-purple-500"
            />
            <div className="flex gap-4 w-full">
              <button onClick={() => setShowBuyInModal(false)} className="flex-1 px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors">
                Annuler
              </button>
              <button 
                onClick={() => handleToggleSpectate(false, buyIn)} 
                disabled={buyIn < minBuyIn || buyIn > balance}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                S'asseoir
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex items-center justify-center font-sans relative overflow-hidden p-4">
      {/* Fond stylisé */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-0"></div>
      <div className="fixed inset-0 bg-[url('/bg/noise-texture.png')] opacity-[0.03] z-0"></div>
      <div className="fixed top-[-50%] left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_rgba(107,33,168,0.1)_0%,transparent_70%)] z-0"></div>
      
      {/* Header avec solde et bouton quitter */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-40">
        <div className="flex gap-4">
          <motion.button 
            onClick={handleLeaveTable}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/80 text-white rounded-lg shadow-lg hover:bg-red-700/80 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut size={16} /> Quitter
          </motion.button>
          {amISpectating ? (
            <motion.button onClick={() => setShowBuyInModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600/80 text-white rounded-lg shadow-lg hover:bg-green-700/80 transition-colors"><Eye size={16} /> Rejoindre la Table</motion.button>
          ) : (
            <motion.button onClick={() => handleToggleSpectate(true)} className="flex items-center gap-2 px-4 py-2 bg-yellow-600/80 text-white rounded-lg shadow-lg hover:bg-yellow-700/80 transition-colors"><EyeOff size={16} /> Se Lever</motion.button>
          )}
        </div>
        <div className="bg-black/50 px-4 py-2 rounded-full flex items-center gap-2 border border-purple-700/50">
          <Coins className="text-yellow-400" />
          <span className="font-bold text-lg">{loadingBalance ? '...' : balance.toLocaleString()}</span>
        </div>
      </div>

      <BuyInModal />

      <div className="w-full max-w-7xl mx-auto z-10 text-center">
        <p className="text-lg text-purple-300 mb-2 mt-16">
          Code : <span className="font-mono tracking-widest bg-gray-800 px-2 py-1 rounded">{tableCode}</span>
        </p>

        {/* Table de jeu */}
        <div className="relative w-full aspect-[2.2/1] max-w-6xl mx-auto">
          {/* Table elle-même */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-green-950 rounded-[150px] border-8 border-yellow-900/80 shadow-2xl shadow-black/50">
            <div className="absolute inset-8 border-4 border-green-700/50 rounded-[120px]"></div>
            <div className="absolute inset-16 border-2 border-yellow-700/30 rounded-[100px]"></div>

            {/* Zone centrale pour le pot et les cartes communes */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center space-y-4">
              <div className="p-4 bg-black/40 rounded-2xl border border-yellow-700/40">
                <p className="text-yellow-400 font-black text-3xl tracking-wider">Pot: {tableState?.pot?.toLocaleString() || 0}</p>
              </div>
              <div className="flex gap-2 h-24">
                {/* Cartes communes révélées */}
                {tableState?.communityCards?.map((card, i) => (
                  <motion.div key={i} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: i * 0.2 }}>
                    <Card card={card} />
                  </motion.div>
                ))}
                {/* Emplacements pour les cartes non encore révélées */}
                {tableState?.state === 'playing' && [...Array(5 - (tableState?.communityCards?.length || 0))].map((_, i) => (
                  <div key={`placeholder-${i}`} className="w-14 h-20 bg-black/30 rounded-md border-2 border-dashed border-green-600/50"></div>
                ))}
              </div>
            </div>

            {/* Bouton pour lancer la partie */}
            {amIHost && tableState?.state === 'waiting' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[150px]">
                <motion.button onClick={handleStartGame} disabled={(tableState?.players?.length || 0) < 2} className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-xl rounded-full shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Play />
                  Lancer la partie
                </motion.button>
              </div>
            )}
            {/* Affichage du gagnant */}
            <WinnerDisplay />
            {/* Bouton pour la main suivante */}
            {amIHost && tableState?.state === 'finished' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[150px] z-20">
                <motion.button onClick={handleNextHand} className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl rounded-full shadow-lg shadow-purple-500/30" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Play />
                  Prochaine Main
                </motion.button>
              </div>
            )}
            {/* Boutons d'action du joueur */}
            <ActionButtons />
          </div>

          {/* Affichage des joueurs en cercle */}
          <AnimatePresence>
            {tableState?.players.map((player, index) => (
              <motion.div
                key={player.id}
                className="absolute"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  top: `${50 - 50 * Math.cos(index * (2 * Math.PI / 8))}%`,
                  left: `${50 + 48 * Math.sin(index * (2 * Math.PI / 8))}%`,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <div className="relative flex flex-col items-center gap-2 w-32">
                  <div className={`relative transition-all duration-300 ${tableState?.currentPlayerId === player.id ? 'scale-110 shadow-2xl shadow-yellow-500/50 rounded-full' : ''} ${player.hasFolded ? 'opacity-40 grayscale' : ''} ${winnerInfo?.winner.id === player.id ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-green-900' : ''}`}>
                    <Image src={player.avatar} alt={player.username} width={64} height={64} className="rounded-full border-4 border-yellow-500 shadow-lg" />
                    {player.isHost && <Crown size={20} className="absolute -top-2 -right-2 text-yellow-400 bg-purple-800 p-1 rounded-full" />}
                  </div>
                  <div className="bg-black/70 px-3 py-1.5 rounded-xl text-center w-full">
                    <p className="text-sm font-bold text-white truncate">{player.username}</p>
                    <p className="text-xs text-yellow-400 font-semibold flex items-center justify-center gap-1">
                      <Coins size={12} /> {player.stack.toLocaleString()}
                    </p>
                  </div>
                  {/* Affichage des cartes et de la main */}
                  {player.hand && (tableState?.state === 'playing' || tableState?.state === 'finished') && (
                    <div className="absolute -bottom-16 flex gap-1">
                      <Card 
                        card={player.hand[0]}
                        hidden={tableState.state === 'playing' && socket?.id !== player.id && !player.hasFolded} />
                      <Card 
                        card={player.hand[1]}
                        hidden={tableState.state === 'playing' && socket?.id !== player.id && !player.hasFolded} />
                    </div>
                  )}
                  {winnerInfo?.winner.id === player.id && player.handDetails && (
                    <div className="absolute -bottom-24 bg-black/80 text-yellow-300 text-xs font-bold px-2 py-1 rounded-md">
                      {player.handDetails.handName}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PokerTablePage;
