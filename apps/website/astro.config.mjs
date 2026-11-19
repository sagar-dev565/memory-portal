// @ts-check
import { defineConfig } from "astro/config";

// Level 0 — public website. Static output, deploys to any static host.
export default defineConfig({
  site: "https://memoryportal.example",
  output: "static",
});
