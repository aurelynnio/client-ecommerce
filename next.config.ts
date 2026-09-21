import type { NextConfig } from 'next';

// On Vercel, standalone output must NOT be enabled.
// Next.js 16.3+ with Turbopack and Vercel's build adapter triggers regression #96657:
// "Error: ENOENT: no such file or directory, open '/vercel/path0/.next/next-server.js.nft.json'".
// Standalone is only intended for self-hosted Docker builds.
const isVercel = process.env.VERCEL === '1';

const nextConfig: NextConfig = {
  ...(isVercel ? {} : { output: 'standalone' }),
  turbopack: {
    root: process.cwd(),
  },
  images: {
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Real product dataset image hosts (Amazon/Lazada/Shopee/Shein/Walmart)
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'img.ltwebstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'us.shein.com',
      },
      {
        protocol: 'https',
        hostname: 'i5.walmartimages.com',
      },
    ],
  },
};

export default nextConfig;
