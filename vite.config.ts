import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  esbuild: {
    drop: ['debugger'],
    legalComments: 'none',
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    minify: 'esbuild',
    lib: {
      entry: path.resolve(__dirname, 'src/bookmarklet/mount.ts'),
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
