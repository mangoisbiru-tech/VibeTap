import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/s/', '/login/', '/signup/'],
    },
    sitemap: 'https://tappay-malaysia-nfc.vercel.app/sitemap.xml',
  }
}
