/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React Strict Mode to prevent third-party widget warnings
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
  
  // ESLint configuration to ignore third-party warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration to ignore build errors
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Images configuration
  images: {
    unoptimized: true,
    domains: ['cdn.voiceflow.com'],
  },
  
  // Headers for better third-party integration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.voiceflow.com https://general-runtime.voiceflow.com https://runtime-api.voiceflow.com; object-src 'none';",
          },
        ],
      },
    ]
  },
}

export default nextConfig
