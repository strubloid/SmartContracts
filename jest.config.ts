import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/components', '<rootDir>/config', '<rootDir>/Interfaces'],
  collectCoverage: true,
  collectCoverageFrom: [
    'components/ThirdWeb/*.ts',
    '!components/ThirdWeb/*.test.ts',
    'config/*.ts',
    'Interfaces/*.ts',
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    'components/ThirdWeb/': {
      branches: 90,
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
