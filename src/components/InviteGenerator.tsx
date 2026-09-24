import { useState, useEffect } from 'react';
import type { WeddingSide } from '../config/wedding';
import { ArrowIcon, CheckIcon } from './Icons';
import { IMGBB_API_KEY } from '../config.js';
import '../styles/generator.css';

type SavedInvite = {
  id: string;
  guest: string;
  side: WeddingSide;
  avatar: string;
  link: string;
  createdAt: string;
};

const INVITES_HISTORY_KEY = 'shinsana_invites_history';

export function InviteGenerator() {
  const [guest, setGuest] = useState('');
  const [side, setSide] = useState<WeddingSide>('groom');
  const [avatar, setAvatar] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState('');
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<SavedInvite[]>([]);
  const [downloadingQr, setDownloadingQr] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    try {
      const stored = localStorage.getItem(INVITES_HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      // Ignore
    }
  }, []);

  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Nén ảnh về kích thước chuẩn stamp (max 360px) để tải siêu tốc (< 50ms)
  const optimizeImage = (source: File | string, maxDim = 360, quality = 0.84): Promise<Blob | File | string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      let objectUrl = '';
      if (typeof source === 'string') {
        img.src = source;
      } else {
        objectUrl = URL.createObjectURL(source);
        img.src = objectUrl;
      }

      img.onload = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = Math.max(width, 1);
          canvas.height = Math.max(height, 1);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else resolve(source);
              },
              'image/jpeg',
              quality
            );
            return;
          }
          resolve(source);
        } catch {
          resolve(source);
        }
      };

      img.onerror = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        resolve(source);
      };
    });
  };

  // Upload image file or URL to ImgBB for permanent hosting (no expiration)
  const uploadToImgBB = async (fileOrUrl: File | string) => {
    const apiKey = IMGBB_API_KEY || 'd4580edf471489b134ad60325a0eae50';
    setUploading(true);
    setUploadStatus('Đang nén và tối ưu hóa ảnh để tải siêu nhanh...');
    try {
      const optimized = await optimizeImage(fileOrUrl);
      const formData = new FormData();
      if (optimized instanceof Blob) {
        formData.append('image', optimized, 'guest-avatar.jpg');
      } else {
        formData.append('image', optimized);
      }
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data) {
        // Ưu tiên link phiên bản tối ưu hóa CDN của ImgBB
        const fastUrl = data.data.medium?.url || data.data.display_url || data.data.thumb?.url || data.data.url;
        setAvatar(fastUrl);
        setPreviewAvatar(fastUrl);
        setUploadStatus('✓ Đã nén nhẹ & lưu vĩnh viễn (tải siêu tốc)!');
        setTimeout(() => setUploadStatus(null), 3500);
      } else {
        setUploadStatus(`⚠️ ${data.error?.message || 'Không thể tải ảnh lên ImgBB'}`);
      }
    } catch {
      setUploadStatus('⚠️ Lỗi kết nối khi tải ảnh. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  // Handle local file selection for avatar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewAvatar(result);
    };
    reader.readAsDataURL(file);

    // Upload to ImgBB permanently
    uploadToImgBB(file);
  };

  // Build the invitation URL using URLSearchParams to safely encode all special characters
  const buildLink = (): string => {
    let path = '';
    if (side === 'groom') path = '/groom';
    else if (side === 'bride') path = '/bride';
    else path = '/';

    const params = new URLSearchParams();
    if (guest.trim()) params.set('guest', guest.trim());
    const finalAvatar = avatar.trim() || (previewAvatar.startsWith('http') ? previewAvatar : '');
    if (finalAvatar) params.set('avatar', finalAvatar);

    const queryString = params.toString();
    const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${base}${path}${queryString ? '?' + queryString : ''}`;
  };

  const currentLink = buildLink();
  const effectiveAvatar = avatar.trim() || previewAvatar;

  const handleCopy = async (linkToCopy = currentLink) => {
    try {
      await navigator.clipboard.writeText(linkToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);

      // Save to recent history if guest has a name
      if (guest.trim() && linkToCopy === currentLink) {
        const newRecord: SavedInvite = {
          id: 'inv_' + Date.now(),
          guest: guest.trim(),
          side,
          avatar: effectiveAvatar,
          link: linkToCopy,
          createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
        };
        const updated = [newRecord, ...history.filter(h => h.guest !== guest.trim())].slice(0, 30);
        setHistory(updated);
        try {
          localStorage.setItem(INVITES_HISTORY_KEY, JSON.stringify(updated));
        } catch {
          // Ignore
        }
      }
    } catch {
      // Fallback copy
      const input = document.createElement('textarea');
      input.value = linkToCopy;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem(INVITES_HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const qrUrl = currentLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(currentLink)}`
    : '';

  // 1. Tải ảnh mã QR về máy (PNG)
  const handleDownloadQr = async () => {
    if (!qrUrl) return;
    setDownloadingQr(true);
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanGuest = guest.trim().replace(/[^a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9]/g, '_') || 'khach';
      a.download = `QR-ThiepCuoi-${cleanGuest}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(qrUrl, '_blank');
    } finally {
      setDownloadingQr(false);
    }
  };

  // 2. Sao chép trực tiếp ảnh mã QR vào Clipboard để dán Ctrl+V vào Zalo / Messenger
  const handleCopyQrImage = async () => {
    if (!qrUrl) return;
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const pngBlob = blob.type === 'image/png' ? blob : new Blob([blob], { type: 'image/png' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': pngBlob,
        }),
      ]);
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 2400);
    } catch {
      alert('Không thể sao chép ảnh trực tiếp trên trình duyệt này. Bạn hãy bấm "Tải ảnh QR" để lưu ảnh nhé!');
    }
  };

  // 3. Chia sẻ nhanh qua Zalo / Facebook / Tin nhắn hoặc Sao chép lời mời kèm link
  const handleShare = async () => {
    const inviteText = guest.trim()
      ? `💌 Trân trọng kính mời ${guest.trim()} đến chung vui lễ thành hôn cùng Tuấn Hùng & Sao Mai!`
      : '💌 Trân trọng kính mời bạn đến chung vui lễ thành hôn cùng Tuấn Hùng & Sao Mai!';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Thiệp cưới Tuấn Hùng & Sao Mai',
          text: inviteText,
          url: currentLink,
        });
        return;
      } catch {
        // User closed native dialog
      }
    }

    const fullMessage = `${inviteText}\n👉 Mở thiệp tại đây: ${currentLink}`;
    try {
      await navigator.clipboard.writeText(fullMessage);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2400);
    } catch {
      handleCopy(currentLink);
    }
  };

  return (
    <div className="invite-generator-page">
      <header className="generator-header">
        <div className="generator-header__inner">
          <div className="generator-header__brand">
            <span className="generator-badge">CÔNG CỤ NỘI BỘ</span>
            <h1>Tạo Thiệp Cưới Cá Nhân Hóa</h1>
            <p>Tuấn Hùng &amp; Sao Mai — Tạo đường link mời &amp; mã QR riêng biệt cho từng vị khách</p>
          </div>
          <a href="/" className="generator-back-link">
            <span>VỀ TRANG THIỆP</span>
            <ArrowIcon direction="external" />
          </a>
        </div>
      </header>

      <main className="generator-container">
        {/* Left Column: Form Controls */}
        <section className="generator-form-panel">
          <h2 className="panel-title">1. Thông tin khách mời</h2>

          {/* Guest Name */}
          <div className="gen-field">
            <label htmlFor="gen-guest-name">
              <span>Họ &amp; Tên khách mời</span>
              <small className="gen-hint">Ví dụ: Anh Tuấn, Gia đình Bác Hùng, Bạn Lan...</small>
            </label>
            <input
              id="gen-guest-name"
              type="text"
              className="gen-input"
              value={guest}
              onChange={(e) => setGuest(e.target.value)}
              placeholder="Nhập tên người nhận thiệp..."
              maxLength={72}
            />
          </div>

          {/* Wedding Side Selection */}
          <div className="gen-field">
            <label>
              <span>Khách của bên nào?</span>
              <small className="gen-hint">Quyết định địa điểm tiệc &amp; thông tin xuất hiện trên thiệp</small>
            </label>
            <div className="gen-side-selector">
              <button
                type="button"
                className={`gen-side-btn ${side === 'groom' ? 'is-active' : ''}`}
                onClick={() => setSide('groom')}
              >
                <span className="side-icon">🤵</span>
                <strong>Nhà Trai</strong>
                <small>/groom</small>
              </button>
              <button
                type="button"
                className={`gen-side-btn ${side === 'bride' ? 'is-active' : ''}`}
                onClick={() => setSide('bride')}
              >
                <span className="side-icon">👰</span>
                <strong>Nhà Gái</strong>
                <small>/bride</small>
              </button>
              <button
                type="button"
                className={`gen-side-btn ${side === 'both' ? 'is-active' : ''}`}
                onClick={() => setSide('both')}
              >
                <span className="side-icon">💐</span>
                <strong>Cả hai bên</strong>
                <small>Trang chủ ( / )</small>
              </button>
            </div>
          </div>

          {/* Guest Avatar */}
          <div className="gen-field">
            <label htmlFor="gen-avatar-url">
              <span>Ảnh đại diện khách quý (Tùy chọn)</span>
              <small className="gen-hint">Dán link ảnh online (Facebook, Zalo, Web...) hoặc chọn ảnh từ máy</small>
            </label>
            <input
              id="gen-avatar-url"
              type="url"
              className="gen-input"
              value={avatar}
              onChange={(e) => {
                setAvatar(e.target.value);
                setPreviewAvatar('');
              }}
              placeholder="Dán đường link ảnh tại đây (https://...)..."
            />

            <div className="gen-upload-row">
              <label className={`gen-upload-btn ${uploading ? 'is-uploading' : ''}`}>
                <span>{uploading ? '⏳ Đang tải ảnh lên...' : '📁 Chọn ảnh từ máy tính / điện thoại'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>

              {avatar.startsWith('http') && !avatar.includes('ibb.co') && (
                <button
                  type="button"
                  className="gen-permanent-btn"
                  onClick={() => uploadToImgBB(avatar)}
                  disabled={uploading}
                  title="Tải ảnh này về và lưu vĩnh viễn lên ImgBB để không bao giờ bị hết hạn"
                >
                  ⚡ Lưu vĩnh viễn (Chống link FB hết hạn)
                </button>
              )}

              {effectiveAvatar && (
                <button
                  type="button"
                  className="gen-clear-btn"
                  onClick={() => {
                    setAvatar('');
                    setPreviewAvatar('');
                    setUploadStatus(null);
                  }}
                >
                  Xóa ảnh
                </button>
              )}
            </div>

            {uploadStatus && (
              <div className={`gen-upload-status ${uploadStatus.startsWith('✓') ? 'is-success' : uploadStatus.startsWith('⚠️') ? 'is-error' : 'is-loading'}`}>
                {uploadStatus}
              </div>
            )}

            <p className="gen-note">
              💡 <strong>Lưu ý:</strong> API ImgBB của bạn đã được kết nối. Khi bạn chọn ảnh từ máy hoặc bấm "Lưu vĩnh viễn", ảnh sẽ được lưu trữ <strong>miễn phí trọn đời</strong>, không bao giờ bị hết hạn như link Facebook.
            </p>
          </div>

          {/* Generated Result Section */}
          <div className="gen-result-box">
            <h3 className="result-title">2. Link thiệp mời đã tạo</h3>
            <div className="gen-link-display">
              <input
                type="text"
                readOnly
                value={currentLink}
                className="gen-link-input"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>

            <div className="gen-actions">
              <button
                type="button"
                className={`gen-copy-btn ${copied ? 'is-copied' : ''}`}
                onClick={() => handleCopy()}
              >
                {copied ? <CheckIcon /> : <ArrowIcon direction="external" />}
                <span>{copied ? 'ĐÃ SAO CHÉP LINK!' : 'SAO CHÉP ĐƯỜNG LINK'}</span>
              </button>
              <a
                href={currentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="gen-preview-link"
              >
                Mở xem thử thiệp ↗
              </a>
            </div>
          </div>
        </section>

        {/* Right Column: Live Card Preview & QR Code */}
        <section className="generator-preview-panel">
          <h2 className="panel-title">Xem trước thiệp (Màn mở thiệp)</h2>

          {/* Miniature Card Preview */}
          <div className="mini-folio-wrap">
            <div className="mini-folio">
              {/* Corner Stamp */}
              {effectiveAvatar && (
                <div className="mini-stamp">
                  <div className="mini-stamp-frame">
                    <img
                      src={effectiveAvatar}
                      alt="Khách quý"
                      className="mini-stamp-img"
                    />
                    <span className="mini-stamp-pin">✦</span>
                  </div>
                  <span className="mini-stamp-tag">KHÁCH QUÝ</span>
                </div>
              )}

              {/* Monogram Seal */}
              <div className="mini-seal">囍</div>

              {/* Couple Names */}
              <div className="mini-names">
                <span>Tuấn Hùng</span>
                <span className="mini-divider">✦</span>
                <span>Sao Mai</span>
              </div>

              {/* Guest Invitation Badge */}
              <div className="mini-invitation-badge">
                <span className="mini-badge-kicker">Trân trọng kính mời</span>
                <strong className="mini-badge-name">
                  {guest.trim() ? guest.trim().toUpperCase() : 'TÊN KHÁCH MỜI'}
                </strong>
                <span className="mini-side-label">
                  {side === 'groom' ? 'Tiệc mừng Nhà Trai' : side === 'bride' ? 'Tiệc mừng Nhà Gái' : 'Chung vui hai họ'}
                </span>
              </div>

              <div className="mini-caption">CHẠM ĐỂ MỞ THIỆP</div>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="mini-qr-box">
            <h3 className="qr-title">Mã QR truy cập nhanh</h3>
            <div className="qr-image-wrap">
              {qrUrl ? (
                <img src={qrUrl} alt="Mã QR thiệp mời" className="qr-code-img" />
              ) : (
                <div className="qr-placeholder">Đang tạo mã QR...</div>
              )}
            </div>

            {/* QR Actions */}
            <div className="qr-actions">
              <button
                type="button"
                className="qr-btn qr-btn--download"
                onClick={handleDownloadQr}
                disabled={downloadingQr}
                title="Tải ảnh mã QR về máy để gửi hoặc in ấn"
              >
                <span>{downloadingQr ? '⏳ Đang tải...' : '📥 Tải ảnh QR'}</span>
              </button>

              <button
                type="button"
                className={`qr-btn qr-btn--copy ${qrCopied ? 'is-success' : ''}`}
                onClick={handleCopyQrImage}
                title="Sao chép ảnh mã QR vào bộ nhớ tạm (dán thẳng vào Zalo / Messenger bằng Ctrl+V)"
              >
                <span>{qrCopied ? '✓ Đã copy ảnh QR!' : '📋 Copy ảnh QR'}</span>
              </button>

              <button
                type="button"
                className={`qr-btn qr-btn--share ${shareCopied ? 'is-success' : ''}`}
                onClick={handleShare}
                title="Chia sẻ link qua Zalo / Facebook hoặc sao chép lời mời kèm link"
              >
                <span>{shareCopied ? '✓ Đã copy lời mời!' : '🚀 Chia sẻ link'}</span>
              </button>
            </div>

            <p className="qr-hint">
              💡 Bấm <strong>"Copy ảnh QR"</strong> để dán trực tiếp ảnh vào Zalo/Messenger (Ctrl+V), hoặc bấm <strong>"Tải ảnh QR"</strong> để lưu file về máy.
            </p>
          </div>
        </section>
      </main>

      {/* Bottom Section: Recent History */}
      {history.length > 0 && (
        <section className="generator-history">
          <div className="history-header">
            <h3>Lịch sử khách đã tạo link ({history.length})</h3>
            <small>Được lưu trên trình duyệt của bạn để bạn dễ dàng tìm lại</small>
          </div>
          <div className="history-grid">
            {history.map((item) => (
              <div key={item.id} className="history-card">
                <div className="history-card__left">
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.guest} className="history-avatar" />
                  ) : (
                    <div className="history-avatar-empty">✦</div>
                  )}
                  <div className="history-info">
                    <strong>{item.guest}</strong>
                    <span>
                      {item.side === 'groom' ? 'Nhà Trai' : item.side === 'bride' ? 'Nhà Gái' : 'Cả hai bên'} · {item.createdAt}
                    </span>
                  </div>
                </div>
                <div className="history-card__actions">
                  <button
                    type="button"
                    className="history-copy-btn"
                    onClick={() => handleCopy(item.link)}
                  >
                    Sao chép
                  </button>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="history-view-link"
                  >
                    Mở
                  </a>
                  <button
                    type="button"
                    className="history-del-btn"
                    onClick={() => handleDeleteHistory(item.id)}
                    title="Xóa khỏi lịch sử"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
