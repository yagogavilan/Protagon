import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath, URL } from 'node:url';

// base relativa: o dist/ pode ser publicado em qualquer caminho como página estática.
// `--mode single` (npm run build:single) gera um único index.html com JS e CSS embutidos em dist-single/.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'single' ? [react(), viteSingleFile()] : [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: mode === 'single' ? { outDir: 'dist-single' } : undefined,
}));
