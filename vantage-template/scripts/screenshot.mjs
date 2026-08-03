#!/usr/bin/env node
import { join } from "node:path";
import { spawn } from "node:child_process";
import { parseArgs } from "node:util";
import { chromium } from "playwright";
import {
  setupDev,
  listUiTemplateNames,
  uiTemplatesDir,
  devDir,
  vantageBin,
} from "./dev-setup.mjs";

// These two shapes are the contract with the Squadbase gallery — `list --json`
// points at them by name, so both the filenames and the pixel sizes are fixed.
const SHOTS = [
  { file: "preview-wide.png", width: 1600, height: 900 },
  { file: "preview-square.png", width: 1200, height: 1200 },
];

const PORT = 5273;
const URL = `http://localhost:${PORT}/`;
const READY_TIMEOUT_MS = 60_000;
const CHART_WAIT_MS = 1500;

const { positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
});

const names = positionals.length > 0 ? positionals : listUiTemplateNames();

const results = [];

for (const name of names) {
  console.log(`\n▶ ${name}`);
  let devProc;
  try {
    setupDev(name);

    // Spawn the binary directly, not through `npx`: the npm wrapper does not
    // forward SIGTERM, so the dev server would outlive the template it was
    // started for and hold the port against the next one.
    devProc = spawn(
      vantageBin(),
      ["dev", "--no-overlay", "--port", String(PORT), "--strict-port"],
      { cwd: devDir, stdio: ["ignore", "pipe", "pipe"] },
    );

    await waitForReady(devProc);

    const browser = await chromium.launch();
    for (const shot of SHOTS) {
      const context = await browser.newContext({
        viewport: { width: shot.width, height: shot.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();

      await page.goto(URL, { waitUntil: "networkidle", timeout: 30_000 });
      await assertNotFallback(page);
      await page.waitForSelector("canvas", { timeout: 10_000 }).catch(() => {});
      await page.waitForTimeout(CHART_WAIT_MS);

      const outPath = join(uiTemplatesDir, name, shot.file);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`  ✓ ${shot.file} (${shot.width}x${shot.height})`);

      await context.close();
    }
    await browser.close();
    results.push({ name, ok: true });
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
    results.push({ name, ok: false, error: err.message });
  } finally {
    if (devProc && devProc.exitCode === null) {
      await stopProcess(devProc);
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

/**
 * A page Vantage failed to pick up still renders — as the base template's 404 —
 * so the screenshot would silently succeed and ship a "Page not found" preview.
 * Fail the template instead.
 */
async function assertNotFallback(page) {
  const notFound = await page
    .getByText("404 — Page not found")
    .count()
    .catch(() => 0);
  if (notFound > 0) {
    throw new Error(
      "/ rendered the 404 page — Vantage did not pick up src/index.tsx",
    );
  }
}

function waitForReady(proc) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(
        new Error(`vantage dev did not become ready within ${READY_TIMEOUT_MS}ms`),
      );
    }, READY_TIMEOUT_MS);

    const onStdout = (chunk) => {
      const text = chunk.toString();
      // Terminate the chunk so our own "✓ …" lines never get glued onto — and
      // hidden behind — the last, newline-less line of the dev server's output.
      const prefixed = text.replace(/^/gm, "    [vantage] ");
      process.stdout.write(prefixed.endsWith("\n") ? prefixed : `${prefixed}\n`);
      if (text.includes(`localhost:${PORT}`)) {
        cleanup();
        resolve();
      }
    };
    const onStderr = (chunk) => {
      process.stderr.write(chunk.toString().replace(/^/gm, "    [vantage!] "));
    };
    const onExit = (code) => {
      cleanup();
      reject(new Error(`vantage dev exited before ready (code ${code})`));
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
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      clearTimeout(kill);
      clearTimeout(giveUp);
      resolve();
    };

    proc.once("exit", done);
    proc.kill("SIGTERM");
    const kill = setTimeout(() => proc.kill("SIGKILL"), 3_000);
    // Never let a child that refuses to die stall the remaining templates —
    // the port check on the next spawn will surface it as a real failure.
    const giveUp = setTimeout(done, 8_000);
  });
}
