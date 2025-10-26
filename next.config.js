/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
      return [
        {
          source: '/api/bot/:path*',
          destination: 'http://193.70.34.25:20007/api/:path*',
        },
        {
          source: '/api/gacha/:path*',
          destination: 'http://193.70.34.25:20007/api/gacha/:path*',
        },
      ]
    },
  // Autoriser les images provenant du CDN de Discord pour les avatars
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;