'use client';

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, ShieldAlert, Bot, Zap, Crown, Sparkles } from "lucide-react";
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const isMaintenanceMode = process.env.NEXT_PUBLIC_BOT_MAINTENANCE_MODE === 'true';
  const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || "NyxBot est actuellement en maintenance. Veuillez réessayer plus tard.";

  const handleLogin = () => {
    setIsLoading(true);
    signIn("discord", { callbackUrl: "/dashboard" });
  };

  if (isMaintenanceMode) {
    return (
      <div className="min-h-screen bg-gradient-nyx flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="nyx-card-glass p-8 max-w-md w-full text-center"
        >
          <motion.div 
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-400 rounded-full flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ShieldAlert size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient-purple mb-4">
            Maintenance en Cours
          </h1>
          <p className="text-gray-300 mb-6">{maintenanceMessage}</p>
          <p className="text-sm text-gray-400">Nous travaillons pour améliorer NyxBot. Merci de votre patience !</p>
          <motion.div 
            className="w-full h-2 bg-gray-700 rounded-full mt-6 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
              animate={{ x: [-100, 100] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              style={{ width: "30%" }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-nyx overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-primary/10 rounded-full blur-3xl animate-pulse-purple"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-darker/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-md"
          >
            <motion.div
              className="mb-8"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-400 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-purple-500 to-purple-400 rounded-2xl flex items-center justify-center">
                  <Bot size={64} className="text-white" />
                </div>
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-6xl font-bold text-gradient-purple mb-4 text-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              NyxBot
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-300 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              La plateforme de gestion Discord la plus avancée
            </motion.p>
            
            <motion.div 
              className="grid grid-cols-1 gap-4 text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <div className="flex items-center gap-3 text-gray-300">
                <Zap size={20} className="text-purple-secondary" />
                <span>Gestion ultra-rapide</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Crown size={20} className="text-purple-secondary" />
                <span>Interface premium</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Sparkles size={20} className="text-purple-secondary" />
                <span>Expérience utilisateur optimale</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <div className="nyx-card p-8">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-400 rounded-xl flex items-center justify-center">
                  <Bot size={32} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gradient-purple">NyxBot</h1>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Bienvenue !
                </h2>
                <p className="text-gray-400">
                  Connectez-vous avec Discord pour accéder au dashboard
                </p>
              </div>

              <AnimatePresence>
                {!isLoading ? (
                  <motion.button
                    onClick={handleLogin}
                    className="w-full btn-nyx-primary text-lg py-4 flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 2.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-2.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Se connecter avec Discord
                  </motion.button>
                ) : (
                  <motion.div
                    className="w-full py-4 flex items-center justify-center gap-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="nyx-spinner"></div>
                    <span className="text-gray-300">Connexion en cours...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500">
                  En vous connectant, vous acceptez nos conditions d'utilisation
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
