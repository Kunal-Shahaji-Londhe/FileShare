import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return defineConfig({
    plugins: [react()],
    css: {
      postcss: './postcss.config.js',
    },
    server: {
      port: env.VITE_SERVER_PORT || 5173,
      host: true,
      allowedHosts: [
        'localhost',
        env.VITE_SERVER_HOST
      ]
    },
  })
}