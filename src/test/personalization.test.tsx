import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../App'

function renderInvitation(query: string) {
  window.history.replaceState({}, '', query)
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Mở lời mời' }))
}

afterEach(() => window.history.replaceState({}, '', '/'))

describe('personalized invitation flows', () => {
  it('shows the guest name and only the groom location for side=groom', async () => {
    renderInvitation('/?guest=Nguyen%20Van%20A&side=groom')
    await screen.findByRole('main', { name: 'Nội dung thiệp cưới' })

    expect(screen.getAllByText('Nguyen Van A').length).toBeGreaterThan(0)
    const locations = document.querySelector<HTMLElement>('#locations')
    expect(locations).not.toBeNull()
    expect(within(locations!).getByRole('heading', { name: 'Nhà Trai' })).toBeVisible()
    expect(within(locations!).queryByRole('heading', { name: 'Nhà Gái' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Nhà Trai/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Chức năng xác nhận trực tuyến sẽ sớm được mở.')).toBeVisible()
  })

  it('shows the bride location and prioritizes the bride envelope for side=bride', async () => {
    renderInvitation('/?guest=Tran%20Thi%20B&side=bride')
    await screen.findByRole('main', { name: 'Nội dung thiệp cưới' })

    const locations = document.querySelector<HTMLElement>('#locations')
    expect(locations).not.toBeNull()
    expect(within(locations!).getByRole('heading', { name: 'Nhà Gái' })).toBeVisible()
    expect(within(locations!).queryByRole('heading', { name: 'Nhà Trai' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Nhà Gái/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps both locations and both gift accounts for side=both or an invalid side', async () => {
    renderInvitation('/?guest=Gia%20dinh%20Anh%20Chi&side=invalid')
    await screen.findByRole('main', { name: 'Nội dung thiệp cưới' })

    expect(screen.getByRole('heading', { name: 'Nhà Trai' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Nhà Gái' })).toBeVisible()
    expect(screen.getByRole('button', { name: /Nhà Trai/ })).toBeVisible()
    expect(screen.getByRole('button', { name: /Nhà Gái/ })).toBeVisible()
    await waitFor(() => expect(document.querySelectorAll('.album-grid__item')).toHaveLength(24))
  })
})
