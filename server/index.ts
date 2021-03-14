import { server as WebSocketServer } from 'websocket'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { createServer } from 'http'
import controllers from './controllers'

const isLocalhost = (url: string) => new URL(url).hostname === 'localhost'

const server = createServer(async (req, res) => {
  if (!isLocalhost(`http://${req.headers.host}`)) {
    console.log(`[http] Request rejected (host: ${req.headers.host})`)
    res.end('403')
    return
  }

  const [style, script] = await Promise.all([
    readFile(resolve(__dirname, '../dist/main.css')),
    readFile(resolve(__dirname, '../dist/main.js')),
  ])

  res.setHeader('Content-Type', 'text/html')
  res.end(
    `<!DOCTYPE html><html><head><style>${style}</style></head><body><script>${script}</script></body></html>`
  )
})

server.listen(8080, () => console.log('[http] Running (:3000)'))

const ws = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
})

ws.on('request', (req) => {
  console.log('[ws] Connection from', req.origin)

  if (!isLocalhost(req.origin)) {
    req.reject()
    console.log('[ws] Connection rejected')
    return
  }

  const connection = req.accept('livingroom', req.origin)
  console.log('[ws] Connection accepted')
  controllers(connection)
})
