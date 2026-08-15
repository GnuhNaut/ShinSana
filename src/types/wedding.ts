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
  venue: {
    name: string
    address: string
    mapEmbedUrl: string
    mapNavigationUrl: string
  }
  hero: ImageAsset
  story: StoryChapter[]
  gallery: GalleryImage[]
  music: { title: string; artist: string; src: string }
  gift: { enabled: boolean; groom: GiftRecipient; bride: GiftRecipient }
  seo: { title: string; description: string; image: string; robots: string; siteUrl: string }
  features: {
    music: boolean
    rsvp: boolean
    guestbook: boolean
    gift: boolean
    personalizedGuest: boolean
    gallery: boolean
  }
  copy: {
    openingEyebrow: string
    openingHint: string
    heroLine: string
    invitationGeneric: string
    invitationPersonalized: string
    invitationBody: string
    storyIntro: string
    galleryQuote: string
    detailsNote: string
    finalMessage: string
    rsvpIntro: string
    guestbookIntro: string
  }
  sampleWishes: Array<{ id: string; name: string; message: string }>
}
