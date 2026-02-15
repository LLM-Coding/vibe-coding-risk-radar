#!/usr/bin/env node
/* global process */
import puppeteer from "puppeteer";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createServer } from "http";
import handler from "serve-handler";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "../dist");
const distIndexPath = join(distPath, "index.html");

async function prerender() {
  console.log("🚀 Starting prerender...");

  // Read the built index.html
  const originalHtml = readFileSync(distIndexPath, "utf-8");

  // Start a local server for dist/
  const server = createServer((req, res) => {
    return handler(req, res, { public: distPath });
  });

  await new Promise((resolve) => {
    server.listen(8765, () => {
      console.log("📡 Local server started on http://localhost:8765");
      resolve();
    });
  });

  // Launch headless browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Navigate to local server
  await page.goto("http://localhost:8765", {
    waitUntil: "networkidle0",
    timeout: 30000,
  });

  // Wait for React to render
  await page.waitForSelector("#root > *", { timeout: 10000 });

  // Give React a moment to fully hydrate
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 1000)));

  // Get the rendered HTML
  const renderedHtml = await page.content();

  await browser.close();
  server.close();

  // Extract only the <body> content from rendered page
  const bodyMatch = renderedHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) {
    throw new Error("Could not extract body content from rendered page");
  }
  const renderedBody = bodyMatch[1];

  // Replace the original body content with rendered content
  const prerenderedHtml = originalHtml.replace(/<body[^>]*>[\s\S]*<\/body>/i, `<body>${renderedBody}</body>`);

  // Write back to dist/index.html
  writeFileSync(distIndexPath, prerenderedHtml, "utf-8");

  console.log("✅ Prerendering complete. Updated dist/index.html");
}

prerender().catch((err) => {
  console.error("❌ Prerendering failed:", err);
  process.exit(1);
});
