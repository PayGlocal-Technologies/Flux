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
    // Real dependencies, deliberately not inlined. Both consuming apps already
    // depend on dnd-kit directly, so bundling a copy here would ship two in
    // every app bundle — and two DndContext module instances is the kind of
    // thing that breaks only in the app, never in the library's own tests.
    "@dnd-kit/core",
    "@dnd-kit/sortable",
    "@dnd-kit/utilities",
  ],
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
