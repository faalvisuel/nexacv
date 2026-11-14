import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, TabStopType } from 'docx';
import { saveAs } from 'file-saver';
import { parseTemplate } from '../data/templates.js';
import { getJob } from '../data/jobs.js';
import { SECTION_TITLES } from '../components/CVRender.jsx';

const fileBase = (cv) => {
  const n = `${cv.personal.firstName}_${cv.personal.lastName}`.trim().replace(/\s+/g, '_');
  return `CV_${n && n !== '_' ? n : 'NexaCV'}`.normalize('NFD').replace(/[̀-ͯ]/g, '');
};
const lines = (s) => String(s || '').split('\n').map((x) => x.replace(/^[-•*\s]+/, '').trim()).filter(Boolean);
const period = (s, e, c) => (s || e || c ? `${s || ''}${s ? ' – ' : ''}${c ? 'Aujourd’hui' : e || ''}` : '');
const order = (cv) => (getJob(cv.jobId)?.order) || Object.keys(SECTION_TITLES);

// PDF : impression navigateur → PDF texte natif, 100 % lisible par les ATS
export function exportPDF(cv) {
  // Modèles Design : si le contenu dépasse une page, on le réduit légèrement pour garder une page nette.
  const sheet = document.querySelector('.sheet-frame .cv');
  const root = document.querySelector('.print-root');
  if (root) { root.style.zoom = ''; root.style.removeProperty('--pz'); }
  if (sheet && root && sheet.classList.contains('cv-design')) {
    const keep = [sheet.style.minHeight, sheet.style.overflow];
    sheet.style.minHeight = '0';
    sheet.style.overflow = 'visible';
    const h = sheet.offsetHeight;
    [sheet.style.minHeight, sheet.style.overflow] = keep;
    if (h > 1110) {
      const z = Math.max(0.78, 1105 / h);
      root.style.zoom = String(z);
      root.style.setProperty('--pz', String(z));
    }
  }
  const prev = document.title;
  document.title = fileBase(cv);
  document.body.classList.add('printing');
  setTimeout(() => {
    window.print();
    document.body.classList.remove('printing');
    document.title = prev;
  }, 60);
}

export function cvToPlainText(cv) {
  const p = cv.personal;
  const out = [];
  out.push(`${p.firstName} ${p.lastName}`.trim().toUpperCase());
  if (p.title) out.push(p.title);
  out.push([p.email, p.phone, p.city, p.linkedin, p.website].filter(Boolean).join(' | '));
  const sec = {
    profil: () => cv.summary && [cv.summary],
    experience: () => cv.experiences.length && cv.experiences.flatMap((e) => [
      `${e.role}${e.company ? ` — ${e.company}` : ''}${e.city ? `, ${e.city}` : ''} (${period(e.start, e.end, e.current)})`,
      ...lines(e.bullets).map((b) => `- ${b}`), '',
    ]),
    formation: () => cv.education.length && cv.education.flatMap((e) => [
      `${e.degree}${e.school ? ` — ${e.school}` : ''}${e.city ? `, ${e.city}` : ''} (${period(e.start, e.end)})`,
      ...(e.details ? [e.details] : []),
    ]),
    competences: () => (cv.skills.length || cv.soft.length) && [
      ...(cv.skills.length ? [`Techniques : ${cv.skills.join(', ')}`] : []),
      ...(cv.soft.length ? [`Qualités : ${cv.soft.join(', ')}`] : []),
    ],
    langues: () => cv.languages.length && [cv.languages.filter((l) => l.name).map((l) => `${l.name} (${l.level})`).join(' | ')],
    certifications: () => cv.certifications.length && cv.certifications.map((c) => `- ${c.name}${c.issuer ? `, ${c.issuer}` : ''}${c.year ? ` (${c.year})` : ''}`),
    interets: () => cv.interests && [cv.interests],
  };
  order(cv).forEach((k) => {
    const body = sec[k]();
    if (body && body.length) out.push('', SECTION_TITLES[k].toUpperCase(), ...body);
  });
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function exportTXT(cv) {
  const blob = new Blob([cvToPlainText(cv)], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${fileBase(cv)}.txt`);
}

export async function exportDOCX(cv) {
  const t = parseTemplate(cv.template);
  const accent = t.palette.color.replace('#', '');
  const font = t.font.docx;
  const p = cv.personal;
  const run = (text, o = {}) => new TextRun({ text, font, size: o.size || 21, bold: o.bold, color: o.color, italics: o.italics });
  const children = [];

  children.push(new Paragraph({ children: [run(`${p.firstName} ${p.lastName}`.trim(), { size: 44, bold: true, color: accent })] }));
  if (p.title) children.push(new Paragraph({ spacing: { after: 60 }, children: [run(p.title, { size: 26, bold: true })] }));
  children.push(new Paragraph({ spacing: { after: 200 }, children: [run([p.email, p.phone, p.city, p.linkedin, p.website].filter(Boolean).join('  |  '), { size: 19, color: '555B63' })] }));

  const heading = (text) => new Paragraph({
    spacing: { before: 240, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accent, space: 2 } },
    children: [run(text.toUpperCase(), { size: 22, bold: true, color: accent })],
  });
  const itemHead = (title, org, dates) => new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: 9600 }],
    spacing: { before: 120, after: 40 },
    children: [run(title, { bold: true }), ...(org ? [run(` — ${org}`, { color: '555B63' })] : []), ...(dates ? [run(`\t${dates}`, { size: 19, color: '555B63' })] : [])],
  });
  const bullet = (text) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 30 }, children: [run(text)] });

  const sec = {
    profil: () => cv.summary && [new Paragraph({ children: [run(cv.summary)] })],
    experience: () => cv.experiences.length && cv.experiences.flatMap((e) => [
      itemHead(e.role, [e.company, e.city].filter(Boolean).join(', '), period(e.start, e.end, e.current)),
      ...lines(e.bullets).map(bullet),
    ]),
    formation: () => cv.education.length && cv.education.flatMap((e) => [
      itemHead(e.degree, [e.school, e.city].filter(Boolean).join(', '), period(e.start, e.end)),
      ...(e.details ? [new Paragraph({ children: [run(e.details, { color: '555B63' })] })] : []),
    ]),
    competences: () => (cv.skills.length || cv.soft.length) && [
      ...(cv.skills.length ? [new Paragraph({ children: [run('Techniques : ', { bold: true }), run(cv.skills.join(', '))] })] : []),
      ...(cv.soft.length ? [new Paragraph({ children: [run('Qualités : ', { bold: true }), run(cv.soft.join(', '))] })] : []),
    ],
    langues: () => cv.languages.length && [new Paragraph({ children: [run(cv.languages.filter((l) => l.name).map((l) => `${l.name} (${l.level})`).join('  |  '))] })],
    certifications: () => cv.certifications.length && cv.certifications.filter((c) => c.name).map((c) => bullet(`${c.name}${c.issuer ? `, ${c.issuer}` : ''}${c.year ? ` (${c.year})` : ''}`)),
    interets: () => cv.interests && [new Paragraph({ children: [run(cv.interests)] })],
  };
  order(cv).forEach((k) => {
    const body = sec[k]();
    if (body && body.length) children.push(heading(SECTION_TITLES[k]), ...body);
  });

  const doc = new Document({
    creator: 'NexaCV',
    title: fileBase(cv),
    sections: [{ properties: { page: { margin: { top: 900, bottom: 900, left: 1000, right: 1000 } } }, children }],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileBase(cv)}.docx`);
}

export { AlignmentType };
