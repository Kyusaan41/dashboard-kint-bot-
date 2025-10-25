'use client'

import { MaintenanceMode } from '@/components/MaintenanceMode'

export default function MaintenancePreviewPage() {
  return (
    <div>
      <MaintenanceMode
        message="En cours de maintenance"
        reason="Nous améliorons NyxBot pour vous offrir une meilleure expérience. Nos équipes travaillent d'arrache-pied pour vous redonner accès rapidement."
        estimatedTime="Environ 30 minutes"
      />
    </div>
  )
}