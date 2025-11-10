import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "&": path.resolve(__dirname, "./lib"),
    },
  },
  build: {
    outDir: ".vercel/output/static",
    assetsDir: "assets",
    sourcemap: false,
    emptyOutDir: true,
  },
});
