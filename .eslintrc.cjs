module.exports = {
  env: {
    node: true
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "airbnb-base",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module"
  },
  ignorePatterns: ["node_modules", "dist"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "quotes": [
      "error",
      "double",
      { avoidEscape: true, allowTemplateLiterals: false }
    ],
    "import/extensions": "off",
    "no-console": "off",
    "no-multi-str": "off"
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".ts"]
      }
    }
  }
};
