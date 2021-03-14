import redis from 'redis'

const client = redis.createClient({
  host: 'localhost',
  port: 6379,
  retry_strategy: () => 5000,
})

client.on('error', (err) => {
  console.error('[redis]', err)
})

client.on('connect', () => {
  console.log('[redis] Connected')
})

client.on('ready', () => {
  console.log('[redis] Ready')
})

client.on('reconnecting', () => {
  console.log('[redis] Reconnecting')
})

client.on('end', () => {
  console.log('[redis] Connection closed')
})

export { client }
