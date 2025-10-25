import { useEffect, useState } from 'react'

interface MaintenanceStatus {
  isUnderMaintenance: boolean
  message?: string
  reason?: string
  estimatedTime?: string
}

export function useMaintenanceMode(pageId?: string): MaintenanceStatus {
  const [status, setStatus] = useState<MaintenanceStatus>({
    isUnderMaintenance: false
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        // Check global maintenance mode first
        const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE
        const globalMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'

        if (globalMaintenanceMode) {
          setStatus({
            isUnderMaintenance: true,
            message: 'En cours de maintenance',
            reason: maintenanceMessage || 'Le service est temporairement indisponible',
            estimatedTime: 'Environ 30 minutes'
          })
          setIsLoading(false)
          return
        }

        // Check page-specific maintenance if pageId is provided
        if (pageId) {
          const response = await fetch(`/api/maintenance-status?pageId=${pageId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.maintenance) {
              setStatus({
                isUnderMaintenance: true,
                message: data.message || 'En cours de maintenance',
                reason: data.reason || 'Cette page est en maintenance',
                estimatedTime: data.estimatedTime || 'Environ 30 minutes'
              })
            }
          }
        }
      } catch (error) {
        console.error('Error checking maintenance status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkMaintenance()
    
    // Check every 10 seconds if under maintenance
    const interval = setInterval(checkMaintenance, 10000)
    
    return () => clearInterval(interval)
  }, [pageId])

  return status
}