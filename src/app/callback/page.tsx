'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// On crÃ©e un composant interne pour utiliser les hooks
function CallbackProcessor() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Cette logique s'exÃ©cutera cÃ´tÃ© client aprÃ¨s le chargement
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            console.error('Erreur de callback OAuth:', error);
            // Redirige vers la page de connexion avec un message d'erreur
            router.push('/login?error=authentication_failed');
        } else if (code) {
            // Le code a Ã©tÃ© reÃ§u avec succÃ¨s.
            // NextAuth va le gÃ©rer automatiquement en coulisses.
            // On redirige simplement l'utilisateur vers son tableau de bord.
            console.log('Authentification rÃ©ussie, redirection vers le dashboard...');
            router.push('/dashboard');
        } else {
            // Cas improbable oÃ¹ ni code ni erreur ne sont prÃ©sents
            router.push('/login?error=unexpected_callback');
        }
    }, [router, searchParams]);

    // Message affichÃ© pendant le traitement
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-900">
            <p className="text-xl text-white animate-pulse">Finalisation de la connexion...</p>
        </div>
    );
}

// La page principale exportÃ©e, qui utilise Suspense
export default function CallbackPage() {
    // Suspense affiche un "fallback" (ici un message "Chargement...")
    // pendant que le composant enfant attend les donnÃ©es client.
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">Chargement...</div>}>
            <CallbackProcessor />
        </Suspense>
    );
}
