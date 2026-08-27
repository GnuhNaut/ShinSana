/** Copies plain text without HTML and falls back for older in-app browsers. */
export async function copyPlainText(value: string): Promise<boolean> {
  const text = value.trim()
  if (!text) return false

  try {
    if (globalThis.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Continue to the DOM fallback used by some Zalo/Facebook in-app browsers.
  }

  if (!globalThis.document?.body) return false
  const activeElement = globalThis.document.activeElement instanceof HTMLElement
    ? globalThis.document.activeElement
    : null
  const textarea = globalThis.document.createElement('textarea')
  textarea.value = text
  textarea.readOnly = true
  textarea.tabIndex = -1
  textarea.setAttribute('aria-hidden', 'true')
  textarea.style.position = 'fixed'
  textarea.style.inset = '0 auto auto -9999px'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'

  try {
    globalThis.document.body.appendChild(textarea)
    try {
      textarea.focus({ preventScroll: true })
    } catch {
      textarea.focus()
    }
    textarea.select()
    return typeof globalThis.document.execCommand === 'function'
      && globalThis.document.execCommand('copy')
  } catch {
    return false
  } finally {
    try {
      textarea.remove()
    } catch {
      // The temporary field is best-effort in older embedded browsers.
    }
    try {
      activeElement?.focus({ preventScroll: true })
    } catch {
      try {
        activeElement?.focus()
      } catch {
        // Focus restoration must never turn a copy failure into an unhandled rejection.
      }
    }
  }
}
