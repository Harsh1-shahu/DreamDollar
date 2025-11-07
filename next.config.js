/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },  // required if you use next/image
  trailingSlash: true,
  basePath: '/Dreamcontract',               // <— add this if serving from /app
};

module.exports = nextConfig;
