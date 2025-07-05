'use client';

import Link from "next/link";
import { LogIn, UserPlus, Shield, BarChart, Settings, Bot, ArrowRight, ToyBrick, ZapIcon } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { FC, ReactNode, useEffect } from "react";
import { useInView } from "react-intersection-observer";

// --- Composants ---
const FeatureNode: FC<{
  icon: ReactNode;
  title: string;
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } }
      }}
      className="flex items-start gap-4"
    >
      <div className="mt-1 w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 text-cyan-400">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-gray-400 mt-1 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

// --- Page Principale ---
export default function Home() {
  const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1075878481498804224';
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=bot%20applications.commands&permissions=8`;

  return (
    <main className="bg-[#030014] text-white font-sans overflow-x-hidden">
      {/* Fond de particules */}
      <div className="absolute inset-0 z-0 opacity-50 bg-particle-pattern"></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#030014] via-transparent to-[#030014]"></div>

      <div className="relative z-20 max-w-6xl mx-auto px-6">
        {/* Header */}
        <header className="py-6 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
                <ZapIcon   className="text-cyan-400"/>
                KINT
            </Link>
            <Link href="/login" className="group relative inline-flex items-center px-6 py-2.5 overflow-hidden rounded-md bg-white/5 backdrop-blur-sm border border-white/10">
                <span className="absolute top-0 left-0 w-0 h-full bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                <span className="relative flex items-center gap-2 transition-colors duration-300 group-hover:text-black">
                    <LogIn size={16}/>
                    Accès Dashboard
                </span>
            </Link>
        </header>

        {/* Section Héros */}
        <section className="py-28 md:py-40 text-center">
             <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-6xl md:text-8xl font-black tracking-tight"
            >
              <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-transparent bg-clip-text">Kint</span>
            </motion.h1>
             <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-gray-300 mt-8 text-xl max-w-3xl mx-auto"
            >
              Un bot Discord tout-en-un pour la modération, les statistiques, l'économie et les jeux.
            </motion.p>
             <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-12"
            >
                <Link href="/login" className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-bold rounded-full bg-cyan-400 text-black transition-transform transform hover:scale-105 shadow-2xl shadow-cyan-400/20">
                    <LogIn size={22}/>
                    Connexion à discord
                </Link>
            </motion.div>
        </section>

        {/* Section Fonctionnalités */}
        <section className="py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="relative h-96 flex items-center justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute w-full h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full blur-3xl opacity-30"
                    />
                    <Bot size={80} className="text-white z-10"/>
                </div>
                <div className="space-y-10">
                    <FeatureNode
                        delay={0.1}
                        icon={<Shield size={24}/>}
                        title="Système de Protection"
                        description="Une modération intelligente et des logs complets pour garantir la sécurité et la sérénité de vos membres."
                    />
                    <FeatureNode
                        delay={0.3}
                        icon={<BarChart size={24}/>}
                        title="Économie & Progression"
                        description="Motivez votre communauté avec un système de monnaie, d'XP, des classements et une boutique intégrée."
                    />
                    <FeatureNode
                        delay={0.5}
                        icon={<ToyBrick size={24}/>}
                        title="Engagement Interactif"
                        description="Des titres à collectionner, des succès à débloquer et des mini-jeux pour une expérience toujours renouvelée."
                    />
                </div>
            </div>
        </section>
      </div>

       {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
             <h2 className="text-4xl font-bold mb-4">Connectez Kint à votre serveur.</h2>
             <p className="text-gray-500 mb-8 max-w-xl mx-auto">
                L'installation ne prend qu'un instant. Le potentiel est infini.
             </p>
             <Link href={inviteUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white transition-transform transform hover:scale-105 shadow-2xl shadow-cyan-500/20">
                Inviter le Bot
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1"/>
            </Link>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes move-particles {
            from { background-position: 0 0; }
            to { background-position: 10000px 5000px; }
        }
        .bg-particle-pattern {
            background-image: url(https://www.script-tutorials.com/demos/360/images/stars.png);
            animation: move-particles 200s linear infinite;
        }
      `}</style>
    </main>
  );
}