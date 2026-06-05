import os from 'node:os'

function getLocalIp() {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return '127.0.0.1'
}

const ip = getLocalIp()
const url = `http://${ip}:3000`

console.log('')
console.log('Android dev server URL:')
console.log(`  ${url}`)
console.log('')
console.log('Run these commands in separate terminals:')
console.log(`  CAPACITOR_SERVER_URL=${url} npm run android:sync`)
console.log('  npm run dev')
console.log('  npm run android:open')
console.log('')
console.log(`Add to .env.local for CORS:`)
console.log(`  CORS_ORIGINS=http://localhost:3000,${url}`)
console.log('')
