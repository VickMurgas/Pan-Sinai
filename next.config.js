/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración optimizada para Next.js 14
  swcMinify: true,
  reactStrictMode: true,
  // Configuración para manejar errores de hidratación
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig 