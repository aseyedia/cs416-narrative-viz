import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
    host: true, // Allows access from network
    proxy: {
      '/api': {
        target: 'http://172.31.227.86:5173', // Update this to your backend server URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
