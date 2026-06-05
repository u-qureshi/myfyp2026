const serverUrl = process.env.CAPACITOR_SERVER_URL || 'http://localhost:3000'
const isLocalHttp = serverUrl.startsWith('http://')

/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'com.smartscheduler.app',
  appName: 'SmartScheduler',
  webDir: 'mobile-shell',
  server: {
    url: serverUrl,
    cleartext: isLocalHttp,
    androidScheme: isLocalHttp ? 'http' : 'https',
  },
  android: {
    allowMixedContent: isLocalHttp,
  },
}

module.exports = config
