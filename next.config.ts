/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow firebase-admin to work in API routes
  serverExternalPackages: ["firebase-admin"],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
