'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Award, FileText, Sparkles } from 'lucide-react'; // Icônes pour l'UI

// --- Définition des types pour nos données ---
type PatchNote = {
  version: string;
  date: string;
  notes: string[];
};

type Success = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
};

// --- Le composant principal de la page ---
export default function DashboardHomePage() {
  const { data: session, status } = useSession();
  const [patchNotes, setPatchNotes] = useState<PatchNote | null>(null);
  const [successes, setSuccesses] = useState<Success[]>([]);

  useEffect(() => {
    // Cette fonction s'exécute une seule fois au chargement de la page
    const fetchData = async () => {
      if (session?.user?.id) {
        // Dans une application réelle, vous appelleriez votre API ici
        // const [patchData, successData] = await Promise.all([
        //   fetch('/api/patchnote'),
        //   fetch(`/api/success/${session.user.id}`)
        // ]);
        
        // Pour l'exemple, on utilise des données factices :
        const latestPatchNotes = {
          version: '1.2.1',
          date: '03 Juillet 2025',
          notes: [
            'Le Dashboard est maintenant en ligne et stable.',
            'Amélioration de la gestion des erreurs sur la page Admin.',
            'Restauration de toutes les fonctionnalités de base.',
            'Le système de connexion avec Discord est 100% opérationnel.',
          ],
        };
        const userSuccesses = [
            { id: 'first_login', name: 'Premiers Pas', description: 'Vous vous êtes connecté au dashboard.', unlocked: true },
            { id: 'deploy_success', name: 'Le Conquérant de Vercel', description: 'Vous avez vaincu le cache de Vercel.', unlocked: true },
            { id: 'bug_hunter', name: 'Chasseur de Bugs', description: 'Vous avez trouvé votre premier bug.', unlocked: false },
        ];

        setPatchNotes(latestPatchNotes);
        setSuccesses(userSuccesses);
      }
    };

    fetchData();
  }, [session]); // Se redéclenche si la session change

  // Affiche un message de chargement tant que la session n'est pas prête
  if (status === 'loading') {
    return <div className="text-center text-gray-400 animate-pulse">Chargement de votre univers...</div>;
  }

  return (
    <div className="space-y-10">
      {/* --- Section de Bienvenue --- */}
      <div>
        <h1 className="text-4xl font-bold text-white flex items-center">
          <Sparkles className="h-8 w-8 text-cyan-400 mr-3" />
          Bienvenue, <span className="text-cyan-400 ml-2">{session?.user?.name || 'Héro'}</span> !
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Votre QG personnel. Suivez votre progression et découvrez les nouveautés.
        </p>
      </div>

      {/* --- Grille pour les deux colonnes : Patch Notes et Succès --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- Section Patch Notes --- */}
        {patchNotes && (
          <div className="bg-[#12151d] border border-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-cyan-400 mb-3 flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              Notes de mise à jour - v{patchNotes.version}
            </h2>
            <p className="text-sm text-gray-500 mb-4">Publié le {patchNotes.date}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              {patchNotes.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        {/* --- Section Succès --- */}
        <div className="bg-[#12151d] border border-gray-700 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center">
            <Award className="h-6 w-6 mr-2" />
            Succès Récents
          </h2>
          <div className="space-y-4">
            {successes.map((succes) => (
              <div key={succes.id} className={`p-4 rounded-md transition-opacity ${succes.unlocked ? 'bg-green-600/20' : 'bg-gray-700/50 opacity-60'}`}>
                <p className="font-bold">{succes.name}</p>
                <p className="text-sm text-gray-400">{succes.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}