/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude realtime-js from client bundle if not needed
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/realtime-js'],
  },
};

export default nextConfig;

