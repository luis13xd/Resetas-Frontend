import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Maneja rutas relativas para producción
  server: {
    proxy: {
      '/api': {
        target: 'https://resetas-backend-production.up.railway.app', // URL de tu backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
