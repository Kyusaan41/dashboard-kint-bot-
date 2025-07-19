'use client';

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { Loader2, ShieldAlert } from "lucide-react";
import Image from 'next/image';
import { motion } from "framer-motion";

export default function LoginPage() {
  const isMaintenanceMode = process.env.NEXT_PUBLIC_BOT_MAINTENANCE_MODE === 'true';
  const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || "Le bot est actuellement en maintenance. Veuillez réessayer plus tard.";

  useEffect(() => {
    if (!isMaintenanceMode) {
      signIn("discord", { callbackUrl: "/dashboard" });
    }
  }, [isMaintenanceMode]); 

  if (isMaintenanceMode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0C] p-4 text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="futuristic-card border-orange-500 p-8 max-w-md w-full"
        >
          <div className="relative w-32 h-32 mx-auto mb-6">
            <Image 
              src="/frog-mascot.png"
              alt="Mascotte Grenouille"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-orange-400 mb-4 flex items-center justify-center gap-3">
            <ShieldAlert size={28}/>
            Maintenance en Cours
          </h1>
          <p className="text-lg text-gray-300 mb-4">{maintenanceMessage}</p>
          <p className="text-md text-gray-400 mt-4">Nous travaillons pour améliorer le service. Merci de votre patience !</p>
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-1 bg-orange-500 rounded-full mt-8"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden">
        <div className="relative w-64 h-64">
            <motion.div 
                className="absolute inset-0 border-4 border-cyan-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div 
                className="absolute inset-4 border-2 border-white/20 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <Image 
                    src="/frog-mascot.png"
                    alt="Mascotte KINT"
                    width={160}
                    height={160}
                    priority
                />
            </div>
        </div>
        <div className="mt-12 text-center">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              <p className="text-xl font-semibold text-gray-200">
                Connexion à Discord en cours...
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Veuillez patienter, nous vous redirigeons.
            </p>
        </div>
    </div>
  );
}