import { promises as fs } from 'fs'
import path from 'path'
import { store, Sanction } from './dataStore'

// Resolve a writable directory for serverless/container environments
function resolveDataDir() {
  const base = process.env.NYX_DATA_DIR
    || process.env.TMPDIR
    || process.env.TEMP
    || process.env.TMP
    || (process.platform === 'win32' ? 'C:\\Windows\\Temp' : '/tmp')
  return path.join(base, 'nyxbot')
}

const dataDir = resolveDataDir()
const sanctionsFile = path.join(dataDir, 'sanctions.json')

async function ensureDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch {}
}

export async function loadSanctionsFromDisk() {
  try {
    await ensureDir()
    const content = await fs.readFile(sanctionsFile, 'utf-8')
    const parsed: Sanction[] = JSON.parse(content)
    if (Array.isArray(parsed)) {
      store.sanctions = parsed
    }
  } catch (e: any) {
    // If file not found, initialize file with current in-memory data
    if (e?.code === 'ENOENT') {
      await saveSanctionsToDisk()
    }
  }
}

export async function saveSanctionsToDisk() {
  try {
    await ensureDir()
    const serialized = JSON.stringify(store.sanctions, null, 2)
    await fs.writeFile(sanctionsFile, serialized, 'utf-8')
  } catch (e) {
    console.error('[Sanctions Persistence] Failed to save:', e)
  }
}
