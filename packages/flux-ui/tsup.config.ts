import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  // All exports are React client components — tell Next.js App Router that
  // this bundle must be treated as a client module.
  banner: { js: '"use client";' },
  external: [
    "react",
    "react-dom",
    "next",
    "next-themes",
  ],
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
