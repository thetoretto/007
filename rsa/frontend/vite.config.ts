import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath, URL } from 'url';

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [react()],
  css: {
    // PostCSS configuration will be automatically discovered from postcss.config.js
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/store', import.meta.url))
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
