'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

// On définit un type pour nos patchnotes
type PatchNote = {
  version: string;
  date: string;
  notes: string[];
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [patchNotes, setPatchNotes] = useState<PatchNote | null>(null);

  useEffect(() => {
    // Dans un cas réel, vous feriez un appel à votre API.
    // Pour cet exemple, on les définit directement.
    const latestPatchNotes = {
      version: '1.2.0',
      date: '03 Juillet 2025',
      notes: [
        'Le Dashboard est maintenant en ligne !',
        'Correction de tous les problèmes de déploiement (enfin !).',
        'Restauration des fonctionnalités des pages principales.',
        'Préparation pour de nouvelles fonctionnalités à venir.',
      ],
    };
    setPatchNotes(latestPatchNotes);
  }, []);

  if (status === 'loading') {
    return <div className="text-center text-gray-400 animate-pulse">Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">
          Bienvenue, <span className="text-cyan-400">{session?.user?.name || 'Utilisateur'}</span> !
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Ravi de vous revoir. Voici les dernières nouvelles concernant le bot et le serveur.
        </p>
      </div>

      {patchNotes && (
        <div className="bg-[#12151d] border border-cyan-700 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-cyan-400 mb-3">
            Notes de mise à jour - Version {patchNotes.version}
          </h2>
          <p className="text-sm text-gray-500 mb-4">Publié le {patchNotes.date}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            {patchNotes.notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}