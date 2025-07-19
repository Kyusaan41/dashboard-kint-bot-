'use client';

import Link from "next/link";
import { LogIn, UserPlus, Shield, BarChart, Settings, Bot, ArrowRight, ToyBrick, ZapIcon } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { FC, ReactNode, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
      className="flex items-start gap-4 p-4 rounded-lg transition-all duration-300 hover:bg-white/5"
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

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1075878481498804224';
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=bot%20applications.commands&permissions=8`;

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        <p className="animate-pulse">Chargement de la session...</p>
      </div>
    );
  }

  return (
    <main className="text-white font-sans overflow-x-hidden">
      <div className="absolute inset-0 z-0 opacity-50 bg-particle-pattern"></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0A0A0C] via-transparent to-[#121218]"></div>

      <div className="relative z-20 max-w-6xl mx-auto px-6">
        <header className="py-6 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
                <ZapIcon className="text-cyan-400"/>
                KINT
            </Link>
            {status !== 'authenticated' && (
                <Link href="/login" className="futuristic-button">
                    <LogIn size={16}/>
                    <span>Accès Dashboard</span>
                </Link>
            )}
        </header>

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
                {status !== 'authenticated' && (
                    <Link href="/login" className="futuristic-button text-lg">
                        <LogIn size={22}/>
                        <span>Connexion à discord</span>
                    </Link>
                )}
            </motion.div>
        </section>

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

      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
             <h2 className="text-4xl font-bold mb-4">Connectez Kint à votre serveur.</h2>
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