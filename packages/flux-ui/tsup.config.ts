import { defineConfig } from "tsup";

export default defineConfig({
  // Charts are a second entry rather than part of the root barrel: recharts
  // and its d3 dependencies are ~144 KB gzipped, and a module is the smallest
  // unit a bundler can split. Folded into `index`, they shipped to every route
  // of every consuming app that imported so much as a Button.
  entry: ["src/index.ts", "src/charts.ts"],
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
