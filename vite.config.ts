import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png', 'favicon-64.png'],
      manifest: {
        name: 'Ultrastar',
        short_name: 'Ultrastar',
        description: 'Busca canciones de UltraStar y apúntate a la cola de la noche de karaoke.',
        lang: 'es',
        start_url: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#6b2be8',
        background_color: '#000000',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/__/],
        runtimeCaching: [
          {
            // Album covers (Deezer CDN): cache-first so the catalog looks right offline.
            urlPattern: /^https:\/\/(e-)?cdns?-images\.dzcdn\.net\//,
            handler: 'CacheFirst',
            options: { cacheName: 'covers', expiration: { maxEntries: 1500, maxAgeSeconds: 60 * 60 * 24 * 90 } },
          },
        ],
      },
    }),
  ],
  build: {
    // The Firestore SDK alone is ~550 kB minified (~165 kB gzip) and can't be split further.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // Firebase is most of the bundle and changes rarely: give it its own long-cached chunks.
        advancedChunks: {
          groups: [
            { name: 'firebase-firestore', test: /node_modules[\\/]@firebase[\\/]firestore/ },
            { name: 'firebase', test: /node_modules[\\/](@firebase|firebase)[\\/]/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
})
