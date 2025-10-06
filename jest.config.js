/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }]
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/test-utils/**'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(pdfjs-dist|uuid|@clerk)/)'
  ],
  moduleNameMapper: {
    '^pdfjs-dist$': '<rootDir>/src/parsers/__tests__/__mocks__/pdfjs-dist.js',
    '^uuid$': '<rootDir>/src/ai/__tests__/__mocks__/uuid.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/ui/Button$': '<rootDir>/src/components/Button.tsx'
  }
}