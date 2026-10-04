import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirrors the `@/*` path in tsconfig.json.
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: [...configDefaults.exclude, "**/.next/**", "**/.agents/**"],
    // Undo vi.stubGlobal / vi.spyOn after every test so files can't leak into each other.
    unstubGlobals: true,
    restoreMocks: true,
  },
});
