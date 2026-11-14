import { useEffect, useState } from 'react';

const KEY = 'nexacv:v1';

export const uid = () => Math.random().toString(36).slice(2, 9);

export const emptyCV = () => ({
  jobId: '',
  level: 'mid',
  years: '',
  field: '',
  personal: { firstName: '', lastName: '', title: '', email: '', phone: '', city: '', linkedin: '', website: '' },
  summary: '',
  experiences: [],
  education: [],
  skills: [],
  soft: [],
  languages: [{ id: uid(), name: 'Français', level: 'Langue maternelle' }],
  certifications: [],
  interests: '',
  template: '',
  offer: '',
  step: 0,
});

export const sampleCV = () => ({
  ...emptyCV(),
  jobId: 'marketing',
  level: 'mid',
  years: '5',
  personal: {
    firstName: 'Aïssatou', lastName: 'Ndiaye', title: 'Chargée de marketing digital',
    email: 'aissatou.ndiaye@email.com', phone: '+221 77 000 00 00', city: 'Dakar, Sénégal',
    linkedin: 'linkedin.com/in/aissatou-ndiaye', website: '',
  },
  summary: 'Chargée de marketing digital avec 5 ans d’expérience en SEO, Meta Ads et emailing. Je pilote des campagnes rentables et mesurables, de la stratégie à l’exécution, pour des marques de grande consommation et de services.',
  experiences: [
    { id: uid(), role: 'Chargée de marketing digital', company: 'Teranga Télécom', city: 'Dakar', start: '03/2022', end: '', current: true,
      bullets: 'Fait croître la communauté Instagram de 12 000 à 85 000 abonnés en 18 mois\nGéré un budget publicitaire de 40 millions FCFA avec un retour sur investissement de 4,2\nRéduit le coût par acquisition de 35 % en optimisant les campagnes Meta Ads' },
    { id: uid(), role: 'Assistante marketing', company: 'Kër Commerce', city: 'Dakar', start: '09/2019', end: '02/2022', current: false,
      bullets: 'Lancé 60 campagnes emailing avec un taux d’ouverture moyen de 32 %\nAugmenté le trafic organique du site de 140 % grâce à une stratégie SEO' },
  ],
  education: [
    { id: uid(), degree: 'Master Marketing et Communication digitale', school: 'ISM Dakar', city: 'Dakar', start: '2017', end: '2019', details: 'Mention Bien' },
  ],
  skills: ['SEO', 'Meta Ads', 'Google Ads', 'Google Analytics 4', 'Emailing', 'Content marketing', 'Canva', 'Marketing automation'],
  soft: ['Créativité', 'Esprit analytique'],
  languages: [
    { id: uid(), name: 'Français', level: 'Courant C1-C2' },
    { id: uid(), name: 'Wolof', level: 'Langue maternelle' },
    { id: uid(), name: 'Anglais', level: 'Avancé B2' },
  ],
  certifications: [{ id: uid(), name: 'Google Ads Search', issuer: 'Google', year: '2023' }],
  interests: 'Photographie, bénévolat associatif',
  template: 'moderne.encre.carlito',
});

export function useCV() {
  const [cv, setCv] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...emptyCV(), ...JSON.parse(raw) };
    } catch (e) { /* stockage indisponible */ }
    return emptyCV();
  });
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(cv)); } catch (e) { /* ignore */ }
  }, [cv]);
  return [cv, setCv];
}

export function hasData(cv) {
  return Boolean(cv.jobId || cv.personal.firstName || cv.experiences.length);
}
