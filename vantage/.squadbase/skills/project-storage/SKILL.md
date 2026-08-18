---
name: project-storage
description: Squadbase の Project Storage(アップロード済みファイル)を @squadbase/react の useStorage() でブラウザから扱う手順。ファイル一覧、画像 / 動画 / PDF の埋め込み、中身の読み取り、アップロードと削除・移動。ページやコンポーネントがアップロード済みファイルを表示・埋め込み・アップロードするときに参照する。
---

# Project Storage(ブラウザ側)

Squadbase の **Project Storage** を React コンポーネントから読み書きする手順。Squadbase 上で
動くアプリでは資格情報も設定も要らず、そのまま動く。サーバー(`server/api/**`)からストレージを
触る API は別物で、ここでは扱わない。

## import は `@squadbase/react` から直接

「import は `@squadbase/vantage` のサブパス経由」はフレームワークが所有するものの話。
**`@squadbase/react` は Squadbase プラットフォームの SDK なので直接 import する**
(`SquadbaseProvider` / `useUser` と同じ)。

```tsx
import { useStorage } from "@squadbase/react"

const storage = useStorage()
// 呼び出しはすべて storage.uploads.* の下
```

`useStorage()` が返すクライアントは安定なので、コンポーネント先頭で呼んで `useQuery` /
`useMutation` の中で使ってよい。データ取得のフックは `@squadbase/vantage/query` から取る
(`@tanstack/*` は直接 import しない)。

## API

すべて async。`key` はストレージ内の**相対**パス(例: `reports/2025-q1.pdf`)で、先頭に
スラッシュを付けない。

読み取り:

- `list(prefix?, options?)` → `{ objects, commonPrefixes, nextCursor? }`。`objects` は
  `{ key, size, lastModified }[]`。`options.delimiter = "/"` でフォルダ表示(サブフォルダが
  `commonPrefixes` に入る)、省略すると再帰的なフラット一覧。`options.limit` / `options.cursor`
  でページング(`cursor` は前回の `nextCursor`)
- `head(key)` → `{ key, size, contentType, createdAt }`。メタ情報だけで本体は取らない
- `getUrl(key)` → `{ url, expiresAt }`。埋め込み用の一時 URL
- `get(key)` → 生の `Response`。`.json()` / `.text()` / `.blob()` / `.arrayBuffer()` で読む

書き込み:

- `put(key, data, options?)` → `void`。`data` は `Blob`(`File` を含む) / `ArrayBuffer` /
  `Uint8Array` / `string`
- `delete(key)` → `void`
- `copy(srcKey, destKey, options?)` / `move(srcKey, destKey, options?)` → `void`

## 一覧を出す

```tsx
import { useStorage } from "@squadbase/react"
import { useQuery } from "@squadbase/vantage/query"

const storage = useStorage()
const { data, isPending, isError } = useQuery({
  queryKey: ["storage", "list", prefix],
  queryFn: () => storage.uploads.list(prefix, { delimiter: "/" }),
})
```

`data.commonPrefixes` をフォルダ、`data.objects` をファイルとして描く。プレフィックス配下を
まとめて出すなら `delimiter` を省く。

## 画像 / 動画 / PDF を埋め込む

埋め込みには URL が要るので `getUrl` を使う。**URL には期限がある**ので、切れる前に取り直す:

```tsx
import { useStorage } from "@squadbase/react"
import { useQuery } from "@squadbase/vantage/query"

function useStorageUrl(key: string) {
  const storage = useStorage()
  return useQuery({
    queryKey: ["storage", "url", key],
    queryFn: () => storage.uploads.getUrl(key),
    refetchInterval: (query) => {
      const expiresAt = query.state.data?.expiresAt
      if (!expiresAt) return false
      // 期限の 60 秒前に取り直す
      return Math.max(0, new Date(expiresAt).getTime() - Date.now() - 60_000)
    },
  })
}
```

```tsx
import { ErrorState, Loading } from "@squadbase/vantage/ui"

const { data, isPending, isError } = useStorageUrl("reports/cover.png")
if (isPending) return <Loading />
if (isError) return <ErrorState message="ファイルを読み込めませんでした" />
return <img src={data.url} alt="" className="w-full rounded-lg" />
```

動画は `<video src={data.url} controls className="w-full rounded-lg" />`、PDF は
`<iframe src={data.url} className="h-[80vh] w-full rounded-lg border border-border" />`。

## 中身を JS で読む

```tsx
const { data } = useQuery({
  queryKey: ["storage", "content", key],
  queryFn: async () => {
    const res = await storage.uploads.get(key)
    return (await res.json()) as Row[] // または res.text()
  },
})
```

## アップロードする

```tsx
import { useStorage } from "@squadbase/react"
import { useMutation, useQueryClient } from "@squadbase/vantage/query"

const storage = useStorage()
const queryClient = useQueryClient()
const upload = useMutation({
  mutationFn: (file: File) =>
    storage.uploads.put(`uploads/${file.name}`, file, { contentType: file.type }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["storage", "list"] }),
})

<input
  type="file"
  onChange={(e) => {
    const file = e.target.files?.[0]
    if (file) upload.mutate(file)
  }}
/>
```

`File` はそのまま `put` に渡す。書き込み後は該当する `["storage", "list", …]` を invalidate して
UI を追従させる。

## 落とし穴

- **`getUrl` の URL は短命。** 結果を永続化したり長寿命のキャッシュに入れたりしない。
  `expiresAt` の前に取り直す(上のフック)。`<img src>` に一度入れて放置すると、開いたままの
  画面で後から読み込まれた分が失敗する
- **`put` の `contentType` の既定は `application/octet-stream`。** 後で埋め込むもの(画像・動画・
  PDF)には `file.type` を必ず渡す。付けないとブラウザが表示せずダウンロードに落ちる
- **`key` は相対パス。** 先頭にスラッシュを付けない。`getUrl` を通さず `<img src="/foo.png">` の
  ような静的パスで参照しない ― ストレージはアプリの `public/` ではない
- **`copy` / `move` は既定で既存の宛先を上書きする。** 残したいときは `{ overwrite: false }`
- **サーバー(`server/api/**`)からは呼ばない。** `useStorage` はブラウザ側の API

---

## 関連スキル

- `vantage-add-feature` — ページ / API / コンポーネントを 1 つ足す手順
- `vantage-pitfalls` — UI・配色・ルーティングの落とし穴
