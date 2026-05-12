import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Body Tracker',
        short_name: 'BodyTracker',
        description: 'Acompanhamento científico de composição corporal',
        theme_color: '#4f46e5',
        background_color: '#111827',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: 'favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'favicon.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts')) return 'vendor-charts';
          if (id.includes('framer-motion') || id.includes('lucide-react')) return 'vendor-ui';
          if (id.includes('dexie') || id.includes('jspdf') || id.includes('html2canvas') || id.includes('papaparse')) return 'vendor-utils';
        },
      },
    },
  },
});
