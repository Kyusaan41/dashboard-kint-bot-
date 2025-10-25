/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/bot/:path*',
        destination: 'http://193.70.34.25:20007/api/:path*',
      },
    ]
  },
  // Si vous avez d'autres configurations, ajoutez-les ici.
  // Par exemple, si vous utilisez des images externes :
  // images: {
  //   domains: ['exemple.com'],
  // },
};

module.exports = nextConfig;