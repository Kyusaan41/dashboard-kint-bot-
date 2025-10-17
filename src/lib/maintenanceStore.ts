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

const DATA_DIR = path.join(process.cwd(), 'data')
const MAINTENANCE_FILE = path.join(DATA_DIR, 'maintenance-status.json')

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Load maintenance status from file
function loadMaintenanceStatus(): Record<string, MaintenanceRecord> {
  try {
    ensureDataDir()
    if (fs.existsSync(MAINTENANCE_FILE)) {
      const data = fs.readFileSync(MAINTENANCE_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading maintenance status from file:', error)
  }
  return {}
}

// Save maintenance status to file
function saveMaintenanceStatus(status: Record<string, MaintenanceRecord>) {
  try {
    ensureDataDir()
    fs.writeFileSync(MAINTENANCE_FILE, JSON.stringify(status, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving maintenance status to file:', error)
  }
}

// In-memory cache
let maintenanceStatus = loadMaintenanceStatus()

export function setPageMaintenance(
  pageId: string,
  record: Omit<MaintenanceRecord, 'lastUpdated'>
) {
  maintenanceStatus[pageId] = {
    ...record,
    lastUpdated: new Date().toISOString()
  }
  saveMaintenanceStatus(maintenanceStatus)
}

export function getPageMaintenance(pageId: string): MaintenanceRecord | undefined {
  return maintenanceStatus[pageId]
}

export function getAllMaintenanceStatus(): Record<string, MaintenanceRecord> {
  return maintenanceStatus
}

export function clearPageMaintenance(pageId: string) {
  delete maintenanceStatus[pageId]
  saveMaintenanceStatus(maintenanceStatus)
}

export function isPageInMaintenance(pageId: string): boolean {
  const status = maintenanceStatus[pageId]
  return status?.status === 'maintenance'
}