import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  {
    ignores: ['dist/', '.astro/', 'node_modules/', 'playwright-report/', 'test-results/'],
  },
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      // Project-wide relaxations can go here as the codebase grows.
    },
  },
];
