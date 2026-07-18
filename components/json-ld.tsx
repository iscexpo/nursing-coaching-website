import { SITE } from '@/lib/site-data'

export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[]
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.nameBn,
    alternateName: SITE.name,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.phoneHref,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.city,
      addressCountry: 'BD',
      streetAddress: SITE.addressBn,
    },
    sameAs: [SITE.facebook, SITE.youtube].filter(Boolean),
  }
}

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE.nameBn,
    alternateName: SITE.name,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.phoneHref,
    image: `${SITE.url}/opengraph-image`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.city,
      addressCountry: 'BD',
      streetAddress: SITE.addressBn,
    },
    sameAs: [SITE.facebook, SITE.youtube].filter(Boolean),
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
