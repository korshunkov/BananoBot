import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Используем переменную окружения для base URL
// Для GitHub Pages используется /BananoBot/
// Для других платформ (Vercel, Netlify) используется /
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/BananoBot/' : '/',
})
