# Frontend Patterns Reference

`useChat` hook details. Minimal page: [`../examples/chat-page.tsx`](../examples/chat-page.tsx).

## Hook return values

```tsx
const {
  messages,            // Message[] — conversation log
  input,               // string — current input value
  handleInputChange,   // pass to <Input onChange>
  handleSubmit,        // pass to <form onSubmit>
  isLoading,           // true while response streaming
  error,               // Error | undefined
  setMessages,         // mutate conversation (e.g., clear)
  reload,              // re-send last user message
  stop,                // abort current stream
} = useChat({ api: "/api/server-logic/chat" });
```

## Extra parameters

Use `body` to send extras alongside `messages`:

```tsx
const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: "/api/server-logic/chat",
  body: {
    model: "gpt-4o-mini",
    temperature: 0.7,
  },
});
```

Access in handler via `c.req.json()` — see [`handler-patterns.md`](./handler-patterns.md).

## Error UX

```tsx
{error && (
  <div className="rounded-md bg-destructive/10 p-3 text-destructive">
    <p className="font-medium">{error.message}</p>
    <Button variant="outline" size="sm" onClick={() => reload()}>
      Retry
    </Button>
  </div>
)}
```

`reload()` re-sends last user message — useful for transient network failures.

## Stop / abort

Long generations should expose a stop button:

```tsx
{isLoading && (
  <Button variant="outline" onClick={stop}>
    Stop generating
  </Button>
)}
```

## Clear conversation

```tsx
<Button variant="ghost" onClick={() => setMessages([])}>
  New chat
</Button>
```

## Initial messages

Seed via `initialMessages`:

```tsx
useChat({
  api: "/api/server-logic/chat",
  initialMessages: [
    { id: "intro", role: "assistant", content: "Hi! How can I help?" },
  ],
});
```

## Streaming UI

Each `message.content` is a string that grows as tokens arrive. Render with `whitespace-pre-wrap` to preserve newlines; React reconciliation handles incremental updates — no manual subscription.

For markdown output, pipe `message.content` through `MarkdownRenderer` (`@/components/common/markdown-renderer`). Sanitize first if any part of conversation contains untrusted input.
