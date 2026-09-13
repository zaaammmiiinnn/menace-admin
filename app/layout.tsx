import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: 'MENACE Admin — Operations & Fulfillment',
    template: '%s | MENACE Admin',
  },
  description: 'High-density operations console and real-time fulfillment portal for MENACE apparel',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MENACE Admin',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
        'pk_test_ZmFpdGhmdWwtdGFkcG9sZS01MzYyLmNsZXJrLmFjY291bnRzLmRldiQ'
      }
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: '#C6FF00',
          colorBackground: '#121212',
        },
      }}
    >
      <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
        <head>
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </head>
        <body className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] antialiased selection:bg-[#C6FF00] selection:text-[#0A0A0A]">
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#141414',
                borderColor: '#262626',
                color: '#F5F1E8',
                fontSize: '12px',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
