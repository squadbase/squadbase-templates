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
  serverExternalPackages: [],
  outputFileTracingIncludes: {
    '/*': ['node_modules/lightningcss/**', 'node_modules/@tailwindcss/**'],
  },
};

export default nextConfig;
