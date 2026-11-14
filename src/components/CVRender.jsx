import { parseTemplate } from '../data/templates.js';
import { getJob } from '../data/jobs.js';

export const SECTION_TITLES = {
  profil: 'Profil',
  experience: 'Expérience professionnelle',
  formation: 'Formation',
  competences: 'Compétences',
  langues: 'Langues',
  certifications: 'Certifications',
  interets: 'Centres d’intérêt',
};

const DEFAULT_ORDER = ['profil', 'experience', 'formation', 'competences', 'langues', 'certifications', 'interets'];

function period(start, end, current) {
  if (!start && !end && !current) return '';
  return `${start || ''}${start ? ' – ' : ''}${current ? 'Aujourd’hui' : end || ''}`;
}

const lines = (s) => String(s || '').split('\n').map((x) => x.replace(/^[-•*\s]+/, '').trim()).filter(Boolean);

export default function CVRender({ cv, templateId, placeholder = false }) {
  const t = parseTemplate(templateId || cv.template);
  const job = getJob(cv.jobId);
  const order = job ? job.order : DEFAULT_ORDER;
  const p = cv.personal;
  const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || (placeholder ? 'Prénom Nom' : '');
  const contact = [p.email, p.phone, p.city, p.linkedin, p.website].filter(Boolean);
  const L = t.layout.id;

  const style = { '--cv-accent': t.palette.color, '--cv-font': t.font.css };

  const sections = {
    profil: cv.summary && <p className="cv-summary">{cv.summary}</p>,
    experience: cv.experiences.length > 0 && cv.experiences.map((e) => (
      <div className="cv-item" key={e.id}>
        <div className="cv-item-body">
          <div className="cv-item-head">
            <span className="cv-item-title">{e.role || 'Poste'}</span>
            {(e.company || e.city) && <span className="cv-item-org">{[e.company, e.city].filter(Boolean).join(', ')}</span>}
            <span className="cv-item-date">{period(e.start, e.end, e.current)}</span>
          </div>
          {lines(e.bullets).length > 0 && (
            <ul>{lines(e.bullets).map((b, i) => <li key={i}>{b}</li>)}</ul>
          )}
        </div>
      </div>
    )),
    formation: cv.education.length > 0 && cv.education.map((e) => (
      <div className="cv-item" key={e.id}>
        <div className="cv-item-body">
          <div className="cv-item-head">
            <span className="cv-item-title">{e.degree || 'Diplôme'}</span>
            {(e.school || e.city) && <span className="cv-item-org">{[e.school, e.city].filter(Boolean).join(', ')}</span>}
            <span className="cv-item-date">{period(e.start, e.end)}</span>
          </div>
          {e.details && <p className="cv-item-details">{e.details}</p>}
        </div>
      </div>
    )),
    competences: (cv.skills.length > 0 || cv.soft.length > 0) && (
      <div className="cv-skills">
        {cv.skills.length > 0 && <p><strong>Techniques : </strong>{cv.skills.join(', ')}</p>}
        {cv.soft.length > 0 && <p><strong>Qualités : </strong>{cv.soft.join(', ')}</p>}
      </div>
    ),
    langues: cv.languages.filter((l) => l.name).length > 0 && (
      <p className="cv-inline">{cv.languages.filter((l) => l.name).map((l) => `${l.name}${l.level ? ` (${l.level})` : ''}`).join(' | ')}</p>
    ),
    certifications: cv.certifications.filter((c) => c.name).length > 0 && (
      <ul className="cv-plain">
        {cv.certifications.filter((c) => c.name).map((c) => (
          <li key={c.id}>{c.name}{c.issuer ? `, ${c.issuer}` : ''}{c.year ? ` (${c.year})` : ''}</li>
        ))}
      </ul>
    ),
    interets: cv.interests && <p className="cv-inline">{cv.interests}</p>,
  };

  return (
    <article className={`cv cv-l-${L}`} style={style} lang="fr">
      <header className="cv-header">
        <h1 className="cv-name">{name}</h1>
        {p.title && <p className="cv-title">{p.title}</p>}
        {contact.length > 0 && (
          <p className="cv-contact">{contact.map((c, i) => <span key={i}>{c}</span>)}</p>
        )}
      </header>
      {order.map((key) => sections[key] && (
        <section className={`cv-section cv-s-${key}`} key={key}>
          <h2 className="cv-h2">{SECTION_TITLES[key]}</h2>
          <div className="cv-section-body">{sections[key]}</div>
        </section>
      ))}
    </article>
  );
}
