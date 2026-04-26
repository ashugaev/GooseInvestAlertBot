module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Match only *.test.ts — by default jest also picks up plain `test.ts` /
  // `test.js` files which in this repo are ad-hoc scripts, not real tests
  // (src/commands/test, src/integrations/google, ...).
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  // Manual probes, require live network / Mongo. CLAUDE.md: "leave them alone".
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/marketApi/binance/api/getAllTicks\\.test\\.ts$',
    '/src/marketApi/binance/api/tradeByHistory/tradeByHistory\\.test\\.ts$',
  ],
}
