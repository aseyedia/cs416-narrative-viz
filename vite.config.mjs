import { defineConfig } from 'vite';

export default defineConfig({
  base: '/cs416-narrative-viz/',
  build: {
    outDir: './dist',
    sourcemap: true,
  },
  publicDir: 'assets', 
  server: {
    port: 5173,
    open: true,
  }
});