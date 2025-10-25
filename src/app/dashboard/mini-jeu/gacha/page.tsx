"use client";

import dynamic from 'next/dynamic';
import { WithMaintenanceCheck } from '@/components/WithMaintenanceCheck';
import GachaLoader from './GachaLoader';

export default function GachaPage() {
  return (
    <WithMaintenanceCheck pageId="mini-jeu-gacha">
      {() => {
        const GachaClientPage = dynamic(() => import('./GachaClientPage'), { ssr: false });
        return <GachaClientPage />;
      }}
    </WithMaintenanceCheck>
  );
}