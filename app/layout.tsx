import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Hind_Siliguri, Poppins } from 'next/font/google'
import './globals.css'
import { SITE } from '@/lib/site-data'
import { JsonLd, organizationJsonLd, localBusinessJsonLd } from '@/components/json-ld'

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: 'কর্নিয়া নার্সিং কোচিং | খুলনা — BNMC নার্সিং ভর্তি প্রস্তুতি',
  description:
    'খুলনার অন্যতম বিশ্বস্ত নার্সিং ভর্তি কোচিং। BNMC ভর্তি পরীক্ষা, B.Sc Nursing, Post Basic B.Sc, কাউন্সিল ও চাকরি প্রস্তুতির সম্পূর্ণ সমাধান।',
  generator: 'v0.app',
  applicationName: SITE.nameBn,
  keywords: [
    'নার্সিং কোচিং খুলনা',
    'Cornia Nursing',
    'BNMC admission',
    'B.Sc Nursing',
    'nursing coaching Khulna',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    url: SITE.url,
    siteName: SITE.nameBn,
    title: 'কর্নিয়া নার্সিং কোচিং | খুলনা — BNMC নার্সিং ভর্তি প্রস্তুতি',
    description:
      'খুলনার অন্যতম বিশ্বস্ত নার্সিং ভর্তি কোচিং। BNMC ভর্তি পরীক্ষা, B.Sc Nursing ও চাকরি প্রস্তুতির সম্পূর্ণ সমাধান।',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'কর্নিয়া নার্সিং কোচিং | খুলনা',
    description: 'খুলনার বিশ্বস্ত নার্সিং ভর্তি কোচিং — BNMC, B.Sc Nursing ও চাকরি প্রস্তুতি।',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0056D2',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} ${poppins.variable} bg-background`}>
      <body className="font-sans antialiased">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={localBusinessJsonLd()} />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
