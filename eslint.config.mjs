import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "site/**", "assets/**"]
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        ...globals.browser,
        flatpickr: false,
        bootstrap: false,
        module: false
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": [
        "warn",
        {
          args: "after-used",
          ignoreRestSiblings: true
        }
      ],
      "no-console": "off"
    }
  }
];
