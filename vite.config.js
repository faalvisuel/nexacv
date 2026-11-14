import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relative => fonctionne sur GitHub Pages (/nexacv/) comme sur un domaine perso
export default defineConfig({
  plugins: [react()],
  base: './',
});
