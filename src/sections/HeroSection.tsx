import { forwardRef } from 'react'
import { ParallaxLayer } from '../components/motion'
import { DongSonDivider, EasternCloud, FloatingPetals, Lotus } from '../components/ornaments'
import { WeddingImage } from '../components/ui/WeddingImage'
import { weddingConfig as config } from '../config/wedding'

export const HeroSection = forwardRef<HTMLHeadingElement>(function HeroSection(_, headingRef) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <DongSonDivider className="hero__dong-son hero__dong-son--top" tone="champagne" />
      <DongSonDivider className="hero__dong-son hero__dong-son--bottom" tone="champagne" center="diamond" />
      <div className="hero__topline">
        <span>Lễ thành hôn</span>
        <time dateTime={config.date.iso}>{config.date.display}</time>
      </div>
      <div className="hero__stage">
        <div className="hero__frame">
          <ParallaxLayer className="hero__parallax" strength={0.032}>
            <WeddingImage {...config.hero} eager wrapperClassName="hero__image" />
          </ParallaxLayer>
          <div className="hero__veil" aria-hidden="true" />
        </div>
      </div>
      <FloatingPetals className="hero__petals" count={12} tone="champagne" />
      <div className="hero__content">
        <p className="hero__lunar">{config.date.lunar}</p>
        <h1 id="hero-title" ref={headingRef} tabIndex={-1}>
          <span>{config.couple.groom.fullName}</span>
          <i>&amp;</i>
          <span>{config.couple.bride.fullName}</span>
        </h1>
        <p className="hero__line">{config.copy.heroLine}</p>
      </div>
      <a href="#invitation" className="hero__scroll" aria-label="Cuộn xuống lời mời"><span aria-hidden="true" /></a>
      <Lotus className="hero__lotus" tone="champagne" withWater={false} />
      <EasternCloud className="hero__cloud hero__cloud--left" direction="left" tone="champagne" />
      <EasternCloud className="hero__cloud hero__cloud--right" direction="right" tone="champagne" />
    </section>
  )
})
