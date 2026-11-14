import { useEffect, useState } from 'react';
import { supabase, siteBase, fcfa } from '../lib/account.js';
import { emptyCV } from '../lib/store.js';
import { templateId } from '../data/templates.js';
import ScaledCV from '../components/ScaledCV.jsx';
import { Arrow } from './Landing.jsx';

function AuthForm({ recovery, setRecovery }) {
  const [mode, setMode] = useState('login'); // login | signup | forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      if (recovery) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setRecovery(false);
        setMsg({ ok: true, t: 'Mot de passe modifié. Vous êtes connecté.' });
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: siteBase() } });
        if (error) throw error;
        if (!data.session) setMsg({ ok: true, t: `Compte créé. Cliquez sur le lien envoyé à ${email} pour l’activer, puis revenez ici.` });
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: siteBase() });
        if (error) throw error;
        setMsg({ ok: true, t: `Un lien de réinitialisation a été envoyé à ${email}.` });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      const m = String(err.message || err);
      const t = /Invalid login/i.test(m) ? 'E-mail ou mot de passe incorrect.'
        : /Email not confirmed/i.test(m) ? 'Activez d’abord votre compte avec le lien reçu par e-mail.'
        : /already registered/i.test(m) ? 'Un compte existe déjà avec cet e-mail. Connectez-vous.'
        : /Password should be/i.test(m) ? 'Le mot de passe doit contenir au moins 6 caractères.'
        : /rate limit/i.test(m) ? 'Trop de tentatives. Réessayez dans quelques minutes.'
        : m;
      setMsg({ ok: false, t });
    } finally {
      setBusy(false);
    }
  };

  const title = recovery ? 'Choisissez un nouveau mot de passe' : mode === 'signup' ? 'Créer mon compte' : mode === 'forgot' ? 'Mot de passe oublié' : 'Se connecter';
  return (
    <form className="auth" onSubmit={submit}>
      <h1 className="h2">{title}</h1>
      <p className="muted">{recovery ? 'Au moins 6 caractères.' : 'Retrouvez vos CV sur tous vos appareils : téléphone, ordinateur, cybercafé.'}</p>
      {!recovery && (
        <label className="field"><span className="field-label">E-mail</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      )}
      {mode !== 'forgot' && (
        <label className="field"><span className="field-label">{recovery ? 'Nouveau mot de passe' : 'Mot de passe'}</span>
          <input type="password" required minLength={6} autoComplete={mode === 'signup' || recovery ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
      )}
      {msg && <p className={`plan-note ${msg.ok ? 'ok' : 'err'}`} role="status">{msg.t}</p>}
      <button type="submit" className="btn btn-primary btn-pill btn-lg" disabled={busy}>
        {busy ? 'Un instant…' : recovery ? 'Enregistrer le mot de passe' : mode === 'signup' ? 'Créer mon compte' : mode === 'forgot' ? 'Envoyer le lien' : 'Se connecter'}
      </button>
      {!recovery && (
        <p className="auth-switch">
          {mode === 'login' && <>Pas encore de compte ? <button type="button" className="link-btn" onClick={() => setMode('signup')}>Créer un compte gratuit</button><br /><button type="button" className="link-btn" onClick={() => setMode('forgot')}>Mot de passe oublié ?</button></>}
          {mode !== 'login' && <>Déjà inscrit ? <button type="button" className="link-btn" onClick={() => setMode('login')}>Se connecter</button></>}
        </p>
      )}
    </form>
  );
}

export default function Account({ account, cv, setCv, go }) {
  const { user, profile, premium, recovery, setRecovery, refreshProfile } = account;
  const [list, setList] = useState(null);
  const [payments, setPayments] = useState([]);
  const paid = window.location.hash.includes('paiement=ok');

  const load = async () => {
    const { data } = await supabase.from('nexacv_resumes').select('id,title,data,updated_at').order('updated_at', { ascending: false });
    setList(data || []);
    const { data: pays } = await supabase.from('nexacv_payments').select('offer,amount,status,payment_method,created_at').eq('status', 'paid').order('created_at', { ascending: false }).limit(10);
    setPayments(pays || []);
  };

  useEffect(() => { if (user) load(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Après paiement, l'IPN peut arriver avec quelques secondes de retard : on revérifie
  useEffect(() => {
    if (!user || !paid || premium) return undefined;
    let n = 0;
    const id = setInterval(() => { n += 1; refreshProfile(); if (n > 10) clearInterval(id); }, 3000);
    return () => clearInterval(id);
  }, [user, paid, premium, refreshProfile]);

  if (!user || recovery) return <div className="wrap account"><AuthForm recovery={recovery} setRecovery={setRecovery} /></div>;

  const open = (r) => { setCv({ ...emptyCV(), ...r.data, cloudId: r.id, step: 6 }); go('creer'); };
  const create = () => { setCv(emptyCV()); go('creer'); };
  const duplicate = async (r) => {
    await supabase.from('nexacv_resumes').insert({ title: `${r.title} (copie)`, data: r.data });
    load();
  };
  const remove = async (r) => {
    if (!window.confirm(`Supprimer « ${r.title} » ? Cette action est définitive.`)) return;
    await supabase.from('nexacv_resumes').delete().eq('id', r.id);
    if (cv.cloudId === r.id) setCv((c) => ({ ...c, cloudId: undefined }));
    load();
  };
  const until = profile?.plan_expires_at ? new Date(profile.plan_expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return (
    <div className="wrap account">
      <header className="acc-head">
        <div>
          <h1 className="h1">Mon compte</h1>
          <p className="muted">{user.email}</p>
        </div>
        <button type="button" className="btn btn-ghost btn-pill" onClick={() => supabase.auth.signOut()}>Se déconnecter</button>
      </header>

      {paid && !premium && <p className="plan-note ok">Paiement reçu. Activation de votre accès en cours…</p>}

      <section className={`plan-status${premium ? ' is-premium' : ''}`}>
        <div>
          <p className="plan-status-k">Votre offre</p>
          <p className="plan-status-v">{premium ? (profile.plan === 'pro' ? 'Pro' : 'Pass 7 jours') : 'Gratuit'}</p>
          <p className="muted small">{premium ? `Accès Premium jusqu’au ${until}.` : 'Modèles Essentiel inclus. Passez Premium pour les modèles Design.'}</p>
        </div>
        <button type="button" className={`btn btn-pill ${premium ? 'btn-ghost' : 'btn-accent'}`} onClick={() => go('tarifs')}>{premium ? 'Prolonger' : 'Voir les offres'}<Arrow /></button>
      </section>

      <div className="sec-head">
        <h2 className="h2">Mes CV</h2>
        <button type="button" className="btn btn-primary btn-pill" onClick={create}>Nouveau CV<Arrow /></button>
      </div>
      {list === null && <p className="muted">Chargement de vos CV…</p>}
      {list && list.length === 0 && <p className="note">Aucun CV enregistré pour l’instant. Créez-en un : il sera sauvegardé automatiquement ici.</p>}
      {list && list.length > 0 && (
        <div className="cv-list">
          {list.map((r) => (
            <article className="cv-card" key={r.id}>
              <button type="button" className="cv-card-thumb" onClick={() => open(r)} aria-label={`Ouvrir ${r.title}`}>
                <ScaledCV cv={{ ...emptyCV(), ...r.data }} templateId={r.data.template || templateId('grenat', 'bordeaux', 'poppins')} clip />
              </button>
              <div className="cv-card-body">
                <strong>{r.title}</strong>
                <span className="muted small">Modifié le {new Date(r.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                <div className="cv-card-actions">
                  <button type="button" className="link-btn" onClick={() => open(r)}>Ouvrir</button>
                  <button type="button" className="link-btn" onClick={() => duplicate(r)}>Dupliquer</button>
                  <button type="button" className="link-btn danger" onClick={() => remove(r)}>Supprimer</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {payments.length > 0 && (
        <section className="pay-hist">
          <h2 className="h2">Historique des paiements</h2>
          <ul>{payments.map((p, i) => (
            <li key={i}><span>{new Date(p.created_at).toLocaleDateString('fr-FR')}</span><span>{p.offer === 'pro30' ? 'Pro 30 jours' : 'Pass 7 jours'}</span><span>{p.payment_method || 'PayTech'}</span><strong>{fcfa(p.amount)}</strong></li>
          ))}</ul>
        </section>
      )}
    </div>
  );
}
