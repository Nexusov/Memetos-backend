module.exports = {
  extends: ['plugin:@typescript-eslint/recommended', 'eslint-config-semistandard'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,

  globals: {
    NodeJS: true
  }
};
