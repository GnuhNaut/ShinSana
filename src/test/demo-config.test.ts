import { afterEach, describe, expect, it } from 'vitest'
import { weddingDemoConfig } from '../config/wedding.demo'
import {
  applyRuntimeRobots,
  isDemoMode,
  loadWeddingRuntime,
} from '../config/weddingRuntime'
import { validateWeddingConfig, weddingConfig } from '../config/wedding'

const demoOnlyStrings = [
  'Nguyễn Văn Minh',
  'Ngân hàng Demo',
  '0123456789',
  '9876543210',
  '123 Đường Hoa Hồng, Quận Cầu Giấy, Hà Nội',
  '88 Đường Hạnh Phúc, Quận Nam Từ Liêm, Hà Nội',
  '456 Đại lộ Tình Yêu, Hà Nội',
  '/images/demo/demo-qr-groom.png',
  '/images/demo/demo-qr-bride.png',
]

describe('wedding demo runtime resolver', () => {
  it('enables demo data only for the exact standalone ?demo=1 search string', () => {
    for (const search of [
      '?demo=1',
      'demo=1',
      '?demo=%31',
      '?demo=1&guest=Nguyen',
      '?guest=Nguyen&demo=1',
    ]) {
      expect(isDemoMode(search), search).toBe(true)
    }

    for (const search of [
      '',
      '?demo=0',
      '?demo=true',
      '?demo=01',
      '?Demo=1',
      '?demo=1&demo=1',
      '?demo=0&demo=1',
      '?demo=1&demo=0',
    ]) {
      expect(isDemoMode(search), search).toBe(false)
    }
  })

  it('loads the complete valid demo config without mutating production data', async () => {
    const runtime = await loadWeddingRuntime('?demo=1')

    expect(runtime).toEqual({ config: weddingDemoConfig, demoMode: true })
    expect(validateWeddingConfig(runtime.config)).toEqual([])
    expect(runtime.config.events.map(({ title }) => title)).toEqual([
      'Lễ Vu Quy',
      'Lễ Thành Hôn',
      'Tiệc Chung Vui',
    ])
    expect(runtime.config.families).toMatchObject({
      groom: { father: 'Nguyễn Văn Minh', mother: 'Trần Thu Hà' },
      bride: { father: 'Lê Văn Thành', mother: 'Phạm Ngọc Mai' },
    })
    expect(runtime.config.gift).toMatchObject({
      enabled: true,
      accounts: [
        { bankName: 'Ngân hàng Demo', accountNumber: '0123456789', qrImage: '/images/demo/demo-qr-groom.png' },
        { bankName: 'Ngân hàng Demo', accountNumber: '9876543210', qrImage: '/images/demo/demo-qr-bride.png' },
      ],
    })

    expect(weddingConfig.events).toEqual([])
    expect(weddingConfig.gift).toEqual({ enabled: false, accounts: [] })
  })

  it('returns the production singleton for every non-exact query and excludes all demo-only strings', async () => {
    for (const search of ['', '?demo=0', '?demo=other', '?demo=1&demo=0']) {
      await expect(loadWeddingRuntime(search)).resolves.toEqual({
        config: weddingConfig,
        demoMode: false,
      })
    }

    const serializedProduction = JSON.stringify(weddingConfig)
    for (const sample of demoOnlyStrings) {
      expect(serializedProduction, sample).not.toContain(sample)
    }
    expect(weddingConfig.gift.enabled).toBe(false)
    expect(weddingConfig.gift.accounts).toEqual([])
  })
})

describe('demo robots metadata', () => {
  const originalHead = document.head.innerHTML
  const originalDemoMarker = document.documentElement.dataset.weddingDemo

  afterEach(() => {
    document.head.innerHTML = originalHead
    if (originalDemoMarker === undefined) delete document.documentElement.dataset.weddingDemo
    else document.documentElement.dataset.weddingDemo = originalDemoMarker
  })

  it('sets noindex for demo, preserves canonical, and restores the prior metadata exactly', () => {
    document.head.innerHTML = `
      <meta name="robots" content="index, follow">
      <link rel="canonical" href="https://wedding.example/invitation">
    `
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const canonicalHref = canonical?.href

    const cleanup = applyRuntimeRobots(true, 'index, follow')

    expect(document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content).toBe('noindex, nofollow')
    expect(document.documentElement).toHaveAttribute('data-wedding-demo', 'true')
    expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')).toBe(canonical)
    expect(canonical?.href).toBe(canonicalHref)

    cleanup()
    expect(document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content).toBe('index, follow')
    expect(document.documentElement).not.toHaveAttribute('data-wedding-demo')
    expect(canonical?.href).toBe(canonicalHref)
  })

  it('keeps production robots and removes a runtime-created meta element during cleanup', () => {
    document.querySelectorAll('meta[name="robots"]').forEach((element) => element.remove())

    const cleanup = applyRuntimeRobots(false, 'index, follow')
    expect(document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content).toBe('index, follow')
    expect(document.documentElement).not.toHaveAttribute('data-wedding-demo')

    cleanup()
    expect(document.querySelector('meta[name="robots"]')).not.toBeInTheDocument()
  })
})
