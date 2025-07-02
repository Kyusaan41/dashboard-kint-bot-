'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('Aucun code OAuth reçu');
      return;
    }

    async function fetchToken() {
      try {
        // Récupération du token
        const resToken = await fetch('/api/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!resToken.ok) throw new Error('Erreur lors de la récupération du token');
        const tokenData = await resToken.json();

        // Récupération des infos utilisateur
        const resUser = await fetch('/api/auth/user', {
          headers: { Authorization: `${tokenData.token_type} ${tokenData.access_token}` },
        });

        if (!resUser.ok) throw new Error('Erreur lors de la récupération des infos utilisateur');
        const userData = await resUser.json();

        // Stocker dans localStorage (ou context global, etc.)
        localStorage.setItem('token', JSON.stringify(tokenData));
        localStorage.setItem('user', JSON.stringify(userData));

        router.push('/dashboard');
      } catch (e: any) {
        setError(e.message || 'Erreur inconnue');
      }
    }

    fetchToken();
  }, [searchParams, router]);

  if (error) return <p>Erreur : {error}</p>;
  return <p>Connexion en cours...</p>;
}
