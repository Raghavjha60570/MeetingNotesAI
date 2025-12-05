module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/lib/(.*)$\': '<rootDir>/src/lib/$1',
    '^@/components/(.*)$\': '<rootDir>/src/components/$1',
    '^@/app/(.*)$\': '<rootDir>/src/app/$1',
  },
};
