/**
 * Centralized maintenance status storage with file persistence
 * Shared between /api/super-admin/page-maintenance and /api/maintenance-status
 */

import fs from 'fs'
import path from 'path'

export interface MaintenanceRecord {
  status: 'online' | 'maintenance'
  message?: string
  reason?: string
  estimatedTime?: number // in milliseconds
  lastUpdated: string
  updatedBy?: string
}

// Use __dirname to get the current directory
let DATA_DIR: string
let MAINTENANCE_FILE: string

try {
  // Try to get the directory path
  DATA_DIR = path.join(process.cwd(), 'data')
  MAINTENANCE_FILE = path.join(DATA_DIR, 'maintenance-status.json')
} catch (e) {
  // Fallback
  DATA_DIR = path.join(__dirname, '../../..', 'data')
  MAINTENANCE_FILE = path.join(DATA_DIR, 'maintenance-status.json')
}

// Ensure data directory exists
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
  } catch (error) {
    console.error('Failed to create data directory:', error)
  }
}

// Load maintenance status from file
function loadMaintenanceStatus(): Record<string, MaintenanceRecord> {
  try {
    ensureDataDir()
    if (fs.existsSync(MAINTENANCE_FILE)) {
      const data = fs.readFileSync(MAINTENANCE_FILE, 'utf-8')
      const parsed = JSON.parse(data)
      console.log('✅ Maintenance status loaded from file:', MAINTENANCE_FILE)
      return parsed
    } else {
      console.log('ℹ️ No maintenance file found, starting with empty state')
    }
  } catch (error) {
    console.error('❌ Error loading maintenance status from file:', MAINTENANCE_FILE, error)
  }
  return {}
}

// Save maintenance status to file
function saveMaintenanceStatus(status: Record<string, MaintenanceRecord>) {
  try {
    ensureDataDir()
    fs.writeFileSync(MAINTENANCE_FILE, JSON.stringify(status, null, 2), 'utf-8')
    console.log('✅ Maintenance status saved to file:', MAINTENANCE_FILE)
  } catch (error) {
    console.error('❌ Error saving maintenance status to file:', MAINTENANCE_FILE, error)
  }
}

// Load from file every time to ensure we get fresh data (important for hot-reload)
export function setPageMaintenance(
  pageId: string,
  record: Omit<MaintenanceRecord, 'lastUpdated'>
) {
  const maintenanceStatus = loadMaintenanceStatus()
  maintenanceStatus[pageId] = {
    ...record,
    lastUpdated: new Date().toISOString()
  }
  saveMaintenanceStatus(maintenanceStatus)
}

export function getPageMaintenance(pageId: string): MaintenanceRecord | undefined {
  const maintenanceStatus = loadMaintenanceStatus()
  return maintenanceStatus[pageId]
}

export function getAllMaintenanceStatus(): Record<string, MaintenanceRecord> {
  return loadMaintenanceStatus()
}

export function clearPageMaintenance(pageId: string) {
  const maintenanceStatus = loadMaintenanceStatus()
  delete maintenanceStatus[pageId]
  saveMaintenanceStatus(maintenanceStatus)
}

export function isPageInMaintenance(pageId: string): boolean {
  const status = getPageMaintenance(pageId)
  return status?.status === 'maintenance'
}