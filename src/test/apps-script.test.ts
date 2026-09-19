import { afterEach, describe, expect, it, vi } from 'vitest'
import { isAppsScriptAvailable, submitRSVP, submitWish } from '../services/appsScript'

describe('Apps Script service', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('reports unavailable without a configured endpoint', async () => {
    vi.stubEnv('VITE_APPS_SCRIPT_URL', '')
    expect(isAppsScriptAvailable()).toBe(false)
    await expect(submitRSVP({
      guestName: 'Nguyễn Văn A',
      side: 'groom',
      attendance: 'yes',
      partySize: 1,
      message: '',
      timestamp: '2026-01-01T00:00:00.000Z',
    })).resolves.toEqual({ status: 'unavailable' })
  })

  it('posts the requested RSVP and wish payloads to a configured endpoint', async () => {
    vi.stubEnv('VITE_APPS_SCRIPT_URL', 'https://script.google.com/macros/s/example/exec')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    await submitRSVP({
      guestName: 'Nguyễn Văn A',
      side: 'groom',
      attendance: 'yes',
      partySize: 2,
      message: 'Hẹn gặp hai bạn',
      timestamp: '2026-01-01T00:00:00.000Z',
    })
    await submitWish({
      name: 'Trần Thị B',
      side: 'bride',
      message: 'Trăm năm hạnh phúc',
      timestamp: '2026-01-01T00:00:00.000Z',
    })

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'https://script.google.com/macros/s/example/exec', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        type: 'rsvp',
        guestName: 'Nguyễn Văn A',
        side: 'groom',
        attendance: 'yes',
        partySize: 2,
        message: 'Hẹn gặp hai bạn',
        timestamp: '2026-01-01T00:00:00.000Z',
      }),
    }))
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://script.google.com/macros/s/example/exec', expect.objectContaining({
      body: JSON.stringify({
        type: 'wish',
        name: 'Trần Thị B',
        side: 'bride',
        message: 'Trăm năm hạnh phúc',
        timestamp: '2026-01-01T00:00:00.000Z',
      }),
    }))
  })

  it('does not fake a successful submission when the endpoint rejects it', async () => {
    vi.stubEnv('VITE_APPS_SCRIPT_URL', 'https://script.google.com/macros/s/example/exec')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(submitWish({
      name: 'Bạn',
      side: 'both',
      message: 'Chúc mừng',
      timestamp: '2026-01-01T00:00:00.000Z',
    })).resolves.toEqual({ status: 'error' })
  })
})
