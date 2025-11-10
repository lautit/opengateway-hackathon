import { defineConfig } from "tsdown";
import path from "path";

export default defineConfig({
  entry: ["./endpoints/api/checkpoint.ts"],
  format: "esm",
  platform: "node",
  outDir: ".vercel/output/functions/api.func",
  alias: {
    $: path.resolve(import.meta.dirname, "./endpoints"),
    "&": path.resolve(import.meta.dirname, "./lib"),
  },
  dts: {
    oxc: true,
  },
});
