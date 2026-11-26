import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const target = env.VITE_API_PROXY_TARGET || 'http://localhost:5106'
  const proxy = { target, changeOrigin: true }
  return {
    plugins: [react(), tailwindcss()],
    server: { proxy: {
      '/api': proxy,
      '/identity': proxy,
      '/health': proxy,
      '/openapi': proxy,
      '/swagger': proxy,
      '/scalar': proxy,
      '/hubs': { ...proxy, ws: true, target: target.replace(/^http/, 'ws') },
    } },
  }
})

