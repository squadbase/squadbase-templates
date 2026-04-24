#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { setupDev, listTemplateNames, root, devDir } from "./dev-setup.mjs";

const VIEWPORT = { width: 1440, height: 900 };
const PORT = 5273;
const URL = `http://localhost:${PORT}/`;
const READY_TIMEOUT_MS = 30_000;
const CHART_WAIT_MS = 1500;

const screenshotsDir = join(root, "screenshots");
mkdirSync(screenshotsDir, { recursive: true });

const argNames = process.argv.slice(2);
const names = argNames.length > 0 ? argNames : listTemplateNames();

const results = [];

for (const name of names) {
  console.log(`\n▶ ${name}`);
  let viteProc;
  try {
    setupDev(name);

    viteProc = spawn(
      "npx",
      ["vite", "--port", String(PORT), "--strictPort"],
      { cwd: devDir, stdio: ["ignore", "pipe", "pipe"] },
    );

    await waitForReady(viteProc);

    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    await page.goto(URL, { waitUntil: "networkidle", timeout: 30_000 });
    await page.waitForSelector("canvas", { timeout: 10_000 }).catch(() => {});
    await page.waitForTimeout(CHART_WAIT_MS);

    const outPath = join(screenshotsDir, `${name}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`  ✓ ${outPath}`);

    const tabPaths = await captureTabs(page, name);
    for (const p of tabPaths) console.log(`  ✓ ${p}`);

    await browser.close();
    results.push({ name, ok: true });
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
    results.push({ name, ok: false, error: err.message });
  } finally {
    if (viteProc && viteProc.exitCode === null) {
      await stopProcess(viteProc);
    }
  }
}

const ok = results.filter((r) => r.ok).length;
const fail = results.length - ok;
console.log(`\n${ok} succeeded, ${fail} failed.`);
if (fail > 0) {
  for (const r of results.filter((r) => !r.ok)) {
    console.log(`  - ${r.name}: ${r.error}`);
  }
  process.exit(1);
}

async function captureTabs(page, name) {
  const tabs = page.locator('[role="tab"]');
  const count = await tabs.count();
  if (count === 0) return [];

  const paths = [];
  for (let i = 0; i < count; i++) {
    const tab = tabs.nth(i);
    const label = ((await tab.textContent()) ?? `tab-${i + 1}`).trim();
    const slug = slugify(label) || `tab-${i + 1}`;

    await tab.click();
    await page.waitForFunction(
      (el) => el.getAttribute("data-state") === "active",
      await tab.elementHandle(),
      { timeout: 5_000 },
    ).catch(() => {});

    await page.evaluate(() => {
      const list = document.querySelector('[role="tablist"]');
      if (list) list.scrollIntoView({ block: "start", behavior: "instant" });
      window.scrollBy(0, -8);
    });

    await page.waitForTimeout(CHART_WAIT_MS);

    const outPath = join(screenshotsDir, `${name}--${i + 1}-${slug}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    paths.push(outPath);
  }
  return paths;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function waitForReady(proc) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`vite did not become ready within ${READY_TIMEOUT_MS}ms`));
    }, READY_TIMEOUT_MS);

    const onStdout = (chunk) => {
      const text = chunk.toString();
      process.stdout.write(text.replace(/^/gm, "    [vite] "));
      if (text.includes(`localhost:${PORT}`)) {
        cleanup();
        resolve();
      }
    };
    const onStderr = (chunk) => {
      process.stderr.write(chunk.toString().replace(/^/gm, "    [vite!] "));
    };
    const onExit = (code) => {
      cleanup();
      reject(new Error(`vite exited before ready (code ${code})`));
    };

    function cleanup() {
      clearTimeout(timer);
      proc.stdout.off("data", onStdout);
      proc.stderr.off("data", onStderr);
      proc.off("exit", onExit);
    }

    proc.stdout.on("data", onStdout);
    proc.stderr.on("data", onStderr);
    proc.on("exit", onExit);
  });
}

function stopProcess(proc) {
  return new Promise((resolve) => {
    proc.once("exit", () => resolve());
    proc.kill("SIGTERM");
    setTimeout(() => {
      if (proc.exitCode === null) proc.kill("SIGKILL");
    }, 5_000);
  });
}
