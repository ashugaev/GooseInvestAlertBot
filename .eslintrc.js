module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
    ecmaFeatures: {
      jsx: true // Allows for the parsing of JSX
    }
  },
  settings: {
    react: {
      version: "latest"
    }
  },
  plugins: [
    '@typescript-eslint',
    'unused-imports',
    'simple-import-sort',
  ],
  extends: ["standard"],
  rules: {
    "react-hooks/exhaustive-deps": "warn",
    "no-return-assign": "off",
    "no-continue": "off",
    "no-plusplus": "off",
    "no-await-in-loop": "off",
    "react/prop-types": "off",
    "react/jsx-one-expression-per-line": "off",
    "linebreak-style": "off",
    "max-len": ["error", { "code": 128 }],
    "class-methods-use-this": 0,
    "no-underscore-dangle": 0,
    "no-use-before-define": 0,
    "prefer-promise-reject-errors": "off",
    "no-undef": 0,
    "no-nested-ternary": 0,
    "no-unused-expressions": 0,
    "no-new": 0,
    "consistent-return": 0,
    "no-restricted-syntax": [
      "error",
      "ForOfStatement",
      "LabeledStatement",
      "WithStatement"
    ],
    "arrow-body-style": 0,
    "no-eval": 0,
    "no-loop-func": 0,
    "no-param-reassign": 0,
    "import/prefer-default-export": 0,
    "react/no-danger": 0,
    "react/prefer-stateless-function": 0,
    "react/no-array-index-key": 0,
    "react/jsx-no-target-blank": 0,
    "react/forbid-prop-types": 0,
    "import/no-extraneous-dependencies": 0,
    "import/no-unresolved": 0,
    "import/extensions": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "@typescript-eslint/no-var-requires": 0
  }
};
