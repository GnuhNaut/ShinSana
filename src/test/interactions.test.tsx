import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { WeddingConfigContext } from '../config/WeddingConfigContext'
import { weddingConfig } from '../config/wedding'
import { GiftSection } from '../sections/GiftSection'

function openApp(config = weddingConfig) {
  render(<App config={config} />)
  fireEvent.click(screen.getByRole('button', { name: 'Mở lời mời' }))
}

afterEach(() => {
  vi.restoreAllMocks()
  window.history.replaceState({}, '', '/')
})

describe('invitation interactions', () => {
  it('opens the accessible gallery lightbox and closes it with Escape', async () => {
    openApp()
    await screen.findByRole('main', { name: 'Nội dung thiệp cưới' })
    const firstPhoto = document.querySelector<HTMLElement>('.coverflow__slide.is-active button')
    expect(firstPhoto).not.toBeNull()
    fireEvent.click(firstPhoto!)
    expect(await screen.findByRole('dialog', { name: 'thư viện ảnh' })).toBeVisible()
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('starts music from the cover gesture and exposes a pause control', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined)
    const config = { ...weddingConfig, music: { ...weddingConfig.music, src: '/music.mp3' } }

    openApp(config)
    expect(play).toHaveBeenCalled()
    await screen.findByRole('main', { name: 'Nội dung thiệp cưới' })
    const audio = document.querySelector('audio')
    expect(audio).not.toBeNull()
    Object.defineProperty(audio!, 'paused', { configurable: true, get: () => false })
    await screen.findByRole('button', { name: 'Tạm dừng nhạc nền' })
    fireEvent.click(screen.getByRole('button', { name: 'Tạm dừng nhạc nền' }))
    expect(pause).toHaveBeenCalled()
  })

  it('copies a configured account number without inventing it in production config', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const fixture = {
      ...weddingConfig,
      gifts: {
        groom: { ...weddingConfig.gifts.groom, bankName: 'Ngân hàng kiểm thử', accountHolder: 'Tuấn Hùng', accountNumber: '123456789' },
        bride: { ...weddingConfig.gifts.bride },
      },
    }

    render(
      <WeddingConfigContext.Provider value={fixture}>
        <GiftSection side="groom" />
      </WeddingConfigContext.Provider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Copy số tài khoản' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('123456789'))
    expect(screen.getByRole('button', { name: 'Đã sao chép' })).toBeVisible()
  })
})
