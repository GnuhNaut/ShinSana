import { useEffect, useRef, useState, type RefObject } from 'react';
import { cinematicImage, finaleImage, heroImage, introImage, wedding } from './config/wedding';
import { guestFromSearch } from './utils/guest';
import { usePointerSurface } from './hooks/usePointerSurface';
import { Gallery } from './components/Gallery';
import { Venues } from './components/Venues';
import { Response } from './components/Response';
import { Gift } from './components/Gift';
import { RomanticHearts } from './components/RomanticHearts';

function Music({
  audio,
  playing,
  onPlayingChange,
}: {
  audio: RefObject<HTMLAudioElement | null>;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
}) {
  const available = Boolean(wedding.music.src);
  const toggle = () => {
    if (!available || !audio.current) return;
    if (playing) {
      audio.current.pause();
      onPlayingChange(false);
    } else {
      audio.current.play().then(() => onPlayingChange(true)).catch(() => onPlayingChange(false));
    }
  };

  return (
    <>
      <audio
        ref={audio}
        preload="none"
        src={wedding.music.src}
        loop
        onPlay={() => onPlayingChange(true)}
        onPause={() => onPlayingChange(false)}
      />
      <button
        className={`music-control ${playing ? 'is-playing' : ''} ${!available ? 'is-unavailable' : ''}`}
        type="button"
        onClick={toggle}
        disabled={!available}
        aria-pressed={playing}
        aria-label={!available ? 'Nhạc nền đang chờ cập nhật' : playing ? 'Tạm dừng nhạc' : 'Bật nhạc'}
        title={!available ? 'Nhạc đang cập nhật' : undefined}
        data-no-hearts
      >
        <span className="music-control__seal" aria-hidden="true">
          <span className="music-control__ring" />
          <span className="music-control__bars"><i /><i /><i /></span>
        </span>
        <span className="music-control__label">{playing ? 'ĐANG PHÁT' : 'ÂM NHẠC'}</span>
      </button>
    </>
  );
}

function Opening({
  guest,
  opening,
  onOpen,
}: {
  guest: string;
  opening: boolean;
  onOpen: () => void;
}) {
  const pointerRef = usePointerSurface<HTMLElement>();
  return (
    <section
      ref={pointerRef}
      className={`opening ${opening ? 'is-opening' : ''}`}
      aria-label="Thiệp cưới Tuấn Hùng và Sao Mai"
    >
      <div className="opening__ambient" aria-hidden="true" />
      <div className="opening__stage">
        <button
          className="opening__folio"
          type="button"
          onClick={onOpen}
          disabled={opening}
          aria-label="Mở thiệp cưới Tuấn Hùng và Sao Mai"
          data-heart-allowed
        >
          <span className="opening__interior" aria-hidden="true">
            <img src={heroImage} alt="" />
            <span className="opening__interior-shade" />
            <span className="opening__interior-mark">T &amp; S</span>
          </span>
          <span className="opening__cover opening__cover--left" aria-hidden="true">
            <span className="opening__cover-edge" />
            <span className="opening__lattice" />
            <span className="opening__engraving" />
            <span className="opening__monogram">TH</span>
          </span>
          <span className="opening__cover opening__cover--right" aria-hidden="true">
            <span className="opening__cover-edge" />
            <span className="opening__lattice" />
            <span className="opening__engraving" />
            <span className="opening__monogram">SM</span>
          </span>
          <span className="opening__copy">
            <span className="opening__eyebrow">HỶ LỄ · 19.10.2026</span>
            <strong><span>Tuấn Hùng</span><i>&amp;</i><span>Sao Mai</span></strong>
            <span className="opening__guest-label">{guest ? 'Trân trọng kính mời' : 'Thiệp mời thành hôn'}</span>
            {guest && <b>{guest}</b>}
          </span>
          <span className="opening__seal" aria-hidden="true">
            <span className="opening__seal-ring" />
            <span className="opening__seal-face"><b>囍</b></span>
          </span>
          <span className="opening__instruction">CHẠM ĐỂ MỞ THIỆP <i /></span>
        </button>
        <div className="opening__folio-caption" aria-hidden="true">
          <span>TH</span><i /><span>THIỆP HỶ</span><i /><span>SM</span>
        </div>
      </div>
    </section>
  );
}

function Hero({ guest }: { guest: string }) {
  const pointerRef = usePointerSurface<HTMLElement>();
  const invitee = guest ? `Thân mời ${guest}` : wedding.copy.intro;
  return (
    <section ref={pointerRef} className="scene hero-scene" aria-labelledby="hero-title">
      <div className="hero-scene__photo-layer">
        <img
          className="hero-scene__photo"
          src={heroImage}
          fetchPriority="high"
          alt="Cặp đôi trong không gian lễ cưới sơn mài đỏ"
        />
      </div>
      <div className="hero-scene__atmosphere" aria-hidden="true" />
      <div className="hero-scene__silk hero-scene__silk--left" aria-hidden="true" />
      <div className="hero-scene__silk hero-scene__silk--right" aria-hidden="true" />
      <div className="hero-scene__lattice" aria-hidden="true"><i /><i /><i /><i /></div>

      <div className="hero-scene__content">
        <p className="hero-scene__invitee">{invitee}</p>
        <h1 id="hero-title" tabIndex={-1}>
          <span>{wedding.couple.groom}</span>
          <em>&</em>
          <span>{wedding.couple.bride}</span>
        </h1>
        <div className="hero-scene__date">
          <strong>{wedding.date}</strong>
          <span>{wedding.lunarDate}</span>
        </div>
      </div>
      <div className="hero-scene__foil" aria-hidden="true">囍</div>
      <a className="hero-scene__scroll" href="#invitation-story">
        <span>CUỘN ĐỂ KHÁM PHÁ</span><i aria-hidden="true" />
      </a>
    </section>
  );
}

function StoryIntro() {
  return (
    <section className="scene intro-scene" id="invitation-story" aria-labelledby="intro-title">
      <div className="intro-scene__seal" aria-hidden="true"><span>囍</span><i>19 · 10</i></div>
      <div className="intro-scene__copy">
        <p className="scene-kicker">CHÚNG MÌNH SẮP CƯỚI</p>
        <h2 id="intro-title">Một ngày son,<br /><em>một đời chung đôi.</em></h2>
        <p>Giữa rất nhiều cuộc gặp gỡ, chúng mình đã tìm thấy nhau. Giờ đây, niềm vui sẽ trọn vẹn hơn khi có bạn ở bên.</p>
        <div className="intro-scene__signature"><span>Tuấn Hùng</span><i>&</i><span>Sao Mai</span></div>
      </div>
      <figure className="intro-scene__portrait">
        <span className="intro-scene__frame" aria-hidden="true" />
        <img src={introImage} loading="lazy" alt="Chi tiết áo dài cưới trắng và hoa đỏ" />
        <figcaption><span>19</span><i>THÁNG MƯỜI</i><span>26</span></figcaption>
      </figure>
      <div className="intro-scene__cloud" aria-hidden="true" />
    </section>
  );
}

function CinematicBreak() {
  return (
    <section className="scene cinematic-scene" aria-label="Khoảnh khắc của cặp đôi">
      <img src={cinematicImage} loading="lazy" alt="Cặp đôi bên nhau trên bờ biển" />
      <div className="cinematic-scene__wash" aria-hidden="true" />
      <blockquote>
        <span aria-hidden="true">“</span>
        <p>{wedding.copy.cinematic}</p>
        <cite>HÙNG & MAI · 2026</cite>
      </blockquote>
      <div className="cinematic-scene__ribbon" aria-hidden="true" />
    </section>
  );
}

function Finale() {
  return (
    <section className="scene finale-scene" aria-labelledby="finale-title">
      <img src={finaleImage} loading="lazy" alt="Cặp đôi bước cùng nhau trong hành lang lễ cưới đỏ" />
      <div className="finale-scene__shade" aria-hidden="true" />
      <div className="finale-scene__copy">
        <span className="finale-scene__seal" aria-hidden="true">囍</span>
        <p>TRÂN TRỌNG CẢM ƠN</p>
        <h2 id="finale-title">{wedding.copy.finale}</h2>
        <strong>{wedding.date}</strong>
      </div>
    </section>
  );
}

export function App() {
  const [{ guest, side }] = useState(guestFromSearch);
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    document.title = wedding.seo.title;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', wedding.seo.description);
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', wedding.seo.title);
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', wedding.seo.description);
  }, []);

  useEffect(() => {
    if (opened) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [opened]);

  const openInvitation = () => {
    if (opening) return;
    if (wedding.music.src && audioRef.current) {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
    }
    setOpening(true);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => {
      setOpened(true);
      window.requestAnimationFrame(() => document.getElementById('hero-title')?.focus({ preventScroll: true }));
    }, reduced ? 150 : 980);
  };

  return (
    <main className={opened ? 'invitation-open' : ''}>
      <Music audio={audioRef} playing={musicPlaying} onPlayingChange={setMusicPlaying} />
      <RomanticHearts />
      {!opened && <Opening guest={guest} opening={opening} onOpen={openInvitation} />}
      <div className="site-content" aria-hidden={!opened} inert={!opened}>
        <Hero guest={guest} />
        <StoryIntro />
        <Venues side={side} />
        <CinematicBreak />
        <Gallery />
        <Response guest={guest} side={side} />
        <Gift side={side} />
        <Finale />
      </div>
    </main>
  );
}
