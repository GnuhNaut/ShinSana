import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { weddingConfig } from '../config/wedding'
import { rsvpService } from '../services/rsvp'
import { RSVPSection } from '../sections/RSVPSection'
import { CoverSection } from '../sections/CoverSection'
import { StorySection } from '../sections/StorySection'
import { WeddingImage } from '../components/ui/WeddingImage'

vi.mock('../services/rsvp', () => ({
  rsvpService: { mode: 'local-demo', submit: vi.fn() },
}))

const submitRSVP = vi.mocked(rsvpService.submit)

describe('CoverSection', () => {
  it('opens promptly when reduced motion is preferred', async () => {
    vi.useFakeTimers()
    const onOpened = vi.fn()
    render(<CoverSection onOpened={onOpened} />)

    expect(document.body).toHaveClass('invitation-closed')
    fireEvent.click(screen.getByRole('button', { name: /Mở lời mời/i }))
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
    render(<RSVPSection guestName={null} />)

    await user.click(document.querySelector<HTMLButtonElement>('form button[type="submit"]')!)

    expect(document.querySelector('#rsvp-name')).toHaveAttribute('aria-invalid', 'true')
    expect(document.querySelector('fieldset')).toHaveAttribute('aria-describedby', 'rsvp-attendance-error')
    expect(document.querySelectorAll('.field__error').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByRole('alert')).toHaveTextContent('Vui lòng kiểm tra')
    await waitFor(() => expect(document.querySelector('#rsvp-name')).toHaveFocus())
    expect(submitRSVP).not.toHaveBeenCalled()
  })

  it('prefills only the personalized guest name', () => {
    render(<RSVPSection guestName="Nguyễn Văn An" />)

    expect(screen.getByRole('textbox', { name: /Họ và tên/ })).toHaveValue('Nguyễn Văn An')
    expect(screen.getByRole('radio', { name: /Có, tôi sẽ tham dự/ })).not.toBeChecked()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.getByText(/Chế độ demo cục bộ/)).toBeInTheDocument()
  })

  it('submits trimmed values and renders the success state', async () => {
    const user = userEvent.setup()
    render(<RSVPSection guestName={null} />)

    await user.type(document.querySelector<HTMLInputElement>('#rsvp-name')!, '  Nguyễn Văn An  ')
    await user.click(screen.getByRole('radio', { name: /Có, tôi sẽ tham dự/ }))
    await user.selectOptions(screen.getByRole('combobox'), '2')
    await user.type(document.querySelector<HTMLTextAreaElement>('#rsvp-message')!, '  Hẹn gặp hai bạn!  ')
    await user.click(document.querySelector<HTMLButtonElement>('form button[type="submit"]')!)

    await waitFor(() => expect(submitRSVP).toHaveBeenCalledOnce())
    expect(submitRSVP).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Nguyễn Văn An',
      attendance: 'yes',
      partySize: 2,
      message: 'Hẹn gặp hai bạn!',
    }))
    expect(await screen.findByRole('status')).toHaveTextContent('Cảm ơn bạn đã xác nhận')
  })

  it('shows a recoverable error when the RSVP adapter rejects', async () => {
    submitRSVP.mockRejectedValueOnce(new Error('network unavailable'))
    const user = userEvent.setup()
    render(<RSVPSection guestName={null} />)

    await user.type(document.querySelector<HTMLInputElement>('#rsvp-name')!, 'Nguyễn Văn An')
    await user.click(screen.getByRole('radio', { name: /Rất tiếc, tôi không thể tham dự/ }))
    await user.click(document.querySelector<HTMLButtonElement>('form button[type="submit"]')!)

    expect(await screen.findByRole('alert')).toHaveTextContent('Kết nối chưa sẵn sàng')
    expect(document.querySelector<HTMLButtonElement>('form button[type="submit"]')).toBeEnabled()
  })

  it('omits conditional party size data and uses distinct copy for a declined RSVP', async () => {
    const user = userEvent.setup()
    render(<RSVPSection guestName={null} />)

    await user.type(document.querySelector<HTMLInputElement>('#rsvp-name')!, 'Nguyễn Văn An')
    await user.click(screen.getByRole('radio', { name: /Rất tiếc, tôi không thể tham dự/ }))
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Gửi lời xác nhận/ }))

    await waitFor(() => expect(submitRSVP).toHaveBeenCalledOnce())
    const submission = submitRSVP.mock.calls[0]?.[0]
    expect(submission).toEqual(expect.objectContaining({ name: 'Nguyễn Văn An', attendance: 'no' }))
    expect(submission).not.toHaveProperty('partySize')
    expect(submission).not.toHaveProperty('message')
    expect(await screen.findByRole('status')).toHaveTextContent('Cảm ơn bạn đã hồi âm')
  })

  it('disables the form and guards against a double submit', async () => {
    let resolveSubmission: ((value: { ok: boolean; id: string }) => void) | undefined
    submitRSVP.mockReturnValueOnce(new Promise((resolve) => { resolveSubmission = resolve }))
    const user = userEvent.setup()
    render(<RSVPSection guestName="Nguyễn Văn An" />)

    await user.click(screen.getByRole('radio', { name: /Có, tôi sẽ tham dự/ }))
    const submitButton = screen.getByRole('button', { name: /Gửi lời xác nhận/ })
    await user.click(submitButton)
    expect(submitButton).toBeDisabled()
    fireEvent.submit(submitButton.closest('form')!)
    expect(submitRSVP).toHaveBeenCalledOnce()

    resolveSubmission?.({ ok: true, id: 'deferred-rsvp' })
    expect(await screen.findByRole('status')).toHaveTextContent('Cảm ơn bạn đã xác nhận')
  })

})

describe('RSVPSection optional rendering', () => {
  const originalRsvpFeature = weddingConfig.features.rsvp
  const originalGift = {
    enabled: weddingConfig.gift.enabled,
    accounts: weddingConfig.gift.accounts.map((account) => ({ ...account })),
  }

  afterEach(() => {
    weddingConfig.features.rsvp = originalRsvpFeature
    weddingConfig.gift.enabled = originalGift.enabled
    weddingConfig.gift.accounts.splice(
      0,
      weddingConfig.gift.accounts.length,
      ...originalGift.accounts.map((account) => ({ ...account })),
    )
  })

  it('stays out of the document when RSVP is disabled; gifting is a separate section', () => {
    weddingConfig.features.rsvp = false
    weddingConfig.gift.enabled = true
    weddingConfig.gift.accounts.splice(0, weddingConfig.gift.accounts.length, {
      id: 'groom-account',
      side: 'groom',
      bankName: 'Ngân hàng A',
      accountNumber: '123456789',
      accountHolder: 'TUAN HUNG',
    })

    render(<RSVPSection guestName={null} />)

    expect(screen.queryByRole('region', { name: weddingConfig.copy.giftLabel })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mừng cưới online' })).not.toBeInTheDocument()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: weddingConfig.copy.rsvpTitle })).not.toBeInTheDocument()
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
