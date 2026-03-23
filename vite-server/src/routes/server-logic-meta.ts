import { Hono } from "hono";
import { getAllMeta, getMeta } from "../registry.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.json(getAllMeta());
});

app.get("/:slug", (c) => {
  const slug = c.req.param("slug");
  const meta = getMeta(slug);

  if (!meta) {
    return c.json({ error: `Server logic '${slug}' not found` }, 404);
  }

  return c.json(meta);
});

export default app;
