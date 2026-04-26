module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Берём только *.test.ts — иначе jest по дефолту цепляет файлы вида
  // `test.ts` / `test.js`, которые в этом репо являются ad-hoc скриптами,
  // а не тестами (src/commands/test, src/integrations/google, …).
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  // Manual probes, требуют живой сети/Mongo. CLAUDE.md: «leave them alone».
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/marketApi/binance/api/getAllTicks\\.test\\.ts$',
    '/src/marketApi/binance/api/tradeByHistory/tradeByHistory\\.test\\.ts$',
  ],
}
