/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'dist',
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/Portafolio' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Portafolio/' : '',
}

module.exports = nextConfig