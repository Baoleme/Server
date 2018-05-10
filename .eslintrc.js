module.exports = {
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 8,
  },
  env: {
    node: true,
    mocha: true
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // add your custom rules here
  rules: {
    'semi': ['warn', 'always'],
    'space-before-function-paren': ['warn', 'always'],
    'object-curly-spacing': ['warn', 'always'],
    // allow paren-less arrow functions
    'arrow-parens': ["error", "as-needed"],
    // no console
    'no-console': 'warn',
    'camelcase': 0
  }
};
