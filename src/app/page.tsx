'use client';

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import Image from "next/image";

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0d13] text-white px-6 py-16 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-[-150px] left-[-120px] w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500 to-blue-400 opacity-25 rounded-full blur-[120px] z-0" />
      <div className="absolute bottom-[-130px] right-[-130px] w-[500px] h-[500px] bg-gradient-to-br from-blue-600 to-cyan-600 opacity-20 rounded-full blur-[100px] z-0" />

      {/* Hero section */}
      <section className="relative z-10 flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto">
        <div className="text-center lg:text-left max-w-xl" data-aos="fade-right">
          <h1 className="text-6xl md:text-7xl font-extrabold leading-tight bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text drop-shadow-lg">
            Kint ⚡
          </h1>
          <p className="text-gray-400 mt-6 text-lg md:text-xl max-w-lg mx-auto lg:mx-0">
            Le bot tout-en-un pour modération, sondages, logs, réactions et plus. Rapide, fiable et puissant.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-6">
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 text-lg font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 shadow-lg text-white transition-transform transform hover:scale-105"
            >
              <LogIn className="mr-2 h-5 w-5" /> Connexion Discord
            </Link>

            <Link
              href="https://discord.com/oauth2/authorize?client_id=TON_CLIENT_ID&scope=bot%20applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 text-lg font-semibold rounded-lg border border-cyan-500 text-cyan-400 hover:bg-cyan-900/30 shadow-md transition-transform transform hover:scale-105"
            >
              <UserPlus className="mr-2 h-5 w-5" /> Inviter le bot
            </Link>
          </div>
        </div>

        <div
          className="mt-16 lg:mt-0 lg:ml-20 animate-float"
          data-aos="fade-left"
          style={{ willChange: "transform" }}
        >
          <Image
            src="/frog-mascot.png"
            alt="Illustration bot Discord"
            width={720}
            height={720}
            className="rounded-2xl shadow-2xl"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-28 max-w-5xl mx-auto z-10 relative">
        {[
          { title: "+20", subtitle: "Commandes disponibles" },
          { title: "Modération", subtitle: "Gère les membres grâce au Dashboard." },
          { title: "Modifie", subtitle: "Ajoutes des fonctionnalités au bot !" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-[#12151d]/70 border border-cyan-600/40 rounded-3xl p-8 text-center shadow-lg backdrop-blur-sm hover:scale-105 transition-transform duration-300 cursor-pointer"
            data-aos="zoom-in"
          >
            <h2 className="text-5xl font-extrabold text-cyan-400 drop-shadow-md">{stat.title}</h2>
            <p className="text-gray-300 mt-3 text-md">{stat.subtitle}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-36 text-gray-500 text-sm text-center z-10 relative select-none">
        © 2025 Kint. Tous droits réservés à Kyû.
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
