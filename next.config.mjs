/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React Strict Mode to prevent development warnings
  reactStrictMode: false,
  
  // Configure webpack to handle external scripts better
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Suppress console warnings from third-party libraries
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  
  // ESLint configuration to ignore build warnings during development
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration to ignore build errors during development
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Images configuration
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig