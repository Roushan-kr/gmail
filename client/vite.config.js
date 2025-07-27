import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true,
    https: false, // Set to true if you need HTTPS for production testing
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
    // Add environment variables for debugging
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['googleapis', 'google-auth-library'],
  },
});
