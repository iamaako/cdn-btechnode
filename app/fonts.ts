import localFont from 'next/font/local'

export const geistSans = localFont({
  src: [
    {
      path: '../public/fonts/Geist-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-geist-sans',
  display: 'swap',
  preload: true,
})

export const geistMono = localFont({
  src: '../public/fonts/GeistMono-Regular.woff2',
  variable: '--font-geist-mono',
  display: 'swap',
  preload: true,
})
