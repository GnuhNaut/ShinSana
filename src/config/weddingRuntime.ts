import type { WeddingConfig } from '../types/wedding.ts'
import { weddingConfig } from './wedding.ts'

export interface WeddingRuntime {
  config: WeddingConfig
  demoMode: boolean
}

/** Demo data is reachable only through an exact `demo=1` query parameter. */
export function isDemoMode(search: string): boolean {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const demoValues = params.getAll('demo')
  return demoValues.length === 1 && demoValues[0] === '1'
}

export async function loadWeddingRuntime(search: string): Promise<WeddingRuntime> {
  if (!isDemoMode(search)) return { config: weddingConfig, demoMode: false }

  const { weddingDemoConfig } = await import('./wedding.demo.ts')
  return { config: weddingDemoConfig, demoMode: true }
}

/** Applies runtime-only robots metadata and returns an exact cleanup function. */
export function applyRuntimeRobots(demoMode: boolean, productionValue: string): () => void {
  const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
  const meta = existing ?? document.createElement('meta')
  const previousValue = existing?.getAttribute('content')
  const created = !existing

  if (created) {
    meta.name = 'robots'
    document.head.appendChild(meta)
  }

  meta.content = demoMode ? 'noindex, nofollow' : productionValue
  if (demoMode) document.documentElement.dataset.weddingDemo = 'true'
  else delete document.documentElement.dataset.weddingDemo

  return () => {
    delete document.documentElement.dataset.weddingDemo
    if (created) {
      meta.remove()
    } else if (previousValue === null || previousValue === undefined) {
      meta.removeAttribute('content')
    } else {
      meta.setAttribute('content', previousValue)
    }
  }
}
