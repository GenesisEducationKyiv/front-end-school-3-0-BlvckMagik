import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";

export default [
  eslint.configs.recommended,
  {
    ignores: [
      "next.config.js", 
      "*.config.js", 
      "node_modules/**", 
      ".next/**",
      "dist/**",
      "build/**"
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: "readonly",
        console: "readonly",
        window: "readonly",
        document: "readonly",
        process: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        module: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Use strictTypeChecked rules as base - these include all the rules we had manually
      ...tseslint.configs["strict-type-checked"].rules,
      
      // Custom overrides for project-specific preferences
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/prefer-readonly-parameter-types": "off",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      
      // Adjust for React/Next.js patterns
      "@typescript-eslint/no-confusing-void-expression": ["error", { 
        "ignoreArrowShorthand": true 
      }],
    },
  },
];
