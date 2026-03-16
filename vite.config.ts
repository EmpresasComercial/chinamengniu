import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // NOTE: loadEnv kept for potential future safe env vars (VITE_ prefixed only).
  // NEVER expose secret keys (GEMINI_API_KEY, etc.) via define{} — they end up in
  // the client bundle and are visible in DevTools.
  loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Mengniu Company',
          short_name: 'Mengniu',
          description: 'Mengniu Company Premium Application',
          theme_color: '#000080',
          icons: [
            {
              src: 'https://s3-symbol-logo.tradingview.com/mengniu-dairy--600.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://s3-symbol-logo.tradingview.com/mengniu-dairy--600.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-icons': ['lucide-react'],
            'vendor-motion': ['motion'],
            'vendor-supabase': ['@supabase/supabase-js'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
