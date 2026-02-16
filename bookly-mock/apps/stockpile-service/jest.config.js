module.exports = {
  displayName: "stockpile-service",
  preset: "../../jest.preset.js",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/apps/stockpile-service",
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!src/**/*.spec.ts",
    "!src/**/*.interface.ts",
    "!src/**/*.dto.ts",
    "!src/**/*.entity.ts",
    "!src/**/*.schema.ts",
    "!src/main.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    "^@libs/(.*)$": "<rootDir>/../../libs/$1/src",
    "^@stockpile/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["<rootDir>/test/**/*.spec.ts", "<rootDir>/src/**/*.spec.ts"],
};
