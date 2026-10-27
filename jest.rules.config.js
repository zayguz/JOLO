// Firestore security rules tests. They need the Firestore emulator, so run them
// with `npm run test:rules`, which starts it, rather than plain `jest`.
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/rules/**/*.test.js"],
  modulePathIgnorePatterns: ["<rootDir>/.claude/", "<rootDir>/ios/", "<rootDir>/android/"],
};
