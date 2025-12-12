module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'helpers/**/*.js',
    'middlewares/**/*.js',
    'routes/**/*.js',
    'models/**/*.js',
    '!models/index.js',
    '!**/node_modules/**',
    '!**/__test__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 88,
      lines: 85,
      statements: 85
    }
  },
  testMatch: [
    '**/__test__/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/__test__/setup.js'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 30000
};
