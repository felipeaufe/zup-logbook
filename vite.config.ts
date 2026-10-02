import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    minify: 'esbuild',
    lib: {
      entry: path.resolve(__dirname, 'src/bookmarklet/mount.tsx'),
      name: 'ZupLogbook',
      formats: ['iife'],
      fileName: () => 'zup-logbook.bookmarklet.js',
    },
    rollupOptions: {
      output: {
        extend: true,
        inlineDynamicImports: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
