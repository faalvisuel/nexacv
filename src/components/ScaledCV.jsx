import { useEffect, useRef, useState } from 'react';
import CVRender from './CVRender.jsx';

// Affiche la feuille A4 réduite à la largeur disponible.
export default function ScaledCV({ cv, templateId, maxScale = 1, placeholder, clip = false }) {
  const wrap = useRef(null);
  const inner = useRef(null);
  const [scale, setScale] = useState(0.5);
  const [h, setH] = useState(1123);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => {
      setScale(Math.min(maxScale, el.clientWidth / 794));
      if (inner.current) setH(inner.current.offsetHeight);
    });
    ro.observe(el);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, [maxScale]);

  const height = clip ? 1123 * scale : h * scale;
  return (
    <div className="scaled" ref={wrap} style={{ height }}>
      <div ref={inner} style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 794 }}>
        <CVRender cv={cv} templateId={templateId} placeholder={placeholder} />
      </div>
    </div>
  );
}
