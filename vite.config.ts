import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function localApiPlugin() {
  const dbFile = path.resolve(__dirname, './src/data/db.json')

  function readDb() {
    try {
      if (fs.existsSync(dbFile)) {
        return JSON.parse(fs.readFileSync(dbFile, 'utf-8'))
      }
    } catch (e) {
      console.error('Error reading db.json', e)
    }
    return { listings: [], orders: [], notifications: [] }
  }

  function writeDb(data: any) {
    try {
      const current = readDb()
      const merged = {
        listings: data.listings ?? current.listings ?? [],
        orders: data.orders ?? current.orders ?? [],
        notifications: data.notifications ?? current.notifications ?? [],
      }
      fs.writeFileSync(dbFile, JSON.stringify(merged, null, 2), 'utf-8')
    } catch (e) {
      console.error('Error writing to db.json', e)
    }
  }

  return {
    name: 'local-api-middleware',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url?.split('?')[0]

        if (url === '/api/db') {
          if (req.method === 'GET') {
            const db = readDb()
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(db))
            return
          }

          if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: any) => {
              body += chunk
            })
            req.on('end', () => {
              try {
                const payload = JSON.parse(body)
                writeDb(payload)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: true }))
              } catch (err) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
            return
          }
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
