module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true // Allows for the parsing of JSX
    },
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'unused-imports',
    'simple-import-sort'
  ],
  extends: ['standard-with-typescript'],
  rules: {
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'unused-imports/no-unused-imports': 'warn',
    'no-return-assign': 'off',
    'no-continue': 'off',
    'no-plusplus': 'off',
    'no-await-in-loop': 'off',
    'linebreak-style': 'off',
    'max-len': ['error', { code: 128 }],
    'class-methods-use-this': 0,
    'no-underscore-dangle': 0,
    'no-use-before-define': 0,
    'prefer-promise-reject-errors': 'off',
    'no-undef': 0,
    'no-nested-ternary': 0,
    'no-unused-expressions': 0,
    'no-new': 0,
    'consistent-return': 0,
    'no-restricted-syntax': [
      'error',
      'ForOfStatement',
      'LabeledStatement',
      'WithStatement'
    ],
    'arrow-body-style': 0,
    'no-eval': 0,
    'no-loop-func': 0,
    'no-param-reassign': 0,
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/no-floating-promises': 0,
    '@typescript-eslint/no-unused-vars': 'warn',
  },
  overrides: [
    {
      files: [
        './src/app.ts'
      ],
      rules: {
        'import/first': 0
      }
    }
  ]
}
