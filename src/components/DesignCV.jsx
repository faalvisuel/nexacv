// Modèles « Design » : photo, deux colonnes, blocs de couleur.
// Tout reste du vrai texte (sélectionnable, lisible par les ATS modernes).
// Aucune jauge inventée : seules les langues ont des barres, calculées depuis le niveau saisi.

const lines = (s) => String(s || '').split('\n').map((x) => x.replace(/^[-•*\s]+/, '').trim()).filter(Boolean);
const period = (s, e, c) => (s || e || c ? `${s || ''}${s ? ' – ' : ''}${c ? 'Aujourd’hui' : e || ''}` : '');

export function langPercent(level = '') {
  if (/maternelle/i.test(level)) return 100;
  if (/C1|C2|Courant/i.test(level)) return 88;
  if (/B2|Avancé/i.test(level)) return 72;
  if (/B1|Interm/i.test(level)) return 52;
  return 30;
}
const CODES = { francais: 'FR', anglais: 'EN', english: 'EN', wolof: 'WO', arabe: 'AR', espagnol: 'ES', allemand: 'DE', portugais: 'PT', italien: 'IT', chinois: 'ZH', pulaar: 'FF', peul: 'FF', serere: 'SR', diola: 'DY', mandingue: 'MN', bambara: 'BM', lingala: 'LN', swahili: 'SW', haoussa: 'HA', russe: 'RU', japonais: 'JA', turc: 'TR', neerlandais: 'NL' };
const langAbbr = (name = '') => {
  const k = name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return CODES[k] || name.trim().slice(0, 2).toUpperCase() || '··';
};
const ringLabel = (level = '') => (/maternelle/i.test(level) ? 'Natif' : (level.match(/[ABC][12](-[ABC][12])?/) || [''])[0].split('-').pop() || '·');
const shortLevel = (level = '') => level.replace(/\s*\(.*\)/, '').replace(/^Langue /, '');

const PATHS = {
  phone: 'M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z',
  mail: 'M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm8 7.2L4.7 7.4v.1L12 12.2l7.3-4.7v-.1L12 12.2z',
  pin: 'M12 2a7 7 0 017 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 017-7zm0 4.5A2.5 2.5 0 1012 11.5 2.5 2.5 0 0012 6.5z',
  link: 'M10.6 13.4a1 1 0 001.4 1.4l4.9-4.9a3.5 3.5 0 00-5-5l-1.6 1.6a1 1 0 101.4 1.4l1.6-1.6a1.5 1.5 0 012.2 2.2l-4.9 4.9zm2.8-2.8a1 1 0 00-1.4-1.4l-4.9 4.9a3.5 3.5 0 005 5l1.6-1.6a1 1 0 10-1.4-1.4l-1.6 1.6a1.5 1.5 0 01-2.2-2.2l4.9-4.9z',
  web: 'M12 2a10 10 0 110 20 10 10 0 010-20zm6.9 9a8 8 0 00-3-5.6c.6 1.6 1 3.5 1.1 5.6h1.9zM15 11c-.1-2.6-.8-4.8-1.6-6a8 8 0 00-2.8 0C9.8 6.2 9.1 8.4 9 11h6zm-8 0c.1-2.1.5-4 1.1-5.6A8 8 0 005.1 11H7zm-1.9 2a8 8 0 003 5.6C7.5 17 7.1 15.1 7 13H5.1zM9 13c.1 2.6.8 4.8 1.6 6a8 8 0 002.8 0c.8-1.2 1.5-3.4 1.6-6H9zm8 0c-.1 2.1-.5 4-1.1 5.6a8 8 0 003-5.6H17z',
  user: 'M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z',
  case: 'M9 4h6a2 2 0 012 2v1h3a1 1 0 011 1v4H3V8a1 1 0 011-1h3V6a2 2 0 012-2zm0 3h6V6H9v1zM3 14h8v1h2v-1h8v5a1 1 0 01-1 1H4a1 1 0 01-1-1v-5z',
  cap: 'M12 3l10 5-10 5L2 8l10-5zm-6 8.2l6 3 6-3V15c0 1.7-2.7 3-6 3s-6-1.3-6-3v-3.8z',
  star: 'M12 2l2.6 6.6L21 9l-5 4.4L17.5 20 12 16.5 6.5 20 8 13.4 3 9l6.4-.4L12 2z',
  award: 'M12 2a6 6 0 016 6 6 6 0 01-3 5.2V22l-3-2-3 2v-8.8A6 6 0 016 8a6 6 0 016-6z',
  heart: 'M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z',
  globe: 'M12 2a10 10 0 110 20 10 10 0 010-20zm-1 2.1A8 8 0 004.1 11H8c.1-2.6.9-5 3-6.9zm2 0c2.1 1.9 2.9 4.3 3 6.9h3.9A8 8 0 0013 4.1zM10 11h4c-.1-2.2-.8-4.2-2-5.6-1.2 1.4-1.9 3.4-2 5.6zm-5.9 2A8 8 0 0011 19.9c-2.1-1.9-2.9-4.3-3-6.9H4.1zm5.9 0c.1 2.2.8 4.2 2 5.6 1.2-1.4 1.9-3.4 2-5.6h-4zm6 0c-.1 2.6-.9 5-3 6.9a8 8 0 006.9-6.9H16z',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
};

export function Icon({ name, size = 14, className = '' }) {
  return (
    <svg className={`ico ${className}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={PATHS[name] || PATHS.star} fill="currentColor" />
    </svg>
  );
}

function Sparkle({ className, color }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 0C21 12 28 19 40 20 28 21 21 28 20 40 19 28 12 21 0 20 12 19 19 12 20 0z" fill={color || 'currentColor'} stroke="#111" strokeWidth="1.2" />
    </svg>
  );
}

function Photo({ cv, className = '' }) {
  const p = cv.personal;
  const initials = `${(p.firstName || 'P')[0]}${(p.lastName || 'N')[0]}`.toUpperCase();
  if (cv.photo && cv.showPhoto !== false) {
    return <div className={`d-photo ${className}`}><img src={cv.photo} alt={`Photo de ${p.firstName} ${p.lastName}`} /></div>;
  }
  return <div className={`d-photo d-photo-empty ${className}`}><span>{initials}</span></div>;
}

function useData(cv) {
  const p = cv.personal;
  const contacts = [
    { k: 'phone', v: p.phone }, { k: 'mail', v: p.email }, { k: 'pin', v: p.city },
    { k: 'link', v: p.linkedin }, { k: 'web', v: p.website },
  ].filter((c) => c.v);
  return {
    p,
    first: p.firstName || 'Prénom',
    last: p.lastName || 'Nom',
    contacts,
    langs: cv.languages.filter((l) => l.name),
    certs: cv.certifications.filter((c) => c.name),
    exps: cv.experiences,
    edus: cv.education,
  };
}

const Contacts = ({ list, cls = '' }) => (
  <ul className={`d-contacts ${cls}`}>
    {list.map((c) => <li key={c.k}><span className="d-ci"><Icon name={c.k} size={12} /></span><span>{c.v}</span></li>)}
  </ul>
);

const ExpList = ({ exps, variant = 'a' }) => exps.map((e) => (
  <div className={`d-exp d-exp-${variant}`} key={e.id}>
    <div className="d-exp-top">
      <strong className="d-exp-role">{variant === 'b' ? (e.company || e.role) : (e.role || 'Poste')}</strong>
      <span className="d-date">{period(e.start, e.end, e.current)}</span>
    </div>
    <div className="d-exp-org">{variant === 'b' ? e.role : [e.company, e.city].filter(Boolean).join(', ')}</div>
    {lines(e.bullets).length > 0 && <ul>{lines(e.bullets).map((b, i) => <li key={i}>{b}</li>)}</ul>}
  </div>
));

const EduList = ({ edus }) => edus.map((e) => (
  <div className="d-edu" key={e.id}>
    <span className="d-date">{period(e.start, e.end)}</span>
    <strong>{e.degree || 'Diplôme'}</strong>
    <span className="d-edu-school">{[e.school, e.city].filter(Boolean).join(', ')}</span>
    {e.details && <span className="d-edu-det">{e.details}</span>}
  </div>
));

/* 1. SABLE — bandeau haut, plaque nom, colonne latérale teintée */
function Sable({ cv, d }) {
  return (
    <>
      <div className="ds-band" aria-hidden="true" />
      <div className="ds-grid">
        <aside className="ds-side">
          <Photo cv={cv} className="ds-photo" />
          <div className="ds-plate"><h1 className="cv-name">{d.first} {d.last}</h1></div>
          <div className="ds-side-in">
            {cv.summary && <section><h2 className="ds-h">Profil</h2><p className="ds-just">{cv.summary}</p></section>}
            {d.langs.length > 0 && <section><h2 className="ds-h">Langues</h2><ul className="ds-ul">{d.langs.map((l) => <li key={l.id}>{l.name} <em>({shortLevel(l.level)})</em></li>)}</ul></section>}
            {cv.skills.length > 0 && <section><h2 className="ds-h">Compétences</h2><ul className="ds-plain">{cv.skills.map((s) => <li key={s}>{s}</li>)}</ul></section>}
            {cv.soft.length > 0 && <section><h2 className="ds-h">Qualités</h2><ul className="ds-plain">{cv.soft.map((s) => <li key={s}>{s}</li>)}</ul></section>}
          </div>
        </aside>
        <main className="ds-main">
          <div className="ds-top">
            {d.p.title && <p className="ds-title">{d.p.title}</p>}
            <h2 className="ds-h ds-h-top">Coordonnées</h2>
            <Contacts list={d.contacts} />
          </div>
          {d.exps.length > 0 && <section><h2 className="ds-bar">Expérience professionnelle</h2><ExpList exps={d.exps} /></section>}
          {d.edus.length > 0 && <section><h2 className="ds-bar">Formation</h2><EduList edus={d.edus} /></section>}
          {d.certs.length > 0 && <section><h2 className="ds-bar">Certifications</h2><ul className="ds-ul">{d.certs.map((c) => <li key={c.id}>{c.name}{c.issuer ? `, ${c.issuer}` : ''}{c.year ? ` (${c.year})` : ''}</li>)}</ul></section>}
          {cv.interests && <section><h2 className="ds-bar">Centres d’intérêt</h2><p>{cv.interests}</p></section>}
        </main>
      </div>
      <div className="ds-foot" aria-hidden="true" />
    </>
  );
}

/* 2. ORBITE — barre latérale sombre, photo ronde, titres pilule, frise */
function Orbite({ cv, d }) {
  const H = ({ icon, children }) => <h2 className="do-h"><span className="do-hi"><Icon name={icon} size={13} /></span>{children}</h2>;
  return (
    <div className="do-grid">
      <aside className="do-side">
        <div className="do-tab"><Photo cv={cv} className="do-photo" /></div>
        <H icon="phone">Contact</H>
        <ul className="do-tl">{d.contacts.map((c) => <li key={c.k}><span className="do-ci"><Icon name={c.k} size={11} /></span>{c.v}</li>)}</ul>
        {d.edus.length > 0 && <><hr className="do-dash" /><H icon="cap">Formation</H>
          <ul className="do-tl do-tl-b">{d.edus.map((e) => <li key={e.id}><strong>{e.degree}</strong><span>{e.school}</span><em>{period(e.start, e.end)}</em></li>)}</ul></>}
        {d.langs.length > 0 && <><hr className="do-dash" /><H icon="globe">Langues</H>
          <ul className="do-langs">{d.langs.map((l) => <li key={l.id}><span>{l.name}<em>{shortLevel(l.level)}</em></span><i><b style={{ width: `${langPercent(l.level)}%` }} /></i></li>)}</ul></>}
      </aside>
      <main className="do-main">
        <header className="do-head">
          <h1 className="cv-name">{d.first} {d.last}</h1>
          {d.p.title && <p className="cv-title">{d.p.title}</p>}
        </header>
        {cv.summary && <section><H icon="user">Profil</H><p className="do-body do-line">{cv.summary}</p></section>}
        {d.exps.length > 0 && <section><H icon="case">Expérience professionnelle</H><div className="do-body do-dots"><ExpList exps={d.exps} variant="b" /></div></section>}
        {(cv.skills.length > 0 || cv.soft.length > 0) && <section><H icon="bolt">Compétences</H>
          <ul className="do-body do-skills">{[...cv.skills, ...cv.soft].map((s) => <li key={s}>{s}</li>)}</ul></section>}
        {d.certs.length > 0 && <section><H icon="award">Certifications</H><ul className="do-body do-skills">{d.certs.map((c) => <li key={c.id}>{c.name}{c.year ? ` (${c.year})` : ''}</li>)}</ul></section>}
      </main>
    </div>
  );
}

/* 3. GRENAT — nom massif, colonne pleine couleur, bannière profil, anneaux langues */
function Grenat({ cv, d }) {
  return (
    <div className="dg">
      <div className="dg-right-bg" aria-hidden="true" />
      <header className="dg-head">
        <div className="dg-names">
          <h1 className="cv-name"><span>{d.first}</span> <span>{d.last}</span></h1>
          {d.p.title && <p className="cv-title">{d.p.title}</p>}
        </div>
        <Photo cv={cv} className="dg-photo" />
      </header>
      {cv.summary && (
        <section className="dg-about">
          <h2 className="dg-pill dg-pill-w">Profil</h2>
          <p>{cv.summary}</p>
        </section>
      )}
      <div className="dg-cols">
        <div className="dg-left">
          {d.edus.length > 0 && <section><h2 className="dg-pill">Formation</h2><div className="dg-edus">{d.edus.map((e) => (
            <div key={e.id} className="dg-edu"><span className="dg-year">{period(e.start, e.end)}</span><strong>{e.degree}</strong><span>{[e.school, e.city].filter(Boolean).join(', ')}</span></div>
          ))}</div></section>}
          {(cv.skills.length > 0) && <section><h2 className="dg-pill">Compétences</h2><ul className="dg-chips">{[...cv.skills, ...cv.soft].map((s) => <li key={s}>{s}</li>)}</ul></section>}
          {d.langs.length > 0 && <section><h2 className="dg-pill">Langues</h2><div className="dg-rings">{d.langs.slice(0, 3).map((l) => {
            const pc = langPercent(l.level); const r = 30; const c = 2 * Math.PI * r;
            return (
              <figure key={l.id}>
                <svg viewBox="0 0 76 76" width="76" height="76" aria-hidden="true">
                  <circle cx="38" cy="38" r={r} className="dg-ring-bg" />
                  <circle cx="38" cy="38" r={r} className="dg-ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - pc / 100)} transform="rotate(-90 38 38)" />
                </svg>
                <span className="dg-ring-lv">{ringLabel(l.level)}</span>
                <figcaption>{l.name}</figcaption>
              </figure>
            );
          })}</div></section>}
        </div>
        <div className="dg-right">
          {d.exps.length > 0 && <section><h2 className="dg-h">Expérience professionnelle</h2>{d.exps.map((e) => (
            <div className="dg-exp" key={e.id}>
              <strong>{e.role}{e.company ? `, ${e.company}` : ''}</strong>
              <span className="dg-exp-date">{period(e.start, e.end, e.current)}</span>
              {lines(e.bullets).length > 0 && <ul>{lines(e.bullets).map((b, i) => <li key={i}>{b}</li>)}</ul>}
            </div>
          ))}</section>}
          {d.certs.length > 0 && <section><h2 className="dg-h">Certifications</h2><ul className="dg-certs">{d.certs.map((c) => <li key={c.id}>{c.name}{c.year ? ` (${c.year})` : ''}</li>)}</ul></section>}
          <section><h2 className="dg-h">Contact</h2><ul className="dg-contacts">{d.contacts.map((c) => <li key={c.k}><span><Icon name={c.k} size={13} /></span>{c.v}</li>)}</ul></section>
        </div>
      </div>
    </div>
  );
}

/* 4. ARDOISE — barre latérale ardoise, grande photo, titres soulignés courts */
function Ardoise({ cv, d }) {
  const Row = ({ left, sub, date, children }) => (
    <div className="da-row"><div className="da-row-l"><strong>{left}</strong><span>{date}</span><span>{sub}</span></div><div className="da-row-r">{children}</div></div>
  );
  return (
    <div className="da-grid">
      <aside className="da-side">
        <div className="da-id">
          <h1 className="cv-name">{d.first}<br />{d.last}</h1>
          {d.p.title && <p className="cv-title">{d.p.title}</p>}
        </div>
        <Photo cv={cv} className="da-photo" />
        <div className="da-side-in">
          <h2 className="da-sh">Contact</h2>
          <Contacts list={d.contacts} cls="da-contacts" />
          {d.langs.length > 0 && <><h2 className="da-sh">Langues</h2><ul className="da-langs">{d.langs.map((l) => <li key={l.id}><span>{l.name}</span><i><b style={{ width: `${langPercent(l.level)}%` }} /></i></li>)}</ul></>}
          {cv.interests && <><h2 className="da-sh">Centres d’intérêt</h2><p className="da-int">{cv.interests}</p></>}
        </div>
      </aside>
      <main className="da-main">
        {cv.summary && <section><h2 className="da-h">Profil</h2><p className="da-p">{cv.summary}</p></section>}
        {d.exps.length > 0 && <section><h2 className="da-h">Expérience</h2>{d.exps.map((e) => (
          <Row key={e.id} left={e.role} sub={e.company} date={period(e.start, e.end, e.current)}>
            <ul>{lines(e.bullets).map((b, i) => <li key={i}>{b}</li>)}</ul>
          </Row>
        ))}</section>}
        {d.edus.length > 0 && <section><h2 className="da-h">Formation</h2>{d.edus.map((e) => (
          <Row key={e.id} left={e.school || e.degree} sub={e.school ? e.degree : ''} date={period(e.start, e.end)}><p>{e.details || e.city}</p></Row>
        ))}</section>}
        {cv.skills.length > 0 && <section><h2 className="da-h">Compétences</h2><ul className="da-skills">{cv.skills.map((s) => <li key={s}>{s}</li>)}</ul></section>}
        {d.certs.length > 0 && <section><h2 className="da-h">Certifications</h2><ul className="da-certs">{d.certs.map((c) => <li key={c.id}>{c.name}{c.issuer ? `, ${c.issuer}` : ''}{c.year ? ` (${c.year})` : ''}</li>)}</ul></section>}
      </main>
    </div>
  );
}

/* 5. BONJOUR — fond crème, « Bonjour ! » manuscrit, frise à dates, coins décoratifs */
function Bonjour({ cv, d }) {
  return (
    <div className="db">
      <span className="db-corner db-tr" aria-hidden="true"><Icon name="star" size={16} /></span>
      <span className="db-corner db-bl" aria-hidden="true"><Icon name="star" size={16} /></span>
      <div className="db-grid">
        <aside className="db-side">
          <Photo cv={cv} className="db-photo" />
          <ul className="db-contacts">{d.contacts.map((c) => <li key={c.k}><span className="db-star">✷</span>{c.v}</li>)}</ul>
          {d.edus.length > 0 && <section><h2 className="db-h">Formation</h2><div className="db-line">{d.edus.map((e) => (
            <div className="db-edu" key={e.id}><span className="db-yr">{period(e.start, e.end)}</span><strong>{e.school || e.degree}</strong><span>{e.school ? e.degree : ''}</span></div>
          ))}</div></section>}
          {cv.skills.length > 0 && <section><h2 className="db-h">Compétences</h2><ul className="db-line db-skills">{cv.skills.map((s) => <li key={s}>{s}</li>)}</ul></section>}
          {d.langs.length > 0 && <section><h2 className="db-h">Langues</h2><ul className="db-tiles">{d.langs.map((l) => <li key={l.id} title={l.name}><b>{langAbbr(l.name)}</b><span>{l.name}</span></li>)}</ul></section>}
        </aside>
        <main className="db-main">
          <p className="db-hello">Bonjour !</p>
          <h1 className="cv-name db-name">{d.first} {d.last}{d.p.title ? <span className="db-role">, {d.p.title}</span> : null}</h1>
          {cv.summary && <p className="db-intro">{cv.summary}</p>}
          {d.exps.length > 0 && <section><h2 className="db-h db-h-main">Expérience</h2>
            <div className="db-tl">{d.exps.map((e) => (
              <div className="db-exp" key={e.id}>
                <span className="db-exp-yr">{e.current ? 'Aujourd’hui' : period(e.start, e.end)}</span>
                <div>
                  <strong>{e.role}</strong>
                  <em>{[e.company, e.city].filter(Boolean).join(', ')}{e.current && e.start ? ` · depuis ${e.start}` : ''}</em>
                  <ul>{lines(e.bullets).map((b, i) => <li key={i}>{b}</li>)}</ul>
                </div>
              </div>
            ))}</div></section>}
          {d.certs.length > 0 && <section><h2 className="db-h db-h-main">Certifications</h2><ul className="db-certs">{d.certs.map((c) => <li key={c.id}>{c.name}{c.issuer ? `, ${c.issuer}` : ''}{c.year ? ` (${c.year})` : ''}</li>)}</ul></section>}
        </main>
      </div>
    </div>
  );
}

/* 6. POP — arche photo, étincelles, titres pilules pastel, puces contour */
function Pop({ cv, d }) {
  return (
    <div className="dp">
      <header className="dp-head">
        <div className="dp-arch-wrap">
          <Photo cv={cv} className="dp-arch" />
          <Sparkle className="dp-sp dp-sp1" color="#BDF5A6" />
          <Sparkle className="dp-sp dp-sp2" color="#F3F79A" />
        </div>
        <div className="dp-hello-box">
          <p className="dp-hello">Bonjour !</p>
          <h1 className="cv-name dp-name"><span className="dp-name-hl">{d.first} {d.last}</span>{d.p.title ? `, ${d.p.title}` : ''}</h1>
          {cv.summary && <p className="dp-intro">{cv.summary}</p>}
          <hr />
          <ul className="dp-contacts">{d.contacts.map((c) => <li key={c.k}><Icon name={c.k} size={15} />{c.v}</li>)}</ul>
        </div>
      </header>
      <div className="dp-cols">
        <div>
          {d.exps.length > 0 && <section><h2 className="dp-pill dp-c1">Expérience</h2>{d.exps.map((e) => (
            <div className="dp-item" key={e.id}>
              <span className="dp-yr">{period(e.start, e.end, e.current)}</span>
              <strong>{e.role}</strong>
              <span>{[e.company, e.city].filter(Boolean).join(', ')}</span>
              {lines(e.bullets).length > 0 && <ul>{lines(e.bullets).map((b, i) => <li key={i}>{b}</li>)}</ul>}
            </div>
          ))}</section>}
          {d.edus.length > 0 && <section><h2 className="dp-pill dp-c2">Formation</h2>{d.edus.map((e) => (
            <div className="dp-item" key={e.id}><span className="dp-yr">{period(e.start, e.end)}</span><strong>{e.degree}</strong><span>{[e.school, e.city].filter(Boolean).join(', ')}</span></div>
          ))}</section>}
        </div>
        <div>
          {(cv.skills.length > 0 || cv.soft.length > 0) && <section><h2 className="dp-pill dp-c3">Compétences</h2><ul className="dp-chips">{[...cv.skills, ...cv.soft].map((s) => <li key={s}>{s}</li>)}</ul></section>}
          {d.langs.length > 0 && <section><h2 className="dp-pill dp-c4">Langues</h2><ul className="dp-tiles">{d.langs.map((l) => (
            <li key={l.id}><b>{langAbbr(l.name)}</b><span className="dp-tl-name">{l.name}</span><i><em style={{ width: `${langPercent(l.level)}%` }} /></i></li>
          ))}</ul></section>}
          {d.certs.length > 0 && <section><h2 className="dp-pill dp-c2">Certifications</h2><div className="dp-tl">{d.certs.map((c) => (
            <div key={c.id} className="dp-tl-item"><span className="dp-yr">{c.year}</span><strong>{c.name}</strong><span>{c.issuer}</span></div>
          ))}</div></section>}
          {cv.interests && <section><h2 className="dp-pill dp-c1">Intérêts</h2><p>{cv.interests}</p></section>}
        </div>
      </div>
    </div>
  );
}

const MAP = { sable: Sable, orbite: Orbite, grenat: Grenat, ardoise: Ardoise, bonjour: Bonjour, pop: Pop };

export default function DesignCV({ cv, layout, style }) {
  const d = useData(cv);
  const C = MAP[layout] || Sable;
  return (
    <article className={`cv cv-design d-${layout}`} style={style} lang="fr">
      <C cv={cv} d={d} />
    </article>
  );
}
