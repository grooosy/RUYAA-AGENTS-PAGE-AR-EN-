/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'placeholder.svg',
      'cdn.voiceflow.com',
      'general-runtime.voiceflow.com',
      'runtime-api.voiceflow.com',
      'cdn.botpress.cloud',
      'files.bpcontent.cloud'
    ],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Suppress warnings from third-party packages
    config.ignoreWarnings = [
      { module: /node_modules\/voiceflow/ },
      { module: /node_modules\/botpress/ },
      /Critical dependency: the request of a dependency is an expression/,
    ]
    
    return config
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.voiceflow.com https://general-runtime.voiceflow.com https://runtime-api.voiceflow.com https://cdn.botpress.cloud https://files.bpcontent.cloud;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.voiceflow.com https://cdn.botpress.cloud;
              img-src 'self' data: blob: https: https://cdn.voiceflow.com https://general-runtime.voiceflow.com https://cdn.botpress.cloud https://files.bpcontent.cloud;
              font-src 'self' https://fonts.gstatic.com https://cdn.voiceflow.com https://cdn.botpress.cloud;
              connect-src 'self' https://general-runtime.voiceflow.com https://runtime-api.voiceflow.com https://api.groq.com https://cdn.botpress.cloud https://files.bpcontent.cloud wss://cdn.botpress.cloud;
              frame-src 'self' https://cdn.voiceflow.com https://general-runtime.voiceflow.com https://cdn.botpress.cloud;
              worker-src 'self' blob:;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim()
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
