import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Landing from './pages/Landing.jsx';
import Builder from './pages/Builder.jsx';
import Gallery from './pages/Gallery.jsx';
import Account from './pages/Account.jsx';
import Pricing from './pages/Pricing.jsx';
import { useAccount, useCloudSync } from './lib/account.js';
import { useCV, sampleCV } from './lib/store.js';
import { getJob } from './data/jobs.js';
import { templateId } from './data/templates.js';
import './styles.css';
import './cv.css';
import './cv-design.css';

const route = () => (window.location.hash.replace(/^#\/?/, '') || 'accueil').split('?')[0];

function App() {
  const [page, setPage] = useState(route());
  const [cv, setCv] = useCV();
  const account = useAccount();
  const syncStatus = useCloudSync(account.user, cv, setCv);

  // Retour vers la page demandée après connexion (ex. achat depuis Tarifs)
  useEffect(() => {
    if (!account.user) return;
    const next = sessionStorage.getItem('nexacv-next');
    if (next) { sessionStorage.removeItem('nexacv-next'); window.location.hash = `/${next}`; }
  }, [account.user]);

  useEffect(() => {
    const on = () => setPage(route());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const go = (p, jobId, opts) => {
    if (opts && opts.next) sessionStorage.setItem('nexacv-next', opts.next.split(':')[0]);
    if (jobId) {
      const j = getJob(jobId);
      setCv((c) => ({ ...c, jobId, step: 0, template: c.template || templateId(j.layout, 'bordeaux', 'poppins'), personal: { ...c.personal, title: c.personal.title || j.titles[0] } }));
    }
    window.location.hash = `/${p}`;
    window.scrollTo(0, 0);
  };

  const startSample = () => {
    if (cv.personal.firstName && !window.confirm('Remplacer vos informations actuelles par l’exemple ?')) return;
    setCv({ ...sampleCV(), step: 6 });
    go('creer');
  };

  return (
    <>
      <a className="skip" href="#main">Aller au contenu</a>
      <header className="topbar">
        <div className="topbar-inner">
          <a href="#/" className="brand" aria-label="NexaCV, accueil"><span className="brand-mark" aria-hidden="true">N</span><span>NexaCV<span className="brand-dot">.</span></span></a>
          <nav className="topnav">
            <a href="#/" className="nav-home" aria-current={!['creer', 'modeles', 'tarifs', 'compte'].includes(page) ? 'page' : undefined}>Accueil</a>
            <a href="#/modeles" aria-current={page === 'modeles' ? 'page' : undefined}>Modèles</a>
            <a href="#/tarifs" className="nav-hide-m" aria-current={page === 'tarifs' ? 'page' : undefined}>Tarifs</a>
            <a href="#/compte" className="nav-account" aria-current={page === 'compte' ? 'page' : undefined} aria-label={account.user ? 'Mon compte' : 'Se connecter'}>
              {account.user ? <span className={`avatar${account.premium ? ' is-premium' : ''}`}>{(account.user.email || '?')[0].toUpperCase()}</span> : 'Connexion'}
            </a>
            <a href="#/creer" className="btn btn-light btn-sm" aria-current={page === 'creer' ? 'page' : undefined}>Créer mon CV</a>
          </nav>
        </div>
      </header>
      <main id="main">
        {page === 'creer' && <Builder key="b" cv={cv} setCv={setCv} go={go} account={account} syncStatus={syncStatus} />}
        {page === 'modeles' && <Gallery cv={cv} setCv={setCv} go={go} premium={account.premium} />}
        {page === 'compte' && <Account account={account} cv={cv} setCv={setCv} go={go} />}
        {page === 'tarifs' && <Pricing user={account.user} premium={account.premium} profile={account.profile} go={go} />}
        {!['creer', 'modeles', 'compte', 'tarifs'].includes(page) && <Landing go={go} cv={cv} startSample={startSample} />}
      </main>
      {page !== 'creer' && (
        <footer className="footer">
          <p>NexaCV. Sans compte, vos données restent sur votre appareil. Avec un compte, vos CV sont sauvegardés et protégés.</p>
        </footer>
      )}
    </>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
