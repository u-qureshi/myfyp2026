import './globals.css'

export const metadata = {
  title: 'SmartScheduler - Intelligent Scheduling System',
  description: 'AI-powered intelligent scheduling system aligned with NEP 2020 for Multidisciplinary Education',
  icons: {
    icon: '/images/smartscheduler-logo.png',
    apple: '/images/smartscheduler-logo.png'
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SmartScheduler',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}