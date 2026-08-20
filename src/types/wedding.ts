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

export interface GiftRecipient {
  label: string
  bankName: string
  accountName: string
  accountNumber: string
  qrImage: string
}

export interface FamilyParents {
  father: string
  mother: string
}

export interface CeremonyCalendar {
  /** ISO 8601 with offset, e.g. 2026-10-19T10:00:00+07:00. Empty = all-day. */
  eventStartIso: string
  /** ISO 8601 with offset. Required when eventStartIso is set. */
  eventEndIso: string
}

export type CeremonySide = 'bride' | 'groom'

export interface CeremonyEvent {
  /** Stable key used by React and calendar downloads; it is not guest-facing copy. */
  id: string
  /** Optional family affinity used only to personalize event ordering. */
  side?: CeremonySide
  enabled: boolean
  label: string
  /** Free-form ceremony title. Empty until the family confirms the ceremony type. */
  eventTitle: string
  /** ISO date YYYY-MM-DD. Empty until family confirms. */
  date: string
  /** Lunar date string entered by the family. Empty until family confirms. */
  lunarDate: string
  /** Display times such as "09:00". Empty until family confirms. */
  guestArrivalTime: string
  ceremonyTime: string
  banquetTime: string
  venueName: string
  address: string
  phone: string
  /** HTTPS map navigation URL. Empty until family confirms. */
  mapNavigationUrl: string
  /** HTTPS map embed URL. Empty until family confirms. */
  mapEmbedUrl: string
  calendar: CeremonyCalendar
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
    groomParents: FamilyParents
    brideParents: FamilyParents
  }
  events: CeremonyEvent[]
  hero: ImageAsset
  story: StoryChapter[]
  gallery: GalleryImage[]
  music: { title: string; artist: string; src: string }
  gift: { enabled: boolean; groom: GiftRecipient; bride: GiftRecipient }
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
    gift: boolean
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
    giftIntro: string
  }
  sampleWishes: Array<{ id: string; name: string; message: string }>
}

export type GuestSide = 'bride' | 'groom' | 'both'
