import { useMemo, useState } from 'react';
import { JOBS, CATEGORIES, LEVELS, LANG_LEVELS, getJob } from '../data/jobs.js';
import { LAYOUTS, PALETTES, FONTS, TEMPLATE_COUNT, parseTemplate, templateId, templatesFor, isDesign } from '../data/templates.js';
import { analyze, startsWithVerb, hasNumber } from '../lib/ats.js';
import { uid, emptyCV, sampleCV } from '../lib/store.js';
import { exportPDF, exportDOCX, exportTXT } from '../lib/export.js';
import ScaledCV from '../components/ScaledCV.jsx';
import CVRender from '../components/CVRender.jsx';
import AtsPanel, { ScoreRing } from '../components/AtsPanel.jsx';
import { Plans } from './Pricing.jsx';

const STEPS = [
  { id: 'objectif', label: 'Objectif' },
  { id: 'coordonnees', label: 'Coordonnées' },
  { id: 'experience', label: 'Expériences' },
  { id: 'formation', label: 'Formation' },
  { id: 'competences', label: 'Compétences' },
  { id: 'profil', label: 'Profil' },
  { id: 'finaliser', label: 'Modèle et export' },
];

function Field({ label, hint, children, wide }) {
  return (
    <label className={`field${wide ? ' field-wide' : ''}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

function ChipPicker({ value, onChange, suggestions = [], placeholder }) {
  const [draft, setDraft] = useState('');
  const has = (s) => value.some((v) => v.toLowerCase() === s.toLowerCase());
  const add = (s) => {
    const t = s.trim();
    if (t && !has(t)) onChange([...value, t]);
  };
  return (
    <div className="chips">
      <div className="chips-selected">
        {value.map((v) => (
          <button type="button" key={v} className="chip chip-on" onClick={() => onChange(value.filter((x) => x !== v))} aria-label={`Retirer ${v}`}>
            {v} <span aria-hidden="true">×</span>
          </button>
        ))}
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(draft); setDraft(''); }
            if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => { if (draft) { add(draft); setDraft(''); } }}
        />
      </div>
      {suggestions.filter((s) => !has(s)).length > 0 && (
        <div className="chips-suggest">
          <span className="chips-suggest-label">Suggestions pour votre métier :</span>
          {suggestions.filter((s) => !has(s)).map((s) => (
            <button type="button" key={s} className="chip" onClick={() => add(s)}>+ {s}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function BulletEditor({ value, onChange, suggestions }) {
  const list = String(value || '').split('\n');
  const items = list.length ? list : [''];
  const set = (arr) => onChange(arr.join('\n'));
  return (
    <div className="bullets">
      {items.map((b, i) => {
        const filled = b.trim().length > 0;
        const verb = filled && startsWithVerb(b);
        const num = filled && hasNumber(b);
        const ph = /\[[^\]]*\]/.test(b);
        return (
          <div className="bullet-row" key={i}>
            <span className="bullet-dot" aria-hidden="true">•</span>
            <div className="bullet-main">
              <textarea
                rows={Math.max(1, Math.ceil(b.length / 62))}
                value={b}
                placeholder="Ex. : Augmenté les ventes de 20 % en 6 mois"
                onChange={(e) => { const a = [...items]; a[i] = e.target.value; set(a); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const a = [...items]; a.splice(i + 1, 0, ''); set(a); } }}
                aria-label={`Réalisation ${i + 1}`}
              />
              {filled && (
                <span className="bullet-flags">
                  <span className={verb ? 'flag ok' : 'flag'}>{verb ? '✓ verbe d’action' : 'commencez par un verbe'}</span>
                  <span className={num && !ph ? 'flag ok' : 'flag'}>{ph ? 'remplacez les [X]' : num ? '✓ chiffré' : 'ajoutez un chiffre'}</span>
                </span>
              )}
            </div>
            <button type="button" className="icon-btn" onClick={() => set(items.filter((_, j) => j !== i))} aria-label="Supprimer cette ligne">×</button>
          </div>
        );
      })}
      <button type="button" className="link-btn" onClick={() => set([...items.filter((x) => x.trim()), ''])}>+ Ajouter une réalisation</button>
      {suggestions && suggestions.length > 0 && (
        <details className="suggest-box">
          <summary>Besoin d’inspiration ? {suggestions.length} exemples pour votre métier</summary>
          <p className="muted small">Cliquez pour ajouter, puis remplacez les [X] par vos vrais chiffres. Un chiffre approximatif mais honnête vaut mieux que rien.</p>
          {suggestions.map((s) => (
            <button type="button" key={s} className="suggest-line" onClick={() => set([...items.filter((x) => x.trim()), s])}>+ {s}</button>
          ))}
        </details>
      )}
    </div>
  );
}

function readPhoto(file, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 520;
      const r = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/jpeg', 0.82));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function fillSummary(cv) {
  const job = getJob(cv.jobId);
  if (!job) return '';
  const tpl = job.summary[cv.level] || job.summary.mid;
  const skills = cv.skills.slice(0, 3);
  const skillStr = skills.length ? skills.slice(0, -1).join(', ') + (skills.length > 1 ? ' et ' : '') + skills[skills.length - 1] : job.skills.slice(0, 3).join(', ');
  return tpl
    .replace(/\{title\}/g, cv.personal.title || job.titles[0])
    .replace(/\{years\}/g, cv.years || (cv.level === 'senior' ? '10' : '4'))
    .replace(/\{skills\}/g, skillStr)
    .replace(/\{field\}/g, cv.field || 'mon domaine');
}

export default function Builder({ cv, setCv, go, account = {}, syncStatus = 'idle' }) {
  const [paywall, setPaywall] = useState(false);
  const [step, setStepRaw] = useState(Math.min(cv.step || 0, STEPS.length - 1));
  const [showPreview, setShowPreview] = useState(false);
  const [jobQuery, setJobQuery] = useState('');
  const [busy, setBusy] = useState('');
  const report = useMemo(() => analyze(cv), [cv]);
  const job = getJob(cv.jobId);

  const setStep = (s) => {
    const n = Math.max(0, Math.min(STEPS.length - 1, s));
    setStepRaw(n);
    setCv((c) => ({ ...c, step: n }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const up = (patch) => setCv((c) => ({ ...c, ...patch }));
  const upP = (k, v) => setCv((c) => ({ ...c, personal: { ...c.personal, [k]: v } }));
  const upList = (key, id, patch) => setCv((c) => ({ ...c, [key]: c[key].map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const delList = (key, id) => setCv((c) => ({ ...c, [key]: c[key].filter((x) => x.id !== id) }));
  const moveList = (key, id, dir) => setCv((c) => {
    const a = [...c[key]]; const i = a.findIndex((x) => x.id === id); const j = i + dir;
    if (j < 0 || j >= a.length) return c;
    [a[i], a[j]] = [a[j], a[i]];
    return { ...c, [key]: a };
  });

  const chooseJob = (j) => {
    setCv((c) => ({
      ...c,
      jobId: j.id,
      template: c.template || templatesFor(j.id)[0].id.replace(/\.[^.]+\.[^.]+$/, '.bordeaux.poppins'),
      personal: { ...c.personal, title: c.personal.title || j.titles[0] },
    }));
    setTimeout(() => document.getElementById('level-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const filteredJobs = JOBS.filter((j) => {
    const q = jobQuery.trim().toLowerCase();
    if (!q) return true;
    return [j.label, ...j.titles, j.category].join(' ').toLowerCase().includes(q);
  });

  const t = parseTemplate(cv.template || (job ? templateId(job.layout, 'bordeaux', 'carlito') : ''));
  const [family, setFamily] = useState(isDesign(t.layout.id) ? 'design' : 'essentiel');
  const recommended = useMemo(() => {
    const seen = new Set();
    return templatesFor(cv.jobId).filter((x) => {
      const k = x.layout.id;
      if (x.layout.family !== family || seen.has(k)) return false;
      seen.add(k); return true;
    }).slice(0, 6);
  }, [cv.jobId, family]);

  const doExport = async (kind) => {
    setBusy(kind);
    try {
      if (kind === 'pdf') {
        if (isDesign(parseTemplate(cv.template).layout.id) && !account.premium) { setPaywall(true); return; }
        exportPDF(cv);
      }
      if (kind === 'docx') await exportDOCX(cv);
      if (kind === 'txt') exportTXT(cv);
    } finally {
      setTimeout(() => setBusy(''), 600);
    }
  };

  const body = (() => {
    switch (STEPS[step].id) {
      case 'objectif':
        return (
          <>
            <h2 className="step-title">Quel poste visez-vous ?</h2>
            <p className="step-lead">On adapte les compétences, les exemples et la mise en page à votre métier. Vous pourrez tout modifier ensuite.</p>
            <input className="search" placeholder="Rechercher un métier : comptable, développeur, infirmier…" value={jobQuery} onChange={(e) => setJobQuery(e.target.value)} aria-label="Rechercher un métier" />
            {CATEGORIES.map((cat) => {
              const js = filteredJobs.filter((j) => j.category === cat);
              if (!js.length) return null;
              return (
                <div key={cat} className="job-group">
                  <h3 className="job-cat">{cat}</h3>
                  <div className="job-grid">
                    {js.map((j) => (
                      <button type="button" key={j.id} className={`job-card${cv.jobId === j.id ? ' is-on' : ''}`} onClick={() => chooseJob(j)} aria-pressed={cv.jobId === j.id}>
                        <span className="job-icon" aria-hidden="true">{j.icon}</span>
                        <span>{j.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {filteredJobs.length === 0 && <p className="muted">Aucun métier trouvé. Choisissez le plus proche : vous pourrez écrire l’intitulé exact à l’étape suivante.</p>}
            <h3 className="sub-title" id="level-title" style={{ scrollMarginTop: 140 }}>Votre niveau d’expérience</h3>
            <div className="level-row">
              {LEVELS.map((l) => (
                <button type="button" key={l.id} className={`level${cv.level === l.id ? ' is-on' : ''}`} onClick={() => up({ level: l.id })} aria-pressed={cv.level === l.id}>
                  <strong>{l.label}</strong><span>{l.hint}</span>
                </button>
              ))}
            </div>
            <div className="grid-2">
              {cv.level !== 'junior' && (
                <Field label="Années d’expérience"><input inputMode="numeric" value={cv.years} onChange={(e) => up({ years: e.target.value.replace(/[^\d]/g, '').slice(0, 2) })} placeholder="5" /></Field>
              )}
              {cv.level === 'junior' && (
                <Field label="Votre domaine d’études"><input value={cv.field} onChange={(e) => up({ field: e.target.value })} placeholder="Gestion, informatique, droit…" /></Field>
              )}
            </div>
          </>
        );
      case 'coordonnees':
        return (
          <>
            <h2 className="step-title">Comment vous joindre ?</h2>
            <p className="step-lead">Pas de photo, pas d’âge, pas de situation familiale : les ATS les ignorent et ils exposent à la discrimination.</p>
            <div className="grid-2">
              <Field label="Prénom"><input autoComplete="given-name" value={cv.personal.firstName} onChange={(e) => upP('firstName', e.target.value)} /></Field>
              <Field label="Nom"><input autoComplete="family-name" value={cv.personal.lastName} onChange={(e) => upP('lastName', e.target.value)} /></Field>
              <Field label="Titre du poste visé" hint="Reprenez l’intitulé exact de l’offre : c’est le premier mot-clé que l’ATS compare." wide>
                <input value={cv.personal.title} onChange={(e) => upP('title', e.target.value)} list="titles" placeholder={job ? job.titles[0] : 'Ex. : Comptable général'} />
                <datalist id="titles">{(job ? job.titles : []).map((x) => <option key={x} value={x} />)}</datalist>
              </Field>
              <Field label="E-mail"><input type="email" autoComplete="email" value={cv.personal.email} onChange={(e) => upP('email', e.target.value)} placeholder="prenom.nom@email.com" /></Field>
              <Field label="Téléphone"><input type="tel" autoComplete="tel" value={cv.personal.phone} onChange={(e) => upP('phone', e.target.value)} placeholder="+221 77 000 00 00" /></Field>
              <Field label="Ville, pays"><input autoComplete="address-level2" value={cv.personal.city} onChange={(e) => upP('city', e.target.value)} placeholder="Dakar, Sénégal" /></Field>
              <Field label="LinkedIn (facultatif)"><input value={cv.personal.linkedin} onChange={(e) => upP('linkedin', e.target.value)} placeholder="linkedin.com/in/votre-nom" /></Field>
              <Field label="Site ou portfolio (facultatif)" wide><input value={cv.personal.website} onChange={(e) => upP('website', e.target.value)} placeholder="votresite.com" /></Field>
            </div>
            <div className="photo-field">
              <div className="photo-prev">{cv.photo ? <img src={cv.photo} alt="Votre photo" /> : <span aria-hidden="true">{(cv.personal.firstName || '?')[0]}</span>}</div>
              <div>
                <span className="field-label">Photo (facultatif)</span>
                <p className="field-hint">Utilisée par les modèles Design. Photo de face, fond neutre, tenue professionnelle. À éviter pour les candidatures dans les grands groupes internationaux.</p>
                <div className="photo-actions">
                  <label className="btn btn-ghost btn-sm">
                    {cv.photo ? 'Changer la photo' : 'Ajouter une photo'}
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) readPhoto(f, (url) => up({ photo: url, showPhoto: true })); }} />
                  </label>
                  {cv.photo && <button type="button" className="link-btn" onClick={() => up({ photo: '' })}>Retirer</button>}
                  {cv.photo && <label className="check inline-check"><input type="checkbox" checked={cv.showPhoto !== false} onChange={(e) => up({ showPhoto: e.target.checked })} /> Afficher sur le CV</label>}
                </div>
              </div>
            </div>
          </>
        );
      case 'experience':
        return (
          <>
            <h2 className="step-title">Vos expériences</h2>
            <p className="step-lead">Du plus récent au plus ancien. Pour chaque poste, écrivez 2 à 4 <strong>résultats</strong> : un verbe d’action, ce que vous avez fait, un chiffre.</p>
            {cv.level === 'junior' && cv.experiences.length === 0 && (
              <p className="note">Vous débutez ? Stages, jobs d’été, bénévolat, projets d’études ou associatifs comptent. Sinon, passez à l’étape suivante.</p>
            )}
            {cv.experiences.map((e, idx) => (
              <fieldset className="entry" key={e.id}>
                <legend>Expérience {idx + 1}</legend>
                <div className="entry-tools">
                  <button type="button" className="icon-btn" onClick={() => moveList('experiences', e.id, -1)} disabled={idx === 0} aria-label="Monter">↑</button>
                  <button type="button" className="icon-btn" onClick={() => moveList('experiences', e.id, 1)} disabled={idx === cv.experiences.length - 1} aria-label="Descendre">↓</button>
                  <button type="button" className="icon-btn danger" onClick={() => delList('experiences', e.id)} aria-label="Supprimer l’expérience">×</button>
                </div>
                <div className="grid-2">
                  <Field label="Poste occupé"><input value={e.role} onChange={(ev) => upList('experiences', e.id, { role: ev.target.value })} placeholder="Ex. : Assistant comptable" /></Field>
                  <Field label="Entreprise"><input value={e.company} onChange={(ev) => upList('experiences', e.id, { company: ev.target.value })} /></Field>
                  <Field label="Ville"><input value={e.city} onChange={(ev) => upList('experiences', e.id, { city: ev.target.value })} /></Field>
                  <div className="grid-2 tight">
                    <Field label="Début"><input value={e.start} onChange={(ev) => upList('experiences', e.id, { start: ev.target.value })} placeholder="MM/AAAA" /></Field>
                    <Field label="Fin"><input value={e.current ? '' : e.end} disabled={e.current} onChange={(ev) => upList('experiences', e.id, { end: ev.target.value })} placeholder={e.current ? 'En cours' : 'MM/AAAA'} /></Field>
                  </div>
                </div>
                <label className="check"><input type="checkbox" checked={e.current} onChange={(ev) => upList('experiences', e.id, { current: ev.target.checked })} /> J’occupe ce poste actuellement</label>
                <span className="field-label">Réalisations</span>
                <BulletEditor value={e.bullets} onChange={(v) => upList('experiences', e.id, { bullets: v })} suggestions={job ? job.bullets : []} />
              </fieldset>
            ))}
            <button type="button" className="btn btn-ghost" onClick={() => up({ experiences: [...cv.experiences, { id: uid(), role: '', company: '', city: '', start: '', end: '', current: cv.experiences.length === 0, bullets: '' }] })}>
              + Ajouter une expérience
            </button>
          </>
        );
      case 'formation':
        return (
          <>
            <h2 className="step-title">Votre formation</h2>
            <p className="step-lead">Commencez par le diplôme le plus élevé. Inutile de remonter avant le baccalauréat.</p>
            {cv.education.map((e, idx) => (
              <fieldset className="entry" key={e.id}>
                <legend>Formation {idx + 1}</legend>
                <div className="entry-tools">
                  <button type="button" className="icon-btn danger" onClick={() => delList('education', e.id)} aria-label="Supprimer la formation">×</button>
                </div>
                <div className="grid-2">
                  <Field label="Diplôme" wide><input value={e.degree} onChange={(ev) => upList('education', e.id, { degree: ev.target.value })} placeholder="Ex. : Licence en gestion des entreprises" /></Field>
                  <Field label="École ou université"><input value={e.school} onChange={(ev) => upList('education', e.id, { school: ev.target.value })} /></Field>
                  <Field label="Ville"><input value={e.city} onChange={(ev) => upList('education', e.id, { city: ev.target.value })} /></Field>
                  <Field label="Année de début"><input value={e.start} onChange={(ev) => upList('education', e.id, { start: ev.target.value })} placeholder="AAAA" /></Field>
                  <Field label="Année d’obtention"><input value={e.end} onChange={(ev) => upList('education', e.id, { end: ev.target.value })} placeholder="AAAA" /></Field>
                  <Field label="Mention, spécialité, projet (facultatif)" wide><input value={e.details} onChange={(ev) => upList('education', e.id, { details: ev.target.value })} placeholder="Ex. : Mention Bien. Mémoire sur…" /></Field>
                </div>
              </fieldset>
            ))}
            <button type="button" className="btn btn-ghost" onClick={() => up({ education: [...cv.education, { id: uid(), degree: '', school: '', city: '', start: '', end: '', details: '' }] })}>+ Ajouter une formation</button>

            <h3 className="sub-title">Certifications (facultatif)</h3>
            {cv.certifications.map((c) => (
              <div className="row-inline" key={c.id}>
                <input value={c.name} onChange={(ev) => upList('certifications', c.id, { name: ev.target.value })} placeholder="Certification" aria-label="Nom de la certification" />
                <input value={c.issuer} onChange={(ev) => upList('certifications', c.id, { issuer: ev.target.value })} placeholder="Organisme" aria-label="Organisme" />
                <input className="w-80" value={c.year} onChange={(ev) => upList('certifications', c.id, { year: ev.target.value })} placeholder="Année" aria-label="Année" />
                <button type="button" className="icon-btn danger" onClick={() => delList('certifications', c.id)} aria-label="Supprimer">×</button>
              </div>
            ))}
            <button type="button" className="link-btn" onClick={() => up({ certifications: [...cv.certifications, { id: uid(), name: '', issuer: '', year: '' }] })}>+ Ajouter une certification</button>
          </>
        );
      case 'competences':
        return (
          <>
            <h2 className="step-title">Vos compétences</h2>
            <p className="step-lead">Les ATS trient d’abord sur ces mots-clés. Visez 8 à 15 compétences techniques précises (logiciels, méthodes, normes).</p>
            <span className="field-label">Compétences techniques</span>
            <ChipPicker value={cv.skills} onChange={(v) => up({ skills: v })} suggestions={job ? job.skills : []} placeholder="Tapez une compétence puis Entrée" />
            <span className="field-label">Qualités (3 maximum)</span>
            <ChipPicker value={cv.soft} onChange={(v) => up({ soft: v.slice(0, 4) })} suggestions={job ? job.soft : []} placeholder="Ex. : Rigueur" />
            <h3 className="sub-title">Langues</h3>
            {cv.languages.map((l) => (
              <div className="row-inline" key={l.id}>
                <input value={l.name} onChange={(ev) => upList('languages', l.id, { name: ev.target.value })} placeholder="Langue" aria-label="Langue" />
                <select value={l.level} onChange={(ev) => upList('languages', l.id, { level: ev.target.value })} aria-label="Niveau">
                  {LANG_LEVELS.map((x) => <option key={x}>{x}</option>)}
                </select>
                <button type="button" className="icon-btn danger" onClick={() => delList('languages', l.id)} aria-label="Supprimer">×</button>
              </div>
            ))}
            <button type="button" className="link-btn" onClick={() => up({ languages: [...cv.languages, { id: uid(), name: '', level: LANG_LEVELS[2] }] })}>+ Ajouter une langue</button>
            <Field label="Centres d’intérêt (facultatif)" hint="Seulement s’ils disent quelque chose de vous : bénévolat, sport en compétition, projets."><input value={cv.interests} onChange={(e) => up({ interests: e.target.value })} /></Field>
          </>
        );
      case 'profil':
        return (
          <>
            <h2 className="step-title">Votre profil en 3 phrases</h2>
            <p className="step-lead">Qui vous êtes, ce que vous savez faire de mieux, ce que vous cherchez. Le recruteur lit ce paragraphe en premier.</p>
            {job && (
              <button type="button" className="btn btn-marker" onClick={() => up({ summary: fillSummary(cv) })}>
                Proposer un texte à partir de mes réponses
              </button>
            )}
            <Field label="Profil" hint={`${(cv.summary || '').length} caractères. Idéal : 250 à 500.`} wide>
              <textarea rows={6} value={cv.summary} onChange={(e) => up({ summary: e.target.value })} placeholder="Ex. : Comptable avec 6 ans d’expérience en SYSCOHADA et clôtures mensuelles…" />
            </Field>
            <p className="note">Personnalisez la proposition : ajoutez une réussite concrète et le nom du secteur visé.</p>
          </>
        );
      case 'finaliser':
      default:
        return (
          <>
            <h2 className="step-title">Choisissez un modèle et téléchargez</h2>
            <div className="family-tabs" role="tablist" aria-label="Style de modèle">
              <button type="button" role="tab" aria-selected={family === 'design'} className={family === 'design' ? 'is-on' : ''} onClick={() => setFamily('design')}><strong>Design</strong><span>Photo, couleurs, deux colonnes</span></button>
              <button type="button" role="tab" aria-selected={family === 'essentiel'} className={family === 'essentiel' ? 'is-on' : ''} onClick={() => setFamily('essentiel')}><strong>Essentiel</strong><span>Une colonne, ATS strict</span></button>
            </div>
            <p className="step-lead small">{family === 'design'
              ? 'Pour les PME, start-up, ONG et candidatures directes. Le texte reste sélectionnable et lisible par la plupart des ATS modernes.'
              : 'Pour les grands groupes et les plateformes de recrutement : la lecture la plus fiable par les logiciels de tri.'}</p>
            <div className="tpl-mini-grid">
              {recommended.map((r) => {
                const id = templateId(r.layout.id, t.palette.id, t.font.id);
                return (
                  <button type="button" key={r.layout.id} className={`tpl-mini${t.layout.id === r.layout.id ? ' is-on' : ''}`} onClick={() => up({ template: id })} aria-pressed={t.layout.id === r.layout.id}>
                    <ScaledCV cv={cv.personal.firstName ? cv : sampleCV()} templateId={family === 'design' && id.endsWith('.carlito') ? id.replace('.carlito', '.poppins') : id} clip />
                    <span>{r.layout.name}{r.layout.family === 'design' && !account.premium && <em className="prem-tag">Premium</em>}</span>
                  </button>
                );
              })}
            </div>
            <div className="tpl-controls">
              <Field label="Mise en page">
                <select value={t.layout.id} onChange={(e) => up({ template: templateId(e.target.value, t.palette.id, t.font.id) })}>
                  {LAYOUTS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </Field>
              <Field label="Police">
                <select value={t.font.id} onChange={(e) => up({ template: templateId(t.layout.id, t.palette.id, e.target.value) })}>
                  {FONTS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </Field>
            </div>
            <span className="field-label">Couleur</span>
            <div className="swatches" role="radiogroup" aria-label="Couleur">
              {PALETTES.map((p) => (
                <button type="button" role="radio" aria-checked={t.palette.id === p.id} key={p.id} title={p.name} aria-label={p.name} className={`swatch${t.palette.id === p.id ? ' is-on' : ''}`} style={{ background: p.color }} onClick={() => up({ template: templateId(t.layout.id, p.id, t.font.id) })} />
              ))}
            </div>
            <p className="small"><button type="button" className="link-btn" onClick={() => go('modeles')}>Parcourir les {TEMPLATE_COUNT.toLocaleString('fr-FR')} modèles</button></p>

            <h3 className="sub-title">Adapter le CV à une offre précise</h3>
            <p className="muted">Collez l’annonce. On repère les mots-clés que l’ATS va chercher et ceux qui manquent à votre CV.</p>
            <textarea rows={5} value={cv.offer} onChange={(e) => up({ offer: e.target.value })} placeholder="Collez ici le texte de l’offre d’emploi…" aria-label="Texte de l’offre d’emploi" />
            {report.keywords.keywords.length > 0 && (
              <div className="kw-box">
                <p><strong>{report.keywords.found.length}</strong> mots-clés trouvés sur <strong>{report.keywords.keywords.length}</strong>.</p>
                {report.keywords.found.length > 0 && (
                  <p className="kw-line">{report.keywords.found.map((k) => <mark className="kw kw-found" key={k}>{k}</mark>)}</p>
                )}
                {report.keywords.missing.length > 0 && (
                  <>
                    <p className="small muted">Manquants : ajoutez ceux que vous maîtrisez vraiment (clic = ajout aux compétences). Placez les autres dans vos réalisations si c’est vrai.</p>
                    <p className="kw-line">{report.keywords.missing.map((k) => (
                      <button type="button" className="kw kw-missing" key={k} onClick={() => up({ skills: [...cv.skills, k] })}>+ {k}</button>
                    ))}</p>
                  </>
                )}
              </div>
            )}

            <h3 className="sub-title">Télécharger</h3>
            <div className="export-row">
              <button type="button" className="btn btn-primary" onClick={() => doExport('pdf')}>{busy === 'pdf' ? 'Ouverture…' : 'Télécharger en PDF'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => doExport('docx')}>{busy === 'docx' ? 'Création…' : 'Télécharger en Word'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => doExport('txt')}>Texte brut</button>
            </div>
            {isDesign(t.layout.id) && <p className="note small">Modèle Design : l’export Word et le texte brut reprennent une mise en page simple, idéale pour les formulaires en ligne. Pour un grand groupe, pensez à télécharger aussi une version Essentiel.</p>}
            <p className="small muted">PDF : dans la fenêtre d’impression, choisissez « Enregistrer au format PDF » et désactivez « En-têtes et pieds de page ». Word : à envoyer quand l’offre demande un .docx. Texte brut : à coller dans les formulaires en ligne.</p>
          </>
        );
    }
  })();

  return (
    <div className="builder">
      <nav className="stepper" aria-label="Étapes">
        <ol>
          {STEPS.map((s, i) => (
            <li key={s.id}>
              <button type="button" className={`stepper-btn${i === step ? ' is-current' : ''}${i < step ? ' is-done' : ''}`} onClick={() => setStep(i)} aria-current={i === step ? 'step' : undefined}>
                <span className="stepper-n">{i < step ? '✓' : i + 1}</span>
                <span className="stepper-l">{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="builder-grid">
        <section className="form-pane" aria-labelledby="step-heading">
          <p className="step-count" id="step-heading">Étape {step + 1} sur {STEPS.length}</p>
          {body}
          <div className="step-nav">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)} disabled={step === 0}>Retour</button>
            {step < STEPS.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={step === 0 && !cv.jobId}>
                {step === 0 && !cv.jobId ? 'Choisissez un métier' : `Continuer : ${STEPS[step + 1].label}`}
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => doExport('pdf')}>Télécharger en PDF</button>
            )}
          </div>
          <p className="small muted save-note">
            {account.user
              ? (syncStatus === 'saving' ? 'Sauvegarde dans votre compte…' : syncStatus === 'error' ? 'Sauvegarde en ligne impossible pour l’instant, vos données restent sur cet appareil.' : 'Sauvegardé dans votre compte.')
              : <>Enregistré sur cet appareil. <button type="button" className="link-btn" onClick={() => go('compte')}>Créez un compte</button> pour le retrouver partout.</>}
            {' '}<button type="button" className="link-btn" onClick={() => { if (window.confirm('Effacer toutes vos informations et recommencer ?')) { setCv(emptyCV()); setStepRaw(0); } }}>Recommencer à zéro</button></p>
        </section>

        <aside className={`preview-pane${showPreview ? ' is-open' : ''}`} aria-label="Aperçu du CV">
          <AtsPanel report={report} onGo={(s) => { setStep(s); setShowPreview(false); }} compact={step === 0} />
          <div className="sheet-frame">
            <ScaledCV cv={cv} templateId={cv.template || templateId(t.layout.id, t.palette.id, t.font.id)} placeholder />
          </div>
          <button type="button" className="btn btn-primary close-preview" onClick={() => setShowPreview(false)}>Revenir au formulaire</button>
        </aside>
      </div>

      <button type="button" className="fab" onClick={() => setShowPreview(true)} aria-label="Voir l’aperçu et le score">
        <ScoreRing score={report.score} size={40} /> Aperçu
      </button>

      {paywall && (
        <div className="modal-back" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) setPaywall(false); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="pw-title">
            <button type="button" className="icon-btn modal-x" onClick={() => setPaywall(false)} aria-label="Fermer">×</button>
            <h2 id="pw-title" className="h2">Ce modèle Design est Premium</h2>
            <p className="muted">Débloquez tous les modèles Design avec photo. Ou téléchargez gratuitement votre CV dans un modèle Essentiel, idéal pour les ATS.</p>
            <Plans user={account.user} premium={account.premium} profile={account.profile} go={(p, j, o) => { setPaywall(false); go(p, j, o); }} compact />
            <button type="button" className="link-btn" onClick={() => {
              const ess = templatesFor(cv.jobId).find((x) => x.layout.family === 'essentiel');
              setCv((c) => ({ ...c, template: templateId(ess.layout.id, t.palette.id, 'carlito') }));
              setPaywall(false);
            }}>Passer à un modèle Essentiel gratuit</button>
          </div>
        </div>
      )}

      <div className="print-root" aria-hidden="true">
        {isDesign(t.layout.id) && <style>{'@page { margin: 0; }'}</style>}
        <CVRender cv={cv} templateId={cv.template || templateId(t.layout.id, t.palette.id, t.font.id)} />
      </div>
    </div>
  );
}
