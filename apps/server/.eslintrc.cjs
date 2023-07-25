module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    project: ["tsconfig.eslint.json", "tsconfig.json"],
  },
  plugins: ["@typescript-eslint/eslint-plugin"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  env: {
    node: true,
  },
  rules: {
    "@typescript-eslint/ban-ts-comment": [
      "error",
      { "ts-ignore": "allow-with-description" },
    ],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
  },
  overrides: [
    {
      files: ["src/**/*.{spec,test}.{js,ts,jsx,tsx}", "test/**/*.{js,ts}"],
      env: {
        jest: true,
      },
    },
  ],
};
