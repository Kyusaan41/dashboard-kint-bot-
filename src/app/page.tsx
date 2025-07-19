'use client';

import Link from "next/link";
import { LogIn, ArrowRight, Shield, BarChart, ToyBrick, ZapIcon } from "lucide-react";
import { motion } from "framer-motion";
import { FC, ReactNode, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

// --- COMPOSANTS UI CORRIGÉS ---
const FeatureCard: FC<{
  icon: ReactNode;
  title: string;
  description: string;
  delay: number; // <-- La prop 'delay' est de retour
  className?: string;
}> = ({ icon, title, description, delay, className }) => {
  return (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, delay }} // <-- 'delay' est utilisé ici
        className={`futuristic-card p-6 items-center flex flex-col group relative overflow-hidden ${className}`}
    >
      <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-2 border-white/10 text-cyan-400 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-400 mt-2 leading-relaxed flex-grow text-center">{description}</p>
      <div className="scan-line" />
    </motion.div>
  );
};

// --- PAGE PRINCIPALE ---
export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);


  const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1075878481498804224';
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=bot%20applications.commands&permissions=8`;

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030014] text-white">
        <p className="animate-pulse">Chargement...</p>
      </div>
    );
  }
  
  return (
    <main className="bg-[#030014] text-white font-sans overflow-x-hidden">
      <div className="absolute inset-0 z-0 opacity-50 bg-particle-pattern"></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0A0A0C] via-transparent to-[#121218]"></div>

      <div className="relative z-20 max-w-7xl mx-auto px-6">
        <header className="py-6 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
                <ZapIcon className="text-cyan-400"/>
                KINT
            </Link>
            <Link href="/login" className="futuristic-button">
                <LogIn size={16}/>
                <span>Accès Dashboard</span>
            </Link>
        </header>

        <section className="py-24 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
                 <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-black tracking-tight"
                >
                  <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-transparent bg-clip-text">Le Dashboard Kint</span> est arrivé.
                </motion.h1>
                 <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-gray-300 mt-8 text-xl max-w-xl mx-auto lg:mx-0"
                >
                  Gérez la modération, l'économie, les statistiques et les jeux de votre serveur Discord depuis une interface unique et intuitive.
                </motion.p>
                 <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-12"
                >
                    <Link href="/login" className="futuristic-button text-lg">
                        <LogIn size={22}/>
                        <span>Se connecter avec Discord</span>
                    </Link>
                </motion.div>
            </div>
            <div className="relative h-96 flex items-center justify-center">
                <motion.div 
                    className="absolute w-80 h-96 bg-cyan-500/10 hexagon"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />
                 <motion.div 
                    className="absolute w-96 h-[28rem] bg-purple-500/10 hexagon"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5, type: 'spring' }}
                >
                    <Image 
                        src="/frog-mascot.png"
                        alt="Mascotte Grenouille Kint"
                        width={256}
                        height={256}
                        priority
                        className="drop-shadow-2xl"
                    />
                </motion.div>
            </div>
        </section>

        <section className="py-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                    delay={0.1}
                    icon={<Shield size={28}/>}
                    title="Protection Avancée"
                    description="Gardez le contrôle avec un système de modération intelligent et des journaux d'événements détaillés."
                />
                <FeatureCard
                    delay={0.3}
                    icon={<BarChart size={28}/>}
                    title="Économie & Progression"
                    description="Stimulez l'engagement grâce à un système de monnaie, d'XP, des classements et une boutique intégrée."
                />
                <FeatureCard
                    delay={0.5}
                    icon={<ToyBrick size={28}/>}
                    title="Engagement Ludique"
                    description="Rendez votre communauté unique avec des titres à collectionner, des succès et des mini-jeux interactifs."
                />
            </div>
        </section>
      </div>

      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
             <h2 className="text-4xl font-bold mb-4">Prêt à transformer votre serveur ?</h2>
             <p className="text-gray-500 mb-8 max-w-xl mx-auto">
                L'installation ne prend qu'un instant. Le potentiel est infini.
             </p>
             <Link href={inviteUrl} target="_blank" rel="noopener noreferrer" className="futuristic-button text-lg">
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