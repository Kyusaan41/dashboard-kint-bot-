'use client';

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Image from 'next/image';

export default function LoginPage() {
  const isMaintenanceMode = process.env.NEXT_PUBLIC_BOT_MAINTENANCE_MODE === 'true';
  const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || "Le site est actuellement en maintenance. Veuillez réessayer plus tard.";

  useEffect(() => {
    if (!isMaintenanceMode) {
      signIn("discord", { callbackUrl: "/dashboard" });
    }
  }, [isMaintenanceMode]); 

  if (isMaintenanceMode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0d13] p-4 text-white text-center">
        {/* Grenouille au-dessus de "Maintenance en cours" */}
        <div className="relative w-48 h-48 mb-6 frog-animation"> {/* Utilisez la classe CSS directe */}
          <Image 
            src="/frog-mascot.png"
            alt="Mascotte Grenouille"
            layout="fill"
            objectFit="contain"
            priority
          />
        </div>

        {/* Titre clignotant */}
        <h1 className="text-4xl font-bold text-red-500 mb-6 maintenance-text"> {/* Utilisez la classe CSS directe */}
          🚧 Maintenance en cours 🚧
        </h1>
        <p className="text-lg text-gray-300 mb-4">{maintenanceMessage}</p>
        <p className="text-md text-gray-400 mt-4">Nous travaillons pour améliorer le service. Merci de votre patience !</p>
        
        {/* Effet de lumière sur les barrières (via classes CSS directes) */}
        <div className="flex mt-8 space-x-4">
            <span className="text-6xl police-light-red">🚨</span> {/* Utilisez la classe CSS directe */}
            <span className="text-6xl police-light-blue">🚨</span>{/* Utilisez la classe CSS directe */}
        </div>

        {/* Styles d'animation directement dans le composant */}
        <style jsx>{`
          /* Animation pour la grenouille sur la page de maintenance */
          .frog-animation {
            animation: bounce-slow 2s ease-in-out infinite;
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          /* Animation pour le texte "Maintenance en cours" */
          .maintenance-text {
            animation: pulse-slow 2s ease-in-out infinite;
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          /* Animations pour les effets de lumière des gyrophares */
          .police-light-red {
            animation: light-pulse-red 1.5s ease-in-out infinite;
          }
          @keyframes light-pulse-red {
            0%, 100% { text-shadow: 0 0 5px rgba(255, 0, 0, 0.5), 0 0 10px rgba(255, 0, 0, 0.3); }
            50% { text-shadow: 0 0 20px rgba(255, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.6); }
          }

          .police-light-blue {
            animation: light-pulse-blue 1.5s ease-in-out infinite;
            animation-delay: 0.75s; /* Décalage pour un effet alterné */
          }
          @keyframes light-pulse-blue {
            0%, 100% { text-shadow: 0 0 5px rgba(0, 0, 255, 0.5), 0 0 10px rgba(0, 0, 255, 0.3); }
            50% { text-shadow: 0 0 20px rgba(0, 0, 255, 0.8), 0 0 30px rgba(0, 0, 255, 0.6); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#202225] p-4 overflow-hidden">
      <div className="flex flex-col items-center space-y-6 text-center">
        
        {/* L'image de la grenouille, maintenant avec son animation */}
        <div className="relative w-64 h-64 animate-sway">
          <Image 
            src="/frog-mascot.png"
            alt="Grenouille qui danse avec une pancarte KINT By Kyû"
            layout="fill"
            objectFit="contain"
            priority
          />
        </div>
        
        {/* Le message de connexion */}
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          <p className="text-xl font-semibold text-gray-200">
            Connexion à Discord en cours...
          </p>
        </div>
        
        <p className="text-sm text-gray-500">
          Veuillez patienter, nous vous redirigeons.
        </p>
      </div>
    </div>
  );
}