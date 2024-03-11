const antfu = require('@antfu/eslint-config').default

module.exports = antfu(
  {
  },
  {
    // your overrides
    rules: {
      'no-irregular-whitespace': 'off',
      curly: ['error', 'all'],
      'vue/max-attributes-per-line': ['error', {
        singleline: {
          max: 1,
        },
        multiline: {
          max: 1
        }
      }]
    },
  },
)
