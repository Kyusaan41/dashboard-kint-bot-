// src/components/InteractionPopup.tsx

'use client';

import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';

// Le type de l'événement d'interaction
type ItemUsedEvent = {
    interactionId: string;
    itemId: string;
    itemName: string;
    fromUser: {
        id: string;
        username: string;
    };
    champName?: string;
};

// Props que le composant va recevoir
interface InteractionPopupProps {
    event: ItemUsedEvent | null;
    onResponse: (accepted: boolean) => void;
}

export default function InteractionPopup({ event, onResponse }: InteractionPopupProps) {
    if (!event) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.9 }}
                className="bg-[#1c222c] p-8 rounded-2xl border border-amber-500 w-full max-w-md shadow-2xl text-center"
            >
               <Swords className="mx-auto h-12 w-12 text-amber-400" />
               <h3 className="text-2xl font-bold text-white mt-4">Demande d'interaction !</h3>
               <p className="text-gray-300 mt-2">
                   <span className="font-bold text-cyan-400">{event.fromUser.username}</span>
                   souhaite utiliser l'objet
                   <span className="font-bold text-amber-400"> "{event.itemName}" </span>
                   sur vous.
                   {event.champName && ` (Champion: ${event.champName})`}
               </p>
               <p className="text-gray-400 text-sm mt-1">Acceptez-vous ?</p>
               <div className="flex justify-center gap-4 mt-8">
                   <motion.button whileTap={{scale:0.95}} onClick={() => onResponse(false)} className="px-8 py-3 bg-red-600 rounded-lg hover:bg-red-700 font-bold transition">Refuser</motion.button>
                   <motion.button whileTap={{scale:0.95}} onClick={() => onResponse(true)} className="px-8 py-3 bg-green-600 rounded-lg hover:bg-green-700 font-bold transition">Accepter</motion.button>
               </div>
            </motion.div>
        </div>
    );
}