/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(pdfjs-dist|uuid)/)'
  ],
  moduleNameMapper: {
    '^pdfjs-dist$': '<rootDir>/src/parsers/__tests__/__mocks__/pdfjs-dist.js',
    '^uuid$': '<rootDir>/src/ai/__tests__/__mocks__/uuid.js'
  }
}