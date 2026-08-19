/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['argon2', '@prisma/client', 'prisma'],
};

export default nextConfig;
