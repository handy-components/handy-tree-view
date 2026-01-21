/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // Explicitly set rootDir to current directory
  rootDir: '.',
  // Only search in these specific directories
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  // Only match test files in the current project
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/__tests__/**/*.e2e.test.{ts,tsx}'
  ],
  // Ignore everything outside the project
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/\\.storybook/',
    '/__stories__/',
    '/__examples__/',
    '/\\.vscode/',
    '/\\.rollup\\.cache/',
    // Ignore any path that doesn't start with the current directory
    '^((?!handy-tree-view).)*$'
  ],
  // Transform TypeScript and TSX files - explicitly use ts-jest
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
      isolatedModules: true,
    }],
  },
  // Prevent Jest from using Babel - explicitly ignore babel-jest
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  // Explicitly set coverage provider to v8 instead of babel
  coverageProvider: 'v8',
  // Only collect coverage from this project
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/**/__tests__/**',
    '!<rootDir>/src/**/__examples__/**',
    '!<rootDir>/src/**/__stories__/**'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
