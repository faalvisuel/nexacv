# Backend NexaCV (Supabase, projet « flip-payments »)

Tables préfixées `nexacv_` : `nexacv_profiles`, `nexacv_resumes`, `nexacv_payments` (RLS activée).

Fonctions :
- `nexacv-checkout` : crée la demande de paiement PayTech (JWT requis).
- `nexacv-ipn` : reçoit la notification PayTech, vérifie la signature HMAC, active l'offre.

Secrets à définir dans Supabase > Edge Functions > Secrets :
- `PAYTECH_API_KEY`, `PAYTECH_API_SECRET` (PayTech > Paramètres > API)
- `PAYTECH_ENV` = `test` puis `prod` une fois le compte PayTech activé

Le code des fonctions déployées est la source de vérité dans Supabase ; ce dossier documente l'architecture.
