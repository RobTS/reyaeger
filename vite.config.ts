import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { analyzer } from 'vite-bundle-analyzer';
import zipPack from 'vite-plugin-zip-pack';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    analyzer(),
    zipPack({
      outDir: 'release',
      outFileName: `reyaeger.zip`,
    }),
  ],
});
