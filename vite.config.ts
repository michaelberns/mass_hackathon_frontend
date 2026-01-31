import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Google Maps API key – set in .env as VITE_GOOGLE_MAPS_API_KEY or here
const VITE_GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY ?? 'AIzaSyD_LOx4-g-7a6VIVzVRs_eJ3f0zZmObB6M'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(VITE_GOOGLE_MAPS_API_KEY),
  },
})
