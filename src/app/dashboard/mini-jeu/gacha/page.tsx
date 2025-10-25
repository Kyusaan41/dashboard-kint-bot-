import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck';
import GachaClientPage from './GachaClientPage'; // Importer le composant client

/**
 * C'est un Composant Serveur.
 * Il enveloppe la page client du Gacha avec le vérificateur de maintenance.
 * Cela garantit que la vérification a lieu avant que le code client ne soit exécuté.
 */
export default function GachaPage() {
  return (
    <WithMaintenanceCheck pageId="gacha">
      <GachaClientPage />
    </WithMaintenanceCheck>
  );
}