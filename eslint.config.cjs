const globals = require("globals");
const eslintPlugin = require("@eslint/js");
const tseslint = require("typescript-eslint");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const reactRefreshPlugin = require("eslint-plugin-react-refresh");
const reactPlugin = require("eslint-plugin-react");
const importPlugin = require("eslint-plugin-import");

module.exports = tseslint.config(
  {
    // Global ignores
    ignores: ["dist/**", "eslint.config.cjs", "vite.config.ts", "vitest.setup.ts"],
  },
  // Configuration for JavaScript files
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...eslintPlugin.configs.recommended.rules,
    },
  },
  // Configuration for TypeScript files
  {
    files: ["**/*.{ts,tsx}"],
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: true,
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        _: "readonly",
        THREE: "readonly",
        window: "readonly",
        document: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        console: "readonly",
        Worker: "readonly",
        URL: "readonly",
        MessageEvent: "readonly",
        ErrorEvent: "readonly",
        self: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        performance: "readonly",
        fetch: "readonly",
        Image: "readonly",
        AudioContext: "readonly",
        PannerNode: "readonly",
        AudioBufferSourceNode: "readonly",
        AudioBuffer: "readonly",
        GainNode: "readonly",
        __THREE_DEVTOOLS_GLOBAL_HOOK__: "readonly",
        CustomEvent: "readonly",
        __REACT_DEVTOOLS_GLOBAL_HOOK__: "readonly",
        AbortController: "readonly",
        MessageChannel: "readonly",
        setImmediate: "readonly",
        matchMedia: "readonly",
        FormData: "readonly",
        navigator: "readonly",
        OffscreenCanvas: "readonly",
        ImageBitmap: "readonly",
        VideoFrame: "readonly",
        WebGLRenderingContext: "readonly",
        XRWebGLBinding: "readonly",
        XRWebGLLayer: "readonly",
        gsap: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-refresh": reactRefreshPlugin,
      import: importPlugin,
    },
    rules: {
      ...eslintPlugin.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "no-unused-vars": "off", // Disable base ESLint no-unused-vars
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "import/no-unresolved": "error",
      "react/prop-types": "off", // Disable prop-types as we use TypeScript
    },
  },
  // Configuration for test files
  {
    files: ["**/*.test.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
  }
);
);
