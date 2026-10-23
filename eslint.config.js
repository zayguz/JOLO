// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier/flat");
const globals = require("globals");

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    // .claude/ holds other sessions' worktrees, each a full copy of the repo.
    ignores: ["dist/*", "data/*", ".claude/*"],
  },
  {
    // Apostrophes in <Text> are fine in React Native; this rule targets HTML.
    rules: { "react/no-unescaped-entities": "off" },
  },
  {
    files: ["**/__tests__/**", "**/*.test.js"],
    languageOptions: { globals: globals.jest },
  },
]);
