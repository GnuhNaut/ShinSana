const STORAGE_VERSION = 1
interface StorageEnvelope<T> { version: number; data: T }

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as StorageEnvelope<T>
    return parsed.version === STORAGE_VERSION ? parsed.data : fallback
  } catch { return fallback }
}

export function writeStorage<T>(key: string, data: T): boolean {
  if (typeof window === 'undefined') return false
  try { window.localStorage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, data })); return true } catch { return false }
}
