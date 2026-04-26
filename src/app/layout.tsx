import type { Metadata } from 'next'
import './globals.css'
import ServiceWorkerRegistrar from '@/components/shared/Serviceworkerregistrar'

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description: 'Track your daily habits and build streaks',
  manifest: '/manifest.json',
  themeColor: '#6366f1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  )
}