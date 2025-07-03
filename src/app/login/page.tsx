'use client';

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Image from 'next/image';

export default function LoginPage() {
  const isMaintenanceMode = process.env.NEXT_PUBLIC_BOT_MAINTENANCE_MODE === 'true';
  const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || "Le bot est actuellement en maintenance. Veuillez réessayer plus tard.";

  // AJOUT TEMPORAIRE POUR DEBUG
  useEffect(() => {
    console.log('NEXT_PUBLIC_BOT_MAINTENANCE_MODE lu:', process.env.NEXT_PUBLIC_BOT_MAINTENANCE_MODE);
    console.log('isMaintenanceMode (après parsing):', isMaintenanceMode);
    if (!isMaintenanceMode) {
      signIn("discord", { callbackUrl: "/dashboard" });
    }
  }, [isMaintenanceMode]); 
  // FIN AJOUT TEMPORAIRE

  if (isMaintenanceMode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0d13] p-4 text-white text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-6">🚧 Maintenance en cours 🚧</h1>
        <p className="text-lg text-gray-300 mb-4">{maintenanceMessage}</p>
        <p className="text-md text-gray-400 mt-4">Nous travaillons pour améliorer le service. Merci de votre patience !</p>
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