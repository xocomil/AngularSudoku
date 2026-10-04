const angular = require('angular-eslint');
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const baseConfig = require('../../eslint.config.cjs');
const overrides = require('../../.eslint.nx.overrides.cjs');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    ignores: ['**/dist'],
  },
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: [
          'libs/components/tsconfig.*?.json',
          'libs/components/.storybook/tsconfig.json',
          'libs/components/cypress/tsconfig.json',
        ],
      },
    },
  },
  { files: ['**/*.ts'], processor: angular.processInlineTemplates },
  ...compat.config({ extends: ['plugin:@nx/angular'] }).map((config) => ({
    ...config,
    files: ['**/*.ts'],
    rules: {
      ...config.rules,
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'sud',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'sud',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/prefer-standalone': 'off',
    },
  })),
  ...compat
    .config({
      extends: ['plugin:@nx/angular-template'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.html'],
      rules: {
        ...config.rules,
      },
    })),
  overrides,
];
