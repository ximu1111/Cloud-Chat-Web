import type { Plugin } from 'vite'
import { handleChat } from './handlers/chat'

export function apiPlugin(): Plugin {
  return {
    name: 'vite-plugin-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/chat' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString()
          })
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body)
              await handleChat(parsed, res)
            } catch (err) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Invalid request body' }))
            }
          })
          return
        }

        if (req.url === '/api/upload' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString()
          })
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body)
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({
                success: true,
                content: parsed.content || 'File content extracted successfully.',
                fileName: parsed.fileName || 'unknown'
              }))
            } catch {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Invalid request body' }))
            }
          })
          return
        }

        next()
      })
    }
  }
}
