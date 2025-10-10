'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquare, Send, X, ThumbsUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fonction API que nous crÃ©erons Ã  l'Ã©tape 3
async function submitFeedback(feedbackText: string) {
    const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackText }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Une erreur est survenue.');
    }
    return response.json();
}


export default function FeedbackWidget() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedbackText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await submitFeedback(feedbackText);
            setIsSubmitted(true);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Impossible d\'envoyer le feedback.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetWidget = () => {
        setIsOpen(false);
        setTimeout(() => {
            setFeedbackText('');
            setIsSubmitted(false);
        }, 300); // Attend la fin de l'animation de fermeture
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="w-80 bg-[#1c222c] border border-cyan-700/50 rounded-xl shadow-2xl p-6"
                    >
                        {isSubmitted ? (
                            <div className="text-center">
                                <ThumbsUp className="mx-auto h-12 w-12 text-green-500" />
                                <h3 className="mt-4 font-bold text-lg text-white">Merci !</h3>
                                <p className="mt-2 text-sm text-gray-300">
                                    KyÃ» a bien reÃ§u ton avis ðŸ‘ðŸ¼ ! Merci beaucoup de participer au dÃ©veloppement de KINT ! â£ï¸
                                </p>
                                <button
                                    onClick={resetWidget}
                                    className="mt-6 w-full px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold transition hover:bg-cyan-700"
                                >
                                    Fermer
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-white">Ton avis compte !</h3>
                                    <button type="button" onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-400 mb-1">En tant que :</p>
                                <p className="w-full bg-black/20 p-2 rounded-md text-cyan-400 font-semibold mb-4">{session?.user?.name || 'Utilisateur'}</p>
                                
                                <textarea
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    placeholder="Ã‰cris ton feedback ici..."
                                    className="w-full h-28 p-2 bg-[#12151d] border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold transition hover:bg-cyan-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                                    Envoyer Ã  KyÃ»
                                </button>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg text-white"
                style={{ display: isOpen ? 'none' : 'flex' }}
            >
                <MessageSquare size={28} />
            </motion.button>
        </div>
    );
}
