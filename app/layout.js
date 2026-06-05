import './globals.css'

export const metadata = {
  title: 'SmartScheduler.AI - Intelligent Scheduling System',
  description: 'AI-powered intelligent scheduling system aligned with NEP 2020 for Multidisciplinary Education',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect fill="%232563EB" width="32" height="32" rx="4"/><text x="50%" y="50%" font-size="14" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">SA</text></svg>',
        type: 'image/svg+xml',
      }
    ],
    apple: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><rect fill="%232563EB" width="180" height="180" rx="40"/><text x="50%" y="50%" font-size="80" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">SA</text></svg>',
        type: 'image/svg+xml',
      }
    ]
  }
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