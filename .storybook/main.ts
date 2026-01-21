import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)', '../__stories__/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config) {
    // Ensure proper module resolution for ESM
    if (config.resolve) {
      config.resolve.conditions = ['import', 'module', 'browser', 'default'];
    } else {
      config.resolve = {
        conditions: ['import', 'module', 'browser', 'default'],
      };
    }
    
    // Ensure TypeScript files are handled correctly
    if (!config.server) {
      config.server = {};
    }
    config.server.fs = {
      allow: ['..'],
    };
    
    // Optimize dependencies
    if (!config.optimizeDeps) {
      config.optimizeDeps = {};
    }
    config.optimizeDeps.include = [
      ...(config.optimizeDeps.include || []),
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
    ];
    
    // Ensure proper handling of .ts and .tsx files
    if (!config.esbuild) {
      config.esbuild = {};
    }
    config.esbuild.jsx = 'automatic';
    
    return config;
  },
};

export default config;
