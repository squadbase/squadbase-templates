import { Hono } from "hono";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

const app = new Hono();

function getPageList() {
  if (!fs.existsSync(DATA_DIR)) return [];
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  const pages = files.map((file) => {
    const name = path.basename(file, ".json");
    const urlPath = name === "home" ? "/" : "/" + name.replace(/-/g, "/");
    let title =
      name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");
    try {
      const raw = JSON.parse(
        fs.readFileSync(path.join(DATA_DIR, file), "utf-8"),
      );
      const puckData = raw.pageData || raw;
      if (puckData?.root?.props?.title) {
        title = puckData.root.props.title;
      }
    } catch {
      /* ignore */
    }
    return { name, path: urlPath, title };
  });
  pages.sort((a, b) => {
    if (a.name === "home") return -1;
    if (b.name === "home") return 1;
    return a.name.localeCompare(b.name);
  });
  return pages;
}

// GET /pages → [{ name, path, title }]
app.get("/pages", (c) => c.json(getPageList()));

// GET /page-data?page=<name> → { pageData, runtimeData }
app.get("/page-data", (c) => {
  const page = c.req.query("page") || "home";
  const safePage = page.replace(/[^a-zA-Z0-9-_]/g, "");
  const filePath = path.join(DATA_DIR, `${safePage}.json`);
  if (!fs.existsSync(filePath)) return c.json({ error: "not found" }, 404);
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (raw.pageData) {
      return c.json({
        runtimeData: raw.runtimeData || { queries: [] },
        pageData: raw.pageData,
      });
    }
    return c.json({ runtimeData: { queries: [] }, pageData: raw });
  } catch {
    return c.json({ error: "Failed to parse file" }, 500);
  }
});

// GET /runtime-data?page=<name> → { queries: [] }
app.get("/runtime-data", (c) => {
  const page = c.req.query("page") || "home";
  const safePage = page.replace(/[^a-zA-Z0-9-_]/g, "");
  const filePath = path.join(DATA_DIR, `${safePage}.json`);
  if (!fs.existsSync(filePath)) return c.json({ queries: [] });
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return c.json(raw.runtimeData || { queries: [] });
  } catch {
    return c.json({ queries: [] });
  }
});

export default app;
