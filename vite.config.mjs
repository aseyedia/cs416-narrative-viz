import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    sourcemap: true,
  },
  server: {
    port: 5173,
    open: true,
  }
});
