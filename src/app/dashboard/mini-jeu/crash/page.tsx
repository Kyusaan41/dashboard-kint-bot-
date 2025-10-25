"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CrashRedirect() {
    const router = useRouter();
    
    useEffect(() => {
        // Rediriger vers la page principale des mini-jeux
        router.replace('/dashboard/mini-jeu');
    }, [router]);
    
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">🚫 Jeu Supprimé</h1>
                <p className="text-gray-400 mb-6">Le mini-jeu Crash a été définitivement supprimé.</p>
                <p className="text-gray-500">Redirection en cours...</p>
            </div>
        </div>
    );
}