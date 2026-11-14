import { useState } from 'react';
import { OFFERS, fcfa, startCheckout } from '../lib/account.js';
import { Arrow } from './Landing.jsx';

export function Plans({ user, premium, profile, go, compact = false }) {
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const buy = async (id) => {
    setErr('');
    if (!user) { go('compte', null, { next: `tarifs:${id}` }); return; }
    setBusy(id);
    try { await startCheckout(id); } catch (e) { setErr(e.message); setBusy(''); }
  };
  const until = premium && profile?.plan_expires_at ? new Date(profile.plan_expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : '';

  return (
    <>
      <div className={`plans${compact ? ' plans-compact' : ''}`}>
        {!compact && (
          <article className="plan">
            <h3>Gratuit</h3>
            <p className="plan-price">0 FCFA</p>
            <ul>
              <li>Assistant complet et score ATS</li>
              <li>12 modèles Essentiel « ATS strict »</li>
              <li>Analyse de l’offre d’emploi</li>
              <li>Export PDF, Word et texte</li>
            </ul>
            <button type="button" className="btn btn-ghost btn-pill" onClick={() => go('creer')}>Créer mon CV</button>
          </article>
        )}
        <article className="plan">
          <h3>{OFFERS.pass7.name}</h3>
          <p className="plan-price">{fcfa(OFFERS.pass7.price)}<span> une fois</span></p>
          <ul>
            <li>Tous les modèles Design avec photo</li>
            <li>Export PDF Design pendant 7 jours</li>
            <li>Idéal pour une candidature urgente</li>
          </ul>
          <button type="button" className="btn btn-ghost btn-pill" disabled={!!busy} onClick={() => buy('pass7')}>{busy === 'pass7' ? 'Redirection…' : 'Prendre le Pass'}</button>
        </article>
        <article className="plan plan-hot">
          <span className="plan-flag">Le plus choisi</span>
          <h3>{OFFERS.pro30.name}</h3>
          <p className="plan-price">{fcfa(OFFERS.pro30.price)}<span> / 30 jours</span></p>
          <ul>
            <li>Tous les modèles Design et Essentiel</li>
            <li>CV illimités, sauvegardés dans votre compte</li>
            <li>Un CV adapté à chaque offre</li>
            <li>Renouvelable, sans prélèvement automatique</li>
          </ul>
          <button type="button" className="btn btn-primary btn-pill" disabled={!!busy} onClick={() => buy('pro30')}>{busy === 'pro30' ? 'Redirection…' : 'Passer Pro'}<Arrow /></button>
        </article>
      </div>
      {premium && <p className="plan-note ok">Votre accès Premium est actif jusqu’au {until}. Un nouvel achat prolonge la durée.</p>}
      {err && <p className="plan-note err" role="alert">{err}</p>}
      <p className="plan-pay">Paiement sécurisé par PayTech : <strong>Wave</strong>, <strong>Orange Money</strong>, <strong>Free Money</strong> ou carte bancaire.</p>
    </>
  );
}

export default function Pricing(props) {
  const canceled = window.location.hash.includes('paiement=annule');
  return (
    <div className="wrap pricing">
      <header className="center-head">
        <h1 className="h1">Des prix pensés pour chercher un emploi</h1>
        <p className="muted">Le CV ATS reste gratuit, pour toujours. Payez seulement si vous voulez les modèles Design.</p>
        {canceled && <p className="plan-note err">Paiement annulé : aucun montant n’a été prélevé.</p>}
      </header>
      <Plans {...props} />
    </div>
  );
}
