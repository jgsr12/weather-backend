import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],

  moduleFileExtensions: ['ts', 'js', 'json'],

  testMatch: ['**/*.spec.ts'],

  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
};

export default config;
