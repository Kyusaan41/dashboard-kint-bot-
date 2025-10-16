"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function GachaMaintenancePage() {
    return (
        <div className="min-h-screen bg-background text-white flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
                {/* Back Button */}
                <Link href="/dashboard/mini-jeu">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Retour aux mini-jeux
                    </motion.button>
                </Link>

                {/* Maintenance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-gradient-to-br from-card-dark/80 to-purple-primary/10 rounded-3xl border border-gray-700/50 p-12 text-center backdrop-blur-sm"
                >
                    {/* Animated Icon */}
                    <motion.div
                        animate={{ 
                            rotate: [0, -10, 10, -10, 10, 0],
                            scale: [1, 1.1, 1, 1.1, 1]
                        }}
                        transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1
                        }}
                        className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/30"
                    >
                        <Wrench className="h-12 w-12 text-white" />
                    </motion.div>

                    {/* Title */}
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        Maintenance en cours
                    </h1>

                    {/* Description */}
                    <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                        Le système Gacha est actuellement en maintenance pour améliorer votre expérience de jeu.
                    </p>

                    {/* Info Boxes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-card-dark/50 rounded-xl p-6 border border-gray-700/30">
                            <Clock className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                            <h3 className="font-bold text-white mb-2">Durée estimée</h3>
                            <p className="text-gray-400 text-sm">
                                Nous travaillons activement sur les améliorations
                            </p>
                        </div>

                        <div className="bg-card-dark/50 rounded-xl p-6 border border-gray-700/30">
                            <AlertCircle className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                            <h3 className="font-bold text-white mb-2">Vos données</h3>
                            <p className="text-gray-400 text-sm">
                                Votre collection est en sécurité et sera préservée
                            </p>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="bg-purple-primary/10 border border-purple-primary/30 rounded-xl p-6">
                        <p className="text-gray-300 text-sm">
                            💜 Merci de votre patience ! Nous préparons de nouvelles fonctionnalités passionnantes pour le système Gacha.
                        </p>
                    </div>

                    {/* Back Button */}
                    <Link href="/dashboard/mini-jeu">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mt-8 px-8 py-4 bg-gradient-to-r from-purple-primary to-purple-secondary text-white font-bold rounded-xl shadow-lg shadow-purple-primary/30 hover:shadow-purple-primary/50 transition-all"
                        >
                            Découvrir les autres jeux
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Floating Particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-yellow-400/30 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                opacity: [0.3, 0.8, 0.3],
                                scale: [1, 1.5, 1],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}