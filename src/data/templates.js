// Système de modèles : 18 mises en page (6 Design + 12 Essentiel) × 14 couleurs × 9 polices.
// Toutes les mises en page respectent les règles ATS : une seule colonne de lecture,
// texte réel (pas d'image), titres de sections standards, pas de tableau de structure,
// pas de photo, polices système ou très répandues.
import { JOBS } from './jobs.js';

export const DESIGN_LAYOUTS = [
  { id: 'grenat', name: 'Grenat', family: 'design', desc: 'Nom massif, colonne pleine couleur, bannière profil et anneaux de langues.' },
  { id: 'sable', name: 'Sable', family: 'design', desc: 'Bandeau supérieur, plaque nom sous la photo, colonne latérale teintée.' },
  { id: 'orbite', name: 'Orbite', family: 'design', desc: 'Barre latérale sombre, photo ronde, titres en pilule et frise chronologique.' },
  { id: 'bonjour', name: 'Bonjour', family: 'design', desc: 'Fond crème, accroche manuscrite, dates en marge, coins décoratifs.' },
  { id: 'ardoise', name: 'Ardoise', family: 'design', desc: 'Barre latérale ardoise avec grande photo, mise en page éditoriale.' },
  { id: 'pop', name: 'Pop', family: 'design', desc: 'Arche photo, étincelles, titres pilules pastel. Pour les métiers créatifs.' },
];

const ESSENTIAL_LAYOUTS = [
  { id: 'classique', name: 'Classique', desc: 'Nom centré, filets fins. Le choix sûr pour tous les secteurs.' },
  { id: 'moderne', name: 'Moderne', desc: 'Nom en couleur, titres de section soulignés d’un trait.' },
  { id: 'executif', name: 'Exécutif', desc: 'Sobre et dense, pour la finance, le droit et la direction.' },
  { id: 'minimal', name: 'Minimal', desc: 'Beaucoup d’air, aucune fioriture. Se lit en 6 secondes.' },
  { id: 'tech', name: 'Tech', desc: 'Compétences en premier, dates alignées à droite.' },
  { id: 'bandeau', name: 'Bandeau', desc: 'En-tête coloré pleine largeur, corps 100 % texte.' },
  { id: 'academique', name: 'Académique', desc: 'Formation mise en avant, idéal pour débuter ou enseigner.' },
  { id: 'compact', name: 'Compact', desc: 'Tout tient sur une page, même avec beaucoup d’expérience.' },
  { id: 'elegant', name: 'Élégant', desc: 'Grand nom, petites capitales, élégance discrète.' },
  { id: 'timeline', name: 'Chronologie', desc: 'Dates en marge gauche, parcours lisible d’un coup d’œil.' },
  { id: 'sante', name: 'Clair', desc: 'Titres sur fond teinté léger, très aéré.' },
  { id: 'impact', name: 'Impact', desc: 'Titre de poste en grand, pour se positionner tout de suite.' },
].map((l) => ({ ...l, family: 'essentiel' }));

export const LAYOUTS = [...DESIGN_LAYOUTS, ...ESSENTIAL_LAYOUTS];
export const isDesign = (layoutId) => DESIGN_LAYOUTS.some((l) => l.id === layoutId);

export const PALETTES = [
  { id: 'encre', name: 'Encre', color: '#1B2A4A' },
  { id: 'noir', name: 'Graphite', color: '#222222' },
  { id: 'ocean', name: 'Océan', color: '#0B5D8C' },
  { id: 'baobab', name: 'Baobab', color: '#2F5D3A' },
  { id: 'emeraude', name: 'Émeraude', color: '#0F7B6C' },
  { id: 'bordeaux', name: 'Bordeaux', color: '#8B1E3F' },
  { id: 'prune', name: 'Prune', color: '#5B2A6E' },
  { id: 'indigo', name: 'Indigo', color: '#3730A3' },
  { id: 'ardoise', name: 'Ardoise', color: '#475569' },
  { id: 'sienne', name: 'Sienne', color: '#9A3412' },
  { id: 'teranga', name: 'Teranga', color: '#B45309' },
  { id: 'sarcelle', name: 'Sarcelle', color: '#0E7490' },
  { id: 'cobalt', name: 'Cobalt', color: '#1D4ED8' },
  { id: 'or', name: 'Or', color: '#8C6A1C' },
];

export const FONTS = [
  { id: 'poppins', name: 'Poppins', css: "'Poppins', Arial, sans-serif", docx: 'Poppins' },
  { id: 'carlito', name: 'Calibri', css: "'Carlito', Calibri, Arial, sans-serif", docx: 'Calibri' },
  { id: 'arial', name: 'Arial', css: 'Arial, Helvetica, sans-serif', docx: 'Arial' },
  { id: 'lato', name: 'Lato', css: "'Lato', Arial, sans-serif", docx: 'Lato' },
  { id: 'roboto', name: 'Roboto', css: "'Roboto', Arial, sans-serif", docx: 'Roboto' },
  { id: 'opensans', name: 'Open Sans', css: "'Open Sans', Arial, sans-serif", docx: 'Open Sans' },
  { id: 'sourcesans', name: 'Source Sans', css: "'Source Sans 3', Arial, sans-serif", docx: 'Source Sans Pro' },
  { id: 'georgia', name: 'Georgia', css: "Georgia, 'Merriweather', serif", docx: 'Georgia' },
  { id: 'garamond', name: 'Garamond', css: "'EB Garamond', Garamond, Georgia, serif", docx: 'Garamond' },
];

export const TEMPLATE_COUNT = LAYOUTS.length * PALETTES.length * FONTS.length;

export function templateId(layout, palette, font) {
  return `${layout}.${palette}.${font}`;
}

export function parseTemplate(id) {
  const [l, p, f] = String(id || '').split('.');
  return {
    layout: LAYOUTS.find((x) => x.id === l) || LAYOUTS[0],
    palette: PALETTES.find((x) => x.id === p) || PALETTES[0],
    font: FONTS.find((x) => x.id === f) || FONTS[0],
  };
}

// Pseudo-aléatoire déterministe pour mélanger la galerie de façon stable
function seeded(n) {
  let x = n;
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
}

// Recommandations par métier : chaque métier a ses mises en page préférées.
const AFFINITY = {
  'Tech & Data': ['orbite', 'ardoise', 'grenat', 'tech', 'moderne', 'compact'],
  'Commerce & Marketing': ['grenat', 'orbite', 'bonjour', 'moderne', 'impact', 'bandeau'],
  'Finance & Gestion': ['ardoise', 'sable', 'grenat', 'executif', 'classique', 'elegant'],
  'Santé & Social': ['sable', 'bonjour', 'orbite', 'sante', 'classique', 'timeline'],
  'Industrie & Terrain': ['orbite', 'ardoise', 'sable', 'compact', 'classique', 'executif'],
  'Services & Support': ['sable', 'orbite', 'bonjour', 'minimal', 'classique', 'bandeau'],
  Création: ['pop', 'bonjour', 'grenat', 'bandeau', 'impact', 'elegant'],
  Débuter: ['sable', 'pop', 'bonjour', 'academique', 'minimal', 'moderne'],
};

export function allTemplates() {
  const list = [];
  LAYOUTS.forEach((l) =>
    PALETTES.forEach((p) =>
      FONTS.forEach((f) => list.push({ id: templateId(l.id, p.id, f.id), layout: l, palette: p, font: f })),
    ),
  );
  return list;
}

export function templatesFor(categoryOrJobId) {
  const job = JOBS.find((j) => j.id === categoryOrJobId);
  const cat = job ? job.category : categoryOrJobId;
  const pref = (cat && AFFINITY[cat]) ? [...AFFINITY[cat]] : DESIGN_LAYOUTS.map((l) => l.id);
  if (job && !pref.includes(job.layout)) pref.push(job.layout);
  const order = [...pref, ...LAYOUTS.map((l) => l.id).filter((id) => !pref.includes(id))];
  const r = seeded((cat ? cat.length * 31 : 7) + (job ? job.id.length : 0));
  // chaque mise en page : ses variantes couleur × police, mélangées de façon stable
  const groups = order.map((lid) => {
    const l = LAYOUTS.find((x) => x.id === lid);
    const g = [];
    PALETTES.forEach((p) => FONTS.forEach((f) => g.push({ id: templateId(l.id, p.id, f.id), layout: l, palette: p, font: f })));
    return g.map((t) => [r(), t]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  });
  // tour de rôle : les mises en page recommandées reviennent plus souvent
  const out = [];
  const ptr = groups.map(() => 0);
  while (out.length < TEMPLATE_COUNT) {
    groups.forEach((g, gi) => {
      const reps = gi < pref.length ? 2 : 1;
      for (let k = 0; k < reps && ptr[gi] < g.length; k++) out.push(g[ptr[gi]++]);
    });
  }
  const seen = new Set();
  return out.filter((t) => (seen.has(t.id) ? false : seen.add(t.id)));
}

export function categoryTag(t) {
  return Object.entries(AFFINITY)
    .filter(([, ls]) => ls.slice(0, 3).includes(t.layout.id))
    .map(([c]) => c);
}
