import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { SITE } from '@/lib/site-data';
import { JsonLd, organizationJsonLd, localBusinessJsonLd } from '@/components/json-ld';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    metadataBase: new URL(SITE.url),
    title: isEn
      ? 'ISC Expo - Icon Skill & Career Expo | Khulna — Nursing Admission Preparation'
      : 'ISC Expo - Icon Skill & Career Expo | খুলনা — BNMC নার্সিং ভর্তি প্রস্তুতি',
    description: isEn
      ? 'One of Khulna\'s most trusted nursing admission coaching. Complete preparation for BNMC admission, B.Sc Nursing, Post Basic B.Sc & job preparation.'
      : 'খুলনার অন্যতম বিশ্বস্ত নার্সিং ভর্তি কোচিং। BNMC ভর্তি পরীক্ষা, B.Sc Nursing, Post Basic B.Sc, কাউন্সিল ও চাকরি প্রস্তুতির সম্পূর্ণ সমাধান।',
    generator: 'v0.app',
    applicationName: SITE.nameBn,
    keywords: isEn
      ? ['nursing coaching Khulna', 'ISC Expo', 'BNMC admission', 'B.Sc Nursing']
      : ['নার্সিং কোচিং খুলনা', 'ISC Expo', 'BNMC admission', 'B.Sc Nursing', 'nursing coaching Khulna'],
    icons: {
      icon: '/icon.svg',
      shortcut: '/icon.svg',
      apple: '/apple-icon.png',
      other: [
        { rel: 'icon', url: '/icon-dark-32x32.png', sizes: '32x32' },
        { rel: 'icon', url: '/icon-light-32x32.png', sizes: '32x32' },
      ],
    },
    manifest: '/manifest.webmanifest',
    openGraph: {
      type: 'website',
      locale: isEn ? 'en_US' : 'bn_BD',
      url: SITE.url,
      siteName: SITE.nameBn,
      title: isEn
        ? 'ISC Expo - Icon Skill & Career Expo | Khulna'
        : 'ISC Expo - Icon Skill & Career Expo | খুলনা',
      description: isEn
        ? 'One of Khulna\'s most trusted nursing admission coaching.'
        : 'খুলনার অন্যতম বিশ্বস্ত নার্সিং ভর্তি কোচিং।',
    },
    twitter: {
      card: 'summary_large_image',
      title: isEn ? 'ISC Expo - Icon Skill & Career Expo | Khulna' : 'ISC Expo - Icon Skill & Career Expo | খুলনা',
      description: isEn
        ? 'Khulna\'s trusted nursing admission coaching'
        : 'খুলনার বিশ্বস্ত নার্সিং কোচিং — BNMC, B.Sc Nursing ও চাকরি প্রস্তুতি।',
    },
  };
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0056D2' },
    { media: '(prefers-color-scheme: dark)', color: '#0c1220' },
  ],
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={localBusinessJsonLd()} />
      {children}
      {process.env.NODE_ENV === 'production' && <Analytics />}
    </NextIntlClientProvider>
  );
}
