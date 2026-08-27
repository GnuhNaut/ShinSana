export interface ImageAsset {
  src: string
  srcSet?: string
  sizes?: string
  alt: string
  aspectRatio: string
  objectPosition?: string
}

export interface PersonProfile {
  firstName: string
  fullName: string
  role: string
  portrait: ImageAsset
  introduction: string
}

export interface StoryChapter {
  chapter: string
  year: string
  title: string
  description: string
  image: ImageAsset
  placeholder: boolean
}

export interface GalleryImage extends ImageAsset {
  id: string
  layout: 'portrait' | 'landscape' | 'feature' | 'detail'
  caption: string
}

/** Optional, non-essential cutout imagery used as a playful wedding-paper accent. */
export interface DecorativeSticker {
  id: string
  src: string
  alt: string
  placement: 'hero' | 'gift' | 'album'
}

export type WeddingGiftSide = 'groom' | 'bride'

export interface WeddingGiftAccount {
  id: string
  side?: WeddingGiftSide
  label?: string
  bankName: string
  accountNumber: string
  accountHolder: string
  qrImage?: string
  branch?: string
}

export interface WeddingFamily {
  label?: string
  father?: string
  mother?: string
  location?: string
}

export interface CeremonyCalendar {
  /** ISO 8601 with offset, e.g. 2026-10-19T10:00:00+07:00. */
  eventStartIso: string
  /** ISO 8601 with offset and later than eventStartIso. */
  eventEndIso: string
}

export type WeddingEventSide = 'groom' | 'bride' | 'both'

export type WeddingEventType =
  | 'vu-quy'
  | 'thanh-hon'
  | 'wedding-party'
  | 'ceremony'
  | 'other'

export interface WeddingEvent {
  /** Stable key used by React and calendar downloads. */
  id: string
  side?: WeddingEventSide
  type?: WeddingEventType
  eyebrow?: string
  /** Free-form guest-facing title; no ceremony title is inferred. */
  title: string
  /** ISO date YYYY-MM-DD. */
  date?: string
  lunarDate?: string
  /** Display times such as "09:00". */
  guestArrivalTime?: string
  ceremonyTime?: string
  receptionTime?: string
  venueName?: string
  address?: string
  /** Manually confirmed HTTPS navigation URL. */
  mapUrl?: string
  /** Optional manually confirmed HTTPS embed URL. */
  mapEmbedUrl?: string
  parkingNote?: string
  contactName?: string
  contactPhone?: string
  calendar?: CeremonyCalendar
}

export interface WeddingConfig {
  couple: {
    groom: PersonProfile
    bride: PersonProfile
    signature: string
    monogram: string
  }
  date: {
    iso: string
    countdownIso: string
    eventStartIso: string
    eventEndIso: string
    display: string
    displayLong: string
    weekday: string
    lunar: string
    lunarLong: string
    timezone: string
  }
  families: {
    groom: WeddingFamily
    bride: WeddingFamily
  }
  events: WeddingEvent[]
  hero: ImageAsset
  decorativeStickers?: DecorativeSticker[]
  story: StoryChapter[]
  gallery: GalleryImage[]
  music: { title: string; artist: string; src: string }
  gift: { enabled: boolean; accounts: WeddingGiftAccount[] }
  seo: {
    title: string
    description: string
    image: string
    imageWidth: number
    imageHeight: number
    robots: string
    siteUrl: string
  }
  features: {
    music: boolean
    rsvp: boolean
    wish: boolean
    personalizedGuest: boolean
    gallery: boolean
  }
  copy: {
    coverEyebrow: string
    coverHint: string
    invitationTitle: string
    invitationGeneric: string
    invitationPersonalized: string
    invitationBody: string
    storyIntro: string
    storyQuote: string
    ceremonyIntro: string
    ceremonyTitle: string
    detailsNote: string
    finalTitle: string
    finalMessage: string
    rsvpTitle: string
    rsvpIntro: string
    rsvpThanks: string
    giftLabel: string
    giftCta: string
    giftIntro: string
  }
  sampleWishes: Array<{ id: string; name: string; message: string }>
}

export type GuestSide = WeddingEventSide
