/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle Node.js core modules for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Explicitly disable canvas and related modules
        canvas: false,
        'canvas-prebuilt': false,
        encoding: false,
        // Add Node.js core modules fallbacks for client-side
        fs: false,
        os: false,
        path: false,
        child_process: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        zlib: require.resolve('browserify-zlib'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        util: require.resolve('util/'),
      };
    }
    
    // Add condition to ignore canvas in browser
    if (!isServer) {
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      
      // Add a rule to null-load canvas and related modules
      config.module.rules.push({
        test: /canvas/,
        use: 'null-loader',
      });
      
      // Add a rule to handle pdf.worker.js
      config.module.rules.push({
        test: /pdf\.worker\.js$/,
        type: 'asset/resource',
      });
    }

    return config;
  },
  // Ensure we transpile the googleapis package
  transpilePackages: ['googleapis', 'google-auth-library', 'pdfjs-dist'],
  // Add experimental settings for better compatibility
  experimental: {
    esmExternals: false,
  },
};

module.exports = nextConfig;
