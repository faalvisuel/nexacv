import { createClient } from '@supabase/supabase-js';
import { useEffect, useRef, useState, useCallback } from 'react';

// Clé publique (publishable) : faite pour être dans le navigateur. Les règles RLS protègent les données.
const SUPABASE_URL = 'https://mqgjwyqpibbthfgcthva.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NYmRN2VXpKkFQu-r967cig_dnDGWPC3';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, storageKey: 'nexacv-auth' },
});

export const OFFERS = {
  pass7: { id: 'pass7', name: 'Pass 7 jours', price: 2000, days: 7 },
  pro30: { id: 'pro30', name: 'Pro', price: 3500, days: 30 },
};

export const fcfa = (n) => `${n.toLocaleString('fr-FR')} FCFA`;

export const siteBase = () => `${window.location.origin}${window.location.pathname}`;

export function isPremium(profile) {
  return Boolean(profile && profile.plan !== 'free' && profile.plan_expires_at && new Date(profile.plan_expires_at) > new Date());
}

export function useAccount() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(false);

  const loadProfile = useCallback(async (user) => {
    if (!user) { setProfile(null); return; }
    let { data } = await supabase.from('nexacv_profiles').select('*').eq('id', user.id).maybeSingle();
    if (!data) {
      await supabase.from('nexacv_profiles').insert({ id: user.id, email: user.email });
      ({ data } = await supabase.from('nexacv_profiles').select('*').eq('id', user.id).maybeSingle());
    }
    setProfile(data || { id: user.id, plan: 'free' });
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      loadProfile(data.session?.user).finally(() => setReady(true));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') loadProfile(s?.user);
      // Après un lien e-mail (PKCE ?code=…), on nettoie l'adresse et on va au compte
      if (event === 'SIGNED_IN' && window.location.search.includes('code=')) {
        window.history.replaceState(null, '', `${siteBase()}#/compte`);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [loadProfile]);

  const refreshProfile = useCallback(() => loadProfile(session?.user), [loadProfile, session]);

  return { session, user: session?.user || null, profile, premium: isPremium(profile), ready, recovery, setRecovery, refreshProfile };
}

// Sauvegarde automatique du CV courant dans le cloud (si connecté)
export function useCloudSync(user, cv, setCv) {
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const timer = useRef(null);
  const last = useRef('');

  useEffect(() => {
    if (!user) return undefined;
    const { step, ...rest } = cv;
    const snapshot = JSON.stringify(rest);
    if (snapshot === last.current) return undefined;
    const meaningful = cv.personal.firstName || cv.experiences.length || cv.jobId;
    if (!meaningful) return undefined;
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setStatus('saving');
      const title = [cv.personal.firstName, cv.personal.lastName].filter(Boolean).join(' ') || 'Mon CV';
      const fullTitle = cv.personal.title ? `${title}, ${cv.personal.title}` : title;
      const data = { ...rest, cloudId: undefined };
      let error;
      if (cv.cloudId) {
        ({ error } = await supabase.from('nexacv_resumes').update({ title: fullTitle, data }).eq('id', cv.cloudId));
      } else {
        const res = await supabase.from('nexacv_resumes').insert({ title: fullTitle, data }).select('id').single();
        error = res.error;
        if (!error) setCv((c) => ({ ...c, cloudId: res.data.id }));
      }
      last.current = snapshot;
      setStatus(error ? 'error' : 'saved');
    }, 1500);
    return () => clearTimeout(timer.current);
  }, [user, cv, setCv]);

  return status;
}

export async function startCheckout(offerId) {
  const { data, error } = await supabase.functions.invoke('nexacv-checkout', {
    body: { offer: offerId, returnUrl: siteBase() },
  });
  if (error) {
    let msg = 'Le paiement n’a pas pu démarrer. Réessayez dans un instant.';
    try {
      const body = await error.context.json();
      if (body?.error === 'not_configured') msg = 'Le paiement en ligne n’est pas encore activé sur NexaCV. Revenez très bientôt.';
      else if (body?.message) msg = body.message;
    } catch (_) { /* réponse non JSON */ }
    throw new Error(msg);
  }
  window.location.href = data.url;
}
