import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { cinematicImage, finaleImage, finaleMobileImage, heroImage, introImage, wedding } from './config/wedding';
import { guestFromSearch } from './utils/guest';
import { usePointerSurface } from './hooks/usePointerSurface';
import { Gallery } from './components/Gallery';
import { Venues } from './components/Venues';
import { Response } from './components/Response';
import { Gift } from './components/Gift';
import { RomanticHearts } from './components/RomanticHearts';
import { useInvitationEntryScroll } from './hooks/useInvitationEntryScroll';
import { InviteGenerator } from './components/InviteGenerator';
import { Countdown } from './components/Countdown';
import { GoldenStardust } from './components/GoldenStardust';

function Music({
  audio,
  playing,
  onPlayingChange,
  revealed,
}: {
  audio: RefObject<HTMLAudioElement | null>;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  revealed: boolean;
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
      {revealed && (
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
      )}
    </>
  );
}

function Opening({
  guest,
  avatar,
  opening,
  closing,
  onOpen,

}: {
  guest: string;
  avatar?: string;
  opening: boolean;
  closing: boolean;
  onOpen: () => void;
}) {
  const pointerRef = usePointerSurface<HTMLElement>();
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  return (
    <section
      ref={pointerRef}
      className={`opening ${opening ? 'is-opening' : ''} ${closing ? 'is-closing' : ''}`}
      aria-label="Thiệp cưới Tuấn Hùng và Sao Mai"
    >
      <div className="opening__ambient" aria-hidden="true" />
      <div className="opening__stage">
        <button
          className="opening__folio"
          type="button"
          onClick={onOpen}
          aria-disabled={opening}
          aria-label="Mở thiệp cưới Tuấn Hùng và Sao Mai"
          data-heart-allowed
        >
          <span className="opening__interior" aria-hidden="true">
            <img className='hero-scene__photo' src={heroImage} alt="" />
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
            {/* <span className="opening__eyebrow">HỶ LỄ · 19.10.2026</span> */}
            <strong className="opening__names">
              <span className="opening__name" data-text="Tuấn Hùng">Tuấn <br /> Hùng</span>
              <span className="opening__name" data-text="Sao Mai">Sao <br /> Mai</span>
            </strong>
            <span className="opening__invitation-card">
              <span className="opening__invitation-eyebrow">TRÂN TRỌNG KÍNH MỜI</span>
              <span className="opening__guest-pill">
                <b>{guest ? guest : 'Quý Khách & Người Thương'}</b>
              </span>
              <span className="opening__invitation-purpose">
                Đến dự buổi tiệc chung vui cùng gia đình chúng tôi
              </span>
            </span>
          </span>
          {avatar && (
            <span className={`opening__guest-stamp ${avatarLoaded ? 'is-loaded' : 'is-loading'}`} aria-label={guest ? `Ảnh khách mời ${guest}` : 'Ảnh khách quý'}>
              <span className="opening__guest-stamp-frame">
                <img
                  src={avatar}
                  alt={guest ? `Ảnh ${guest}` : 'Khách quý'}
                  className="opening__guest-stamp-img"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onLoad={() => setAvatarLoaded(true)}
                  onError={(e) => {
                    const el = e.currentTarget.closest('.opening__guest-stamp') as HTMLElement | null;
                    if (el) el.style.display = 'none';
                  }}
                />
                {!avatarLoaded && <span className="opening__guest-stamp-spinner" aria-hidden="true" />}
                <span className="opening__guest-stamp-rim" aria-hidden="true" />
                <span className="opening__guest-stamp-pin" aria-hidden="true">✦</span>
              </span>
              <span className="opening__guest-stamp-tag">KHÁCH QUÝ</span>
            </span>
          )}
          <span className={`opening__seal ${opening ? 'is-bursting' : ''}`} aria-hidden="true">
            {opening && (
              <>
                <span className="opening__seal-burst" />
                <span className="opening__seal-burst opening__seal-burst--second" />
                <span className="opening__seal-aura" />
              </>
            )}
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
      <div className="hero-scene__content">
        <div className="hero-scene__invitation-card">
          <div className="hero-scene__ornament-line">
            <span className="hero-scene__ornament-dash" aria-hidden="true" />
            <span className="hero-scene__card-kicker">LỄ THÀNH HÔN · 19.10.2026</span>
          </div>
          <p className="hero-scene__invitation-lead">TRÂN TRỌNG KÍNH MỜI</p>
          <div className="hero-scene__guest-pill">
            <span className="hero-scene__guest-name">{guest ? guest : 'Quý Khách & Người Thương'}</span>
          </div>
          <p className="hero-scene__invitation-sub">
            Đến dự buổi tiệc chung vui cùng gia đình chúng tôi
          </p>
        </div>

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
        <p className="scene-kicker">CHÚNG MÌNH SẮP VỀ CHUNG MỘT NHÀ</p>
        <h2 id="intro-title" style={{ lineHeight: 1.2 }}>Một ngày son,<br /><em>một đời chung đôi.</em></h2>
        <p style={{textAlign: 'justify'}}>Cuối cùng, chúng mình cũng đã viết nên câu chuyện của riêng mình. <br/>

Bằng tất cả sự trân trọng và yêu thương,
chúng mình tự tay chuẩn bị tấm thiệp nhỏ này,
gửi lời mời đến những người đặc biệt nhất trong cuộc đời. <br/>

Mong bạn sẽ đến,
cùng chúng mình lưu giữ khoảnh khắc thật đẹp,
và chứng kiến một chương mới
trong câu chuyện tình yêu của chúng mình.</p>
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
      <img src={cinematicImage} loading="lazy" alt="Cặp đôi trong trang phục cưới đỏ" />
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
      <div className="finale-scene__photo-layer" aria-hidden="true">
        <picture>
          <source media="(max-width: 900px)" srcSet={finaleMobileImage} />
          <img src={finaleImage} loading="lazy" alt="Tuấn Hùng & Sao Mai trong ngày cưới" className="finale-scene__photo" />
        </picture>
      </div>
      <div className="finale-scene__atmosphere" aria-hidden="true" />
      <div className="finale-scene__content">
        <span className="finale-scene__seal" aria-hidden="true">囍</span>
        <p id="finale-title" className="finale-scene__kicker">TRÂN TRỌNG CẢM ƠN</p>
        <div className="finale-scene__letter">
          <p>
            Cảm ơn bạn đã đến và cùng chúng mình chia sẻ khoảnh khắc đặc biệt này.<br />
            Mong rằng niềm hạnh phúc hôm nay sẽ lan tỏa đến bạn, để những ngày tháng phía trước luôn có thật nhiều bình an, ấm áp và niềm vui.
          </p>
          <p>
            Chúc bạn luôn bình an, vui vẻ, gặp được những điều mình mong cầu và luôn có người đồng hành trên hành trình phía trước.
          </p>
          <p className="finale-scene__promise">
            Hẹn gặp bạn trong ngày chúng mình viết tiếp câu chuyện tình yêu này.
          </p>
          <div className="finale-scene__signoff">
            <span className="finale-scene__withlove">With love,</span>
            <span className="finale-scene__couple">SM - TH</span>
          </div>
        </div>
        <div className="finale-scene__date">
          <span className="finale-scene__date-line" aria-hidden="true" />
          <strong>{wedding.date}</strong>
          <span className="finale-scene__date-line" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function WeddingInvitation() {
  const [{ guest, side, avatar }] = useState(guestFromSearch);
  const [opening, setOpening] = useState(false);

  const [opened, setOpened] = useState(false);
  const [showOpening, setShowOpening] = useState(true);
  const [closingOpening, setClosingOpening] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const openingTimerRef = useRef<number>(0);
  const closingTimerRef = useRef<number>(0);
  const celebrationTimerRef = useRef<number>(0);
  const { normalizeTop } = useInvitationEntryScroll(opened);

  useEffect(() => {
    document.title = wedding.seo.title;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', wedding.seo.description);
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', wedding.seo.title);
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', wedding.seo.description);
  }, []);

  useEffect(() => {
    if (!avatar) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = avatar;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, [avatar]);

  useLayoutEffect(() => {
    if (!opened) return;
    normalizeTop();
    document.getElementById('hero-title')?.focus({ preventScroll: true });
  }, [normalizeTop, opened]);

  useEffect(() => () => {
    if (openingTimerRef.current) window.clearTimeout(openingTimerRef.current);
    if (closingTimerRef.current) window.clearTimeout(closingTimerRef.current);
    if (celebrationTimerRef.current) window.clearTimeout(celebrationTimerRef.current);
  }, []);

  const openInvitation = () => {
    if (opening) return;
    if (wedding.music.src && audioRef.current) {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
    }
    normalizeTop();
    setOpening(true);
    setCelebrating(true);
    if (celebrationTimerRef.current) window.clearTimeout(celebrationTimerRef.current);
    celebrationTimerRef.current = window.setTimeout(() => {
      setCelebrating(false);
    }, 5400);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    openingTimerRef.current = window.setTimeout(() => {
      normalizeTop();
      setOpened(true);
      setClosingOpening(true);
      closingTimerRef.current = window.setTimeout(() => {
        setShowOpening(false);
        setOpening(false);
        setClosingOpening(false);
      }, 420);
    }, reduced ? 250 : 980);
  };

  return (
    <main className={opened ? 'invitation-open' : ''}>
      <Music audio={audioRef} playing={musicPlaying} onPlayingChange={setMusicPlaying} revealed={opened} />
      <RomanticHearts celebrating={celebrating} />
      <GoldenStardust active={opened} />
      {showOpening && <Opening guest={guest} avatar={avatar} opening={opening} closing={closingOpening} onOpen={openInvitation} />}

      <div className="site-content" aria-hidden={!opened} inert={!opened}>
        <Hero guest={guest} />
        <StoryIntro />
        <Venues side={side} />
        <CinematicBreak />
        <Gallery />
        <Response guest={guest} side={side} />
        <Gift side={side} />
        <Countdown />
        <Finale />
      </div>
    </main>
  );
}

export function App() {
  const isGenerator =
    typeof window !== 'undefined' && /^\/(invite|tao-thiep)(\/|$)/i.test(window.location.pathname);

  if (isGenerator) {
    return <InviteGenerator />;
  }

  return <WeddingInvitation />;
}
