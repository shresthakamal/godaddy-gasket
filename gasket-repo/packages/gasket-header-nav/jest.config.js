export default {
  globals: {},
  testEnvironment: 'jsdom',
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  collectCoverageFrom: [
    '<rootDir>/components/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!<rootDir>/components/footer.js',
    '!<rootDir>/components/header.js'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^.+\\.(css|scss)$': 'identity-obj-proxy'
  },
  testPathIgnorePatterns: [
    '<rootDir>/components/header/config/',
    '<rootDir>/cypress/',
    '<rootDir>/.cache/',
    'node_modules'
  ],
  transformIgnorePatterns: ['^.+\\.(trafficUtils)$']
};
