import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  collectCoverage: true,
  rootDir: "./src",
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  testMatch: ["**/**/*.test.ts"],
  setupFiles: ["dotenv/config"],
};

export default config;
