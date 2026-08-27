import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_TARGET = 'https://kalendart.ddns.net'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['kalendart.ddns.net'],
    proxy: {
      // Теперь ВСЁ (включая /purchases) под единым префиксом /api,
      // поэтому один проброс на всё. Через дев-сервер Vite -> на
      // бэкенд, браузер считает запросы «своими», CORS не мешает.
      '/api': { target: API_TARGET, changeOrigin: true, secure: false },
    },
  },
})
