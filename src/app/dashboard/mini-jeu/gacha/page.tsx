"use client";

import dynamic from 'next/dynamic';
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck';

// Le chargement dynamique est maintenant dans un composant client.
// ssr: false garantit qu'il ne sera jamais rendu côté serveur.
const GachaClientPage = dynamic(() => import('./GachaClientPage'), {
  ssr: false,
  loading: () => <div className="flex h-screen w-full items-center justify-center"><div className="nyx-spinner"></div></div>,
});

export default function GachaPage() {
  return (
    <WithMaintenanceCheck pageId="gacha">
      <GachaClientPage />
    </WithMaintenanceCheck>
  );
}