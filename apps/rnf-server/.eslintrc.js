module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint/eslint-plugin"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
  ],
  root: true,
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
    "max-len": ["error", { code: 140 }],
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
  ],
};
