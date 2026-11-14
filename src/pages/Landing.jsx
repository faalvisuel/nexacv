import { useMemo } from 'react';
import { JOBS } from '../data/jobs.js';
import { TEMPLATE_COUNT } from '../data/templates.js';
import { sampleCV, hasData } from '../lib/store.js';
import ScaledCV from '../components/ScaledCV.jsx';

const HIGHLIGHT = ['Chargée de marketing digital', 'SEO', 'Meta Ads', '85 000 abonnés', '35 %', 'Google Analytics 4'];

function HeroSheet() {
  // Feuille de démonstration : les mots-clés reçoivent un coup de surligneur, un par un.
  return (
    <div className="hero-sheet" aria-hidden="true">
      <div className="hs-paper">
        <p className="hs-name">Aïssatou Ndiaye</p>
        <p className="hs-title"><mark style={{ '--d': '0.3s' }}>Chargée de marketing digital</mark></p>
        <p className="hs-contact">aissatou.ndiaye@email.com | +221 77 000 00 00 | Dakar</p>
        <p className="hs-h">Profil</p>
        <p className="hs-p">5 ans d’expérience en <mark style={{ '--d': '0.7s' }}>SEO</mark>, <mark style={{ '--d': '0.95s' }}>Meta Ads</mark> et emailing, pour des marques de grande consommation.</p>
        <p className="hs-h">Expérience professionnelle</p>
        <p className="hs-role"><strong>Chargée de marketing digital</strong> — Teranga Télécom <span>03/2022 – Aujourd’hui</span></p>
        <ul>
          <li>Fait croître la communauté Instagram de 12 000 à <mark style={{ '--d': '1.3s' }}>85 000 abonnés</mark></li>
          <li>Réduit le coût par acquisition de <mark style={{ '--d': '1.6s' }}>35 %</mark> sur les campagnes payantes</li>
          <li>Piloté les tableaux de bord <mark style={{ '--d': '1.9s' }}>Google Analytics 4</mark> de 4 marques</li>
        </ul>
        <p className="hs-h">Compétences</p>
        <p className="hs-p">SEO, Meta Ads, Google Ads, Emailing, Canva, CRM, Content marketing</p>
      </div>
      <div className="hs-badge">
        <span className="hs-score">92</span>
        <span>Score ATS<br />6/6 mots-clés de l’offre</span>
      </div>
    </div>
  );
}

export default function Landing({ go, cv, startSample }) {
  const demo = useMemo(() => sampleCV(), []);
  const strip = ['moderne.ocean.lato', 'classique.encre.georgia', 'bandeau.baobab.opensans', 'timeline.bordeaux.sourcesans', 'elegant.prune.garamond', 'tech.cobalt.roboto'];
  const resume = hasData(cv);

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <h1 className="hero-h1">Un CV que les logiciels de tri savent lire. Et que les recruteurs retiennent.</h1>
          <p className="hero-lead">
            La plupart des grandes entreprises font passer les candidatures par un logiciel de tri (ATS) avant qu’un humain ne les lise.
            NexaCV vous guide question par question et vérifie, en direct, tout ce que ces logiciels regardent.
          </p>
          <div className="hero-cta">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => go('creer')}>{resume ? 'Reprendre mon CV' : 'Créer mon CV gratuitement'}</button>
            <button type="button" className="btn btn-ghost btn-lg" onClick={startSample}>Voir un exemple rempli</button>
          </div>
          <p className="hero-proof">Environ 10 minutes. Sans inscription. PDF et Word.</p>
        </div>
        <HeroSheet />
      </section>

      <section className="band">
        <div className="wrap">
          <h2 className="h2">Trois étapes, aucune page blanche</h2>
          <ol className="how">
            <li>
              <h3>Choisissez votre métier</h3>
              <p>{JOBS.length} métiers pré-configurés. On vous propose les compétences que les recruteurs du secteur recherchent.</p>
            </li>
            <li>
              <h3>Répondez aux questions</h3>
              <p>Une étape à la fois. Des exemples de phrases toutes prêtes : il suffit de mettre vos chiffres.</p>
            </li>
            <li>
              <h3>Téléchargez</h3>
              <p>Choisissez un modèle, collez l’offre visée pour vérifier les mots-clés, exportez en PDF ou Word.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="wrap checks-sec">
        <div>
          <h2 className="h2">Ce que nous vérifions pendant que vous écrivez</h2>
          <p className="muted">Le score ATS se met à jour à chaque frappe. Chaque point vous dit quoi corriger.</p>
        </div>
        <ul className="check-list">
          <li><strong>Lisibilité machine.</strong> Une colonne de lecture, du vrai texte, aucune image ni tableau piège.</li>
          <li><strong>Mots-clés de l’offre.</strong> Collez l’annonce : on surligne ce qui correspond et ce qui manque.</li>
          <li><strong>Titres standards.</strong> « Expérience professionnelle », « Formation », « Compétences » : les intitulés que les ATS reconnaissent.</li>
          <li><strong>Résultats chiffrés.</strong> Chaque réalisation est contrôlée : verbe d’action au début, chiffre dedans.</li>
          <li><strong>Dates complètes.</strong> Les ATS calculent vos années d’expérience à partir d’elles.</li>
          <li><strong>Longueur et profil.</strong> Ni trop court, ni trop long, avec un résumé qui accroche.</li>
        </ul>
      </section>

      <section className="band band-ink">
        <div className="wrap">
          <div className="tpl-head">
            <h2 className="h2">{TEMPLATE_COUNT.toLocaleString('fr-FR')} modèles, classés par métier</h2>
            <button type="button" className="btn btn-marker" onClick={() => go('modeles')}>Parcourir les modèles</button>
          </div>
          <p className="on-ink-muted">12 mises en page, 14 couleurs, 8 polices. Sobres là où il faut l’être, affirmés quand le métier le permet. Tous testés pour les ATS.</p>
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
            <button type="button" key={j.id} className="job-tag" onClick={() => go('creer', j.id)}>{j.label}</button>
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
          <p>Personne ne peut honnêtement le garantir : la décision dépend de votre parcours et du recruteur. Ce que nous garantissons, c’est que votre CV sera lu correctement par les logiciels et qu’il mettra en avant ce que les recruteurs cherchent. C’est ce qui multiplie vos chances d’être rappelé.</p>
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
        <h2 className="h2">Votre prochain CV commence par une question : quel poste visez-vous ?</h2>
        <button type="button" className="btn btn-marker btn-lg" onClick={() => go('creer')}>Commencer</button>
      </section>
    </div>
  );
}

