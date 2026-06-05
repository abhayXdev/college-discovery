/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.29.15', 'localhost', '127.0.0.1'],
  experimental: {
    allowedDevOrigins: ['192.168.29.15', 'localhost', '127.0.0.1'],
  }
};

module.exports = nextConfig;
