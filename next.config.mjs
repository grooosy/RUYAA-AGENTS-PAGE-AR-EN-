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
      'images.unsplash.com',
      'cdn.voiceflow.com',
      'general-runtime.voiceflow.com',
      'runtime-api.voiceflow.com',
      'cdn.botpress.cloud',
      'files.bpcontent.cloud'
    ],
    unoptimized: true,
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
              connect-src 'self' https://cdn.voiceflow.com https://general-runtime.voiceflow.com https://runtime-api.voiceflow.com wss://general-runtime.voiceflow.com https://cdn.botpress.cloud https://files.bpcontent.cloud wss://ws-us3.pusher.com;
              img-src 'self' data: blob: https://images.unsplash.com https://cdn.voiceflow.com https://general-runtime.voiceflow.com https://runtime-api.voiceflow.com https://cdn.botpress.cloud https://files.bpcontent.cloud https://vercel.live https://vercel.com;
              style-src 'self' 'unsafe-inline' https://cdn.voiceflow.com https://general-runtime.voiceflow.com https://runtime-api.voiceflow.com https://cdn.botpress.cloud https://files.bpcontent.cloud https://vercel.live;
              font-src 'self' data: https://cdn.voiceflow.com https://general-runtime.voiceflow.com https://runtime-api.voiceflow.com https://cdn.botpress.cloud https://files.bpcontent.cloud https://vercel.live https://assets.vercel.com;
              frame-src 'self' https://cdn.voiceflow.com https://general-runtime.voiceflow.com https://runtime-api.voiceflow.com https://cdn.botpress.cloud https://files.bpcontent.cloud https://vercel.live;
              media-src 'self' blob: data: https://cdn.voiceflow.com https://general-runtime.voiceflow.com https://runtime-api.voiceflow.com https://cdn.botpress.cloud https://files.bpcontent.cloud;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim()
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
    ]
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
}

export default nextConfig
