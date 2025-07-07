/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    minimumCacheTTL: 3600,
  },
  skipTrailingSlashRedirect: true,
  experimental: {
    esmExternals: "loose", // Add this to fix tailwind-scrollbar-hide error
    appDir: true, // Recommended for Next.js 13+
  },
  env: {
    API_URL: process.env.API_URL,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL}/api/:path*`,
      },
    ];
  },
  // Add these compiler options to suppress hydration warnings
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === "production", // Remove console.log in production
  },
  // Enable modularizeImports for better bundle size
  modularizeImports: {
    "@headlessui/react": {
      transform: "@headlessui/react/{{member}}",
    },
    "react-icons": {
      transform: "react-icons/{{member}}",
    },
  },
};

module.exports = nextConfig;
