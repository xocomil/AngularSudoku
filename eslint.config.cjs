const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const nxEslintPlugin = require('@nx/eslint-plugin');
const stylisticEslintPlugin = require('@stylistic/eslint-plugin');
const tseslint = require('typescript-eslint');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const ignores = [
  '**/dist',
  '**/.storybook/*',
  'cypress/support/**/*',
  'eslint.config.cjs',
];

module.exports = [
  {
    ignores,
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  ...compat.extends('plugin:storybook/recommended'),
  {
    plugins: {
      '@nx': nxEslintPlugin,
      '@stylistic': stylisticEslintPlugin,
      '@typescript-eslint': tseslint.plugin,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
    ignores,
  },
  ...compat
    .config({
      extends: ['plugin:@nx/typescript'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
      rules: {
        ...config.rules,
        '@stylistic/semi': 'error',
      },
      ignores,
    })),
  ...compat
    .config({
      extends: ['plugin:@nx/javascript'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.js', '**/*.jsx'],
      rules: {
        ...config.rules,
        '@stylistic/semi': 'warn',
      },
      ignores,
    })),
  ...compat
    .config({
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        ...config.rules,
        'jest/prefer-expect-assertions': [
          'warn',
          {
            onlyFunctionsWithAsyncKeyword: true,
          },
        ],
      },
    })),
  ...compat
    .config({
      extends: ['plugin:@ngrx/all'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.ts'],
      rules: {
        ...config.rules,
      },
    })),
  {
    ignores: ['node_modules\r'],
  },
];
