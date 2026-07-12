export type CmsContent = {
  site: {
    nameBn: string
    tagline: string
    city: string
    phone: string
    whatsapp: string
    email: string
    addressBn: string
  }
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    primaryCta: string
    secondaryCta: string
  }
  whyCornia: Array<{ title: string; description: string }>
  counters: Array<{ value: string; label: string }>
  faqs: Array<{ question: string; answer: string }>
}

export type CmsContentInput = {
  site?: Partial<CmsContent['site']>
  hero?: Partial<CmsContent['hero']>
  whyCornia?: CmsContent['whyCornia']
  counters?: CmsContent['counters']
  faqs?: CmsContent['faqs']
}

export const defaultCmsContent: CmsContent = {
  site: {
    nameBn: 'কর্নিয়া নার্সিং কোচিং',
    tagline: 'সাফল্যের জন্য প্রস্তুতি',
    city: 'খুলনা',
    phone: '01784-176442',
    whatsapp: 'https://wa.me/8801784176442',
    email: 'info@cornianursing.com',
    addressBn: 'কলাবাগান মোড়, খুলনা মেডিকেল কলেজ হাসপাতালের সামনে, খুলনা।',
  },
  hero: {
    eyebrow: 'BNMC ভর্তি পরীক্ষার সম্পূর্ণ প্রস্তুতি',
    title: 'খুলনার অন্যতম বিশ্বস্ত নার্সিং ভর্তি কোচিং',
    subtitle: 'অভিজ্ঞ শিক্ষক, আপডেটেড নোট ও নিয়মিত মডেল টেস্টের মাধ্যমে আপনার নার্সিং ক্যারিয়ারের নিশ্চিত প্রস্তুতি।',
    primaryCta: 'ভর্তি হোন',
    secondaryCta: 'ফ্রি ক্লাস',
  },
  whyCornia: [
    { title: 'অভিজ্ঞ শিক্ষকমণ্ডলী', description: 'দীর্ঘদিনের অভিজ্ঞ ও দক্ষ শিক্ষকদের সরাসরি তত্ত্বাবধান।' },
    { title: 'আপডেটেড নোট', description: 'সর্বশেষ সিলেবাস অনুযায়ী হালনাগাদ লেকচার শীট ও নোট।' },
    { title: 'সাপ্তাহিক পরীক্ষা', description: 'প্রতি সপ্তাহে মডেল টেস্ট ও পারফরম্যান্স বিশ্লেষণ।' },
    { title: 'ব্যক্তিগত যত্ন', description: 'প্রতিটি শিক্ষার্থীর জন্য আলাদা কেয়ার ও ফলোআপ।' },
  ],
  counters: [
    { value: '৫০০০+', label: 'শিক্ষার্থী' },
    { value: '৯৫%', label: 'সাফল্যের হার' },
    { value: '১৫০+', label: 'মডেল টেস্ট' },
    { value: '৩০০+', label: 'লেকচার শীট' },
  ],
  faqs: [
    { question: 'ভর্তি কিভাবে করবো?', answer: 'আপনি সরাসরি আমাদের অফিসে এসে অথবা ওয়েবসাইটের ভর্তি পেজ থেকে অনলাইনে ফরম পূরণ করে ভর্তি হতে পারবেন।' },
    { question: 'ক্লাস কখন হয়?', answer: 'সকাল ও বিকাল — দুটি ব্যাচে ক্লাস পরিচালিত হয়। এছাড়া অনলাইন ব্যাচের জন্য আলাদা সময়সূচি রয়েছে।' },
  ],
}

export function mergeCmsContent(input: CmsContentInput = {}): CmsContent {
  return {
    site: { ...defaultCmsContent.site, ...input.site },
    hero: { ...defaultCmsContent.hero, ...input.hero },
    whyCornia: input.whyCornia?.length ? input.whyCornia : defaultCmsContent.whyCornia,
    counters: input.counters?.length ? input.counters : defaultCmsContent.counters,
    faqs: input.faqs?.length ? input.faqs : defaultCmsContent.faqs,
  }
}
