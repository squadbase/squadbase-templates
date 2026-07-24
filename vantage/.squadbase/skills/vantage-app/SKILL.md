---
name: vantage-app
description: Vantage(@squadbase/vantage)ダッシュボードアプリの新規作成と、index.tsx 1ファイルの SPA から server/api・ネストレイアウト・動的ルート・404/error を備えた fullstack への拡張手順。Vantage アプリを一から作る/構成を広げるとき、ルーティング規約や definePage の書き方に迷ったときに使う。
---

# Vantage アプリの作成と fullstack 拡張

Vantage は設定ファイル不要(config-free)な React ダッシュボードフレームワーク。アプリ作者が
書くのは `index.tsx`(と任意の追加ファイル)だけで、Vite・ルーティング・TanStack Query・
Tailwind・UI キット・開発サーバー・API サーバー・ビルドはすべて Vantage が所有する。

このスキルは「アプリを一から作る」「最小の SPA を fullstack に広げる」ワークフローを扱う。
個別のページ/API/UI の追加は `vantage-add-feature` スキル、実装中に踏みやすい落とし穴は
`vantage-pitfalls` スキルを参照。

## 大原則(先に頭に入れる)

- **設定ファイルを作らない。** `vite.config.*`・`tailwind.config.*`・`postcss.config.*`・
  `components.json`・`vantage.config.*` はすべて禁止。存在すると `vantage check` がエラーにする。
  設定は「ファイル名の規約」で表現する。
- **import は必ず `@squadbase/vantage` のサブパス経由。** `@tanstack/*`・`@base-ui/react`・
  `echarts`・`hono`・`vite`・`tailwindcss` を直接 import しない。`lucide-react` のアイコンだけは
  直接 import してよい。
- **`.vantage/` と `dist/` は生成物。** 編集しない・読みにいかない(gitignore 済み)。
- **モジュール間 import はランタイムの `.js` 指定子を使う**(例: `./components/revenue-chart.js`)。
  ソースは `.tsx`/`.ts` でも、相対 import の拡張子は `.js` と書く。ESM の Node 解決に必要。

## サブパスの地図

| import 元 | 提供するもの |
| --- | --- |
| `@squadbase/vantage` | `definePage`(ページ設定) |
| `@squadbase/vantage/router` | `Link`・`Outlet`・`useParams`・`useSearch`・`useNavigate`・`redirect`・`notFound` |
| `@squadbase/vantage/query` | `useQuery`・`useMutation`・`apiFetch`・`apiUrl` ほか TanStack Query の再エクスポート |
| `@squadbase/vantage/ui` | shadcn/ui 系プリミティブ(`Button`・`Loading`・`ErrorState`・`Empty` ほか) |
| `@squadbase/vantage/components` | 複合パーツ(`PageShell`・`DashboardCardPreset`・`DataTablePreset`・`EChart` ほか) |
| `@squadbase/vantage/markdown` | `MarkdownRenderer`(Shiki を隔離するため専用サブパス) |
| `@squadbase/vantage/server` | `ApiContext`・`HttpError`(server/ 側でのみ使う) |

どのコンポーネントがあるか、props が何かは **`vantage docs` で引く**(パッケージ同梱。
`vantage docs` で一覧、`vantage docs button` / `vantage docs parts/data-table` で個別ページ、
`--json` で機械可読)。**props を推測で書かない。** 名前が分からないときは
**`vantage search <やりたいこと>`**(例: `vantage search 期間を選ぶ UI が欲しい`)で探し、
出てきた slug を `vantage docs` に渡す。

## Step 1 — 最小アプリ(SPA モード)

`package.json` と `index.tsx` の2ファイルだけで動く。

`package.json`:

```json
{
  "name": "my-dashboard",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vantage dev",
    "build": "vantage build",
    "preview": "vantage preview",
    "check": "vantage check",
    "routes": "vantage routes"
  },
  "dependencies": {
    "@squadbase/vantage": "^0.1.0",
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  }
}
```

`index.tsx`(ルートのデフォルトエクスポートが `/` ページになる):

```tsx
export default function Dashboard() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
    </main>
  )
}
```

起動と検証:

```bash
pnpm install
pnpm dev      # → http://localhost:5173(HMR)
pnpm check    # 静的診断。エラーがあれば exit 1
pnpm routes   # ページ/API の URL マップ
```

`server/` ディレクトリが無いので、この時点では **SPA モード**(`vantage-manifest.json` の
`mode: "spa"`)。

## Step 2 — ページを足してファイルベースルーティングにする

ルートディレクトリ直下の `.tsx`/`.jsx` がそのままページになる。規約:

| ファイル | ルート |
| --- | --- |
| `index.tsx` | `/` |
| `monthly-analysis.tsx` | `/monthly-analysis` |
| `sales/index.tsx` | `/sales` |
| `sales/[customerId].tsx` | `/sales/:customerId`(動的パラメータ) |
| `_layout.tsx` | そのディレクトリ配下を包むネストレイアウト |
| `_404.tsx` | Not Found ページ |
| `_error.tsx` | ルートが throw したときのエラーページ |

`components/`・`hooks/`・`lib/`・`server/`・`public/` はルート走査の対象外(ページにならない)。

各ページは **デフォルトエクスポートの React コンポーネントが必須**。タイトル等は `definePage`:

```tsx
import { definePage } from "@squadbase/vantage"

export const page = definePage({ title: "Monthly Analysis" })

export default function MonthlyAnalysis() {
  return <main className="p-6">…</main>
}
```

> `page` エクスポートはランタイムでは読まれない。title/description はビルド時に**静的抽出**される
> ので、値はリテラルで書く(変数や関数呼び出しにしない)。

### ネストレイアウトと特殊ページ

`_layout.tsx` は `Outlet` で子ルートを描く:

```tsx
import { Outlet } from "@squadbase/vantage/router"

export default function RootLayout() {
  return (
    <div className="min-h-screen">
      <header>…</header>
      <Outlet />
    </div>
  )
}
```

`_404.tsx` / `_error.tsx` は `ui/` の状態コンポーネントを使うと早い:

```tsx
// _error.tsx
import { ErrorState } from "@squadbase/vantage/ui"
export default function RouteError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error)
  return <ErrorState title="This page failed to render" message={message} />
}
```

### 動的パラメータの「3つの綴り」を必ず同期させる

これは崩すと壊れる不変条件:

- ファイル名 `sales/[customerId].tsx`
- 表示ルート `/sales/:customerId`
- リンク: `to="/sales/$customerId"` + `params={{ customerId }}`

```tsx
import { Link, useParams } from "@squadbase/vantage/router"

// 一覧側のリンク
<Link to="/sales/$customerId" params={{ customerId: row.id }}>{row.name}</Link>

// 詳細ページ側で取り出す
const { customerId } = useParams()
```

## Step 3 — サーバー状態(API を持たない fetch)

外部 API を叩くだけなら `server/` は不要。`@squadbase/vantage/query` の `useQuery` を使う:

```tsx
import { useQuery } from "@squadbase/vantage/query"

const q = useQuery({ queryKey: ["stats"], queryFn: () => fetch("/…").then((r) => r.json()) })
if (q.isPending) return <Loading />
if (q.isError) return <ErrorState message={(q.error as Error).message} />
```

`QueryClient` は Vantage が1つだけ管理する(staleTime 30s・retry 1・refetchOnWindowFocus false)。
挙動を変えたいときはクエリ側のオプションで上書きする(クライアントごと差し替える口は無い)。

## Step 4 — fullstack へ拡張(server/api を足す)

**`server/` ディレクトリを作った瞬間に fullstack モードになる。** `server/api/**` の各ファイルが
API ルートになり、ビルドは client + server バンドル + `mode: "fullstack"` の manifest を出す。

`server/api/monthly-analysis.ts` → `GET /api/monthly-analysis`:

```ts
import type { ApiContext } from "@squadbase/vantage/server"

export async function GET(_ctx: ApiContext) {
  return Response.json({ ok: true })
}
```

- API モジュールは大文字の HTTP メソッド(`GET`/`POST`/`PUT`/`PATCH`/`DELETE`/`OPTIONS`)を
  エクスポートする。それ以外の名前は `INVALID_API_EXPORT` エラー。
- 動的 API も `[id].ts` 記法: `server/api/customers/[id].ts` → `GET /api/customers/:id`。
  `params.id` で取り出す(`noUncheckedIndexedAccess` が効くので `params.id!` 等で narrowing)。
- クライアントに見せたいエラーは `HttpError(status, msg)` を throw する。それ以外の throw は
  ログに記録され汎用の 500 になる。
- **シークレットは `ApiContext.env` にだけ届く**(クライアントには決して届かない)。

クライアント側からは `apiFetch` で同一オリジンの `/api/*` を叩く:

```tsx
import { apiFetch, useQuery } from "@squadbase/vantage/query"

const q = useQuery({
  queryKey: ["customer", customerId],
  queryFn: async () => {
    const res = await apiFetch(`/api/customers/${customerId}`)
    if (!res.ok) throw new Error(`Customer ${customerId} not found`)
    return res.json()
  },
})
```

### server/ とクライアントの境界(絶対に守る)

- **クライアントコードは `server/` を import してはならない。** 共有したいコードは `lib/` に置く。
  違反は `CLIENT_IMPORTS_SERVER` エラー(静的にもビルド時にも弾かれる)。
- サーバー専用のデータ/ヘルパは `server/utils.ts` などに置き、`server/api/**` からのみ import する。

## Step 5 — 環境変数

- **クライアントに届くのは `PUBLIC_` 接頭辞の付いた env のみ**。`import.meta.env.PUBLIC_FOO`。
  `VITE_` 系の API は無い。それ以外を `import.meta.env` で読むと `PUBLIC_ENV_MISUSE` 警告。
- サーバー側のシークレットは `ApiContext.env.MY_SECRET` で読む(`server/` 内のみ)。

## Step 6 — 検証・ビルド・プレビュー

```bash
pnpm check     # 静的診断(禁止ファイル・ルート衝突・境界・API export・env 誤用)
pnpm routes    # ページ + API の URL マップを確認
pnpm build     # dist/ に client(+ server)+ vantage-manifest.json
pnpm preview   # 本番ビルドをローカル実行(fullstack:4173 / spa は Vite preview)
```

`vantage-manifest.json` の `mode` は `server/` の有無から自動で決まる(手で書かない)。
デプロイまでの詳細は別途デプロイ手順を参照。

## 詰まったら

- `console.*` とランタイムエラーは開発ターミナルに `[browser:…]` として転送される。
- `vantage check --json` / `vantage routes --json` はエージェント向けの機械可読出力。
- 規約や props を確かめたいときは `vantage docs <name>`(ガイドは `vantage docs routing` など、
  一覧は `vantage docs`)。名前が思い出せないときは `vantage search <やりたいこと>`、
  綴りを横断で確かめたいときは `vantage search "<regex>" --regex`。
- Base UI(≠ Radix)固有の罠、`SelectValue` の挙動、EChart のテーマ非追従などは
  `vantage-pitfalls` スキルにまとまっている。
