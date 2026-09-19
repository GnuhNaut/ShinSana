import { useEffect, useRef, useState } from 'react';
import { gallery } from '../config/wedding';

export function Gallery() {
  const [ready, setReady] = useState(false); const [index, setIndex] = useState(0); const [viewer, setViewer] = useState(false);
  const scene = useRef<HTMLElement>(null); const start = useRef(0); const intent = useRef(false); const last = useRef<HTMLButtonElement>(null);
  useEffect(() => { const obs = new IntersectionObserver(([entry]) => entry.isIntersecting && setReady(true), { rootMargin: '300px' }); if (scene.current) obs.observe(scene.current); return () => obs.disconnect(); }, []);
  useEffect(() => { const key = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') setIndex(i => (i + 1) % gallery.length); if (e.key === 'ArrowLeft') setIndex(i => (i - 1 + gallery.length) % gallery.length); if (e.key === 'Escape') setViewer(false); }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, []);
  const move = (direction: number) => setIndex(i => (i + direction + gallery.length) % gallery.length);
  const visible = [-3,-2,-1,0,1,2,3].map(offset => ({ offset, item: gallery[(index + offset + gallery.length) % gallery.length] }));
  return <section className="scene gallery-scene" ref={scene} aria-label="Album ảnh"><div className="gallery-meta"><span>PHOTO</span><span>{String(index + 1).padStart(2,'0')} / {gallery.length}</span></div>
    <div className="gallery-stage" onPointerDown={e => { start.current=e.clientX; intent.current=false; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }} onPointerMove={e => { if (Math.abs(e.clientX-start.current)>12) intent.current=true; }} onPointerUp={e => { const delta=e.clientX-start.current; if (Math.abs(delta)>48 && intent.current) move(delta < 0 ? 1 : -1); }}>
      {ready && visible.map(({offset,item}) => <button key={`${item.id}-${offset}`} ref={offset===0 ? last : undefined} className={`gallery-slide offset-${offset}`} tabIndex={offset===0 ? 0 : -1} aria-label={`Xem ảnh ${index + offset + 1}`} onClick={() => offset === 0 ? setViewer(true) : move(offset > 0 ? 1 : -1)}><img src={item.src} srcSet={`${item.src}&w=480 480w, ${item.src}&w=768 768w, ${item.src}&w=1200 1200w`} sizes="(max-width: 600px) 80vw, 55vw" alt={offset === 0 ? item.alt : ''} loading={Math.abs(offset) < 2 ? 'eager' : 'lazy'} /></button>)}
    </div><div className="gallery-progress"><i style={{ width: `${((index+1)/gallery.length)*100}%` }} /></div>
    {viewer && <div className="viewer" role="dialog" aria-modal="true" aria-label="Xem ảnh toàn màn hình"><button className="viewer-close" autoFocus onClick={() => { setViewer(false); last.current?.focus(); }}>Đóng ×</button><button className="viewer-prev" onClick={() => move(-1)} aria-label="Ảnh trước">←</button><img src={gallery[index].src} alt={gallery[index].alt}/><button className="viewer-next" onClick={() => move(1)} aria-label="Ảnh tiếp">→</button><span>{index+1} / {gallery.length}</span></div>}
  </section>;
}
