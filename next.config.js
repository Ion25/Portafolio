/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'dist',
  basePath: '/Portafolio',
  assetPrefix: '/Portafolio',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig