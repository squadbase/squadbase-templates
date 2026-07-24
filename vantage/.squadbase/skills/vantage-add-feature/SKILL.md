---
name: vantage-add-feature
description: 既存の Vantage(@squadbase/vantage)アプリにページ・API エンドポイント・UI コンポーネント・ブロックを追加する定型ワークフロー。vantage add コマンドで雛形を出し、規約(動的パラメータの綴り・server 境界・大文字メソッド)を守り、vantage check / routes で確認するまでの一連。Vantage アプリに機能を1つ足すときに使う。
---

# Vantage への機能追加(page / api / ui / block)

既存の Vantage アプリに要素を1つ追加するときの定型手順。アプリの新規作成や fullstack 化の
全体像は `vantage-app` スキル、実装で踏みやすい罠は `vantage-pitfalls` スキルを参照。

CLI は雛形を出すだけで、規約の遵守はこちらの責任。**追加したら必ず `vantage check` と
`vantage routes` で確認する**。

## `vantage add` の4種別

```bash
vantage add page  <name>    # ルートページ(.tsx)
vantage add api   <name>    # server/api/**.ts の API モジュール
vantage add ui    <name>    # registry から UI ソースを components/ui/ にコピー
vantage add block <name>    # registry からブロックを components/blocks/ にコピー
```

`--force` で既存ファイルを上書き。`add` の雛形は import に `@squadbase/vantage` を焼き込む。

## ページを追加する

```bash
vantage add page monthly-analysis        # → ./monthly-analysis.tsx  → ルート /monthly-analysis
vantage add page sales/index             # → ./sales/index.tsx       → ルート /sales
vantage add page "sales/[customerId]"    # → 動的ルート /sales/:customerId
```

出力される雛形は `definePage` + デフォルトエクスポートのコンポーネント。ファイル名の規約:

| ファイル | ルート | 用途 |
| --- | --- | --- |
| `foo.tsx` | `/foo` | 通常ページ |
| `foo/index.tsx` | `/foo` | ディレクトリのインデックス |
| `foo/[id].tsx` | `/foo/:id` | 動的パラメータ |
| `_layout.tsx` | — | 配下を包むネストレイアウト(`Outlet` を描く) |
| `_404.tsx` / `_error.tsx` | — | Not Found / エラーページ |

チェックリスト:

1. **デフォルトエクスポートは必須**(無いと `MISSING_DEFAULT_EXPORT` エラー)。
2. `definePage({ title })` の値は**リテラル**で書く(ビルド時に静的抽出されるため)。
3. 動的ページなら **3つの綴りを同期**:
   - ファイル `foo/[id].tsx`
   - 表示ルート `/foo/:id`
   - リンク `to="/foo/$id"` + `params={{ id }}`、取り出しは `const { id } = useParams()`
4. `components/`・`hooks/`・`lib/`・`server/`・`public/` はページにならない(ルート走査対象外)。

## API を追加する(fullstack)

```bash
vantage add api monthly-analysis     # → server/api/monthly-analysis.ts → GET /api/monthly-analysis
vantage add api "customers/[id]"     # → server/api/customers/[id].ts   → GET /api/customers/:id
```

**`server/` を作った時点でアプリは fullstack モードに切り替わる**(SPA → fullstack)。
雛形は `GET` ハンドラ:

```ts
import type { ApiContext } from "@squadbase/vantage/server"

export async function GET({ request, params }: ApiContext) {
  return Response.json({ ok: true, params })
}
```

チェックリスト:

1. **エクスポート名は大文字の HTTP メソッド**のみ(`GET`/`POST`/`PUT`/`PATCH`/`DELETE`/`OPTIONS`)。
   他の名前は `INVALID_API_EXPORT` エラー。
2. `ApiContext` は Web 標準ベース: `request`(`Request`)・`params`・`env`・`waitUntil`。
3. 動的パラメータは `params.id`。`noUncheckedIndexedAccess` が効くので `params.id!` などで narrowing。
4. **クライアントに見せるエラーは `HttpError(status, msg)` を throw**。それ以外の throw は
   500 に丸められログに出る。
   ```ts
   import { HttpError, type ApiContext } from "@squadbase/vantage/server"
   export async function GET({ params }: ApiContext) {
     const row = findCustomer(params.id!)
     if (!row) throw new HttpError(404, `Customer ${params.id} not found`)
     return Response.json(row)
   }
   ```
5. **シークレットは `ctx.env` からのみ**読む。クライアントには決して渡さない。
6. サーバー専用の共有コードは `server/utils.ts` 等に置く。**クライアントから `server/` を
   import しない**(`CLIENT_IMPORTS_SERVER` エラー。共有は `lib/` に置く)。

クライアント側から叩くときは `apiFetch`:

```tsx
import { apiFetch, useQuery } from "@squadbase/vantage/query"
const q = useQuery({
  queryKey: ["customer", id],
  queryFn: async () => {
    const res = await apiFetch(`/api/customers/${id}`)
    if (!res.ok) throw new Error("not found")
    return res.json()
  },
})
```

## UI コンポーネント / ブロックを追加する

```bash
vantage add ui data-table       # → components/ui/data-table.tsx(編集可能なソースをコピー)
vantage add block sales-overview # → components/blocks/sales-overview.tsx
```

- **多くの UI コンポーネントは「import 専用」で、`add ui` でコピーできる名前は限られる。**
  現在 registry からコピー可能なのは `data-table`(ui)と `sales-overview`(block)のみ。
  未知の名前を渡すと利用可能な名前一覧を出して失敗する。
- コピーが要らない大半のプリミティブは `@squadbase/vantage/ui` から、複合パーツは
  `@squadbase/vantage/components` から**そのまま import**するのが基本(コピー不要)。
  ```tsx
  import { Button, Loading, ErrorState } from "@squadbase/vantage/ui"
  import { DashboardCardPreset, DataTablePreset, EChart } from "@squadbase/vantage/components"
  ```
- コピーしたソースの相対 import は**ランタイムの `.js` 指定子**で書く(`./cn.js` など)。
- **props は `vantage docs <name>` で確認してから書く**(`vantage docs button`・
  `vantage docs parts/data-table`。名前が分からなければ `vantage search <やりたいこと>` で
  探してから `vantage docs` に渡す)。

## 追加後に必ず確認する

```bash
vantage routes    # 追加したページ/API が意図した URL に出ているか
vantage check     # 規約違反が無いか(exit 1 ならエラーあり)
vantage dev       # 実際に動くか(console は開発ターミナルに [browser:…] で転送)
```

エージェントで自動処理するなら機械可読出力を使う:

```bash
vantage routes --json   # { pages, layouts, notFound, error, apis, hasServer }
vantage check --json    # { ok, errorCount, warningCount, diagnostics[] }
```

`vantage check` が出しうる診断コード(参考):

| code | 意味 |
| --- | --- |
| `FORBIDDEN_FILE` | `vite.config.*` などの禁止設定ファイルがある |
| `ROUTE_CONFLICT` | 同じルートを指すファイルが複数ある |
| `MISSING_DEFAULT_EXPORT` | ページ/レイアウトにデフォルトエクスポートが無い |
| `INVALID_API_EXPORT` | API モジュールが大文字メソッド以外をエクスポート |
| `CLIENT_IMPORTS_SERVER` | クライアントが `server/` を import している |
| `PUBLIC_ENV_MISUSE`(warn) | `PUBLIC_*` 以外の env をクライアントで読んでいる |
