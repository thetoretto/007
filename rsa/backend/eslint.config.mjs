import globals from "globals";
import js from "@eslint/js";

export default [
  // Apply ESLint's recommended configurations globally first.
  // This includes rules for ECMAScript 'latest', sourceType 'module',
  // and globals for browser, node, and es2021.
  // We will override some of these for specific file types below.
  js.configs.recommended,
  {
    // Configuration for all JavaScript files (CommonJS by default in this project)
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node, // Use Node.js globals
      },
      ecmaVersion: 2022, // Or a more recent version like 2023 or 'latest'
      sourceType: "commonjs", // Explicitly set to CommonJS for .js files
    },
    // You can add or override rules specific to your .js files here
    rules: {
      // Example: warn about unused variables instead of erroring
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      // Example: allow console.log for now, common in Node.js scripts/apps
      "no-console": "off", 
      // Add other project-specific rules or overrides
    },
  },
  {
    // Configuration for the ESLint config file itself (eslint.config.mjs)
    // This file is an ES module.
    files: ["eslint.config.mjs"],
    languageOptions: {
      globals: {
        ...globals.node, // It runs in a Node.js environment
      },
      ecmaVersion: 2022,
      sourceType: "module", // This file uses ES module syntax
    },
    rules: {
      // Specific rules for the config file, if any
    }
  },
  {
    // Ignores node_modules and other build/dist folders by default with flat config.
    // If you have other specific directories to ignore, add them here:
    ignores: [
      // "dist/",
      // "coverage/",
      // "**/old_code_to_ignore/"
    ]
  }
];
