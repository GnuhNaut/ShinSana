import { useState, useEffect, type FormEvent } from 'react';
import type { WeddingSide } from '../config/wedding';
import { submitRsvp, submitWish } from '../services/submissions';
import {
  getSavedRsvp,
  getSavedWish,
  saveRsvp,
  saveWish,
  type SavedRsvp,
  type SavedWish,
} from '../utils/storage';
import { ArrowIcon, CheckIcon, StepIcon } from './Icons';

type Mode = 'rsvp' | 'wish';
type Attendance = 'Có, Mình sẽ tới chung vui' | 'Thật tiếc, Mình không thể tới chung vui';

function formatDateTimeVN(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function Response({ guest, side }: { guest: string; side: WeddingSide }) {
  const [mode, setMode] = useState<Mode>('rsvp');

  // Persistence state
  const [savedRsvp, setSavedRsvpState] = useState<SavedRsvp | null>(null);
  const [savedWish, setSavedWishState] = useState<SavedWish | null>(null);
  const [isEditingRsvp, setIsEditingRsvp] = useState(false);
  const [isEditingWish, setIsEditingWish] = useState(false);

  // Form input state
  const [rsvpName, setRsvpName] = useState(guest);
  const [attendance, setAttendance] = useState<Attendance>('Có, Mình sẽ tới chung vui');
  const [partySize, setPartySize] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState('');

  const [wishName, setWishName] = useState(guest);
  const [wishMessage, setWishMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<{ kind: 'idle' | 'success' | 'error'; text: string }>({ kind: 'idle', text: '' });

  // Load saved data on mount
  useEffect(() => {
    const existingRsvp = getSavedRsvp();
    if (existingRsvp) {
      setSavedRsvpState(existingRsvp);
      setRsvpName(existingRsvp.guestName || guest);
      if (
        existingRsvp.attendance === 'Có, Mình sẽ tới chung vui' ||
        existingRsvp.attendance === 'Thật tiếc, Mình không thể tới chung vui'
      ) {
        setAttendance(existingRsvp.attendance);
      }
      setPartySize(existingRsvp.partySize || 1);
      setRsvpMessage(existingRsvp.message || '');
    } else {
      setRsvpName(guest);
    }

    const existingWish = getSavedWish();
    if (existingWish) {
      setSavedWishState(existingWish);
      setWishName(existingWish.name || guest);
      setWishMessage(existingWish.message || '');
    } else {
      setWishName(guest);
    }
  }, [guest]);

  const changeMode = (next: Mode) => {
    setMode(next);
    setState({ kind: 'idle', text: '' });
  };

  const handleStartEditRsvp = () => {
    if (savedRsvp) {
      setRsvpName(savedRsvp.guestName);
      if (
        savedRsvp.attendance === 'Có, Mình sẽ tới chung vui' ||
        savedRsvp.attendance === 'Thật tiếc, Mình không thể tới chung vui'
      ) {
        setAttendance(savedRsvp.attendance);
      }
      setPartySize(savedRsvp.partySize || 1);
      setRsvpMessage(savedRsvp.message || '');
    }
    setIsEditingRsvp(true);
    setState({ kind: 'idle', text: '' });
  };

  const handleCancelEditRsvp = () => {
    setIsEditingRsvp(false);
    setState({ kind: 'idle', text: '' });
  };

  const handleStartEditWish = () => {
    if (savedWish) {
      setWishName(savedWish.name);
      setWishMessage(savedWish.message);
    }
    setIsEditingWish(true);
    setState({ kind: 'idle', text: '' });
  };

  const handleCancelEditWish = () => {
    setIsEditingWish(false);
    setState({ kind: 'idle', text: '' });
  };

  async function sendRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setState({ kind: 'idle', text: '' });

    const id = savedRsvp?.id || `rsvp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const submittedAt = formatDateTimeVN();

    const rsvpData: SavedRsvp = {
      id,
      guestName: rsvpName.trim(),
      side,
      attendance,
      partySize,
      message: rsvpMessage.trim(),
      submittedAt,
    };

    const result = await submitRsvp(rsvpData);
    setSubmitting(false);

    // Save locally in all cases (with fallback if offline or endpoint unconfigured)
    saveRsvp(rsvpData);
    setSavedRsvpState(rsvpData);
    setIsEditingRsvp(false);

    if (result.ok) {
      setState({
        kind: 'success',
        text: isEditingRsvp ? 'Đã cập nhật phản hồi thành công!' : 'Đã gửi xác nhận. Hẹn gặp bạn trong ngày vui!',
      });
    } else if (result.reason === 'unavailable') {
      setState({
        kind: 'success',
        text: 'Đã lưu phản hồi của bạn trên thiết bị. Cảm ơn bạn!',
      });
    } else {
      setState({
        kind: 'error',
        text: 'Chưa thể đồng bộ trực tuyến. Thông tin đã được lưu tạm trên máy của bạn.',
      });
    }
  }

  async function sendWish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setState({ kind: 'idle', text: '' });

    const id = savedWish?.id || `wish_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const submittedAt = formatDateTimeVN();

    const wishData: SavedWish = {
      id,
      name: wishName.trim(),
      side,
      message: wishMessage.trim(),
      submittedAt,
    };

    const result = await submitWish(wishData);
    setSubmitting(false);

    // Save locally
    saveWish(wishData);
    setSavedWishState(wishData);
    setIsEditingWish(false);

    if (result.ok) {
      setState({
        kind: 'success',
        text: isEditingWish ? 'Đã cập nhật lời chúc thành công!' : 'Lời chúc đã được gửi. Cảm ơn bạn rất nhiều!',
      });
    } else if (result.reason === 'unavailable') {
      setState({
        kind: 'success',
        text: 'Đã lưu lời chúc của bạn trên thiết bị. Cảm ơn bạn!',
      });
    } else {
      setState({
        kind: 'error',
        text: 'Chưa thể đồng bộ trực tuyến. Lời chúc đã được lưu tạm trên máy của bạn.',
      });
    }
  }

  const showRsvpSummary = Boolean(savedRsvp && !isEditingRsvp);
  const showWishSummary = Boolean(savedWish && !isEditingWish);

  return (
    <section className="scene response-scene" id="response" aria-labelledby="response-title">
      <div className="response-scene__ornament" aria-hidden="true"><span>囍</span></div>
      <div className="response-scene__heading">
        <p className="scene-kicker">HỒI ÂM</p>
        <h2 id="response-title">Dành một lời<br />cho ngày vui.</h2>
        <p>Chúng mình rất mong được đón bạn, và luôn trân trọng từng lời chúc gửi về.</p>
      </div>
      <div className={`response-paper response-paper--${mode}`}>
        <div className="response-paper__edge" aria-hidden="true" />
        <nav className="response-modes" aria-label="Chọn nội dung hồi âm">
          <button
            type="button"
            className={mode === 'rsvp' ? 'is-active' : ''}
            aria-pressed={mode === 'rsvp'}
            onClick={() => changeMode('rsvp')}
          >
            <span>01</span> XÁC NHẬN THAM DỰ
          </button>
          <button
            type="button"
            className={mode === 'wish' ? 'is-active' : ''}
            aria-pressed={mode === 'wish'}
            onClick={() => changeMode('wish')}
          >
            <span>02</span> GỬI LỜI CHÚC
          </button>
        </nav>

        <div className={`response-form-frame response-form-frame--${mode}`}>
          {/* Notification status if any */}
          {state.text && (
            <p className={`form-state form-state--${state.kind}`} role="status" aria-live="polite">
              {state.kind === 'success' && (
                <span className="form-state__seal" aria-hidden="true">
                  <CheckIcon />
                </span>
              )}
              {state.text}
            </p>
          )}

          {/* ===================== TAB 1: RSVP ===================== */}
          {mode === 'rsvp' && (
            showRsvpSummary && savedRsvp ? (
              <div className="response-saved-card" aria-label="Thông tin xác nhận đã lưu">
                <div className="response-saved-header">
                  <span className="response-saved-badge">
                    <CheckIcon /> ĐÃ XÁC NHẬN THAM DỰ
                  </span>
                  <span className="response-saved-time">{savedRsvp.submittedAt}</span>
                </div>

                <div className="response-saved-content">
                  <div className="response-saved-row">
                    <span className="response-saved-label">Khách mời:</span>
                    <strong className="response-saved-val">{savedRsvp.guestName}</strong>
                  </div>
                  <div className="response-saved-row">
                    <span className="response-saved-label">Phản hồi:</span>
                    <strong className={`response-saved-val ${savedRsvp.attendance.startsWith('Có') ? 'val-attending' : 'val-declined'}`}>
                      {savedRsvp.attendance}
                    </strong>
                  </div>
                  {savedRsvp.attendance.startsWith('Có') && (
                    <div className="response-saved-row">
                      <span className="response-saved-label">Số người:</span>
                      <strong className="response-saved-val">{savedRsvp.partySize} người</strong>
                    </div>
                  )}
                  {savedRsvp.message && (
                    <div className="response-saved-row response-saved-row--msg">
                      <span className="response-saved-label">Lời nhắn:</span>
                      <p className="response-saved-quote">“{savedRsvp.message}”</p>
                    </div>
                  )}
                </div>

                <div className="response-saved-actions">
                  <button
                    type="button"
                    className="lacquer-button response-edit-btn"
                    onClick={handleStartEditRsvp}
                  >
                    <span>SỬA LẠI THÔNG TIN</span>
                    <ArrowIcon direction="external" />
                  </button>
                  <p className="response-saved-hint">
                    Bạn đã xác nhận thông tin trước đó. Nếu có thay đổi, vui lòng bấm sửa lại để cập nhật cho cô dâu chú rể nhé!
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={sendRsvp} aria-label="Xác nhận tham dự">
                <div className="field-group field-group--wide">
                  <label htmlFor="rsvp-name">Họ và tên</label>
                  <input
                    id="rsvp-name"
                    required
                    name="name"
                    maxLength={72}
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    autoComplete="name"
                    placeholder="Tên của bạn"
                  />
                </div>

                <fieldset className="attendance-choice">
                  <legend>Bạn sẽ tham dự?</legend>
                  {(['Có, Mình sẽ tới chung vui', 'Thật tiếc, Mình không thể tới chung vui'] as const).map((option) => (
                    <label key={option} className={attendance === option ? 'is-selected' : ''}>
                      <input
                        type="radio"
                        name="attendance"
                        value={option}
                        checked={attendance === option}
                        onChange={() => setAttendance(option)}
                      />
                      <span className="attendance-choice__mark" aria-hidden="true">
                        {attendance === option && <CheckIcon />}
                      </span>
                      <span>{option === 'Có, Mình sẽ tới chung vui' ? 'Mình sẽ tới chung vui' : 'Thật tiếc, Mình không thể tới chung vui'}</span>
                    </label>
                  ))}
                </fieldset>

                {attendance.startsWith('Có') && (
                  <div className="field-group party-size-field">
                    <label id="party-size-label">Số người tham dự</label>
                    <div className="party-stepper" role="group" aria-labelledby="party-size-label">
                      <button
                        type="button"
                        onClick={() => setPartySize((value) => Math.max(1, value - 1))}
                        disabled={partySize === 1}
                        aria-label="Giảm số người tham dự"
                      >
                        <StepIcon kind="minus" />
                      </button>
                      <output aria-live="polite" aria-label={`${partySize} người`}>
                        {String(partySize).padStart(2, '0')}<small>NGƯỜI</small>
                      </output>
                      <button
                        type="button"
                        onClick={() => setPartySize((value) => Math.min(4, value + 1))}
                        disabled={partySize === 4}
                        aria-label="Tăng số người tham dự"
                      >
                        <StepIcon kind="plus" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="field-group field-group--wide">
                  <label htmlFor="rsvp-message">Lời nhắn (không bắt buộc)</label>
                  <textarea
                    id="rsvp-message"
                    name="message"
                    maxLength={360}
                    rows={4}
                    value={rsvpMessage}
                    onChange={(e) => setRsvpMessage(e.target.value)}
                    placeholder="Gửi chúng mình một lời nhắn…"
                  />
                </div>

                <div className="response-form-actions">
                  <button className="lacquer-button response-submit" type="submit" disabled={submitting}>
                    <span>{submitting ? 'ĐANG GỬI...' : isEditingRsvp ? 'CẬP NHẬT XÁC NHẬN' : 'GỬI XÁC NHẬN'}</span>
                    {submitting ? <i className="button-loader" aria-hidden="true" /> : <ArrowIcon direction="external" />}
                  </button>
                  {isEditingRsvp && (
                    <button
                      type="button"
                      className="response-cancel-btn"
                      onClick={handleCancelEditRsvp}
                      disabled={submitting}
                    >
                      Hủy bỏ
                    </button>
                  )}
                </div>
              </form>
            )
          )}

          {/* ===================== TAB 2: WISH ===================== */}
          {mode === 'wish' && (
            showWishSummary && savedWish ? (
              <div className="response-saved-card" aria-label="Lời chúc đã gửi">
                <div className="response-saved-header">
                  <span className="response-saved-badge">
                    <CheckIcon /> ĐÃ GỬI LỜI CHÚC
                  </span>
                  <span className="response-saved-time">{savedWish.submittedAt}</span>
                </div>

                <div className="response-saved-content">
                  <div className="response-saved-row">
                    <span className="response-saved-label">Người gửi:</span>
                    <strong className="response-saved-val">{savedWish.name}</strong>
                  </div>
                  <div className="response-saved-row response-saved-row--msg">
                    <span className="response-saved-label">Lời chúc:</span>
                    <p className="response-saved-quote">“{savedWish.message}”</p>
                  </div>
                </div>

                <div className="response-saved-actions">
                  <button
                    type="button"
                    className="lacquer-button response-edit-btn"
                    onClick={handleStartEditWish}
                  >
                    <span>SỬA LẠI LỜI CHÚC</span>
                    <ArrowIcon direction="external" />
                  </button>
                  <p className="response-saved-hint">
                    Bạn đã gửi lời chúc cho cặp đôi. Bạn có thể chỉnh sửa lại lời chúc bất cứ lúc nào!
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={sendWish} aria-label="Gửi lời chúc">
                <div className="field-group field-group--wide">
                  <label htmlFor="wish-name">Họ và tên</label>
                  <input
                    id="wish-name"
                    required
                    name="name"
                    maxLength={72}
                    value={wishName}
                    onChange={(e) => setWishName(e.target.value)}
                    autoComplete="name"
                    placeholder="Tên của bạn"
                  />
                </div>

                <div className="field-group field-group--wide">
                  <label htmlFor="wish-message">Lời chúc của bạn</label>
                  <textarea
                    id="wish-message"
                    required
                    name="message"
                    maxLength={360}
                    rows={4}
                    value={wishMessage}
                    onChange={(e) => setWishMessage(e.target.value)}
                    placeholder="Viết lời chúc của bạn gửi tới Tuấn Hùng & Sao Mai…"
                  />
                </div>

                <div className="response-form-actions">
                  <button className="lacquer-button response-submit" type="submit" disabled={submitting}>
                    <span>{submitting ? 'ĐANG GỬI...' : isEditingWish ? 'CẬP NHẬT LỜI CHÚC' : 'GỬI LỜI CHÚC'}</span>
                    {submitting ? <i className="button-loader" aria-hidden="true" /> : <ArrowIcon direction="external" />}
                  </button>
                  {isEditingWish && (
                    <button
                      type="button"
                      className="response-cancel-btn"
                      onClick={handleCancelEditWish}
                      disabled={submitting}
                    >
                      Hủy bỏ
                    </button>
                  )}
                </div>
              </form>
            )
          )}
        </div>
      </div>
    </section>
  );
}
