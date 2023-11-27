/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    project: ['tsconfig.eslint.json', 'tsconfig.json'],
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'standard',
  ],
  rules: {
    'comma-dangle': [2, 'always-multiline'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-dupe-class-members': 'off',
    'spaced-comment': [
      'error',
      'always',
      {
        markers: [
          '#region',
          '#endregion',
          '/',
        ],
      },
    ],
    indent: [
      'error',
      2,
      {
        ignoredNodes: [
          'PropertyDefinition',
          'FunctionExpression > .params[decorators.length > 0]',
          'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
          'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key',
        ],
      },
    ],
  },
  overrides: [
    {
      files: [
        'src/**/*.{spec,test}.{js,ts,jsx,tsx}',
      ],
      env: {
        jest: true,
      },
    },
  ],
}
