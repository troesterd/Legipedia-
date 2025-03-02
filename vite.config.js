import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Listen on all available network interfaces
    port: 5173,       // Default Vite port
    strictPort: true, // Fail if port is already in use
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    allowedHosts: ['server1.fritz.box'] // explicitly allow the host
  },
  // Ensure data directory is properly served
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
})
