import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'https://gooozeee-personal-backend.azurewebsites.net'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  publicDir: resolve(__dirname, 'public'),
  server: {
    proxy: {
      // The deployed API does not allow localhost CORS. The dev server proxies
      // same-origin /api requests so the full site reads real data locally.
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
