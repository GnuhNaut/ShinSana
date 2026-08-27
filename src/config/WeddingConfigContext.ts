import { createContext, useContext } from 'react'
import type { WeddingConfig } from '../types/wedding.ts'
import { weddingConfig } from './wedding.ts'

export const WeddingConfigContext = createContext<WeddingConfig>(weddingConfig)

export function useWeddingConfig(): WeddingConfig {
  return useContext(WeddingConfigContext)
}
