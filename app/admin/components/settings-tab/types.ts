export type SiteSettings = {
  nameBn: string
  nameEn: string
  tagline: string
  logo: string
  city: string
  phone: string
  phoneHref: string
  whatsapp: string
  messenger: string
  email: string
  facebook: string
  youtube: string
  addressBn: string
}

export type FaqItem = { question: string; answer: string }

export type HeroSettings = {
  eyebrow: string
  title: string
  subtitle: string
  primaryCta: string
  secondaryCta: string
}

export type WhyCorniaItem = { title: string; description: string }

export type CounterItem = { value: string; label: string }

export type FormState = {
  siteName: string
  siteTagline: string
  smsProvider: string
  smsApiKey: string
  smsSenderId: string
  smsEmail: string
  smsPassword: string
  paymentGateway: string
  paymentGatewayApiKey: string
  paymentGatewaySecret: string
  paymentGatewayWebhookSecret: string
  site: SiteSettings
  hero: HeroSettings
  whyCornia: WhyCorniaItem[]
  counters: CounterItem[]
  faqs: FaqItem[]
}

export const defaultSite: SiteSettings = {
  nameBn: '',
  nameEn: '',
  tagline: '',
  logo: '',
  city: '',
  phone: '',
  phoneHref: '',
  whatsapp: '',
  messenger: '',
  email: '',
  facebook: '',
  youtube: '',
  addressBn: '',
}

export const defaultHero: HeroSettings = {
  eyebrow: '',
  title: '',
  subtitle: '',
  primaryCta: '',
  secondaryCta: '',
}

export const defaultForm: FormState = {
  siteName: '',
  siteTagline: '',
  smsProvider: 'none',
  smsApiKey: '',
  smsSenderId: '',
  smsEmail: '',
  smsPassword: '',
  paymentGateway: 'none',
  paymentGatewayApiKey: '',
  paymentGatewaySecret: '',
  paymentGatewayWebhookSecret: '',
  site: defaultSite,
  hero: defaultHero,
  whyCornia: [],
  counters: [],
  faqs: [],
}