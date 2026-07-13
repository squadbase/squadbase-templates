---
name: project-storage
description: Access Project Storage (uploaded files) from dashboard React components via @squadbase/react useStorage() — list files, embed images / video / PDFs and other files, and upload or manage files from the browser. Read when a page or component needs to display, embed, or upload files held in the project's upload storage.
---

# Project Storage (browser)

Access the project's **upload storage** from React components via `@squadbase/react`. This is the browser / client side. Reading or writing storage from server logic is a different API and is **not** covered here.

Works automatically inside a Squadbase-hosted app — no credentials, setup, or configuration are needed.

## Access

```tsx
import { useStorage } from "@squadbase/react";

const storage = useStorage();
// all calls live under storage.uploads.*
```

`useStorage()` returns a stable client — safe to call at the top of any component and to use inside `useQuery` / `useMutation`.

## API

All methods are async. `key` is a **relative** path within the project's upload storage (e.g. `reports/2025-q1.pdf`) — no leading slash.

Reads:

- `list(prefix?, options?)` → `{ objects, commonPrefixes, nextCursor? }`. `objects: { key, size, lastModified }[]`. Pass `options.delimiter = "/"` for a folder-style listing (sub-folders come back in `commonPrefixes`); omit it for a flat recursive list. `options.limit` / `options.cursor` paginate (`cursor` = the previous `nextCursor`).
- `head(key)` → `{ key, size, contentType, createdAt }`. Metadata only, no body.
- `getUrl(key)` → `{ url, expiresAt }`. A temporary URL for embedding the file. Re-fetch before `expiresAt`.
- `get(key)` → raw `Response`. Read the body with `.json()` / `.text()` / `.blob()` / `.arrayBuffer()`.

Writes:

- `put(key, data, options?)` → `void`. `data`: `Blob` (incl. `File`), `ArrayBuffer`, `Uint8Array`, or `string`. `options.contentType` defaults to `application/octet-stream` — set it for files you will embed later.
- `delete(key)` → `void`.
- `copy(srcKey, destKey, options?)` / `move(srcKey, destKey, options?)` → `void`. `options.overwrite` — when omitted, an existing destination is overwritten.

## Patterns

### List files

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ["storage", "list", prefix],
  queryFn: () => storage.uploads.list(prefix, { delimiter: "/" }),
});
```

- Folder UI: render `data.commonPrefixes` as folders and `data.objects` as files.
- Flat list of everything under a prefix: omit `delimiter`.

### Embed an image / video / PDF

Embedding needs a URL, so use `getUrl`. The URL expires, so re-fetch it before `expiresAt` — a small hook keeps it fresh:

```tsx
function useStorageUrl(key: string) {
  const storage = useStorage();
  return useQuery({
    queryKey: ["storage", "url", key],
    queryFn: () => storage.uploads.getUrl(key),
    refetchInterval: (q) => {
      const expiresAt = q.state.data?.expiresAt;
      if (!expiresAt) return false;
      // refresh 60s before expiry
      return Math.max(0, new Date(expiresAt).getTime() - Date.now() - 60_000);
    },
  });
}
```

```tsx
const { data } = useStorageUrl("reports/cover.png");
if (!data) return <Skeleton className="h-48 w-full" />;
return <img src={data.url} alt="" className="..." />;
// <video src={data.url} controls /> for video, <iframe src={data.url} /> for PDFs
```

### Read file contents in JS

```tsx
const { data } = useQuery({
  queryKey: ["storage", "content", key],
  queryFn: async () => {
    const res = await storage.uploads.get(key);
    return (await res.json()) as MyType; // or res.text()
  },
});
```

### Upload a file

```tsx
const queryClient = useQueryClient();
const upload = useMutation({
  mutationFn: (file: File) =>
    storage.uploads.put(`uploads/${file.name}`, file, { contentType: file.type }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["storage", "list"] }),
});

<input
  type="file"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) upload.mutate(file);
  }}
/>;
```

- Pass the `File` straight to `put`. Set `contentType: file.type` so the file embeds correctly later.

### Delete / copy / move

```tsx
await storage.uploads.delete(key);
await storage.uploads.move(oldKey, newKey);
```

Invalidate the relevant `["storage", "list", ...]` queries after any write so the UI reflects the change.

## Loading / error guards

- `if (isLoading) return <Skeleton className="..." />;`
- `if (error) return <p className="text-destructive">{error.message}</p>;`
- Guard `data` before `.map()` / `.length` — list calls can resolve to empty results.

## Gotchas

- **`getUrl` URLs are short-lived.** Don't persist a `getUrl` result or put it in a long-lived cache; re-fetch before `expiresAt` (see the hook above).
- **Keys are relative** paths within the project's upload storage — no leading slash.
- **`put` contentType** defaults to `application/octet-stream`; set it explicitly for anything you will embed (images, video, PDF) or the browser may not render it.
- **`copy` / `move` overwrite** an existing destination unless you pass `{ overwrite: false }`.

---

## Related skills

- `component-generation` — general component file rules (creation order, data fetching, loading / error guards). This skill assumes those conventions.
