import type { Config } from "jest"

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFiles: [],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  transformIgnorePatterns: ["/node_modules/", "/.next/"],
}

export default config
