# NexaCV

Créateur de CV compatibles ATS, en français, étape par étape.

**En ligne :** https://faalvisuel.github.io/nexacv/

## Ce que fait le site

- **Assistant en 7 étapes** : objectif, coordonnées, expériences, formation, compétences, profil, modèle et export.
- **22 métiers pré-configurés** : compétences suggérées, exemples de réalisations à chiffrer, profil généré automatiquement.
- **Score ATS en direct** : coordonnées, titre de poste, verbes d'action, résultats chiffrés, dates, longueur, mots-clés.
- **Analyse d'offre** : on colle l'annonce, le site surligne les mots-clés présents et propose ceux qui manquent.
- **2 268 modèles** : 18 mises en page (6 « Design » avec photo et 2 colonnes, 12 « Essentiel » ATS strict) × 14 couleurs × 9 polices, triés par métier. Toujours du vrai texte, jamais d'image de texte.
- **Export** PDF (texte natif), Word (.docx) et texte brut.
- **Aucune donnée envoyée** : tout est stocké dans le navigateur (localStorage).

## Développement

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # génère dist/
```

Le déploiement sur GitHub Pages est automatique à chaque push sur `main` (`.github/workflows/deploy.yml`).

## Structure

```
src/
  data/jobs.js        métiers, compétences, exemples de réalisations
  data/templates.js   mises en page, couleurs, polices, tri par métier
  lib/ats.js          analyse ATS et mots-clés
  lib/export.js       export PDF / Word / texte
  components/         rendu du CV, score, aperçu
  pages/              accueil, assistant, galerie
```
