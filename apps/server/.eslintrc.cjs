module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['tsconfig.eslint.json', 'tsconfig.json'],
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'standard',
  ],
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'database/migrations/*.ts'],
  rules: {
    '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    'no-useless-constructor': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'max-len': ['error', { code: 120 }],
    'no-irregular-whitespace': 'warn',
    'comma-dangle': ['error', 'always-multiline'],
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
    'space-before-function-paren': 0,
    'no-case-declarations': 'off',
  },
  overrides: [
    {
      files: ['*.spec.ts', '*.mock.ts', '*.e2e-spec.ts'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
      },
    },
    {
      files: ['src/**/*.{spec,test}.{js,ts,jsx,tsx}', 'test/**/*.{js,ts}'],
      env: {
        jest: true,
      },
    },
    {
      files: ['*.mock.ts', 'database/migrations/*.ts'],
      rules: {
        'max-len': 'off',
      },
    },
    {
      files: ['*spec.ts'],
      rules: {
        'max-len': ['warn', { code: 140 }],
      },
    },

  ],
}
