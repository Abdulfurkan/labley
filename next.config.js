/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  experimental: {
    esmExternals: false, // This is important for PDF.js
  },
  webpack: (config, { isServer }) => {
    // Handle PDF.js worker
    config.resolve.alias['pdfjs-dist/build/pdf.worker.js'] = false;
    
    // Explicitly ignore canvas
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        'canvas-prebuilt': false,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        zlib: false,
        http: false,
        https: false,
        url: false,
        util: false,
        assert: false,
        buffer: false,
        process: false,
        child_process: false,
      };
    }

    // Add null-loader for canvas modules
    config.module.rules.push({
      test: /node_modules\/canvas/,
      use: 'null-loader',
    });

    // Add null-loader for pdfjs-dist worker
    config.module.rules.push({
      test: /pdf\.worker\.js$/,
      use: 'null-loader',
    });

    return config;
  },
  // Disable image optimization for PDF thumbnails
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com'],
  },
  // Transpile specific modules
  transpilePackages: ['pdfjs-dist'],
}

module.exports = nextConfig
