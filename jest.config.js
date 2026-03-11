module.exports = {
  transform: {
    '^.+\\.tsx?$': ['@swc/jest'],
  },
  testEnvironment: 'node',

  setupFiles: ['<rootDir>/__tests__/setupEnv.setup.ts'],
  globalSetup: '<rootDir>/__tests__/globalSetup.ts',

  testMatch: ['**/__tests__/**/*.test.ts'],

  // 👇 explicitly ignore setup files so they never run as test suites
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/__tests__/setupEnv.setup.ts',
    '<rootDir>/__tests__/dbSetup.setup.ts',
  ],
};