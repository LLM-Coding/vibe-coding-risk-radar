import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // For GitHub Pages: set VITE_BASE_PATH in the workflow or .env
  // e.g. /vibe-coding-risk-radar/
  base: process.env.VITE_BASE_PATH || "/",
  build: {
    outDir: "dist",
  },
}));
