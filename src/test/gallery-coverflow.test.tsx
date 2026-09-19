import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GalleryCoverflow } from '../components/wedding/GalleryCoverflow'
import { WeddingConfigContext } from '../config/WeddingConfigContext'
import { weddingConfig } from '../config/wedding'
import type { GalleryImage } from '../types/wedding'

function imageAt(index: number): GalleryImage {
  const ratios = ['3 / 2', '2 / 3', '1 / 1', '4 / 5'] as const
  const layouts = ['wide', 'portrait', 'square', 'detail'] as const
  const chapter = weddingConfig.galleryChapters[index % weddingConfig.galleryChapters.length].id

  return {
    id: `test-image-${index}`,
    src: `/assets/placeholders/gallery-${(index % 6) + 1}.webp`,
    alt: `Ảnh thử nghiệm ${index + 1}`,
    caption: `Khoảnh khắc ${index + 1}`,
    aspectRatio: ratios[index % ratios.length],
    layout: layouts[index % layouts.length],
    chapter,
  }
}

function setReducedMotion(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string): MediaQueryList => ({
    matches: query === '(prefers-reduced-motion: reduce)' && reduced,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  }))
}

function renderCoverflow(count: number, reduced = true) {
  const images = Array.from({ length: count }, (_, index) => imageAt(index))
  setReducedMotion(reduced)

  return render(
    <WeddingConfigContext.Provider value={{ ...weddingConfig, gallery: images }}>
      <GalleryCoverflow images={images} chapters={weddingConfig.galleryChapters} />
    </WeddingConfigContext.Provider>,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('virtual gallery coverflow', () => {
  it('mounts a bounded, unique window for a 24-image album and supports keyboard looping', async () => {
    renderCoverflow(24)
    const region = screen.getByRole('region', { name: /Bộ ảnh cưới/i })
    const slides = document.querySelectorAll<HTMLElement>('.coverflow__slide')

    expect(slides).toHaveLength(7)
    expect(new Set([...slides].map((slide) => slide.dataset.imageId)).size).toBe(7)
    expect(region.querySelectorAll('.coverflow__slide img')).toHaveLength(5)
    expect(screen.getByText('Ảnh 1 trên 24')).toBeVisible()
    expect(region.closest('.coverflow')).toHaveAttribute('data-reduced-motion', 'true')

    region.focus()
    fireEvent.keyDown(region, { key: 'ArrowRight' })
    await screen.findByText('Ảnh 2 trên 24')
    const secondPhoto = region.querySelector<HTMLButtonElement>('[aria-current="true"]')
    expect(secondPhoto).toHaveAttribute('aria-label', 'Mở ảnh 2: Khoảnh khắc 2')
    expect(document.activeElement).toBe(secondPhoto)

    fireEvent.click(screen.getByRole('button', { name: /Về chung một lối/i }))
    await screen.findByText('Ảnh 4 trên 24')

    fireEvent.keyDown(region, { key: 'End' })
    await screen.findByText('Ảnh 24 trên 24')
    fireEvent.keyDown(region, { key: 'ArrowRight' })
    await screen.findByText('Ảnh 1 trên 24')
    fireEvent.keyDown(region, { key: 'Home' })
    expect(screen.getByText('Ảnh 1 trên 24')).toBeVisible()
  })

  it('handles one and two images without duplicate virtual cards', async () => {
    const one = renderCoverflow(1)
    expect(document.querySelectorAll('.coverflow__slide')).toHaveLength(1)
    expect(screen.getByText('Ảnh 1 trên 1')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Ảnh tiếp theo' })).toBeDisabled()
    const oneRegion = screen.getByRole('region', { name: /Bộ ảnh cưới/i })
    fireEvent.keyDown(oneRegion, { key: 'Enter' })
    expect(await screen.findByRole('dialog', { name: 'thư viện ảnh' })).toBeVisible()
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    one.unmount()

    renderCoverflow(2)
    const slides = document.querySelectorAll<HTMLElement>('.coverflow__slide')
    expect(slides).toHaveLength(2)
    expect(new Set([...slides].map((slide) => slide.dataset.imageId)).size).toBe(2)
    fireEvent.click(screen.getByRole('button', { name: 'Ảnh tiếp theo' }))
    await screen.findByText('Ảnh 2 trên 2')
    fireEvent.click(screen.getByRole('button', { name: 'Ảnh tiếp theo' }))
    await screen.findByText('Ảnh 1 trên 2')
  })

  it('commits a horizontal swipe once while preserving a vertical scroll gesture', async () => {
    renderCoverflow(24, false)
    const region = screen.getByRole('region', { name: /Bộ ảnh cưới/i })

    fireEvent.pointerDown(region, { pointerId: 1, pointerType: 'touch', clientX: 220, clientY: 120, timeStamp: 1 })
    fireEvent.pointerMove(region, { pointerId: 1, pointerType: 'touch', clientX: 108, clientY: 124, timeStamp: 40 })
    fireEvent.pointerUp(region, { pointerId: 1, pointerType: 'touch', clientX: 108, clientY: 124, timeStamp: 50 })
    await screen.findByText('Ảnh 2 trên 24')
    const currentAfterSwipe = region.querySelector<HTMLElement>('.coverflow__slide.is-active button')!
    fireEvent.pointerDown(currentAfterSwipe, { pointerId: 11, pointerType: 'touch', clientX: 160, clientY: 120, timeStamp: 55 })
    fireEvent.pointerUp(currentAfterSwipe, { pointerId: 11, pointerType: 'touch', clientX: 160, clientY: 120, timeStamp: 56 })
    fireEvent.click(currentAfterSwipe)
    expect(await screen.findByRole('dialog', { name: 'thư viện ảnh' })).toBeVisible()
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    fireEvent.pointerDown(region, { pointerId: 2, pointerType: 'touch', clientX: 180, clientY: 100, timeStamp: 60 })
    fireEvent.pointerMove(region, { pointerId: 2, pointerType: 'touch', clientX: 186, clientY: 190, timeStamp: 90 })
    fireEvent.pointerUp(region, { pointerId: 2, pointerType: 'touch', clientX: 186, clientY: 190, timeStamp: 100 })
    expect(screen.getByText('Ảnh 2 trên 24')).toBeVisible()
    fireEvent.click(region.querySelector<HTMLElement>('.coverflow__slide.is-active button')!)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('finishes a mouse drag after pointer capture is lost and clears its temporary click guard', async () => {
    renderCoverflow(24, false)
    const region = screen.getByRole('region', { name: /Bộ ảnh cưới/i })

    fireEvent.pointerDown(region, { pointerId: 8, pointerType: 'mouse', clientX: 220, clientY: 120, timeStamp: 1 })
    fireEvent.pointerMove(region, { pointerId: 8, pointerType: 'mouse', clientX: 104, clientY: 124, timeStamp: 40 })
    expect(region).toHaveClass('is-dragging')
    fireEvent.lostPointerCapture(region, { pointerId: 8, pointerType: 'mouse', clientX: 80, clientY: 124, timeStamp: 50 })
    await screen.findByText('Ảnh 2 trên 24')
    expect(region).not.toHaveClass('is-dragging')

    const currentAfterExternalRelease = region.querySelector<HTMLElement>('.coverflow__slide.is-active button')!
    fireEvent.pointerDown(currentAfterExternalRelease, { pointerId: 12, pointerType: 'mouse', clientX: 160, clientY: 120, timeStamp: 55 })
    fireEvent.pointerUp(currentAfterExternalRelease, { pointerId: 12, pointerType: 'mouse', clientX: 160, clientY: 120, timeStamp: 56 })
    fireEvent.click(currentAfterExternalRelease)
    expect(await screen.findByRole('dialog', { name: 'thư viện ảnh' })).toBeVisible()
  })

  it('uses a fast fling only when reduced motion is not requested', async () => {
    const moving = renderCoverflow(24, false)
    const movingRegion = screen.getByRole('region', { name: /Bộ ảnh cưới/i })
    fireEvent.pointerDown(movingRegion, { pointerId: 3, pointerType: 'touch', clientX: 210, clientY: 110, timeStamp: 1 })
    fireEvent.pointerMove(movingRegion, { pointerId: 3, pointerType: 'touch', clientX: 172, clientY: 112, timeStamp: 4 })
    fireEvent.pointerUp(movingRegion, { pointerId: 3, pointerType: 'touch', clientX: 172, clientY: 112, timeStamp: 5 })
    await screen.findByText('Ảnh 2 trên 24')
    moving.unmount()

    renderCoverflow(24, true)
    const reducedRegion = screen.getByRole('region', { name: /Bộ ảnh cưới/i })
    fireEvent.pointerDown(reducedRegion, { pointerId: 4, pointerType: 'touch', clientX: 210, clientY: 110, timeStamp: 1 })
    fireEvent.pointerMove(reducedRegion, { pointerId: 4, pointerType: 'touch', clientX: 172, clientY: 112, timeStamp: 4 })
    fireEvent.pointerCancel(reducedRegion, { pointerId: 4, pointerType: 'touch', clientX: 172, clientY: 112, timeStamp: 5 })
    expect(screen.getByText('Ảnh 1 trên 24')).toBeVisible()
  })

  it('opens only the active photo and keeps its full source ratio available', async () => {
    renderCoverflow(4)
    const region = screen.getByRole('region', { name: /Bộ ảnh cưới/i })
    const active = within(region).getByRole('button', { name: /Mở ảnh 1/i })
    expect(active.querySelector('img')).toHaveAttribute('data-image-id', 'test-image-0')
    expect(active.querySelector('.coverflow__image')).toHaveStyle('--image-ratio: 3 / 2')
    fireEvent.keyDown(region, { key: 'ArrowRight' })
    await screen.findByText('Ảnh 2 trên 4')
    expect(region.querySelector('.coverflow__slide.is-active .coverflow__image')).toHaveStyle('--image-ratio: 2 / 3')
    const secondPhoto = within(region).getByRole('button', { name: /Mở ảnh 2/i })
    secondPhoto.focus()
    fireEvent.click(secondPhoto)
    const dialog = await screen.findByRole('dialog', { name: 'thư viện ảnh' })
    expect(dialog).toBeVisible()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Ảnh tiếp theo' }))
    await within(dialog).findByText('Ảnh 3 trên 4')
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(document.activeElement).toBe(region.querySelector('.coverflow__slide.is-active button')))
  })
})
