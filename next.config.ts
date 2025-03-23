/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Désactive le mode strict en dev
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
