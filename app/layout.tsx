import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeScript } from '@/components/shared/ThemeScript'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'TaskFinance',
    template: '%s | TaskFinance',
  },
  description: 'Daily clarity. Financial control. Your all-in-one task and finance tracker.',
  keywords: ['task management', 'finance tracker', 'productivity', 'budget'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={dmSans.variable}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '10px',
            },
          }}
        />
      </body>
    </html>
  )
}
