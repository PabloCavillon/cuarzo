import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals:     true,
    environment: "node",
    setupFiles:  ["__tests__/setup.ts"],
    include:     ["__tests__/**/*.test.ts"],
    exclude:     ["node_modules/**"],
    clearMocks:  true,
    coverage: {
      provider:  "v8",
      reporter:  ["text", "html", "lcov"],
      include:   ["lib/**", "app/api/**/route.ts", "proxy.ts"],
      exclude:   ["app/generated/**", "**/*.d.ts"],
      thresholds: { lines: 70, functions: 70, branches: 65 },
    },
  },
});
