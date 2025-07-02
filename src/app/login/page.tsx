'use client';

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react"; // On importe une icône pour l'animation

export default function LoginPage() {
  // Ce hook se déclenche une seule fois et lance la connexion avec Discord
  useEffect(() => {
    signIn("discord", { callbackUrl: "/dashboard" });
  }, []);

  // Pendant la redirection, on affiche une belle page de chargement
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#202225]">
      <div className="flex flex-col items-center space-y-4">
        {/* L'icône animée qui tourne sur elle-même */}
        <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
        
        {/* Le texte demandé */}
        <p className="text-xl font-semibold text-gray-200">
          Connexion à Discord en cours...
        </p>
        
        <p className="text-sm text-gray-500">
          Veuillez patienter, nous vous redirigeons.
        </p>
      </div>
    </div>
  );
}