'use client'

import { ReactNode, useEffect, useState } from 'react'
import { MaintenanceMode } from './MaintenanceMode'

interface WithMaintenanceCheckProps {
  children: ReactNode
  pageId?: string
}

/**
 * Wrapper component to check maintenance status and show maintenance page if needed
 * Automatically checks global maintenance mode and page-specific maintenance
 */
export function WithMaintenanceCheck({ 
  children, 
  pageId 
}: WithMaintenanceCheckProps) {
  const [isMaintenance, setIsMaintenance] = useState(false)
  const [maintenanceData, setMaintenanceData] = useState({
    message: 'En cours de maintenance',
    reason: 'Le service est temporairement indisponible',
    estimatedTime: 'Environ 30 minutes'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        // First check environment variable
        const globalMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
        
        if (globalMaintenance) {
          setIsMaintenance(true)
          setMaintenanceData({
            message: 'En cours de maintenance',
            reason: process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || 'Le service est temporairement indisponible',
            estimatedTime: 'Environ 30 minutes'
          })
          setIsLoading(false)
          return
        }

        // Check API for page-specific maintenance
        const query = pageId ? `?pageId=${pageId}` : ''
        const response = await fetch(`/api/maintenance-status${query}`)
        if (response.ok) {
          const data = await response.json()
          if (data.maintenance) {
            setIsMaintenance(true)
            setMaintenanceData({
              message: data.message || 'En cours de maintenance',
              reason: data.reason || 'Cette page est en maintenance',
              estimatedTime: data.estimatedTime || 'Environ 30 minutes'
            })
          }
        }
      } catch (error) {
        console.error('Error checking maintenance status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkMaintenance()
    
    // Check every 30 seconds
    const interval = setInterval(checkMaintenance, 30000)
    
    return () => clearInterval(interval)
  }, [pageId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-primary/20 border-t-purple-primary"></div>
      </div>
    )
  }

  if (isMaintenance) {
    return (
      <MaintenanceMode
        message={maintenanceData.message}
        reason={maintenanceData.reason}
        estimatedTime={maintenanceData.estimatedTime}
      />
    )
  }

  return <>{children}</>
}