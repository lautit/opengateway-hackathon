import { defineConfig } from "tsdown";
import path from "path";

export default defineConfig({
  entry: ["./endpoints/api/checkpoint.ts"],
  format: "esm",
  platform: "node",
  outDir: ".vercel/output/functions/api.func",
  alias: {
    $: path.resolve(__dirname, "./endpoints"),
    "&": path.resolve(__dirname, "./lib"),
  },
  dts: {
    oxc: true,
  },
});
