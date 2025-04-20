import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    origin: 'http://0.0.0.0:3000',
  }
})