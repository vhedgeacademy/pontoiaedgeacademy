const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  // Hard isolation: os testes do frontend vivem em frontend/tests — o root
  // legado "../tests/frontend" foi removido junto com o diretório na raiz.
  roots: ["<rootDir>"],
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
