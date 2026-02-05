/// <reference types="vitest" />
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

// Middleware to serve app.html for /g/* paths (mimics GCS not_found_page behavior)
function gistFallbackPlugin(): Plugin {
  return {
    name: 'gist-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/g/')) {
          req.url = '/app.html'
        }
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/g/')) {
          const appHtmlPath = resolve(__dirname, 'dist/app.html')
          if (fs.existsSync(appHtmlPath)) {
            res.setHeader('Content-Type', 'text/html')
            fs.createReadStream(appHtmlPath).pipe(res)
            return
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), gistFallbackPlugin()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app.html'),
      },
    },
  },
  test: {
    include: ['test/**/*.test.ts'],
  },
})
