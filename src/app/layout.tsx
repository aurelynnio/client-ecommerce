import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ReduxProvider } from './Provider';
import { SocketProvider } from '@/context/SocketContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const auraSans = localFont({
  src: '../../public/fonts/InterVariable.woff2',
  variable: '--font-aura-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Aura Commerce',
    template: '%s | Aura',
  },
  description: 'Modern refined e-commerce experience.',
  icons: {
    icon: '/images/logo-aura-light.png',
    shortcut: '/images/logo-aura-light.png',
    apple: '/images/logo-aura-light.png',
  },
  other: {
    google: 'notranslate',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" translate="no" className="notranslate">
      <body
        translate="no"
        className={`${auraSans.variable} notranslate antialiased min-h-screen flex flex-col`}
      >
        <ReduxProvider>
          <SocketProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </SocketProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
