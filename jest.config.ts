import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/components', '<rootDir>/config', '<rootDir>/Interfaces'],
  collectCoverage: true,
  collectCoverageFrom: [
    'components/**/*.ts',
    '!components/**/*.test.ts',
    '!config/*.ts',  // Exclude config files from global coverage
    '!Interfaces/*.ts',  // Exclude interfaces from global coverage
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'components/ThirdWeb/LoadThirdwebClient.ts': {
      branches: 87,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};

export default config;
