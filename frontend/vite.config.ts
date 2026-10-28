import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isCopilotBuild =
  process.env.VITE_COPILOT_ONLY === 'true' ||
  process.env.VITE_APP_MODE === 'copilot' ||
  process.env.VERCEL_GIT_REPO_SLUG?.toLowerCase() === 'copilot' ||
  process.env.VERCEL_PROJECT_NAME?.toLowerCase().includes('copilot');

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    __COPILOT_BUILD__: JSON.stringify(Boolean(isCopilotBuild)),
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
