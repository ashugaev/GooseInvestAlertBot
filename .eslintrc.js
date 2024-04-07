module.exports = {
  root: true,
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2023, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    project: './tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    node: true,
  },
  plugins: [
    'unused-imports',
    'simple-import-sort',
    '@typescript-eslint',
    'prettier',
    'import',
    'no-relative-import-paths',
    'eslint-plugin-node',
  ],
  rules: {
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'unused-imports/no-unused-imports': 'warn',
    'no-return-assign': 'off',
    'no-continue': 'off',
    'no-plusplus': 'off',
    'no-await-in-loop': 'off',
    'linebreak-style': 'off',
    'no-constant-condition': 'off',
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
    'node/no-callback-literal': 0,
    'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],
    '@typescript-eslint/semi': ['error', 'never'],
    'arrow-body-style': 0,
    'no-eval': 0,
    'no-loop-func': 0,
    'no-param-reassign': 0,
    'no-floating-promise/no-floating-promise': 0,
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-misused-promises': 0,
    '@typescript-eslint/no-floating-promises': 0,
  },
  overrides: [
    {
      files: ['./src/app.ts'],
      rules: {
        'import/first': 0,
      },
    },
    {
      files: ['jest.config.js'],
      parserOptions: {
        project: './tsconfig.eslint.json',
        disableTypeChecked: true, // отключаем проверку типов для этого файла
      },
    },
  ],
}
