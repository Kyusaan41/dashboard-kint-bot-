/** @type {import('next').NextConfig} */
const nextConfig = {
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