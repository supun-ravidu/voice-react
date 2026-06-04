import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('framer-motion')) {
              return 'vendor-react'
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase'
            }
            return 'vendor'
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'firebase/app', 'firebase/auth', 'firebase/firestore']
  },
  server: {
    port: 5173,
    open: true
  }
})