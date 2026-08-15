import { describe, expect, it, vi } from 'vitest'
import { readStorage, writeStorage } from '../utils/storage'

describe('safe versioned storage', () => {
  it('round-trips current data and falls back for invalid payloads', () => {
    expect(writeStorage('qa-key', { accepted: true })).toBe(true)
    expect(readStorage('qa-key', { accepted: false })).toEqual({ accepted: true })

    window.localStorage.setItem('qa-key', '{not-json')
    expect(readStorage('qa-key', { accepted: false })).toEqual({ accepted: false })
  })

  it('fails gracefully when localStorage is unavailable', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    expect(writeStorage('qa-key', ['value'])).toBe(false)
    setItem.mockRestore()
  })
})
