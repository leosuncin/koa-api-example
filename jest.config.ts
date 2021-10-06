import type { InitialOptionsTsJest } from 'ts-jest/dist/types';
import { pathsToModuleNameMapper } from 'ts-jest/utils';

import { compilerOptions } from './tsconfig.json';

const config: InitialOptionsTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', '.'],
  watchPathIgnorePatterns: ['dist', 'coverage'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
};

export default config;
