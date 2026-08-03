## Squadbase の Connection / Query からデータを読む

**`server/api/**` のハンドラが実データを取りにいく唯一の方法**が `@squadbase/vantage-sdk`
(`@squadbase/vantage-sdk/server` の `connection`)。資格情報・接続先・SQL は Squadbase 側の
**Connection** と **Query** が持ち、ハンドラは「どの Query を、どの引数で回すか」だけを知る。

### 追加の不変条件

- **`server/` からデータを読むときは `connection` を使う。** ハンドラに SQL・接続文字列・
  DB クライアント・上流サービスの URL や API キーを書かない。データソース用のライブラリを
  `package.json` に足すのも不要(足す前に、その接続が Connection にできないか疑う)。
- **`connection` は `server/` の中でしか呼べない。** クライアントから import すると
  `CLIENT_IMPORTS_SERVER` エラー(フレームワーク側の不変条件と同じ)。
- **CONNECTION_ID / QUERY_ID を推測で埋めない。** 値はアプリを動かす Squadbase プロジェクト側の
  設定なので、分からなければユーザーに聞く。実データがまだ無い段階は `lib/mock-data.ts` の
  モックで進め、id が確定したらハンドラだけ差し替える(クライアントの `useApiQuery` は変わらない)。

### 追加の import サブパス

| import 元 | 提供するもの |
| --- | --- |
| `@squadbase/vantage-sdk/server` | `connection`(Connection の宛先と認証を解決する。server/ 側でのみ使う) |

### 使い方

`connection(ctx, connectionId)` は**宛先(`baseUrl`)と認証ヘッダー(`headers`)を解決するだけ**で、
リクエストは自分で `fetch` する。

```ts
import type { ApiContext } from "@squadbase/vantage/server"
import { HttpError } from "@squadbase/vantage/server"
import { connection } from "@squadbase/vantage-sdk/server"

const CONNECTION_ID = "..."
const QUERY_ID = "..."

export async function GET(ctx: ApiContext) {
  const { baseUrl, headers } = await connection(ctx, CONNECTION_ID)

  const res = await fetch(`${baseUrl}/queries/${QUERY_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ params: {} }),
  })
  if (!res.ok) throw new HttpError(502, `query execution failed: ${res.status}`)

  const { columns, rows } = await res.json()
  return Response.json({ columns, rows })
}
```

- **`ctx` をそのまま渡す。** `connection` が読むのは `ctx.request` と `ctx.env` だけなので、
  `ApiContext` をそのまま渡せる(第 1 引数を自作しない)。
- **`baseUrl` はバージョン接頭辞込み・末尾スラッシュ無し。** そのままパスを繋ぐ。
- **`headers` は必ずスプレッドする**(`{ "Content-Type": "application/json", ...headers }`)。
- **Query は id だけで指す**: `POST {baseUrl}/queries/{queryId}`。Connection は Query 側から
  解決されるので、**パスに connection id を入れない**(`connection` の引数として渡すだけ)。
- **プレビューでもデプロイ済みアプリでも同じコードが動く。** Squadbase の外で走らせると
  `connection` は throw する。

### SQL Query と HTTP Query で body の形が違う

| Query 種別 | リクエスト | レスポンス |
| --- | --- | --- |
| SQL Query | 引数は `{ params: { … } }` に入れる | `{ columns: [{ name, type? }], rows: [{ … }] }` |
| HTTP Query | Query が宣言した形をそのまま(`params` で包まない)。クエリ文字列は URL に載せる | 上流サービスのレスポンスをそのまま通す(非 2xx も来るので `res.ok` を必ず見る) |

```ts
// HTTP Query — クエリ文字列は URL、body は Query の宣言どおり
const res = await fetch(`${baseUrl}/queries/${QUERY_ID}?since=2026-01-01`, {
  method: "POST",
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify({ customerId: "c_123" }),
})
```
