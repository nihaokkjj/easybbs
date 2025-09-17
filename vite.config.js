import { defineConfig } from 'vite'
import {fileURLToPath, URL} from 'node:url'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
 ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    hmr: true,
    port: 3004,
    proxy:{
      "/api": {
        target: 'http://localhost:7070',
        changeOrigin: true,
        pathRewrite: {
          '^api': '/api'
        }
      }
    }
  }
})
