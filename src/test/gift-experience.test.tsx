import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GiftExperience, OPEN_GIFT_EXPERIENCE_EVENT } from '../components/wedding/GiftExperience'
import type { WeddingConfig, WeddingGiftAccount } from '../types/wedding'

function account(overrides: Partial<WeddingGiftAccount> = {}): WeddingGiftAccount {
  return {
    id: 'groom-account',
    side: 'groom',
    label: 'Nhà Trai',
    bankName: 'Ngân hàng A',
    accountNumber: '123456789',
    accountHolder: 'TUAN HUNG',
    ...overrides,
  }
}

function gift(accounts: WeddingGiftAccount[], enabled = true): WeddingConfig['gift'] {
  return { enabled, accounts }
}

function renderGift(
  value: WeddingConfig['gift'],
  copy: { heading?: string; intro?: string; ctaLabel?: string } = {},
) {
  return render(
    <div className="site">
      <GiftExperience
        gift={value}
        heading={copy.heading ?? 'Gửi mừng cưới'}
        intro={copy.intro ?? 'Sự hiện diện của bạn đã là món quà quý giá.'}
        ctaLabel={copy.ctaLabel ?? 'Mừng cưới online'}
      />
    </div>,
  )
}

describe('GiftExperience conditional rendering', () => {
  it('stays hidden when disabled, empty, or only supplied an incomplete account', () => {
    const { rerender } = renderGift(gift([account()], false))
    expect(screen.queryByRole('button', { name: 'Mừng cưới online' })).not.toBeInTheDocument()

    rerender(<GiftExperience gift={gift([])} heading="Gửi mừng cưới" intro="Lời nhắn" ctaLabel="Mừng cưới online" />)
    expect(screen.queryByRole('button', { name: 'Mừng cưới online' })).not.toBeInTheDocument()

    rerender(<GiftExperience
      gift={gift([account({ bankName: '', accountNumber: '', accountHolder: '', qrImage: '/qr.webp' })])}
      heading="Gửi mừng cưới"
      intro="Lời nhắn"
      ctaLabel="Mừng cưới online"
    />)
    expect(screen.queryByRole('button', { name: 'Mừng cưới online' })).not.toBeInTheDocument()
  })
})

describe('GiftExperience dialog', () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
  const originalExecCommand = Object.getOwnPropertyDescriptor(document, 'execCommand')

  afterEach(() => {
    if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
    else Reflect.deleteProperty(navigator, 'clipboard')
    if (originalExecCommand) Object.defineProperty(document, 'execCommand', originalExecCommand)
    else Reflect.deleteProperty(document, 'execCommand')
  })

  it('renders one bank-only account without tabs and manages modal focus', async () => {
    const user = userEvent.setup()
    renderGift(gift([account()]))

    const trigger = screen.getByRole('button', { name: 'Mừng cưới online' })
    await user.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Mừng cưới online' })
    const closeButton = within(dialog).getByRole('button', { name: 'Đóng Mừng cưới online' })

    expect(within(dialog).queryByRole('tablist')).not.toBeInTheDocument()
    expect(within(dialog).getByText('Ngân hàng A')).toBeVisible()
    expect(within(dialog).getByText('TUAN HUNG')).toBeVisible()
    expect(within(dialog).getByText('123456789')).toBeVisible()
    expect(within(dialog).queryByRole('img')).not.toBeInTheDocument()
    expect(document.body).toHaveStyle({ overflow: 'hidden' })
    expect(document.querySelector<HTMLElement>('.site')?.inert).toBe(true)
    await waitFor(() => expect(closeButton).toHaveFocus())

    await user.keyboard('{Shift>}{Tab}{/Shift}')
    const copyButton = within(dialog).getByRole('button', { name: 'Sao chép STK' })
    expect(copyButton).toHaveFocus()
    await user.keyboard('{Tab}')
    expect(closeButton).toHaveFocus()

    await user.click(closeButton)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(trigger).toHaveFocus())
    expect(document.body).not.toHaveAttribute('data-modal-open')
    expect(document.querySelector<HTMLElement>('.site')?.inert).toBe(false)
  })

  it('opens from the floating gift shortcut event', async () => {
    renderGift(gift([account()]))
    window.dispatchEvent(new Event(OPEN_GIFT_EXPERIENCE_EVENT))
    expect(await screen.findByRole('dialog', { name: 'Mừng cưới online' })).toBeVisible()
  })

  it('shows an optional square QR and removes only the image when it fails', async () => {
    const user = userEvent.setup()
    renderGift(gift([account({
      qrImage: '/images/groom-qr.webp',
      branch: 'Chi nhánh Hà Nội',
    })]))

    await user.click(screen.getByRole('button', { name: 'Mừng cưới online' }))
    const dialog = screen.getByRole('dialog', { name: 'Mừng cưới online' })
    const qr = within(dialog).getByRole('img', { name: 'Mã QR mừng cưới Nhà Trai' })

    expect(qr).toHaveAttribute('src', '/images/groom-qr.webp')
    expect(qr).toHaveAttribute('width', '640')
    expect(qr).toHaveAttribute('height', '640')
    expect(within(dialog).getByText('Chi nhánh Hà Nội')).toBeVisible()

    fireEvent.error(qr)
    expect(within(dialog).queryByRole('img', { name: /Mã QR/ })).not.toBeInTheDocument()
    expect(within(dialog).getByText('123456789')).toBeVisible()
    expect(screen.queryByText('Ảnh sẽ được cập nhật')).not.toBeInTheDocument()
  })

  it('supports two-account tabs, copies the active account, and resets copied state per tab', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    renderGift(gift([
      account(),
      account({
        id: 'bride-account',
        side: 'bride',
        label: 'Nhà Gái',
        bankName: 'Ngân hàng B',
        accountNumber: '987654321',
        accountHolder: 'SAO MAI',
      }),
    ]))

    const trigger = screen.getByRole('button', { name: 'Mừng cưới online' })
    await user.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Mừng cưới online' })
    const tabs = within(dialog).getByRole('tablist', { name: 'Tài khoản nhận mừng cưới' })
    const groomTab = within(tabs).getByRole('tab', { name: 'Nhà Trai' })
    const brideTab = within(tabs).getByRole('tab', { name: 'Nhà Gái' })

    expect(groomTab).toHaveAttribute('aria-selected', 'true')
    groomTab.focus()
    await user.keyboard('{ArrowRight}')
    expect(brideTab).toHaveAttribute('aria-selected', 'true')
    expect(brideTab).toHaveFocus()
    expect(within(dialog).getByText('987654321')).toBeVisible()

    await user.keyboard('{Home}')
    expect(groomTab).toHaveFocus()
    await user.keyboard('{End}')
    expect(brideTab).toHaveFocus()

    await user.click(within(dialog).getByRole('button', { name: 'Sao chép STK' }))
    expect(writeText).toHaveBeenCalledWith('987654321')
    expect(within(dialog).getByRole('button', { name: 'Đã sao chép' })).toBeVisible()
    expect(within(dialog).getByRole('status')).toHaveTextContent('Đã sao chép số tài khoản')

    await user.click(groomTab)
    expect(within(dialog).getByText('123456789')).toBeVisible()
    expect(within(dialog).getByRole('button', { name: 'Sao chép STK' })).toBeVisible()
    expect(within(dialog).getByRole('status')).toBeEmptyDOMElement()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('uses family-side tab labels for same-bank accounts and repeats the configured intro in the modal', async () => {
    const user = userEvent.setup()
    const customIntro = 'Nếu ở xa, bạn có thể gửi lời chúc theo cách riêng này.'
    renderGift(gift([
      account({
        label: undefined,
        side: 'groom',
        bankName: 'Ngân hàng Chung',
      }),
      account({
        id: 'bride-account',
        label: undefined,
        side: 'bride',
        bankName: 'Ngân hàng Chung',
        accountNumber: '987654321',
        accountHolder: 'SAO MAI',
      }),
    ]), {
      heading: 'Mừng cưới từ phương xa',
      intro: customIntro,
    })

    await user.click(screen.getByRole('button', { name: 'Mừng cưới online' }))
    const dialog = screen.getByRole('dialog', { name: 'Mừng cưới online' })
    const tabs = within(dialog).getByRole('tablist', { name: 'Tài khoản nhận mừng cưới' })
    const groomTab = within(tabs).getByRole('tab', { name: 'Nhà Trai' })
    const brideTab = within(tabs).getByRole('tab', { name: 'Nhà Gái' })

    expect(groomTab).toHaveAttribute('id', 'gift-tab-0')
    expect(brideTab).toHaveAttribute('id', 'gift-tab-1')
    expect(within(dialog).getByRole('heading', { name: 'Mừng cưới từ phương xa' })).toBeVisible()
    expect(within(dialog).getByText(customIntro)).toBeVisible()
    expect(within(dialog).getByText('123456789')).toBeVisible()

    await user.click(brideTab)
    expect(within(dialog).getByText('987654321')).toBeVisible()
  })

  it('announces copy failure without claiming success', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('permission denied')) },
    })
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    })
    renderGift(gift([account()]))

    await user.click(screen.getByRole('button', { name: 'Mừng cưới online' }))
    const dialog = screen.getByRole('dialog', { name: 'Mừng cưới online' })
    await user.click(within(dialog).getByRole('button', { name: 'Sao chép STK' }))

    expect(within(dialog).getByRole('button', { name: 'Sao chép STK' })).toBeVisible()
    expect(within(dialog).getByRole('status')).toHaveTextContent('Không thể sao chép')
  })
})
