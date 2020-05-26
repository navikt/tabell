
module.exports = {
  roots: [
    '<rootDir>/src'
  ],
  testMatch: ['**/*.test.js'],
  moduleDirectories: [
    'node_modules'
  ],
  moduleNameMapper: {
    '^.+\\.(jpg|jpeg|png|gif|css|less)$': 'identity-obj-proxy'
  }
}
