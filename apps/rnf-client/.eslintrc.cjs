/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    'standard',
    '@vue/eslint-config-prettier/skip-formatting',
  ],
  rules: {
    'jsx-quotes': [2, 'prefer-double'],
    'comma-dangle': [2, 'always-multiline'],
  },
  overrides: [
    {
      files: [
        'cypress/support/*.{js,ts,jsx,tsx}',
        'cypress/e2e/*.{spec,e2e}.{js,ts,jsx,tsx}',
        'src/**/*.cy.{js,ts,jsx,tsx}',
      ],
      extends: [
        'plugin:cypress/recommended',
      ],
    },
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
