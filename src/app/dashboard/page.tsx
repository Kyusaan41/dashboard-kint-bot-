'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

// --- Définition des types pour les données de la page ---
type Message = {
  id: string;
  title: string;
  content: string;
  author: string;
};

type PatchNote = {
  version: string;
  date: string;
  changes: string[];
};

// --- Le composant principal de la page d'accueil ---
export default function DashboardHomePage() {
  const { data: session, status } = useSession();
  
  // On utilise des états pour les messages et patchnotes, comme prévu
  const [messages, setMessages] = useState<Message[]>([]);
  const [patchNotes, setPatchNotes] = useState<PatchNote | null>(null);

  useEffect(() => {
    // Cette fonction s'exécute pour charger les données nécessaires à la page d'accueil
    const loadHomepageData = async () => {
      // Dans une application réelle, vous appelleriez vos API ici.
      // Exemple: const messageData = await fetch('/api/messages').then(res => res.json());
      
      // Données factices pour l'exemple, fidèles à la structure que vous aviez
      const serverMessages: Message[] = [
        { 
          id: 'msg1', 
          title: 'Bienvenue sur le nouveau Dashboard !', 
          content: 'Nous sommes ravis de vous présenter la nouvelle interface. N\'hésitez pas à explorer les différentes sections et à nous faire vos retours.',
          author: 'L\'équipe des admins'
        }
      ];

      const latestPatchNotes: PatchNote = {
        version: '1.2.2',
        date: '03 Juillet 2025',
        changes: [
          'Déploiement initial du Dashboard réussi.',
          'Interface d\'accueil restaurée selon le design original.',
          'Préparation des pages de mini-jeux et de la boutique.'
        ],
      };

      setMessages(serverMessages);
      setPatchNotes(latestPatchNotes);
    };

    loadHomepageData();
  }, []); // Le tableau vide signifie que cela ne s'exécute qu'une fois

  // On affiche un état de chargement propre
  if (status === 'loading') {
    return <div className="text-center text-gray-400 animate-pulse">Chargement de la page d'accueil...</div>;
  }

  return (
    <div className="space-y-8">
      {/* --- Section de Bienvenue --- */}
      <div>
        <h1 className="text-4xl font-bold text-white">
          Tableau de bord de KINT
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Bonjour, <span className="font-semibold text-cyan-400">{session?.user?.name}</span>. Voici les informations importantes du serveur.
        </p>
      </div>

      {/* --- Section des Messages --- */}
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="bg-[#12151d] border border-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-cyan-400">{message.title}</h2>
            <p className="mt-2 text-gray-300">{message.content}</p>
            <p className="text-right text-sm text-gray-500 mt-4">- {message.author}</p>
          </div>
        ))}
      </div>

      {/* --- Section des Patch Notes --- */}
      {patchNotes && (
        <div className="bg-[#12151d] border border-gray-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-cyan-400 mb-3">
            Dernières Notes de Mise à Jour (v{patchNotes.version})
          </h2>
          <p className="text-sm text-gray-500 mb-4">Date : {patchNotes.date}</p>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            {patchNotes.changes.map((change, index) => (
              <li key={index}>{change}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}