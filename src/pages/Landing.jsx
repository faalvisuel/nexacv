import { useMemo, useState } from 'react';
import { JOBS } from '../data/jobs.js';
import { TEMPLATE_COUNT } from '../data/templates.js';
import { sampleCV, hasData } from '../lib/store.js';
import ScaledCV from '../components/ScaledCV.jsx';
import { ScoreRing } from '../components/AtsPanel.jsx';

export const Arrow = () => (
  <span className="arrow-dot" aria-hidden="true">
    <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 11L11 3M11 3H5M11 3V9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
);

const STEPS = [
  { t: 'Choisissez votre métier', tags: ['22 métiers', 'Compétences suggérées', 'Mise en page adaptée'], d: 'On part du poste que vous visez : les compétences, les exemples de phrases et le modèle recommandé s’adaptent tout de suite.' },
  { t: 'Vos coordonnées', tags: ['Sans photo', 'Titre du poste', 'Ville'], d: 'Juste l’essentiel. Le titre du poste visé est repris de l’offre : c’est le premier mot-clé que l’ATS compare.' },
  { t: 'Vos expériences', tags: ['Verbes d’action', 'Résultats chiffrés', 'Exemples par métier'], d: 'Chaque ligne est vérifiée pendant que vous tapez : commence-t-elle par un verbe ? Contient-elle un chiffre ?' },
  { t: 'Formation et certifications', tags: ['Diplôme le plus élevé', 'Mentions', 'Certifications'], d: 'Du plus récent au plus ancien, sans remonter avant le baccalauréat.' },
  { t: 'Compétences et langues', tags: ['Mots-clés ATS', 'Qualités', 'Niveaux CECRL'], d: 'Un clic sur les compétences que les recruteurs de votre secteur recherchent. Ajoutez les vôtres en une frappe.' },
  { t: 'Votre profil', tags: ['Texte proposé', '3 phrases', 'Personnalisable'], d: 'On rédige une proposition à partir de vos réponses. Vous l’ajustez avec une réussite concrète.' },
  { t: 'Modèle, offre et téléchargement', tags: [`${TEMPLATE_COUNT.toLocaleString('fr-FR')} modèles`, 'Analyse de l’offre', 'PDF, Word, texte'], d: 'Collez l’annonce : les mots-clés trouvés sont surlignés, ceux qui manquent s’ajoutent d’un clic. Puis téléchargez.' },
];

export default function Landing({ go, cv, startSample }) {
  const demo = useMemo(() => sampleCV(), []);
  const [open, setOpen] = useState(2);
  const resume = hasData(cv);
  const arc = [
    { id: 'ardoise.or.poppins', tag: 'Finance', photo: './photo-4.jpg' },
    { id: 'sable.or.opensans', tag: 'Comptable', gold: true, photo: './photo-2.jpg' },
    { id: 'orbite.teranga.poppins', tag: 'Logistique', photo: './photo-3.jpg' },
    { id: 'grenat.bordeaux.poppins', tag: 'Score ATS 96', photo: './photo-1.jpg' },
    { id: 'bonjour.cobalt.poppins', tag: 'Designer', gold: true, photo: './photo-2.jpg' },
    { id: 'pop.prune.poppins', tag: 'Créatif', photo: './photo-3.jpg' },
    { id: 'executif.bordeaux.georgia', tag: 'ATS strict', gold: true },
  ];
  const strip = ['grenat.bordeaux.poppins', 'sable.or.opensans', 'orbite.teranga.poppins', 'bonjour.cobalt.poppins', 'ardoise.emeraude.poppins', 'pop.prune.poppins'];
  const marquee = [...JOBS, ...JOBS].map((j) => j.label);

  return (
    <div className="landing">
      <section className="hero2">
        <p className="tag-pill"><span className="tag-dot" aria-hidden="true" />Lisible par Workday, Taleo, Greenhouse et les autres ATS</p>
        <h1 className="hero2-h1">
          <span className="h1-serif">Passez les filtres des recruteurs,</span>
          <span className="h1-sans">décrochez plus d’<em>entretiens</em>.</span>
        </h1>
        <p className="hero2-lead">Répondez à quelques questions simples. NexaCV construit un CV clair, chiffré et adapté à votre métier, et vérifie en direct ce que les logiciels de tri regardent.</p>
        <div className="hero-cta">
          <button type="button" className="btn btn-primary btn-lg btn-pill" onClick={() => go('creer')}>{resume ? 'Reprendre mon CV' : 'Créer mon CV gratuitement'}<Arrow /></button>
          <button type="button" className="btn btn-ghost btn-lg btn-pill" onClick={startSample}>Voir un exemple rempli</button>
        </div>

        <div className="arc" aria-hidden="true">
          <svg className="arc-ring" viewBox="0 0 1200 600" fill="none">
            <path d="M40 600 A560 560 0 0 1 1160 600" stroke="currentColor" strokeWidth="18" strokeDasharray="1.5 9" />
            <path d="M120 600 A480 480 0 0 1 1080 600" stroke="currentColor" strokeWidth="1" opacity=".6" />
          </svg>
          {arc.map((c, i) => (
            <div className="arc-card" key={c.id} style={{ '--i': i - 3, '--a': Math.abs(i - 3) }}>
              {c.tag && <span className={`arc-tag${c.gold ? ' gold' : ''}`}>{c.tag}</span>}
              <ScaledCV cv={c.photo ? { ...demo, photo: c.photo } : demo} templateId={c.id} clip />
            </div>
          ))}
          <div className="float float-score"><ScoreRing score={96} size={46} /><span><strong>Score ATS</strong><br />Excellent</span></div>
          <div className="float float-kw">
            <span className="float-title">Mots-clés de l’offre</span>
            <span className="float-chips"><mark>SEO</mark><mark>Meta Ads</mark><mark>Google Analytics</mark><span className="miss">+ CRM</span></span>
          </div>
        </div>

        <div className="hero-feats">
          <div><strong>Gratuit</strong><span>Sans inscription, sans filigrane.</span></div>
          <div><strong>Privé</strong><span>Vos données restent sur votre appareil.</span></div>
          <div><strong>Rapide</strong><span>Environ 10 minutes, étape par étape.</span></div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {marquee.map((m, i) => <span key={i}>{m}<i>✦</i></span>)}
        </div>
      </div>

      <section className="wrap stats">
        <div><strong>{TEMPLATE_COUNT.toLocaleString('fr-FR')}</strong><span>modèles compatibles ATS</span></div>
        <div><strong>{JOBS.length}</strong><span>métiers pré-configurés</span></div>
        <div><strong>16</strong><span>points vérifiés en direct</span></div>
        <div><strong>3</strong><span>formats : PDF, Word, texte</span></div>
      </section>

      <section className="wrap interview">
        <div className="iv-photo">
          <img src="./photo-4.jpg" alt="Un candidat souriant tend la main au début d’un entretien" loading="lazy" />
          <div className="iv-chip"><span className="iv-dot" aria-hidden="true" />Prochaine étape : l’entretien</div>
        </div>
        <div className="iv-text">
          <p className="tag-pill small-pill"><span className="tag-dot" aria-hidden="true" />Pourquoi c’est important</p>
          <h2 className="h2">Un bon parcours mal présenté finit souvent à la corbeille</h2>
          <p className="muted">Avant d’arriver chez un recruteur, votre CV est lu par un logiciel. S’il ne trouve pas vos dates, votre titre de poste ou les bons mots-clés, il vous classe loin derrière, même si vous êtes la bonne personne.</p>
          <ul className="iv-list">
            <li>Votre titre de poste reprend celui de l’offre</li>
            <li>Vos réalisations montrent des résultats chiffrés</li>
            <li>Les compétences demandées apparaissent en toutes lettres</li>
          </ul>
        </div>
      </section>

      <section className="wrap steps-sec">
        <div className="sec-head">
          <div>
            <p className="tag-pill small-pill"><span className="tag-dot" aria-hidden="true" />Comment ça marche</p>
            <h2 className="h2">Sept étapes courtes, aucune page blanche</h2>
          </div>
          <button type="button" className="btn btn-accent btn-pill" onClick={() => go('creer')}>Commencer<Arrow /></button>
        </div>
        <div className="steps-grid">
        <ol className="acc">
          {STEPS.map((s, i) => (
            <li key={s.t} className={`acc-item${open === i ? ' is-open' : ''}`}>
              <button type="button" className="acc-btn" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span className="acc-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="acc-t">{s.t}</span>
                <Arrow />
              </button>
              {open === i && (
                <div className="acc-body">
                  <p className="acc-tags">{s.tags.map((t) => <span key={t}>{t}</span>)}</p>
                  <p>{s.d}</p>
                </div>
              )}
            </li>
          ))}
        </ol>
        <figure className="steps-photo">
          <img src="./photo-5.jpg" alt="Un entretien en visioconférence avec un candidat souriant" loading="lazy" />
          <figcaption>De la première question au téléchargement : environ 10 minutes.</figcaption>
        </figure>
        </div>
      </section>

      <section className="wrap bento-sec">
        <div className="center-head">
          <h2 className="h2">Tout ce qu’un recruteur veut voir, rien de ce qu’un ATS ne sait pas lire</h2>
          <p className="muted">Une colonne de lecture, du vrai texte, des titres standards. Et des conseils précis à chaque étape.</p>
        </div>
        <div className="bento">
          <article className="b-card b-dark">
            <div className="b-sheet"><ScaledCV cv={demo} templateId="sable.or.opensans" clip /></div>
            <div className="b-text">
              <h3>Un aperçu qui se remplit pendant que vous écrivez</h3>
              <p>Chaque réponse apparaît aussitôt sur la feuille A4, dans le modèle choisi.</p>
            </div>
          </article>
          <article className="b-card b-sand">
            <ScoreRing score={88} size={84} />
            <h3>Score ATS en direct</h3>
            <p>16 critères : coordonnées, dates, verbes d’action, chiffres, longueur, mots-clés. Chaque point indique quoi corriger.</p>
          </article>
          <article className="b-card b-cream">
            <h3>Des phrases prêtes pour votre métier</h3>
            <ul className="b-lines">
              <li>Réduit le délai de clôture mensuelle de <mark>8</mark> à <mark>4</mark> jours</li>
              <li>Signé <mark>14</mark> nouveaux clients grands comptes en <mark>9</mark> mois</li>
              <li>Assuré le support de <mark>250</mark> utilisateurs</li>
            </ul>
            <p>Remplacez les chiffres par les vôtres, c’est tout.</p>
          </article>
          <article className="b-card b-olive">
            <img className="b-photo" src="./photo-3.jpg" alt="Une candidate souriante au bureau" loading="lazy" />
            <div className="b-text">
              <h3>L’offre d’emploi, décodée</h3>
              <p>Collez l’annonce. Les mots-clés présents sont surlignés, les manquants s’ajoutent d’un clic.</p>
            </div>
            <p className="b-kw"><mark>Comptabilité générale</mark><mark>SYSCOHADA</mark><mark>Sage</mark><span>+ Trésorerie</span><span>+ Audit</span></p>
          </article>
        </div>
      </section>

      <section className="tpl-band">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <p className="tag-pill small-pill on-dark"><span className="tag-dot" aria-hidden="true" />Modèles</p>
              <h2 className="h2">{TEMPLATE_COUNT.toLocaleString('fr-FR')} modèles, classés par métier</h2>
              <p className="on-ink-muted">6 modèles Design avec photo et 12 modèles Essentiel « ATS strict », en 14 couleurs et 9 polices. Affirmés pour la création et le commerce, sobres pour la finance et les grands groupes.</p>
            </div>
            <button type="button" className="btn btn-accent btn-pill" onClick={() => go('modeles')}>Parcourir les modèles<Arrow /></button>
          </div>
          <div className="tpl-strip">
            {strip.map((id) => (
              <button type="button" className="tpl-strip-item" key={id} onClick={() => go('modeles')} aria-label="Voir les modèles">
                <ScaledCV cv={demo} templateId={id} clip />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap jobs-sec">
        <h2 className="h2">Préparé pour votre métier</h2>
        <div className="job-tags">
          {JOBS.map((j) => (
            <button type="button" key={j.id} className="job-tag" onClick={() => go('creer', j.id)}><span aria-hidden="true">{j.icon}</span>{j.label}</button>
          ))}
        </div>
      </section>

      <section className="wrap faq">
        <h2 className="h2">Questions fréquentes</h2>
        <details>
          <summary>Qu’est-ce qu’un ATS ?</summary>
          <p>Un Applicant Tracking System est le logiciel qui reçoit les candidatures : Workday, Taleo, Greenhouse, SmartRecruiters… Il extrait le texte du CV, le range dans des cases et le compare à l’offre. Un CV mal structuré peut ressortir vide ou mal classé, même avec un excellent parcours.</p>
        </details>
        <details>
          <summary>Est-ce que NexaCV garantit un entretien ?</summary>
          <p>Personne ne peut honnêtement le garantir : la décision dépend de votre parcours et du recruteur. Ce que nous faisons, c’est rendre votre CV lisible par les logiciels et mettre en avant ce que les recruteurs cherchent. C’est ce qui augmente vos chances d’être rappelé.</p>
        </details>
        <details>
          <summary>Faut-il mettre une photo ?</summary>
          <p>Non. Les ATS ne lisent pas les photos, et beaucoup d’entreprises internationales les écartent pour limiter la discrimination. Nos modèles n’en ont pas, volontairement.</p>
        </details>
        <details>
          <summary>Où sont stockées mes données ?</summary>
          <p>Uniquement dans votre navigateur, sur votre appareil. Rien n’est envoyé sur un serveur. Si vous changez d’appareil, téléchargez votre CV avant.</p>
        </details>
        <details>
          <summary>PDF ou Word ?</summary>
          <p>Le PDF généré contient du vrai texte et convient à la plupart des ATS. Si l’offre demande un fichier .docx, utilisez l’export Word. Pour les formulaires qui demandent de coller le CV, utilisez le texte brut.</p>
        </details>
      </section>

      <section className="final-cta">
        <div className="final-inner">
          <div className="final-text">
            <h2 className="h2">Votre prochain CV commence par une question : quel poste visez-vous ?</h2>
            <button type="button" className="btn btn-primary btn-lg btn-pill" onClick={() => go('creer')}>Commencer maintenant<Arrow /></button>
          </div>
          <img className="final-photo" src="./photo-6.jpg" alt="Une jeune professionnelle présente un dossier à un collègue" loading="lazy" />
        </div>
      </section>
    </div>
  );
}
