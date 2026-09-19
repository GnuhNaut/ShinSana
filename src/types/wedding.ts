export type WeddingSide = 'groom' | 'bride'
export type GuestSide = WeddingSide | 'both'

export interface ImageAsset {
  id: string
  src: string
  srcSet?: string
  sizes?: string
  alt: string
  /** CSS aspect ratio, kept with each image to prevent layout shift. */
  aspectRatio: string
  objectPosition?: string
}

export interface GalleryImage extends ImageAsset {
  caption: string
  layout: 'wide' | 'portrait' | 'square' | 'detail'
}

/** The only two in-person locations presented on the invitation. */
export interface WeddingLocation {
  side: WeddingSide
  title: string
  date: string
  lunarDate: string
  receptionTime: string
  ceremonyTime: string
  address: string
  mapUrl: string
  note?: string
}

/** Empty values deliberately render as a clear “will update” state, never invented bank data. */
export interface WeddingGiftAccount {
  side: WeddingSide
  bankName: string
  accountHolder: string
  accountNumber: string
  qrImage?: string
}

export interface WeddingConfig {
  couple: {
    groom: string
    bride: string
    monogram: string
  }
  date: {
    iso: string
    display: string
    displayLong: string
    lunar: string
  }
  hero: ImageAsset
  locations: Record<WeddingSide, WeddingLocation>
  gifts: Record<WeddingSide, WeddingGiftAccount>
  music: {
    src: string
    title: string
    artist: string
  }
  gallery: GalleryImage[]
  content: {
    coverEyebrow: string
    coverPrompt: string
    invitationEyebrow: string
    invitationTitle: string
    invitationBody: string
    dateEyebrow: string
    dateTitle: string
    dateBody: string
    storyEyebrow: string
    storyTitle: string
    storyLead: string
    storyQuote: string
    locationsEyebrow: string
    locationsTitle: string
    locationsBody: string
    rsvpEyebrow: string
    rsvpTitle: string
    rsvpBody: string
    wishEyebrow: string
    wishTitle: string
    wishBody: string
    giftEyebrow: string
    giftTitle: string
    giftBody: string
    closingEyebrow: string
    closingTitle: string
    closingBody: string
  }
  sampleWishes: Array<{ id: string; name: string; message: string }>
  seo: {
    title: string
    description: string
    image: string
    imageWidth: number
    imageHeight: number
    robots: string
    siteUrl: string
  }
}
