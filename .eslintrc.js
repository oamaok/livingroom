module.exports = {
  ignorePatterns: ['dist/'],
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  // extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        semi: false,
        quoteProps: 'consistent',
      },
    ],
  },
}
