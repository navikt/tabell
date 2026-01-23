
module.exports = {
  roots: [
    '<rootDir>/src'
  ],
  testMatch: ['**/*.test.tsx'],
  moduleDirectories: [
    'node_modules'
  ],
  moduleNameMapper: {
    '^.+\\.(jpg|jpeg|png|gif|css|less)$': 'identity-obj-proxy',
    '\\.(svg)$': '<rootDir>/src/__mocks__/svgMock.js'
  },
  collectCoverageFrom: [
    "src/*.tsx"
  ],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
}
