/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure image domains if needed
  images: {
    unoptimized: true,
  },
  // Remove deprecated experimental options
  experimental: {
    // appDir is no longer needed in Next.js 13+ as it's the default
  },
};

module.exports = nextConfig;
