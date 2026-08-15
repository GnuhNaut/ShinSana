import { readStorage, writeStorage } from '../../utils/storage'
import type { GuestbookService, Wish } from './types'
export const WISHES_STORAGE_KEY = 'wedding_v1_wishes'

class LocalGuestbookService implements GuestbookService {
  async list(): Promise<Wish[]> { return readStorage<Wish[]>(WISHES_STORAGE_KEY, []) }
  async submit(input: Pick<Wish, 'name' | 'message'>): Promise<Wish> {
    await new Promise((resolve) => window.setTimeout(resolve, 250))
    const wishes = readStorage<Wish[]>(WISHES_STORAGE_KEY, [])
    const wish: Wish = { id: `wish-${Date.now()}`, name: input.name.trim(), message: input.message.trim(), createdAt: new Date().toISOString() }
    if (!writeStorage(WISHES_STORAGE_KEY, [wish, ...wishes])) throw new Error('Guestbook storage is unavailable')
    return wish
  }
}
export const guestbookService: GuestbookService = new LocalGuestbookService()
