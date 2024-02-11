import { eslint } from '@betterer/eslint';

export default {
  'no more immer': () =>
    eslint({
      'no-restricted-imports': [
        'error',
        { name: 'immer', message: 'use mutative instead.' },
      ],
    }).include(['.apps/src/**/*.ts', './libs/**/*.ts']),
};
