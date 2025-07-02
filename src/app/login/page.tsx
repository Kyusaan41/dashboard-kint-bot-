'use client';

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Image from 'next/image';

export default function LoginPage() {
  // Déclenche la connexion avec Discord au chargement de la page
  useEffect(() => {
    signIn("discord", { callbackUrl: "/dashboard" });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#202225] p-4 overflow-hidden">
      <div className="flex flex-col items-center space-y-6 text-center">
        
        {/* L'image de la grenouille, maintenant avec son animation */}
        <div className="relative w-64 h-64 animate-sway"> {/* <-- MODIFICATION ICI */}
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