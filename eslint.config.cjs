const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const nxEslintPlugin = require('@nx/eslint-plugin');
const stylisticEslintPlugin = require('@stylistic/eslint-plugin');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    ignores: ['**/dist'],
  },
  ...compat.extends('plugin:storybook/recommended'),
  {
    plugins: {
      '@nx': nxEslintPlugin,
      '@stylistic': stylisticEslintPlugin,
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
    ignores: ['**/.storybook/**/*', 'cypress/support/*'],
  },
  ...compat
    .config({
      extends: ['plugin:@nx/typescript'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
      excludedFiles: ['.storybook/*', 'cypress/support/*'],
      rules: {
        ...config.rules,
        '@stylistic/semi': 'error',
      },
    })),
  ...compat
    .config({
      extends: ['plugin:@nx/javascript'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
      excludedFiles: ['**/.storybook/**/*', 'cypress/support/*'],
      rules: {
        ...config.rules,
        '@stylistic/semi': 'error',
      },
    })),
  ...compat
    .config({
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.spec.ts', '**/*.spec.tsx'],
      excludedFiles: ['.storybook/*', 'cypress/support/*'],
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
      excludedFiles: ['.storybook/*', 'cypress/support/*'],
      rules: {
        ...config.rules,
      },
    })),
  {
    ignores: ['node_modules\r'],
  },
];
