import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://10.3.1.122:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  // Para producción (Docker):
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://10.3.1.122:5000')
  }
});