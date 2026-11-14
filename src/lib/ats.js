// Analyse ATS : vérifie ce que les logiciels de tri (Taleo, Workday, Greenhouse,
// Lever, SmartRecruiters…) savent lire et ce que les recruteurs cherchent.
import { ACTION_VERBS } from '../data/jobs.js';

const STOP = new Set(`a à au aux avec ce ces cette dans de des du elle en et être eux il ils je la le les leur lui ma mais me même mes moi mon ne nos notre nous on ou où par pas pour qu que qui sa se ses son sur ta te tes toi ton tu un une vos votre vous c d j l à m n s t y été étée étés avoir ai as avons avez ont avait sont est sera seront serait plus moins très tout tous toute toutes autre autres afin ainsi dont donc car si sans sous chez entre vers lors leurs cela celui celle ceux comme aussi bien peu fait faire peut doit doivent doit être nos vos votre poste profil mission missions candidat candidate candidature recherche recherchons entreprise équipe sein cadre h f hf ans an année années expérience expériences minimum maximum niveau capacité capable bonne bonnes bon bons forte fort excellent excellente maîtrise connaissance connaissances qualité qualités compétences compétence the and or of to in for with on at by an be is are as we you our your will from this that have has job role work etc via selon tant chaque ici cdi cdd temps plein partiel lieu date salaire rémunération avantages envoyer cv lettre motivation postuler offre`.split(/\s+/));

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function cvText(cv) {
  const p = cv.personal;
  return [
    p.title, cv.summary,
    ...cv.experiences.map((e) => `${e.role} ${e.company} ${e.bullets}`),
    ...cv.education.map((e) => `${e.degree} ${e.school} ${e.details}`),
    cv.skills.join(' '), cv.soft.join(' '),
    cv.certifications.map((c) => `${c.name} ${c.issuer}`).join(' '),
    cv.languages.map((l) => l.name).join(' '),
  ].join(' \n ');
}

export function extractKeywords(offer, max = 25) {
  if (!offer || offer.trim().length < 40) return [];
  const raw = offer.replace(/[’']/g, ' ').split(/[^A-Za-zÀ-ÿ0-9+#./-]+/).filter(Boolean);
  const counts = new Map();
  const display = new Map();
  const add = (k, d) => {
    counts.set(k, (counts.get(k) || 0) + 1);
    if (!display.has(k)) display.set(k, d);
  };
  for (let i = 0; i < raw.length; i++) {
    const w = raw[i].replace(/^[./-]+|[./-]+$/g, '');
    const n = norm(w);
    if (n.length < 2 || STOP.has(n) || /^\d+$/.test(n)) continue;
    // acronymes et outils (SQL, SAP, Excel…) comptent double
    const isTool = /[A-Z]{2,}|[+#]/.test(w) || /^[A-Z][a-z]+[A-Z]/.test(w);
    if (n.length < 4 && !isTool) continue;
    add(n, w);
    if (isTool) add(n, w);
    // bigrammes : "gestion de projet", "service client"…
    const nx = raw[i + 1] && norm(raw[i + 1]);
    if (nx && nx.length > 3 && !STOP.has(nx)) add(`${n} ${nx}`, `${w} ${raw[i + 1]}`);
  }
  return [...counts.entries()]
    .filter(([k, c]) => c >= (k.includes(' ') ? 2 : 1))
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([k]) => display.get(k));
}

export function keywordMatch(cv) {
  const kws = extractKeywords(cv.offer);
  const text = norm(cvText(cv));
  const found = [];
  const missing = [];
  kws.forEach((k) => {
    const n = norm(k);
    const stem = n.length > 6 ? n.slice(0, n.length - 2) : n; // tolère pluriels et genres
    (text.includes(stem) ? found : missing).push(k);
  });
  return { keywords: kws, found, missing, ratio: kws.length ? found.length / kws.length : null };
}

export function bulletLines(cv) {
  return cv.experiences.flatMap((e) => String(e.bullets || '').split('\n').map((b) => b.trim()).filter(Boolean));
}

export function startsWithVerb(line) {
  const first = norm(line.replace(/^[-•*\s]+/, '').split(/\s+/)[0]);
  return ACTION_VERBS.some((v) => norm(v) === first) || /^[a-z]+(e|é|és|ée|ées)$/.test(first) && first.length > 4 && first.endsWith('é');
}

export const hasNumber = (line) => /\d/.test(line) && !/\[x\]/i.test(line);

export function analyze(cv) {
  const p = cv.personal;
  const checks = [];
  const add = (id, ok, weight, label, fix, step) => checks.push({ id, ok, weight, label, fix, step });

  add('contact', Boolean(p.firstName && p.lastName && p.email && p.phone), 10,
    'Nom, e-mail et téléphone renseignés', 'Sans coordonnées, le recruteur ne peut pas vous appeler.', 1);
  add('email', !p.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email), 4,
    'Adresse e-mail valide', 'Vérifiez l’adresse e-mail : elle semble incomplète.', 1);
  add('city', Boolean(p.city), 4, 'Ville indiquée', 'Beaucoup d’ATS filtrent les candidats par localisation.', 1);
  add('title', Boolean(p.title), 10, 'Titre de poste en haut du CV',
    'L’ATS compare ce titre à l’intitulé de l’offre. Reprenez-le mot pour mot.', 1);

  const sl = (cv.summary || '').trim().length;
  add('summary', sl >= 150 && sl <= 650, 8, 'Profil de 2 à 4 phrases',
    sl < 150 ? 'Ajoutez un profil : c’est la première chose lue.' : 'Raccourcissez le profil à 4 phrases maximum.', 5);

  const isJunior = cv.level === 'junior';
  add('exp', cv.experiences.length > 0 || (isJunior && cv.education.length > 0), 10,
    isJunior ? 'Une expérience ou une formation au moins' : 'Au moins une expérience',
    'Ajoutez stages, missions, bénévolat ou projets : tout compte.', 2);

  const missingDates = cv.experiences.filter((e) => !e.start || (!e.end && !e.current)).length;
  add('dates', cv.experiences.length > 0 && missingDates === 0, 6, 'Dates de début et de fin partout',
    'Les ATS calculent vos années d’expérience à partir des dates.', 2);

  const lines = bulletLines(cv);
  const verbRatio = lines.length ? lines.filter(startsWithVerb).length / lines.length : 0;
  const numRatio = lines.length ? lines.filter(hasNumber).length / lines.length : 0;
  const placeholders = lines.filter((l) => /\[[^\]]*\]/.test(l)).length;
  add('bullets', lines.length >= Math.max(2, cv.experiences.length * 2), 6, '2 réalisations ou plus par poste',
    'Listez ce que vous avez accompli, pas seulement vos tâches.', 2);
  add('verbs', lines.length > 0 && verbRatio >= 0.6, 6, 'Réalisations qui commencent par un verbe d’action',
    'Commencez par : piloté, développé, réduit, augmenté…', 2);
  add('numbers', lines.length > 0 && numRatio >= 0.5, 10, 'Résultats chiffrés (%, montants, volumes)',
    'Un chiffre par ligne rend l’impact concret : +30 %, 50 clients, 2 M FCFA.', 2);
  add('placeholders', lines.length > 0 && placeholders === 0, 6, 'Aucun [X] laissé à compléter',
    `${placeholders} ligne(s) contiennent encore des [crochets] à remplacer.`, 2);

  add('edu', cv.education.length > 0, 6, 'Formation renseignée', 'Ajoutez votre diplôme le plus élevé.', 3);
  add('skills', cv.skills.length >= 6, 8, '6 compétences techniques ou plus',
    'Les ATS cherchent des mots-clés précis : outils, logiciels, méthodes.', 4);
  add('langs', cv.languages.length > 0, 2, 'Langues indiquées', 'Précisez vos langues et votre niveau.', 4);

  const words = cvText(cv).split(/\s+/).filter(Boolean).length;
  add('length', words >= 140 && words <= 900, 4, 'Longueur adaptée (1 à 2 pages)',
    words < 140 ? 'Le CV est trop court pour convaincre.' : 'Le CV est trop long : gardez l’essentiel.', 5);

  const km = keywordMatch(cv);
  let total = checks.reduce((s, c) => s + c.weight, 0);
  let got = checks.reduce((s, c) => s + (c.ok ? c.weight : 0), 0);
  if (km.ratio !== null) {
    total += 25;
    got += Math.round(25 * Math.min(1, km.ratio / 0.75));
  }
  const score = Math.round((got / total) * 100);
  return { score, checks, keywords: km, words, verbRatio, numRatio };
}

export function scoreLabel(score) {
  if (score >= 85) return { text: 'Excellent', tone: 'good' };
  if (score >= 70) return { text: 'Bon', tone: 'ok' };
  if (score >= 45) return { text: 'À renforcer', tone: 'mid' };
  return { text: 'Incomplet', tone: 'low' };
}
