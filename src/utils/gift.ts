import type { WeddingConfig, WeddingGiftAccount } from '../types/wedding.ts'
import { cleanOptionalText, safeAssetUrl } from './contentSafety.ts'

export function giftAccountHasRequiredDetails(account: WeddingGiftAccount): boolean {
  return Boolean(
    cleanOptionalText(account.bankName)
    && cleanOptionalText(account.accountNumber)
    && cleanOptionalText(account.accountHolder),
  )
}

/** Returns only production-safe accounts and never exposes an enabled empty gift block. */
export function getDisplayableGiftAccounts(gift: WeddingConfig['gift']): WeddingGiftAccount[] {
  if (!gift.enabled) return []

  const ids = new Set<string>()
  return gift.accounts.filter((account) => {
    const id = cleanOptionalText(account.id)
    if (!id || ids.has(id) || !giftAccountHasRequiredDetails(account)) return false
    ids.add(id)
    return true
  })
}

/** An invalid or missing QR is omitted while valid bank details remain usable. */
export function safeGiftQrImage(account: WeddingGiftAccount): string | null {
  return safeAssetUrl(account.qrImage)
}
