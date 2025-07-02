'use client';

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react"; // On importe une icône pour l'animation
import Image from 'next/image'; // On importe le composant Image de Next.js

export default function LoginPage() {
  // Ce hook se déclenche une seule fois et lance la connexion avec Discord
  useEffect(() => {
    signIn("discord", { callbackUrl: "/dashboard" });
  }, []);

  // Pendant la redirection, on affiche la nouvelle page de chargement
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#202225] p-4">
      <div className="flex flex-col items-center space-y-6 text-center">
        
        {/* --- La Grenouille qui Danse --- */}
        <div className="relative w-64 h-64">
          <Image 
            src="http://googleusercontent.com/image_generation_content/0" 
            alt="Grenouille qui danse avec une pancarte KINT By Kyû"
            layout="fill"
            objectFit="contain"
            priority // On charge l'image en priorité pour qu'elle s'affiche vite
          />
        </div>
        
        {/* --- Le Message de Connexion --- */}
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