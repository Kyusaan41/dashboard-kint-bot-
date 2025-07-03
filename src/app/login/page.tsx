'use client';

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Image from 'next/image';

export default function LoginPage() {
  const isMaintenanceMode = process.env.NEXT_PUBLIC_BOT_MAINTENANCE_MODE === 'true';
  const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || "Le bot est actuellement en maintenance. Veuillez réessayer plus tard.";

  // Supprimons les logs de debug temporaires pour le code final
  useEffect(() => {
    if (!isMaintenanceMode) {
      signIn("discord", { callbackUrl: "/dashboard" });
    }
  }, [isMaintenanceMode]); 

  if (isMaintenanceMode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0d13] p-4 text-white text-center">
        {/* Grenouille au-dessus de "Maintenance en cours" */}
        <div className="relative w-48 h-48 mb-6 animate-bounce-slow"> {/* animate-bounce-slow sera défini dans globals.css */}
          <Image 
            src="/frog-mascot.png" // Assurez-vous que ce chemin est correct
            alt="Mascotte Grenouille"
            layout="fill"
            objectFit="contain"
            priority
          />
        </div>

        {/* Titre clignotant */}
        <h1 className="text-4xl font-bold text-red-500 mb-6 animate-pulse-slow"> {/* animate-pulse-slow sera défini dans globals.css */}
          🚧 Maintenance en cours 🚧
        </h1>
        <p className="text-lg text-gray-300 mb-4">{maintenanceMessage}</p>
        <p className="text-md text-gray-400 mt-4">Nous travaillons pour améliorer le service. Merci de votre patience !</p>
        
        {/* Effet de lumière sur les barrières (via classes CSS) */}
        <div className="flex mt-8 space-x-4">
            <span className="text-6xl animate-light-pulse-red">🚨</span>
            <span className="text-6xl animate-light-pulse-blue">🚨</span>
        </div>
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