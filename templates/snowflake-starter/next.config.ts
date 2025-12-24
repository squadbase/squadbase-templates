import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    turbopackFileSystemCacheForDev: true,
    swcPlugins: [
      [
        '@squadbase/swc-plugin-component-annotate',
        {
          'source-file-attr': 'data-component-id',
          'filepath-attr': 'data-component-filepath',
          'ignored-components': [
            'components/ui/**',
            'app/**/layout.tsx',
            'app/**/page.tsx',
            '**/component-selector.tsx',
          ],
        },
      ],
    ],
  },
  reactCompiler: true,
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  serverExternalPackages: ['snowflake-sdk'],
  outputFileTracingIncludes: {
    '/*': ['node_modules/lightningcss/**', 'node_modules/@tailwindcss/**'],
  },
};

export default nextConfig;
