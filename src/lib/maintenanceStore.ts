/**
 * Centralized maintenance status storage
 * Shared between /api/super-admin/page-maintenance and /api/maintenance-status
 */

export interface MaintenanceRecord {
  status: 'online' | 'maintenance'
  message?: string
  reason?: string
  estimatedTime?: number // in milliseconds
  lastUpdated: string
  updatedBy?: string
}

// Single source of truth for maintenance status
const maintenanceStatus = new Map<string, MaintenanceRecord>()

export function setPageMaintenance(
  pageId: string,
  record: Omit<MaintenanceRecord, 'lastUpdated'>
) {
  maintenanceStatus.set(pageId, {
    ...record,
    lastUpdated: new Date().toISOString()
  })
}

export function getPageMaintenance(pageId: string): MaintenanceRecord | undefined {
  return maintenanceStatus.get(pageId)
}

export function getAllMaintenanceStatus(): Record<string, MaintenanceRecord> {
  return Object.fromEntries(maintenanceStatus)
}

export function clearPageMaintenance(pageId: string) {
  maintenanceStatus.delete(pageId)
}

export function isPageInMaintenance(pageId: string): boolean {
  const status = maintenanceStatus.get(pageId)
  return status?.status === 'maintenance'
}