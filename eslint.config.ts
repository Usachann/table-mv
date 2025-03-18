import eslint from "@eslint/js";
import eslintPluginVue from "eslint-plugin-vue";
import typescriptEslint from "typescript-eslint";

export default typescriptEslint.config(
  {
    ignores: [
      "dist/*",
      "coverage/*",
      ".output/*",
      ".nuxt/*",
      "**/dist",
      "**/node_modules",
      "**/.output",
      "**/.nuxt",
    ],
  },
  {
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      ...eslintPluginVue.configs["flat/recommended"],
    ],
    files: ["**/*.{ts,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
    rules: {
      // place your rules here!
      // For example:
      "@typescript-eslint/no-unused-vars": "error",
      "vue/multi-word-component-names": [
        "error",
        {
          ignores: ["default", "error", "index", "[id]"],
        },
      ],
    },
  }
);
