module.exports = {
  env: {
    "react-native/react-native": true
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    'plugin:react/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'react',
    'react-native'
  ],
  rules: {
    "@typescript-eslint/no-use-before-define": "off",
    "no-console": "error",
    "comma-dangle": ["error", "never"],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "camelcase": ['error', {"properties": "always"}]
  }
};
