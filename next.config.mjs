/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    emotion: true,
  },
  output: 'export',
  env: {
    API_KEY: process.env.API_KEY,
  },
};

export default nextConfig;