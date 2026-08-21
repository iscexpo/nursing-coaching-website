export const ISC_CATEGORIES = [
  {
    id: 'cat_isc',
    name: 'ISC',
    slug: 'isc',
    description:
      'HSC Science / ISC track — BNMC-aligned curriculum (Physics, Chemistry, Biology, Math, ICT)',
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'cat_icon',
    name: 'Icon',
    slug: 'icon',
    description: 'Regular Icon track — general nursing preparation',
    sortOrder: 0,
    isActive: true,
  },
] as const

export type IscCategorySeed = (typeof ISC_CATEGORIES)[number]
