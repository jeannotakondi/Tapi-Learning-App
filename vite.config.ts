/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg', 'audio/manifest.json'],
      manifest: {
        name: 'Tapi: learn to read',
        short_name: 'Tapi',
        description: 'Phonics and spelling games for children aged 4 to 7, in English and French.',
        theme_color: '#38a169',
        background_color: '#faf7f2',
        display: 'standalone',
        orientation: 'any',
        icons: [
          { src: 'icons/tapi.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/tapi-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Everything the child needs, including recorded audio, is cached so the app works offline.
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff,woff2,json,mp3,m4a,ogg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
