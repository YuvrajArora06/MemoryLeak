import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // When the FastAPI backend exists, proxy /api to it:
    // proxy: { '/api': 'http://localhost:8000' },
  },
});
