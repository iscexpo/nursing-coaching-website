import { NextIntlClientProvider } from 'next-intl'
import { Hind_Siliguri, Poppins } from 'next/font/google'
import messages from '../messages/bn.json'
import './globals.css'

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hind',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} ${poppins.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
