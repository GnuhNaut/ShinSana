import { useEffect, useState } from 'react';

// Ngày cưới chính thức: 19.10.2026 lúc 09:00 sáng
const WEDDING_TIMESTAMP = new Date('2026-10-19T09:00:00+07:00').getTime();

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPassed: boolean;
};

function calculateTimeLeft(): TimeLeft {
  const now = Date.now();
  const diff = WEDDING_TIMESTAMP - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isPassed: false };
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <section className="scene countdown-scene" aria-labelledby="countdown-heading">
      <div className="countdown-container">
        <div className="countdown-ornament countdown-ornament--top" aria-hidden="true">
          <span className="ornament-line" />
          <span className="ornament-mark">囍</span>
          <span className="ornament-line" />
        </div>

        <p className="scene-kicker">ĐẾM NGƯỢC NGÀY HỶ</p>
        <h2 id="countdown-heading" className="countdown-title">
          <span>Khoảnh khắc</span> một đời
        </h2>

        <p className="countdown-caption">
          Từng khoảnh khắc trôi qua đều là sự mong chờ được đón tiếp bạn trong ngày vui của chúng mình.
        </p>

        {timeLeft.isPassed ? (
          <div className="countdown-passed">
            <span className="countdown-passed-badge">NGÀY HỶ ĐÃ ĐẾN</span>
            <p>Cảm ơn bạn đã luôn đồng hành và sẻ chia hạnh phúc cùng Tuấn Hùng &amp; Sao Mai!</p>
          </div>
        ) : (
          <div className="countdown-timer" role="timer" aria-live="polite">
            <div className="countdown-card">
              <div className="countdown-card__inner">
                <span className="countdown-number">{formatNumber(timeLeft.days)}</span>
                <span className="countdown-unit">NGÀY</span>
              </div>
              <span className="countdown-corner-dot" aria-hidden="true" />
            </div>

            <span className="countdown-colon" aria-hidden="true">:</span>

            <div className="countdown-card">
              <div className="countdown-card__inner">
                <span className="countdown-number">{formatNumber(timeLeft.hours)}</span>
                <span className="countdown-unit">GIỜ</span>
              </div>
              <span className="countdown-corner-dot" aria-hidden="true" />
            </div>

            <span className="countdown-colon" aria-hidden="true">:</span>

            <div className="countdown-card">
              <div className="countdown-card__inner">
                <span className="countdown-number">{formatNumber(timeLeft.minutes)}</span>
                <span className="countdown-unit">PHÚT</span>
              </div>
              <span className="countdown-corner-dot" aria-hidden="true" />
            </div>

            <span className="countdown-colon" aria-hidden="true">:</span>

            <div className="countdown-card countdown-card--seconds">
              <div className="countdown-card__inner">
                <span className="countdown-number countdown-number--pulse">
                  {formatNumber(timeLeft.seconds)}
                </span>
                <span className="countdown-unit">GIÂY</span>
              </div>
              <span className="countdown-corner-dot" aria-hidden="true" />
            </div>
          </div>
        )}

        <div className="countdown-date-stamp">
          <span>19 · 10 · 2026</span>
          <i aria-hidden="true">✦</i>
          <span>10 / 09 ÂM LỊCH</span>
        </div>
      </div>
    </section>
  );
}
