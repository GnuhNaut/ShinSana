import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { weddingDemoConfig } from '../config/wedding.demo'
import { weddingConfig } from '../config/wedding'

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
const originalUrl = window.location.href

afterEach(() => {
  if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
  else Reflect.deleteProperty(navigator, 'clipboard')
  window.history.replaceState({}, '', originalUrl)
})

async function openRenderedInvitation() {
  const user = userEvent.setup()
  const trigger = screen.getByRole('button', { name: 'Mở lời mời' })
  await user.click(trigger)
  await screen.findByRole('main', { name: 'Nội dung thiệp cưới' })
  await screen.findByRole('heading', { name: 'Ngày mình chung đôi' })
  return user
}

describe('App demo presentation', () => {
  it('renders all synthetic ceremony and family data and supports the complete gift dialog flow', async () => {
    window.history.replaceState({}, '', '/?demo=1')
    const writeText = vi.fn().mockResolvedValue(undefined)
    render(<App config={weddingDemoConfig} demoMode />)

    expect(screen.getByRole('status')).toHaveTextContent('DEMO PREVIEW')
    const user = await openRenderedInvitation()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    const families = document.querySelector<HTMLElement>('.invite__families')!
    expect(within(families).getByText('Nhà Trai')).toBeVisible()
    expect(within(families).getByText('Nhà Gái')).toBeVisible()
    expect(within(families).getByText('Nguyễn Văn Minh')).toBeVisible()
    expect(within(families).getByText('Phạm Ngọc Mai')).toBeVisible()

    const cards = [...document.querySelectorAll<HTMLElement>('article.event-card')]
    expect(cards).toHaveLength(3)
    expect(cards.map((card) => within(card).getByRole('heading').textContent)).toEqual([
      'Lễ Vu Quy',
      'Lễ Thành Hôn',
      'Tiệc Chung Vui',
    ])
    expect(screen.getAllByRole('button', { name: 'Chỉ đường' })).toHaveLength(3)

    const calendarLinks = screen.getAllByRole('link', { name: 'Lưu ngày cưới' })
    expect(calendarLinks).toHaveLength(3)
    expect(calendarLinks.map((link) => link.getAttribute('download'))).toEqual([
      'wedding-demo-vu-quy.ics',
      'wedding-demo-thanh-hon.ics',
      'wedding-demo-wedding-party.ics',
    ])
    const vuQuyIcsHref = calendarLinks[0]?.getAttribute('href') ?? ''
    const vuQuyIcs = decodeURIComponent(vuQuyIcsHref.slice(vuQuyIcsHref.indexOf(',') + 1))
    expect(vuQuyIcs).toContain('SUMMARY:Lễ Vu Quy')
    expect(vuQuyIcs).toContain('DTSTART:20261018T100000Z')

    const giftTrigger = screen.getByRole('button', { name: 'Gửi mừng cưới' })
    await user.click(giftTrigger)
    const dialog = screen.getByRole('dialog', { name: 'Gửi mừng cưới' })
    const closeButton = within(dialog).getByRole('button', { name: 'Đóng Gửi mừng cưới' })
    await waitFor(() => expect(closeButton).toHaveFocus())

    const tabs = within(dialog).getByRole('tablist', { name: 'Tài khoản nhận mừng cưới' })
    const groomTab = within(tabs).getByRole('tab', { name: 'Nhà Trai' })
    const brideTab = within(tabs).getByRole('tab', { name: 'Nhà Gái' })
    expect(groomTab).toHaveAttribute('aria-selected', 'true')
    expect(within(dialog).getByText('0123456789')).toBeVisible()
    expect(within(dialog).getByRole('img', { name: 'Mã QR mừng cưới Nhà Trai' })).toHaveAttribute(
      'src',
      '/images/demo/demo-qr-groom.png',
    )

    await user.click(brideTab)
    expect(brideTab).toHaveAttribute('aria-selected', 'true')
    expect(within(dialog).getByText('9876543210')).toBeVisible()
    expect(within(dialog).getByRole('img', { name: 'Mã QR mừng cưới Nhà Gái' })).toHaveAttribute(
      'src',
      '/images/demo/demo-qr-bride.png',
    )

    await user.click(within(dialog).getByRole('button', { name: 'Sao chép STK' }))
    expect(writeText).toHaveBeenCalledWith('9876543210')
    expect(within(dialog).getByRole('status')).toHaveTextContent('Đã sao chép số tài khoản')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(giftTrigger).toHaveFocus())
  })

  it('keeps every demo-only family, event, and gift value out of the production presentation', async () => {
    window.history.replaceState({}, '', '/')
    render(<App config={weddingConfig} demoMode={false} />)
    await openRenderedInvitation()

    const pageText = document.body.textContent ?? ''
    for (const sample of [
      'Nguyễn Văn Minh',
      'Ngân hàng Demo',
      '0123456789',
      '123 Đường Hoa Hồng, Quận Cầu Giấy, Hà Nội',
    ]) {
      expect(pageText, sample).not.toContain(sample)
    }
    expect(document.querySelectorAll('article.event-card')).toHaveLength(0)
    expect(screen.queryByRole('button', { name: /(?:Mừng cưới online|Gửi mừng cưới)/ })).not.toBeInTheDocument()
    expect(document.querySelector('img[src^="/images/demo/demo-qr-"]')).not.toBeInTheDocument()
  })
})
