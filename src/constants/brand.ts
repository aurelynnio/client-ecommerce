export const BRAND_CONFIG = {
  name: 'Aura Commerce',
  shortName: 'Aura',
  tagline: 'Modern refined e-commerce experience.',
  copyright: `© ${new Date().getFullYear()} Aura Commerce. All rights reserved.`,
  support: {
    phone: process.env.NEXT_PUBLIC_BRAND_PHONE || null,
    email: process.env.NEXT_PUBLIC_BRAND_EMAIL || null,
    address: process.env.NEXT_PUBLIC_BRAND_ADDRESS || null,
  },
  socials: [
    { name: 'Facebook', href: process.env.NEXT_PUBLIC_BRAND_FACEBOOK || null },
    { name: 'Instagram', href: process.env.NEXT_PUBLIC_BRAND_INSTAGRAM || null },
    { name: 'Twitter', href: process.env.NEXT_PUBLIC_BRAND_X || null },
    { name: 'Youtube', href: process.env.NEXT_PUBLIC_BRAND_YOUTUBE || null },
  ],
};
