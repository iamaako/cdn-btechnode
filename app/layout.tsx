import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'BtechNode',
  description: 'Your one-stop platform for B.Tech education',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      }
    ],
    shortcut: '/icon.svg',
    apple: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      }
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="gradient-circle-container">
            <div className="gradient-circle"></div>
          </div>
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
