module.exports = {
  collectCoverageFrom: ['src/**/*.js'],
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['./test/jest-setup.js']
};
