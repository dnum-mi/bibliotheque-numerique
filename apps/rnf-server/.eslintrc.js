module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint/eslint-plugin"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
    "standard",
  ],
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.js"],
  rules: {
    "@typescript-eslint/ban-ts-comment": ["error", { "ts-ignore": "allow-with-description" }],
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-extraneous-class": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "max-len": ["error", { code: 120 }],
    'no-useless-constructor': 'off',
    'no-irregular-whitespace': 'off',
    'comma-dangle': ['error', 'always-multiline'],
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
  },
  overrides: [
    {
      files: ["*.spec.ts", "*.mock.ts", "*.e2e-spec.ts"],
      rules: {
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
      },
    },
    {
      files: ["src/**/*.{spec,test}.{js,ts,jsx,tsx}", "test/**/*.{js,ts}"],
      env: {
        jest: true,
      },
    },
    {
      files: ["*.mock.ts"],
      rules: {
        "max-len": "off"
      }
    },
    {
      files: ["*spec.ts"],
      rules: {
        "max-len": ["warn", { code: 140 }]
      }
    }
  ],
};
