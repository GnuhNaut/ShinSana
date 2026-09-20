import { useState, type FormEvent } from 'react';
import type { WeddingSide } from '../config/wedding';
import { submitRsvp, submitWish } from '../services/submissions';

type Mode = 'rsvp' | 'wish';
type Attendance = 'Có, tôi sẽ tham dự' | 'Rất tiếc, tôi không thể tham dự';

export function Response({ guest, side }: { guest: string; side: WeddingSide }) {
  const [mode, setMode] = useState<Mode>('rsvp');
  const [attendance, setAttendance] = useState<Attendance>('Có, tôi sẽ tham dự');
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<{ kind: 'idle' | 'success' | 'error'; text: string }>({ kind: 'idle', text: '' });

  const changeMode = (next: Mode) => {
    setMode(next);
    setState({ kind: 'idle', text: '' });
  };

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    setState({ kind: 'idle', text: '' });
    const result = mode === 'rsvp'
      ? await submitRsvp({
          guestName: String(data.get('name') || ''),
          side,
          attendance,
          partySize: Number(data.get('partySize') || 1),
          message: String(data.get('message') || ''),
        })
      : await submitWish({
          name: String(data.get('name') || ''),
          side,
          message: String(data.get('message') || ''),
        });
    setSubmitting(false);
    if (result.ok) {
      setState({ kind: 'success', text: mode === 'rsvp' ? 'Đã gửi xác nhận. Hẹn gặp bạn trong ngày vui!' : 'Lời chúc đã được gửi. Cảm ơn bạn!' });
    } else if (result.reason === 'unavailable') {
      setState({ kind: 'error', text: 'Dịch vụ đang được kết nối. Vui lòng liên hệ trực tiếp với cô dâu hoặc chú rể.' });
    } else {
      setState({ kind: 'error', text: 'Chưa thể gửi lúc này. Vui lòng thử lại sau.' });
    }
  }

  return (
    <section className="scene response-scene" id="response" aria-labelledby="response-title">
      <div className="response-scene__ornament" aria-hidden="true"><span>囍</span></div>
      <div className="response-scene__heading">
        <p className="scene-kicker">HỒI ÂM</p>
        <h2 id="response-title">Dành một lời<br />cho ngày vui.</h2>
        <p>Chúng mình rất mong được đón bạn, và luôn trân trọng từng lời chúc gửi về.</p>
      </div>
      <div className="response-paper">
        <div className="response-paper__edge" aria-hidden="true" />
        <nav className="response-modes" aria-label="Chọn nội dung hồi âm">
          <button type="button" className={mode === 'rsvp' ? 'is-active' : ''} aria-pressed={mode === 'rsvp'} onClick={() => changeMode('rsvp')}>
            <span>01</span> XÁC NHẬN THAM DỰ
          </button>
          <button type="button" className={mode === 'wish' ? 'is-active' : ''} aria-pressed={mode === 'wish'} onClick={() => changeMode('wish')}>
            <span>02</span> GỬI LỜI CHÚC
          </button>
        </nav>

        <div className={`response-form-frame response-form-frame--${mode}`}>
          <form onSubmit={send} key={mode} aria-label={mode === 'rsvp' ? 'Xác nhận tham dự' : 'Gửi lời chúc'}>
            <div className="field-group field-group--wide">
              <label htmlFor={`${mode}-name`}>Họ và tên</label>
              <input id={`${mode}-name`} required name="name" maxLength={72} defaultValue={guest} autoComplete="name" placeholder="Tên của bạn" />
            </div>

            {mode === 'rsvp' && (
              <>
                <fieldset className="attendance-choice">
                  <legend>Bạn sẽ tham dự?</legend>
                  {(['Có, tôi sẽ tham dự', 'Rất tiếc, tôi không thể tham dự'] as const).map((option) => (
                    <label key={option} className={attendance === option ? 'is-selected' : ''}>
                      <input
                        type="radio"
                        name="attendance"
                        value={option}
                        checked={attendance === option}
                        onChange={() => setAttendance(option)}
                      />
                      <span className="attendance-choice__mark" aria-hidden="true">{attendance === option ? '✓' : ''}</span>
                      <span>{option === 'Có, tôi sẽ tham dự' ? 'Tôi sẽ tham dự' : 'Tôi không thể tham dự'}</span>
                    </label>
                  ))}
                </fieldset>
                <div className="field-group">
                  <label htmlFor="party-size">Số người tham dự</label>
                  <select id="party-size" name="partySize" defaultValue="1">
                    <option value="1">01 người</option>
                    <option value="2">02 người</option>
                    <option value="3">03 người</option>
                    <option value="4">04 người</option>
                  </select>
                </div>
              </>
            )}

            <div className="field-group field-group--wide">
              <label htmlFor={`${mode}-message`}>{mode === 'rsvp' ? 'Lời nhắn (không bắt buộc)' : 'Lời chúc của bạn'}</label>
              <textarea
                id={`${mode}-message`}
                required={mode === 'wish'}
                name="message"
                maxLength={360}
                rows={4}
                placeholder={mode === 'wish' ? 'Viết lời chúc của bạn…' : 'Gửi chúng mình một lời nhắn…'}
              />
            </div>
            <button className="lacquer-button response-submit" type="submit" disabled={submitting}>
              <span>{submitting ? 'ĐANG GỬI' : mode === 'rsvp' ? 'GỬI XÁC NHẬN' : 'GỬI LỜI CHÚC'}</span>
              {submitting ? <i className="button-loader" aria-hidden="true" /> : <i aria-hidden="true">↗</i>}
            </button>
            <p className={`form-state form-state--${state.kind}`} role="status" aria-live="polite">{state.text}</p>
          </form>
        </div>
      </div>
    </section>
  );
}
