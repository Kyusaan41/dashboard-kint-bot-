'use client'

import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="futuristic-card border-cyan-500/50 p-10 text-center flex flex-col items-center max-w-lg w-full"
      >
        <motion.div
            animate={{ scale: [1, 1.1, 1]}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 flex items-center justify-center rounded-full bg-cyan-500/10 border-2 border-cyan-500/50 text-cyan-400 mb-8"
        >
            <Construction size={48} />
        </motion.div>
        
        <h1 className="text-4xl font-bold text-white mb-4 tracking-wide">
          Page en Construction
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Cette fonctionnalitÃ© est en cours de dÃ©veloppement. PrÃ©parez-vous pour des duels intenses, elle arrive trÃ¨s bientÃ´t !
        </p>
        
        <div className="futuristic-button opacity-50 cursor-not-allowed select-none">
          Prochainement
        </div>
      </motion.div>
    </div>
  )
}
