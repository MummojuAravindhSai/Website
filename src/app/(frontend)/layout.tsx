import React from 'react'
import type { Metadata } from 'next'
import './styles.css'
import { Inter, Playfair_Display } from 'next/font/google'
import { getWebsiteSettings } from '@/lib/content'
import { SiteHeader } from './components/site-header'
import { SiteFooter } from './components/site-footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })

const title = 'Premium Interior Design Studio — Hyderabad'
const description =
  'A premium Hyderabad interior design studio creating thoughtful homes through space planning, natural materials, storage and warm contemporary detail.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title,
  description,
  openGraph: {
    title,
    description,
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getWebsiteSettings()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} min-h-screen bg-[#fbf8f1] text-[#211b17] antialiased`}
      >
        <a className="skip-link" href="#root">
          Skip to content
        </a>
        <div id="root" tabIndex={-1}>
          <SiteHeader
            studioName={settings.studioName ?? '[Studio Name]'}
            city={settings.primaryCity ?? 'Hyderabad, Telangana'}
          />
          {children}
          <SiteFooter settings={settings} />
        </div>
      </body>
    </html>
  )
}
