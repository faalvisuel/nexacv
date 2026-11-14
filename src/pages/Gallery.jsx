import { useMemo, useState } from 'react';
import { JOBS } from '../data/jobs.js';
import { LAYOUTS, PALETTES, FONTS, TEMPLATE_COUNT, templatesFor } from '../data/templates.js';
import { sampleCV, hasData } from '../lib/store.js';
import ScaledCV from '../components/ScaledCV.jsx';

const PAGE = 24;

export default function Gallery({ cv, setCv, go, premium }) {
  const [jobId, setJobId] = useState(cv.jobId || '');
  const [layout, setLayout] = useState('');
  const [family, setFamily] = useState('');
  const [palette, setPalette] = useState('');
  const [font, setFont] = useState('');
  const [shown, setShown] = useState(PAGE);
  const demo = useMemo(() => (hasData(cv) && cv.personal.firstName ? cv : sampleCV()), [cv]);

  const list = useMemo(() => templatesFor(jobId).filter((t) =>
    (!family || t.layout.family === family) && (!layout || t.layout.id === layout) && (!palette || t.palette.id === palette) && (!font || t.font.id === font)), [jobId, family, layout, palette, font]);

  const use = (id) => {
    setCv((c) => ({ ...c, template: id, jobId: c.jobId || jobId }));
    go('creer');
  };

  const reset = (fn) => (e) => { fn(e.target.value); setShown(PAGE); };

  return (
    <div className="gallery wrap">
      <header className="gallery-head">
        <h1 className="h1">{TEMPLATE_COUNT.toLocaleString('fr-FR')} modèles de CV compatibles ATS</h1>
        <p className="muted">Choisissez votre métier : les modèles les plus adaptés remontent en premier. L’aperçu utilise {demo === cv ? 'vos informations' : 'un exemple'}.</p>
      </header>
      <div className="filters">
        <label className="field"><span className="field-label">Métier</span>
          <select value={jobId} onChange={reset(setJobId)}>
            <option value="">Tous les métiers</option>
            {JOBS.map((j) => <option key={j.id} value={j.id}>{j.label}</option>)}
          </select>
        </label>
        <label className="field"><span className="field-label">Style</span>
          <select value={family} onChange={reset(setFamily)}>
            <option value="">Tous</option>
            <option value="design">Design (photo, couleurs)</option>
            <option value="essentiel">Essentiel (ATS strict)</option>
          </select>
        </label>
        <label className="field"><span className="field-label">Mise en page</span>
          <select value={layout} onChange={reset(setLayout)}>
            <option value="">Toutes</option>
            {LAYOUTS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </label>
        <label className="field"><span className="field-label">Couleur</span>
          <select value={palette} onChange={reset(setPalette)}>
            <option value="">Toutes</option>
            {PALETTES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="field"><span className="field-label">Police</span>
          <select value={font} onChange={reset(setFont)}>
            <option value="">Toutes</option>
            {FONTS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </label>
        <p className="filters-count">{list.length.toLocaleString('fr-FR')} modèles</p>
      </div>

      <div className="gallery-grid">
        {list.slice(0, shown).map((t) => (
          <figure className="g-card" key={t.id}>
            <button type="button" className="g-thumb" onClick={() => use(t.id)} aria-label={`Utiliser le modèle ${t.layout.name} ${t.palette.name} ${t.font.name}`}>
              <span className={`g-badge${t.layout.family === 'design' ? '' : ' ess'}`}>{t.layout.family === 'design' ? (premium ? 'Design' : 'Design · Premium') : 'Gratuit · ATS strict'}</span>
              <ScaledCV cv={demo} templateId={t.id} clip />
              <span className="g-use">Utiliser ce modèle</span>
            </button>
            <figcaption>
              <strong>{t.layout.name}</strong>
              <span className="g-meta"><i style={{ background: t.palette.color }} aria-hidden="true" />{t.palette.name}, {t.font.name}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      {shown < list.length && (
        <div className="more"><button type="button" className="btn btn-ghost" onClick={() => setShown(shown + PAGE)}>Afficher {Math.min(PAGE, list.length - shown)} modèles de plus</button></div>
      )}
    </div>
  );
}
