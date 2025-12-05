import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Renty - Gestion locative simplifiée',
  description:
    'Plateforme de gestion locative pour propriétaires et locataires',
  icons: {
    icon: '/logo/renty_logo_favicon.svg',
    shortcut: '/logo/renty_logo_favicon.svg',
    apple: '/logo/renty_logo_favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
