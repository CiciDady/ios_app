/**
 * Jest config for the PURE-LOGIC core only (no React Native / Expo imports).
 * These tests are runnable in the cloud (no device/emulator needed) and cover
 * the two hardest pieces of the app: pose matching and pose recommendation.
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/core'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
};
