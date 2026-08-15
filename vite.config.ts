import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { weddingConfig } from './src/config/wedding.ts'

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function weddingMetadata(siteUrlOverride = '') {
  const { seo, couple, date } = weddingConfig
  const siteUrl = siteUrlOverride.trim() || seo.siteUrl.trim()
  let socialImage = seo.image
  let urlTag = ''
  if (siteUrl) {
    const pageUrl = new URL(siteUrl)
    if (!['http:', 'https:'].includes(pageUrl.protocol)) {
      throw new Error('VITE_SITE_URL or weddingConfig.seo.siteUrl must use HTTP or HTTPS')
    }
    const normalizedPageUrl = pageUrl.toString()
    socialImage = new URL(seo.image, normalizedPageUrl).toString()
    urlTag = `<link rel="canonical" href="${escapeHtml(normalizedPageUrl)}" />\n    <meta property="og:url" content="${escapeHtml(normalizedPageUrl)}" />`
  }
  const replacements: Record<string, string> = {
    '{{WEDDING_TITLE}}': escapeHtml(seo.title),
    '{{WEDDING_DESCRIPTION}}': escapeHtml(seo.description),
    '{{WEDDING_ROBOTS}}': escapeHtml(seo.robots),
    '{{WEDDING_IMAGE}}': escapeHtml(socialImage),
    '{{WEDDING_OG_URL}}': urlTag,
    '{{WEDDING_NAMES}}': escapeHtml(`${couple.groom.fullName} & ${couple.bride.fullName}`),
    '{{WEDDING_DATE}}': escapeHtml(date.display),
    '{{WEDDING_LUNAR}}': escapeHtml(date.lunar),
  }

  return {
    name: 'wedding-config-metadata',
    transformIndexHtml(html: string) {
      return Object.entries(replacements).reduce((output, [token, value]) => output.replaceAll(token, value), html)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_')

  return {
    plugins: [react(), weddingMetadata(env.VITE_SITE_URL)],
    server: { host: '127.0.0.1', port: 5173 },
    preview: { host: '127.0.0.1', port: 4173 },
    build: { assetsDir: 'assets/vite', sourcemap: false },
    test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', css: true },
  }
})
