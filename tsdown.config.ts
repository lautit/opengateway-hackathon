import { defineConfig } from "tsdown";
import path from "path";

export default defineConfig({
  entry: ["./endpoints/api/checkpoint.ts"],
  format: "esm",
  platform: "node",
  outDir: "/api",
  alias: {
    $: path.resolve(import.meta.dirname, "./endpoints"),
    "&": path.resolve(import.meta.dirname, "./lib"),
  },
  dts: {
    oxc: true,
  },
});
