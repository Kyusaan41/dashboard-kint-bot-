/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        port: '',
        pathname: '**', // Autorise tous les chemins sur ce nom de domaine
      },
    ],
  },
};

module.exports = nextConfig;