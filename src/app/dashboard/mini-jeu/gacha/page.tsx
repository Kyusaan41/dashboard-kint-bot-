import dynamic from 'next/dynamic';
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck';

// ✨ CORRECTION DÉFINITIVE: Utiliser le chargement dynamique pour le composant client.
// ssr: false garantit qu'il ne sera jamais rendu côté serveur,
// ce qui empêche toute interférence avec la vérification de maintenance.
const GachaClientPage = dynamic(() => import('./GachaClientPage'), {
  ssr: false,
  // Optionnel: afficher un loader pendant que le composant client charge
  loading: () => <div className="flex h-screen w-full items-center justify-center"><div className="nyx-spinner"></div></div>,
});

/**
 * C'est un Composant Serveur.
 * Il enveloppe la page client du Gacha avec le vérificateur de maintenance.
 * La vérification a lieu AVANT même que le composant client ne soit chargé.
 */
export default function GachaPage() {
  return (
    <WithMaintenanceCheck pageId="gacha">
      <GachaClientPage />
    </WithMaintenanceCheck>
  );
}