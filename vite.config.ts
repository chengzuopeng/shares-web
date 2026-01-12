import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/shares-web/' : '/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
}))

