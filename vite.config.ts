import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  publicDir: resolve(__dirname, 'public'),
})
