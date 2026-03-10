import eslintCommentsConfigs from '@eslint-community/eslint-plugin-eslint-comments/configs';
import prettier from 'eslint-config-prettier';
import arrayFunc from 'eslint-plugin-array-func';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import jestFormatting from 'eslint-plugin-jest-formatting';
import n from 'eslint-plugin-n';
import noSecrets from 'eslint-plugin-no-secrets';
import optimizeRegex from 'eslint-plugin-optimize-regex';
import promise from 'eslint-plugin-promise';
import security from 'eslint-plugin-security';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import switchCase from 'eslint-plugin-switch-case';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**'] },

  tseslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,

  n.configs['flat/recommended'],

  sonarjs.configs.recommended,

  arrayFunc.configs.all,

  eslintCommentsConfigs.recommended,

  promise.configs['flat/recommended'],

  security.configs.recommended,

  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,

  {
    plugins: {
      'no-secrets': noSecrets,
      'optimize-regex': optimizeRegex,
      'simple-import-sort': simpleImportSort,
      'switch-case': switchCase,
    },
    languageOptions: {
      ecmaVersion: 2019,
      sourceType: 'module',
      globals: {
        ...globals.es2020,
        ...globals.node,
      },
      parserOptions: {
        project: 'tsconfig.json',
      },
    },
    settings: {
      node: {
        tryExtensions: ['.js', '.json', '.ts'],
        allowModules: [
          'ts-jest',
          'supertest',
          'jest-mock-extended',
          'pactum',
          '@faker-js/faker',
          'fast-check',
        ],
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      'switch-case/newline-between-switch-case': 'error',
      'switch-case/no-case-curly': 'error',
      'optimize-regex/optimize-regex': [
        'warn',
        { blacklist: ['charClassClassrangesMerge'] },
      ],
      'no-secrets/no-secrets': 'error',
      '@typescript-eslint/no-deprecated': 'warn',
      'n/no-unsupported-features/es-syntax': [
        'error',
        { ignores: ['modules', 'nullish-coalescing-operators'] },
      ],
      'n/no-missing-import': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      // Disable rules that are new in upgraded plugins and were not in the previous config
      // These require author intervention to address
      '@typescript-eslint/only-throw-error': 'off',
      'sonarjs/slow-regex': 'off',
      'sonarjs/no-hardcoded-secrets': 'off',
      'sonarjs/no-hardcoded-passwords': 'off',
      'sonarjs/assertions-in-tests': 'off',
    },
  },

  prettier,

  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },

  {
    files: ['**/*.spec.ts'],
    ...jestPlugin.configs['flat/recommended'],
    ...jestPlugin.configs['flat/style'],
    plugins: {
      ...jestPlugin.configs['flat/recommended'].plugins,
      'jest-formatting': jestFormatting,
    },
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      ...jestPlugin.configs['flat/style'].rules,
      'jest-formatting/padding-around-all': 'error',
      'jest/expect-expect': [
        'warn',
        {
          assertFunctionNames: ['expect', 'request.**.expect', '**.expect\\w+'],
        },
      ],
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
);
