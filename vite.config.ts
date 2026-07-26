import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-github-pages-meta',
      closeBundle() {
        execFileSync(process.execPath, [resolve(__dirname, 'scripts/prerender-meta.mjs')], {
          stdio: 'inherit',
        })
      },
    },
  ],
  base: '/',
})
