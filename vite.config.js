import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  define: {
    'process.env': {},
    // Ensure environment variables are properly replaced
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY),
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN),
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID),
    'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET),
    'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.VITE_FIREBASE_APP_ID)
  },
  server: {
    port: 5173,
    host: true
  }
})