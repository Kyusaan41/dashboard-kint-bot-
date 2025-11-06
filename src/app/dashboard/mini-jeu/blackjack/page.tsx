"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { User, Bot, Coins, ArrowLeft, Shield, Swords, Diamond, Spade, Club, Heart } from 'lucide-react';
import Link from 'next/link';
import { updateCurrency, fetchCurrency } from '@/utils/api';

// --- Types et Structures de Données ---
type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  suitColor: string;
}

type GameState = 'betting' | 'player-turn' | 'dealer-turn' | 'finished';

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      let value = parseInt(rank);
      if (['J', 'Q', 'K'].includes(rank)) value = 10;
      if (rank === 'A') value = 11;
      deck.push({ suit, rank, value, suitColor: (suit === '♥' || suit === '♦') ? 'text-red-500' : 'text-white' });
    }
  }
  // Mélanger le paquet
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const CardComponent = ({ card, hidden }: { card?: Card; hidden?: boolean }) => {
  const cardVariants = {
    hidden: { rotateY: 180, opacity: 0 },
    visible: { rotateY: 0, opacity: 1 },
  };

  if (hidden || !card) {
    return (
      <motion.div className="w-24 h-36 md:w-28 md:h-40 rounded-lg bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-800/50 flex items-center justify-center shadow-lg shadow-black/50">
        <div className="w-20 h-20 rounded-full bg-yellow-900/20 flex items-center justify-center border-2 border-yellow-800/30">
          <Spade className="text-yellow-700" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-24 h-36 md:w-28 md:h-40 rounded-lg bg-gray-900 text-white border-2 border-gray-700 shadow-lg shadow-black/50 p-2 flex flex-col justify-between"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5 }}
    >
      <div className={`text-2xl font-bold ${card.suitColor}`}>{card.rank}</div>
      <div className={`text-4xl text-center ${card.suitColor}`}>{card.suit}</div>
      <div className={`text-2xl font-bold self-end transform rotate-180 ${card.suitColor}`}>{card.rank}</div>
    </motion.div>
  );
};

const Hand = ({ title, cards, score, isPlayer, isTurn }: { title: string; cards: Card[]; score: number; isPlayer: boolean; isTurn: boolean }) => (
  <div className="flex flex-col items-center gap-4">
    <div className="flex items-center gap-3">
      {isPlayer ? <User className="text-cyan-400" /> : <Bot className="text-red-400" />}
      <h2 className="text-xl font-bold text-white/80">{title}</h2>
      {score > 0 && <span className={`px-3 py-1 rounded-full text-sm font-bold ${score > 21 ? 'bg-red-500/30 text-red-300' : 'bg-black/30 text-white/90'}`}>{score}</span>}
    </div>
    <div className="flex -space-x-12 md:-space-x-16 min-h-[160px] items-center">
      {cards.map((card, i) => (
        <motion.div 
          key={i}
          initial={isPlayer ? { opacity: 0, y: 20, rotate: -10 } : { opacity: 0, scale: 0.8 }}
          animate={isPlayer ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.2, duration: 0.4 }}
        >
          <CardComponent card={card} hidden={!isPlayer && i === 0 && isTurn} />
        </motion.div> 
      ))}
    </div>
  </div>
);

const BlackjackPage = () => {
  const { data: session } = useSession();
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const [gameState, setGameState] = useState<GameState>('betting');
  const [bet, setBet] = useState(100);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [message, setMessage] = useState('Placez votre mise pour commencer.');

  const calculateScore = (hand: Card[]): number => {
    let score = 0;
    let aceCount = 0;
    for (const card of hand) {
      score += card.value;
      if (card.rank === 'A') aceCount++;
    }
    while (score > 21 && aceCount > 0) {
      score -= 10;
      aceCount--;
    }
    return score;
  };

  const playerScore = useMemo(() => calculateScore(playerHand), [playerHand]);
  const dealerScore = useMemo(() => calculateScore(dealerHand), [dealerHand]);

  const fetchUserCurrency = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoadingBalance(true);
    try {
      const data = await fetchCurrency(session.user.id);
      setBalance(data.balance || 0);
    } catch (error) {
      console.error("Erreur de récupération du solde:", error);
      setMessage("Impossible de charger votre solde.");
    } finally {
      setLoadingBalance(false);
    }
  }, [session]);

  useEffect(() => {
    fetchUserCurrency();
  }, [fetchUserCurrency]);

  const startGame = async () => {
    if (bet > balance) {
      setMessage("Solde insuffisant pour cette mise.");
      return;
    }
    if (bet <= 0) {
      setMessage("La mise doit être supérieure à zéro.");
      return;
    }

    try {
      await updateCurrency(session!.user.id, -bet, 'Mise Blackjack');
      setBalance(prev => prev - bet);

      setGameState('player-turn');
      setMessage('Votre tour. Tirez ou restez.');
      const newDeck = createDeck();

      const initialPlayerHand = [newDeck.pop()!, newDeck.pop()!];
      const initialDealerHand = [newDeck.pop()!, newDeck.pop()!];

      setPlayerHand(initialPlayerHand);
      setDealerHand(initialDealerHand);
      setDeck(newDeck);

      const initialPlayerScore = calculateScore(initialPlayerHand);
      if (initialPlayerScore === 21) {
        setTimeout(() => handleStand(), 1000);
      }
    } catch (error) {
      console.error("Erreur lors du placement de la mise:", error);
      setMessage("Une erreur est survenue. Veuillez réessayer.");
      fetchUserCurrency(); // Re-sync balance on error
    }
  };

  const handleHit = () => {
    if (gameState !== 'player-turn') return;

    const newDeck = [...deck];
    const newCard = newDeck.pop()!;
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck(newDeck);

    if (calculateScore(newHand) > 21) {
      setMessage('Vous avez dépassé 21 ! Vous avez perdu.');
      setGameState('finished');
    }
  };

  const handleStand = () => {
    if (gameState !== 'player-turn') return;
    setGameState('dealer-turn');
    setMessage('Tour du croupier...');
  };

  const resetGame = () => {
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setMessage('Placez votre mise pour commencer.');
  };

  useEffect(() => {
    if (gameState === 'dealer-turn') {
      const dealerTurn = () => {
        let currentDealerHand = [...dealerHand];
        let currentDeck = [...deck];
        let score = calculateScore(currentDealerHand);

        const drawCard = () => {
          if (score < 17) {
            const newCard = currentDeck.pop()!;
            currentDealerHand.push(newCard);
            setDealerHand([...currentDealerHand]);
            setDeck([...currentDeck]);
            score = calculateScore(currentDealerHand);
            setTimeout(drawCard, 1000);
          } else {
            setGameState('finished');
          }
        };
        setTimeout(drawCard, 1000);
      };
      dealerTurn();
    }
  }, [gameState, dealerHand, deck]);

  useEffect(() => {
    if (gameState === 'finished') {
      const finalPlayerScore = calculateScore(playerHand);
      const finalDealerScore = calculateScore(dealerHand);

      let winAmount = 0;
      if (finalPlayerScore > 21) {
        setMessage('Perdu ! Vous avez dépassé 21.');
      } else if (finalDealerScore > 21) {
        winAmount = bet * 2;
        setMessage(`Gagné ! Le croupier a dépassé 21. Vous gagnez ${winAmount} pièces.`);
      } else if (finalPlayerScore > finalDealerScore) {
        if (finalPlayerScore === 21 && playerHand.length === 2) {
          winAmount = Math.floor(bet * 2.5);
          setMessage(`BLACKJACK ! Vous gagnez ${winAmount} pièces !`);
        } else {
          winAmount = bet * 2;
          setMessage(`Gagné ! Vous battez le croupier. Vous gagnez ${winAmount} pièces.`);
        }
      } else if (finalPlayerScore < finalDealerScore) {
        setMessage('Perdu ! Le croupier a un meilleur score.');
      } else {
        winAmount = bet;
        setMessage('Égalité ! Votre mise est remboursée.');
      }

      if (winAmount > 0) {
        updateCurrency(session!.user.id, winAmount, 'Gain Blackjack').then(() => {
          setBalance(prev => prev + winAmount);
        });
      }
    }
  }, [gameState, playerHand, dealerHand, bet, session]);

  const renderGameControls = () => {
    switch (gameState) {
      case 'betting':
        return (
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-full border border-slate-700">
              <Coins className="text-yellow-400" />
              <input
                type="number"
                value={bet}
                onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                className="bg-transparent w-24 text-center font-bold text-lg focus:outline-none"
                disabled={loadingBalance}
              />
            </div>
            <motion.button
              onClick={startGame}
              disabled={loadingBalance || bet <= 0 || bet > balance}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-full font-bold text-white shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Miser
            </motion.button>
          </div>
        );
      case 'player-turn':
        return (
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleHit}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full font-bold text-white shadow-lg shadow-cyan-500/20"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Swords /> Tirer
            </motion.button>
            <motion.button
              onClick={handleStand}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full font-bold text-white shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield /> Rester
            </motion.button>
          </div>
        );
      case 'finished':
        return (
          <motion.button
            onClick={resetGame}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-bold text-white shadow-lg shadow-pink-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Rejouer
          </motion.button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent text-white p-4 md:p-8 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-0"></div>
      <div className="fixed inset-0 bg-[url('/bg/noise-texture.png')] opacity-[0.03] z-0"></div>
      <div className="fixed top-[-50%] left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_rgba(202,138,4,0.15)_0%,transparent_60%)] z-0"></div>

      <div className="w-full max-w-6xl mx-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">BLACKJACK</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-black/50 px-4 py-2 rounded-full flex items-center gap-2 border border-yellow-700/50">
              <Coins className="text-yellow-400" />
              <span className="font-bold text-lg">{loadingBalance ? '...' : balance.toLocaleString()}</span>
            </div>
            <Link href="/dashboard/mini-jeu">
              <motion.button
                className="p-3 bg-black/50 rounded-full border border-yellow-700/50"
                whileHover={{ scale: 1.1, rotate: -15 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft />
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Game Table */}
        <div className="bg-green-950/80 border-4 border-yellow-900/80 rounded-[40px] p-4 md:p-8 shadow-2xl shadow-black/50 min-h-[60vh] flex flex-col justify-between backdrop-blur-sm relative">
          {/* Dealer's Hand */}
          <Hand
            title="Croupier"
            cards={dealerHand}
            score={gameState === 'finished' ? dealerScore : (dealerHand.length > 0 ? calculateScore([dealerHand[1]]) : 0)}
            isPlayer={false}
            isTurn={gameState === 'player-turn'}
          />

          {/* Decorative Poker Chips */}
          <div className="absolute top-1/2 -left-8 -translate-y-1/2 opacity-50">
            <div className="flex flex-col gap-1">
              <div className="w-16 h-4 bg-red-700 rounded-full border-2 border-red-900/50 transform -rotate-12"></div>
              <div className="w-16 h-4 bg-blue-700 rounded-full border-2 border-blue-900/50 transform -rotate-12 -ml-1"></div>
              <div className="w-16 h-4 bg-gray-600 rounded-full border-2 border-gray-800/50 transform -rotate-12"></div>
            </div>
          </div>
          <div className="absolute top-1/2 -right-8 -translate-y-1/2 opacity-50">
            <div className="flex flex-col gap-1">
              <div className="w-16 h-4 bg-green-700 rounded-full border-2 border-green-900/50 transform rotate-12"></div>
              <div className="w-16 h-4 bg-black rounded-full border-2 border-gray-800/50 transform rotate-12 -mr-1"></div>
              <div className="w-16 h-4 bg-purple-700 rounded-full border-2 border-purple-900/50 transform rotate-12"></div>
            </div>
          </div>

          {/* Message & Controls */}
          <div className="flex flex-col items-center gap-4 my-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={message}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="text-center"
              >
                <p className="text-xl font-semibold text-white/90">{message}</p>
                {gameState === 'betting' && <p className="text-sm text-gray-400">Votre solde: {balance.toLocaleString()} pièces</p>}
              </motion.div>
            </AnimatePresence>
            <div className="mt-4">
              {renderGameControls()}
            </div>
          </div>

          {/* Player's Hand */}
          <Hand
            title={session?.user?.name || 'Joueur'}
            cards={playerHand}
            score={playerScore}
            isPlayer={true}
            isTurn={true}
          />
        </div>

        {/* Rules */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>Règles : Le but est de battre le croupier sans dépasser 21. L'As vaut 1 ou 11. Les figures valent 10.</p>
          <p>Le croupier tire jusqu'à 17. Un Blackjack rapporte 2.5x la mise. Une victoire normale rapporte 2x la mise.</p>
        </div>
      </div>
    </div>
  );
};

export default BlackjackPage;