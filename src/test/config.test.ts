import { describe, expect, it } from 'vitest'
import { weddingConfig } from '../config/wedding'

describe('wedding configuration', () => {
  it('keeps the event model limited to the groom and bride locations', () => {
    expect(Object.keys(weddingConfig.locations).sort()).toEqual(['bride', 'groom'])
    expect(weddingConfig.locations.groom.title).toBe('Nhà Trai')
    expect(weddingConfig.locations.bride.title).toBe('Nhà Gái')
  })

  it('supports an album of more than twenty independently art-directed entries', () => {
    expect(weddingConfig.gallery.length).toBeGreaterThanOrEqual(20)
    expect(new Set(weddingConfig.gallery.map((image) => image.id)).size).toBe(weddingConfig.gallery.length)
    expect(weddingConfig.gallery.every((image) => Boolean(image.aspectRatio && image.src && image.caption))).toBe(true)
  })

  it('keeps sensitive integration data outside of the config', () => {
    expect(weddingConfig.gifts.groom.accountNumber).toBe('')
    expect(weddingConfig.gifts.bride.accountNumber).toBe('')
    expect(weddingConfig.music.src).toBe('')
  })
})
