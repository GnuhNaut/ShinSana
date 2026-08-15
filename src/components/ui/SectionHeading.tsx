interface SectionHeadingProps {
  id?: string
  folio?: string
  eyebrow: string
  eyebrowLang?: 'en' | 'fr' | 'vi'
  title: string
  description?: string
  light?: boolean
}

export function SectionHeading({ id, folio, eyebrow, eyebrowLang, title, description, light = false }: SectionHeadingProps) {
  return (
    <header className={`section-heading ${light ? 'section-heading--light' : ''}`}>
      <div className="section-heading__meta">{folio && <span>{folio}</span>}<span lang={eyebrowLang}>{eyebrow}</span></div>
      <h2 id={id}>{title}</h2>
      {description && <p>{description}</p>}
    </header>
  )
}
