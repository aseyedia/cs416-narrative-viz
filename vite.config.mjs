import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
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