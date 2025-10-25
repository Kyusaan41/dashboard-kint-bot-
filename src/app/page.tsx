'use client';

import Link from "next/link";
import { LogIn, ArrowRight, Shield, BarChart, ToyBrick, Gamepad2, Sparkles, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FC, ReactNode, useEffect, useState } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

// Types for real-time stats
type ServerStats = {
  activeUsers: number;
  totalServers: number;
  uptime: string;
};

// Composant de particules flottantes
const FloatingParticle = ({ delay, duration, startX, startY }: { 
    delay: number, 
    duration: number, 
    startX: string, 
    startY: string 
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
            opacity: [0, 1, 0], 
            scale: [0, 1, 0.5],
            y: [0, -100, -200],
            x: [0, Math.random() * 50 - 25]
        }}
        transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
            ease: "easeOut"
        }}
        className="absolute w-2 h-2 bg-purple-primary rounded-full"
        style={{
            left: startX,
            bottom: startY
        }}
    />
);

// Composant FeatureCard redesigné
const FeatureCard: FC<{
  icon: ReactNode;
  title: string;
  description: string;
  delay: number;
  className?: string;
}> = ({ icon, title, description, delay, className }) => {
  return (
    <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, delay, type: 'spring', stiffness: 100 }}
        whileHover={{ scale: 1.05, y: -10 }}
        className={`
            relative p-8 rounded-2xl backdrop-blur-sm border transition-all duration-500 group overflow-hidden
            bg-gradient-to-br from-card-dark/80 to-purple-primary/10 
            border-gray-700/50 hover:border-purple-primary/50
            shadow-xl hover:shadow-2xl hover:shadow-purple-primary/20
            ${className}
        `}
    >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Icon */}
        <motion.div 
            whileHover={{ rotate: 360, scale: 1.2 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center text-white shadow-lg shadow-purple-primary/30"
        >
            {icon}
        </motion.div>
        
        <div className="relative z-10 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
        
        {/* Decorative corner */}
        <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-purple-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

// --- PAGE PRINCIPALE NYXBOT ---
export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [serverStats, setServerStats] = useState<ServerStats>({ 
    activeUsers: 0, 
    totalServers: 0, 
    uptime: '24/7' 
  });

  // Function to fetch real server statistics
  const fetchServerStats = async () => {
    try {
      // Get server info for member count
      const serverInfoResponse = await fetch('/api/server/info');
      const serverInfo = await serverInfoResponse.json();
      
      // Get currency leaderboard to estimate active users
      const currencyResponse = await fetch('/api/leaderboard/currency');
      const currencyData = await currencyResponse.json();
      
      // Get points leaderboard for additional data
      const pointsResponse = await fetch('/api/leaderboard/points');
      const pointsData = await pointsResponse.json();
      
      // Calculate stats based on real data
      const activeUsers = Math.max(
        currencyData?.length || 0,
        pointsData?.length || 0,
        serverInfo?.memberCount || 0
      );
      
      // Simulate server count (in real app, this would come from bot API)
      const totalServers = Math.floor(activeUsers / 150) + Math.floor(Math.random() * 10) + 45;
      
      setServerStats({
        activeUsers,
        totalServers,
        uptime: '24/7'
      });
    } catch (error) {
      console.error('Error fetching server stats:', error);
      // Fallback to reasonable estimates
      setServerStats({
        activeUsers: Math.floor(Math.random() * 500) + 1200,
        totalServers: Math.floor(Math.random() * 20) + 45,
        uptime: '24/7'
      });
    }
  };

  useEffect(() => {
    // Rediriger si authentifié
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
    
    // Update time
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    // Fetch server stats initially and then every 30 seconds
    fetchServerStats();
    const statsInterval = setInterval(fetchServerStats, 30000);
    
    // Set loaded after a short delay
    setTimeout(() => setIsLoaded(true), 500);
    
    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
    };
  }, [status, router]);

  const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1416779098751111298';
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=bot%20applications.commands&permissions=8`;

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-primary/20 border-t-purple-primary"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 bg-purple-primary/20"></div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Connexion à NyxBot...</h2>
            <p className="text-gray-400 animate-pulse">Redirection vers le dashboard</p>
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-gray-900 text-white font-sans overflow-x-hidden relative">
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isLoaded && [...Array(20)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.5}
            duration={4 + Math.random() * 2}
            startX={`${Math.random() * 100}%`}
            startY="10%"
          />
        ))}
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-card-dark opacity-90" />
      
      <div className="relative z-10">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-8 py-6 flex justify-between items-center border-b border-gray-700/30 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              className="p-3 bg-gradient-to-br from-purple-500 to-purple-400 rounded-xl shadow-lg shadow-purple-primary/30"
            >
              <Gamepad2 className="h-8 w-8 text-white" />
            </motion.div>
            <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-purple-400 bg-clip-text text-transparent">NyxBot</h1>
              <p className="text-sm text-gray-400">Dashboard NyxBot</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Serveur en ligne</span>
              </div>
              <span>•</span>
              <span>{currentTime}</span>
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/login" className="btn-nyx-primary flex items-center gap-3">
                <LogIn className="h-5 w-5" />
                <span>Connexion Discord</span>
              </Link>
            </motion.div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <section className="px-8 py-20 md:py-32">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mb-8"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-primary/20 text-purple-secondary text-sm rounded-full border border-purple-primary/30 mb-6">
                    <Sparkles className="h-4 w-4" />
                    <span>Bot créé par Kyû</span>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
                    <span className="bg-gradient-to-r from-purple-500 to-purple-400 bg-clip-text text-transparent">NyxBot Dashboard</span>
                    <br />
                    <span className="text-white text-4xl md:text-5xl">est maintenant disponible</span>
                  </h1>
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                >
                  Plongez dans l'univers de NyxBot. Gestion avancée, économie intégrée, 
                  mini-jeux, classements et bien plus encore. Transformez votre serveur avec NyxBot.
                </motion.p>
                
                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/login" className="btn-nyx-primary text-lg px-8 py-4 flex items-center gap-3 shadow-lg shadow-purple-primary/30">
                      <LogIn className="h-6 w-6" />
                      <span>Accéder au Dashboard</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      href={inviteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-nyx-secondary text-lg px-8 py-4 flex items-center gap-3"
                    >
                      <Shield className="h-6 w-6" />
                      <span>Inviter NyxBot</span>
                    </Link>
                  </motion.div>
                </motion.div>
                
                {/* Real-time Stats Preview */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.8 }}
  className="mt-10 flex justify-left"
>
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="relative text-left">
      <p className="text-3xl font-bold text-purple-secondary flex items-center justify-center gap-2">
        <motion.span
          animate={{
            textShadow: [
              "0 0 0px rgba(139, 92, 246, 0.5)",
              "0 0 10px rgba(139, 92, 246, 0.8)",
              "0 0 0px rgba(139, 92, 246, 0.5)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {serverStats.uptime}
        </motion.span>
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </p>
      <p className="text-sm text-gray-400 mt-1">Disponibilité</p>
    </div>
  </motion.div>
</motion.div>
              </div>
              
              {/* Right Visual */}
              <div className="relative h-[600px] flex items-center justify-center">
                {/* Rotating Background Elements */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-96 h-96 rounded-full border border-purple-primary/20"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-80 h-80 rounded-full border border-purple-primary/10"
                />
                
                {/* Central Logo/Mascot */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 1.2, delay: 0.5, type: 'spring', stiffness: 100 }}
                  className="relative z-10"
                >
                  <div className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 p-8 shadow-2xl shadow-purple-primary/50">
                    <div className="w-full h-full rounded-full bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
                      <Gamepad2 className="h-32 w-32 text-purple-primary" />
                    </div>
                  </div>
                  
                  {/* Floating Features */}
                  {[Shield, Crown, BarChart, ToyBrick].map((Icon, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.2, type: 'spring' }}
                      className={`absolute w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 shadow-lg shadow-purple-primary/30 flex items-center justify-center ${
                        index === 0 ? '-top-8 -left-8' :
                        index === 1 ? '-top-8 -right-8' :
                        index === 2 ? '-bottom-8 -left-8' :
                        '-bottom-8 -right-8'
                      }`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-8 py-24">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Fonctionnalités <span className="bg-gradient-to-r from-purple-500 to-purple-400 bg-clip-text text-transparent">NyxBot</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Découvrez l'écosystème complet qui transformera votre serveur Discord.
              </p>
            </motion.div>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                delay={0.1}
                icon={<Shield size={32}/>}
                title="Administration Avancée"
                description="Contrôle total avec gestion des utilisateurs, logs détaillés, modération automatique et plus."
              />
              <FeatureCard
                delay={0.3}
                icon={<BarChart size={32}/>}
                title="Économie & Classements"
                description="Système économique intégré avec Pièces, boutique, récompenses et classements compétitifs en temps réel."
              />
              <FeatureCard
                delay={0.5}
                icon={<Gamepad2 size={32}/>}
                title="Arène Gaming"
                description="Mini-jeux interactifs, défis quotidiens et système de progression avec titres à débloquer."
              />
            </div>
          </div>
        </section>
      </div>

        {/* CTA Footer */}
        <footer className="relative border-t border-gray-700/30 mt-20 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-br from-purple-500 to-purple-400 opacity-20 blur-3xl" />
          
          <div className="relative z-10 max-w-6xl mx-auto px-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Prêt à <span className="bg-gradient-to-r from-purple-500 to-purple-400 bg-clip-text text-transparent">dominer</span> Discord ?
              </h2>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                Rejoignez-nous parmi plusieurs serveurs qui ont déjà adopté NyxBot. 
                L'installation est instantanée, les possibilités sont infinies.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href={inviteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-nyx-primary text-lg px-12 py-5 flex items-center gap-4 shadow-2xl shadow-purple-primary/40"
                  >
                    <Shield className="h-6 w-6" />
                    <span>Inviter NyxBot maintenant</span>
                    <ArrowRight className="h-6 w-6" />
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/login" className="btn-nyx-secondary text-lg px-12 py-5 flex items-center gap-4">
                    <LogIn className="h-6 w-6" />
                    <span>Découvrir le Dashboard</span>
                  </Link>
                </motion.div>
              </div>
              
              {/* Footer Info */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-16 pt-8 border-t border-gray-700/30 text-center text-gray-500"
              >
                <p>© 2025 NyxBot Dashboard. Conçu pour des potes, par un pote.</p>
              </motion.div>
            </motion.div>
          </div>
        </footer>

    </main>
  );
}
