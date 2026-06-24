/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from Firebase Storage
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
};

export default nextConfig;
