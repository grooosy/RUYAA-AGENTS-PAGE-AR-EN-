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
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: blob: https: http:;
              media-src 'self' data: blob: https: http:;
              connect-src 'self' https://api.groq.com https://cdn.voiceflow.com https://general-runtime.voiceflow.com https://runtime-api.voiceflow.com https://cdn.botpress.cloud https://files.bpcontent.cloud wss: ws:;
              frame-src 'self' https://cdn.voiceflow.com https://general-runtime.voiceflow.com https://runtime-api.voiceflow.com https://cdn.botpress.cloud https://files.bpcontent.cloud;
              worker-src 'self' blob:;
              child-src 'self' blob:;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              upgrade-insecure-requests;
            `.replace(/\s+/g, ' ').trim()
          },
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
