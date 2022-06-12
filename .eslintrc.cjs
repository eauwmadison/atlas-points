module.exports = {
  env: {
    node: true
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "node"],
  extends: [
    "airbnb-base",
    "plugin:import/typescript",
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
    "import/no-unresolved": [
      "error",
      {
        ignore: ["firebase-admin/*"]
      }
    ],
    "no-console": "off",
    "node/no-missing-import": "off",
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
