import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { weddingConfig } from '../config/wedding'
import { rsvpService } from '../services/rsvp'
import { RSVPSection } from '../sections/RSVPSection'
import { CoverSection } from '../sections/CoverSection'
import { StorySection } from '../sections/StorySection'
import { WeddingImage } from '../components/ui/WeddingImage'

vi.mock('../services/rsvp', () => ({
  rsvpService: { submit: vi.fn() },
}))

const submitRSVP = vi.mocked(rsvpService.submit)

describe('CoverSection', () => {
  it('opens promptly when reduced motion is preferred', async () => {
    vi.useFakeTimers()
    const onOpened = vi.fn()
    render(<CoverSection onOpened={onOpened} />)

    expect(document.body).toHaveClass('invitation-closed')
    fireEvent.click(screen.getByRole('button', { name: /Mở thiệp/i }))
    expect(screen.getByRole('button')).toBeDisabled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20)
    })

    expect(onOpened).toHaveBeenCalledOnce()
    expect(document.body).not.toHaveClass('invitation-closed')
  })
})

describe('WeddingImage', () => {
  it('replaces a broken image with the monogram fallback', () => {
    render(<WeddingImage src="/missing-image.webp" alt="Ảnh cưới thử nghiệm" aspectRatio="4 / 5" />)
    fireEvent.error(screen.getByAltText('Ảnh cưới thử nghiệm'))

    expect(screen.getByRole('img', { name: 'Ảnh cưới thử nghiệm' })).toHaveTextContent('Ảnh sẽ được cập nhật')
  })
})

describe('RSVPSection', () => {
  beforeEach(() => {
    submitRSVP.mockResolvedValue({ ok: true, id: 'test-rsvp' })
  })

  it('shows accessible inline errors for an empty submission', async () => {
    const user = userEvent.setup()
    render(<RSVPSection guestName={null} side="both" />)

    await user.click(document.querySelector<HTMLButtonElement>('form button[type="submit"]')!)

    expect(document.querySelector('#rsvp-name')).toHaveAttribute('aria-invalid', 'true')
    expect(document.querySelector('fieldset')).toHaveAttribute('aria-describedby', 'rsvp-attendance-error')
    expect(document.querySelectorAll('.field__error').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByRole('alert')).toHaveTextContent('Vui lòng kiểm tra')
    await waitFor(() => expect(document.querySelector('#rsvp-name')).toHaveFocus())
    expect(submitRSVP).not.toHaveBeenCalled()
  })

  it('prefills the attendance choice from the guest side query', () => {
    render(<RSVPSection guestName="Nguyễn Văn An" side="groom" />)

    const groomRadio = screen.getByRole('radio', { name: /Nhà Trai/ }) as HTMLInputElement
    expect(groomRadio.checked).toBe(true)
  })

  it('submits trimmed values and renders the success state', async () => {
    const user = userEvent.setup()
    render(<RSVPSection guestName={null} side="both" />)

    await user.type(document.querySelector<HTMLInputElement>('#rsvp-name')!, '  Nguyễn Văn An  ')
    await user.click(screen.getByRole('radio', { name: /Cả Hai/ }))
    await user.selectOptions(screen.getByRole('combobox'), '2')
    await user.type(document.querySelector<HTMLTextAreaElement>('#rsvp-message')!, '  Hẹn gặp hai bạn!  ')
    await user.click(document.querySelector<HTMLButtonElement>('form button[type="submit"]')!)

    await waitFor(() => expect(submitRSVP).toHaveBeenCalledOnce())
    expect(submitRSVP).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Nguyễn Văn An',
      attendance: 'both',
      partySize: 2,
      message: 'Hẹn gặp hai bạn!',
    }))
    expect(await screen.findByRole('status')).toHaveTextContent('Cảm ơn bạn đã xác nhận')
  })

  it('shows a recoverable error when the RSVP adapter rejects', async () => {
    submitRSVP.mockRejectedValueOnce(new Error('network unavailable'))
    const user = userEvent.setup()
    render(<RSVPSection guestName={null} side="both" />)

    await user.type(document.querySelector<HTMLInputElement>('#rsvp-name')!, 'Nguyễn Văn An')
    await user.click(screen.getByRole('radio', { name: /Rất tiếc, tôi không thể tham dự/ }))
    await user.click(document.querySelector<HTMLButtonElement>('form button[type="submit"]')!)

    expect(await screen.findByRole('alert')).toHaveTextContent('Kết nối chưa sẵn sàng')
    expect(document.querySelector<HTMLButtonElement>('form button[type="submit"]')).toBeEnabled()
  })

  it('opens the gift modal via the secondary CTA', async () => {
    const user = userEvent.setup()
    render(<RSVPSection guestName={null} side="both" />)

    const giftButton = screen.getByRole('button', { name: /Gửi quà mừng/i })
    await user.click(giftButton)
    const dialog = await screen.findByRole('dialog', { name: 'gửi quà mừng' })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByRole('tab', { name: 'Nhà Trai' })).toHaveAttribute('aria-selected', 'true')

    await user.click(within(dialog).getByRole('tab', { name: 'Nhà Gái' }))
    expect(within(dialog).getByRole('tab', { name: 'Nhà Gái' })).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})

describe('StorySection lightbox', () => {
  it('opens an image, supports keyboard navigation, and closes with Escape', async () => {
    const user = userEvent.setup()
    render(<StorySection />)

    await user.click(screen.getAllByRole('button', { name: /Mở ảnh:/i })[0]!)
    const lightbox = screen.getByRole('dialog', { name: 'thư viện ảnh' })
    expect(lightbox).toBeInTheDocument()
    expect(within(lightbox).getByRole('img', { name: weddingConfig.gallery[0].alt })).toBeInTheDocument()

    await user.keyboard('{ArrowRight}')
    expect(within(lightbox).getByText(weddingConfig.gallery[1].caption)).toBeInTheDocument()
    expect(within(lightbox).getByText(`Ảnh 2 trên ${weddingConfig.gallery.length}`)).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
