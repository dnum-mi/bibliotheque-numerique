import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['node_modules', '**/node_modules/**', 'dist', '**/dist/**'],
}, {
  rules: {
    'vue/custom-event-name-casing': 'warn', // we should enable this as error
    'antfu/if-newline': 'warn', // we should enable this as error
    'no-console': 'warn', // we should enable this as error
    'prefer-template': 'warn', // we should enable this as error
    'vue/component-name-in-template-casing': 'warn', // we should enable this as error
    'vue/no-useless-v-bind': 'warn', // we SHOULD enable this as error
    'ts/no-use-before-define': 'warn', // we SHOULD enable this as error
    curly: ['warn', 'all'], // we SHOULD enable this as error
    'style/max-statements-per-line': 'warn', // we SHOULD enable this as error
    'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'no-irregular-whitespace': 'off',
    'style/space-before-function-paren': ['error', 'always'],
    'vue/no-irregular-whitespace': 'off',
    'sort-imports': 'off', // we should enable this
    'ts/consistent-type-definitions': 'off', // we should enable this
    'import/order': 'off', // we should enable this
    'style/member-delimiter-style': 'off', // we should enable this
    'style/arrow-parens': 'off', // we should enable this
    'antfu/top-level-function': 'off', // maybe we should enable this
    'style/quote-props': 'off', // maybe we should enable this
    'ts/no-unused-vars': 'off',
    'ts/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
    'no-case-declarations': 'off',
    'style/spaced-comment': [
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
  },
})
