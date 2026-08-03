# AGENTS.md — Vantage アプリの地図

このファイルは、**Vantage(`@squadbase/vantage`)アプリを作るコーディングエージェント**が
最初に読むための地図です。アプリ作者(= `index.tsx` を書く側)が守るべき規約・不変条件・
最小レシピを 1 ページに集約しています。ここに書かれた規約だけで、最小のダッシュボードアプリを
正しく組めます。

> このファイルは **Vantage フレームワークが所有する正本**のコピーです。手で書き換えても、
> `vantage upgrade` を実行するとフレームワーク同梱の正本から再同期されて上書きされます。
> アプリ固有のメモは別ファイル(例: `README.md`)に書いてください。
>
> 手順を伴う踏み込んだワークフローは、同梱の Claude Code Skill に分かれています。このファイルは
> 「地図」、Skill は「手順書」という役割分担です。**配置済みの Skill を先に探す**手順は
> 末尾の「さらに詳しく(同梱 Skill)」にあります。

## Vantage とは

設定ファイル不要(config-free)な React ダッシュボードフレームワーク。アプリ作者が書くのは
`index.tsx`(と任意の追加ファイル)だけで、Vite・ルーティング・TanStack Query・Tailwind・
UI キット・開発サーバー・API サーバー・ビルドはすべて Vantage が所有します。設定は
「ファイル名の規約」で表現します。

## 不変条件(破ると静かに壊れる)

- **ページは `src/` の中か、プロジェクトルート直下か、どちらか一方。** `src/` があれば走査は
  `src/` だけになり、ルート直下に残した `.tsx` は無視される(`SRC_DIR_SPLIT` エラー)。
  新しいファイルは既にある側に置く(→「ディレクトリ構造」)。
- **設定ファイルを作らない。** `vite.config.*`・`tailwind.config.*`・`postcss.config.*`・
  `components.json`・`vantage.config.*` はすべて禁止。存在すると `vantage check` がエラーにする
  (`FORBIDDEN_FILE`)。テーマ調整は `styles.css` のトークンで行う。
- **import は必ず `@squadbase/vantage` のサブパス経由。** `@tanstack/*`・`@base-ui/react`・
  `echarts`・`hono`・`vite`・`tailwindcss` を直接 import しない。`lucide-react` のアイコンだけは
  直接 import してよい。
- **クライアントコードは `server/` を import してはならない。** 違反は `CLIENT_IMPORTS_SERVER`
  エラー(静的にもビルド時にも弾かれる)。共有したいコードは `lib/` に置く。
- **クライアントに届く env は `PUBLIC_` 接頭辞のものだけ。** `import.meta.env.PUBLIC_FOO`。
  それ以外を `import.meta.env` で読むと `PUBLIC_ENV_MISUSE` 警告。シークレットは
  `ApiContext.env`(server/ 内)にだけ届く。
- **`.vantage/` と `dist/` は生成物。** 編集しない・読みにいかない(gitignore 済み)。任意の CLI
  コマンド、または `vantage upgrade` で再生成される。
- **`definePage` の値はリテラルで書く。** title/description/navLabel はビルド時に静的抽出される
  ため、変数・関数呼び出し・テンプレート補間は使わない。`page` エクスポートはランタイムでは
  読まれない。

## ディレクトリ構造(ページをどこに置くか)

**ページの置き場所は 2 通りあり、`src/` があるかどうかだけで決まる。混ぜてはならない。**

- `src/` が**ある** → ページは `src/` の中だけ。ルート直下に置いた `.tsx` はルートにならず、
  `SRC_DIR_SPLIT` エラーになる。
- `src/` が**無い** → ページはプロジェクトルート直下。

**ファイルを足す前に `src/` の有無を確認し、既にある側に置く**(`ls` するだけでよい)。URL は
どちらでも同じで、`src/` は URL に現れない(`src/sales/index.tsx` → `/sales`)。

```text
root/
├── src/                    # ある場合、ページはこの中だけ(無ければ以下が root 直下)
│   ├── index.tsx           # /
│   ├── monthly-analysis.tsx  # /monthly-analysis
│   ├── sales/index.tsx     # /sales
│   ├── _layout.tsx         # ルートレイアウト
│   ├── components/         # ページ走査の対象外(URL にならない)
│   ├── hooks/  lib/        # 同上
│   └── styles.css          # 任意のグローバル CSS
├── server/                 # 常にプロジェクトルート直下。src/ の中ではない
│   ├── api/…               # /api/*
│   └── utils.ts
├── public/                 # 静的ファイル。常にプロジェクトルート直下
├── package.json            # managed
└── tsconfig.json           # managed
```

- **`server/` と `public/` は常にプロジェクトルート直下。** `src/server/` は決してスキャン
  されない(`SRC_DIR_SPLIT` エラー)。
- **`styles.css` はページと同じ側**に置く(`src/` があれば `src/styles.css`)。
- **ディレクトリ名はそのまま URL のセグメントになる。** `pages/`・`app/`・`utils/` のような
  足場ディレクトリを切ると、その名前が URL に出る(`pages/report.tsx` → `/pages/report`)。
  `SUSPICIOUS_ROUTE_DIR` 警告で知らされる。ページでないモジュールは `components/`・`hooks/`・
  `lib/` に置く ― この 3 つ(と `server/`・`public/`)はどの階層でも走査されない。

## import サブパスの地図

| import 元 | 提供するもの |
| --- | --- |
| `@squadbase/vantage` | `definePage`(ページ設定) |
| `@squadbase/vantage/router` | `Link`・`Outlet`・`useParams`・`useSearch`・`useNavigate`・`redirect`・`notFound`・`useRoutes`・`useCurrentRoute`・`useSearchParam`・`useSearchState` |
| `@squadbase/vantage/query` | `useApiQuery`・`useApiMutation`・`apiJson`・`apiFetch`・`apiUrl`・`ApiError`、ほか `useQuery`/`useMutation` など TanStack Query の再エクスポート |
| `@squadbase/vantage/ui` | shadcn/ui(Base UI バリアント)プリミティブ(`Button`・`Loading`・`ErrorState`・`Empty` ほか) |
| `@squadbase/vantage/components` | 複合パーツ(`PageShell`・`DashboardCardPreset`・`DataTablePreset`・`EChart` ほか) |
| `@squadbase/vantage/markdown` | `MarkdownRenderer`(Shiki を隔離するための専用サブパス) |
| `@squadbase/vantage/server` | `ApiContext`・`ApiHandler`・`HttpError`・`isHttpError`・`json`(server/ 側でのみ使う) |

## モードは 2 つ、切り替えるのは `server/` の有無だけ

`server/` ディレクトリがあれば **fullstack**、無ければ **SPA**。`vantage-manifest.json` の
`mode` はここから自動で決まり、手で書く設定は無い。**SPA から始めて fullstack へ「昇格」する
必要はない** ― テンプレートから始めた場合は最初から `server/` があり、その時点で fullstack。
下の 2 節は段階ではなく、いま自分がどちらにいるかを確かめるための地図として読む。

- `server/` が**ある** → 「API を持つ(fullstack モード)」を見る。データは自前の `/api/*` から
  `useApiQuery` で取る。
- `server/` が**無い** → 「最小アプリ(2 ファイル)」の構成。外部 API を直接叩くなら `useQuery`。
  自前の API が要るようになったら `server/api/*.ts` を足すだけでよい(設定変更は不要)。

## 最小アプリ(2 ファイル)

`package.json` と `index.tsx` の 2 ファイルだけで動く。

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
    "@squadbase/vantage": "^0.5.0",
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

```bash
pnpm install
pnpm dev      # → http://localhost:5173(HMR)
pnpm check    # 静的診断(エラーがあれば exit 1)
pnpm routes   # ページ/API の URL マップ
```

`server/` ディレクトリが無いので、この構成は **SPA モード**。ページを直下に置く形だが、
`src/` を作ってその中に集めてもよい(テンプレートから始めた場合は最初から `src/` がある)。
どちらか一方に寄せること(→「ディレクトリ構造」)。

## ルーティング規約(ファイル名 → ルート)

ページルート(`src/` があればその中、無ければプロジェクトルート)からの相対パスが、そのまま
URL になる。各ページは**デフォルトエクスポートの React コンポーネントが必須**(無いと
`MISSING_DEFAULT_EXPORT`)。以下の「ファイル」列はページルートからの相対パス。

| ファイル | ルート |
| --- | --- |
| `index.tsx` | `/` |
| `monthly-analysis.tsx` | `/monthly-analysis` |
| `sales/index.tsx` | `/sales` |
| `sales/[customerId].tsx` | `/sales/:customerId`(動的パラメータ) |
| `_layout.tsx` | そのディレクトリ配下を包むネストレイアウト(`Outlet` で子を描く) |
| `_404.tsx` | Not Found ページ |
| `_error.tsx` | ルートが throw したときのエラーページ |

`components/`・`hooks/`・`lib/`・`server/`・`public/` はどの階層でもルート走査の対象外
(ページにならない)。それ以外のディレクトリ名は URL のセグメントになる(→「ディレクトリ構造」)。

```tsx
import { definePage } from "@squadbase/vantage"

// title は document.title、navLabel は useRoutes() で組むナビの表示名(既定は title)
export const page = definePage({ title: "Monthly Analysis · Acme", navLabel: "Monthly" })

export default function MonthlyAnalysis() {
  return <main className="p-6">…</main>
}
```

### ナビはルート一覧から組む

`useRoutes()` がページルート一覧(スキャン順)を返すので、リンク配列を手で持たない。
`useCurrentRoute()` は現在のルート(404 なら `undefined`)。

```tsx
import { Link, useCurrentRoute, useRoutes } from "@squadbase/vantage/router"

// 動的ルートは URL が定まらないので外す。label は navLabel → title → path の順
const routes = useRoutes().filter((r) => !r.dynamic)
const current = useCurrentRoute()

routes.map((r) => (
  <Link key={r.path} to={r.to} activeClassName="font-semibold">
    {r.label}
  </Link>
))
```

`RouteInfo`: `path`(`/sales/:id`)・`to`(`/sales/$id`)・`params`・`dynamic`・`index`・`label`・
`title`・`description`・`navLabel`。

### フィルタ状態は URL に置く

リロードで消えず、URL をそのまま共有できる。`useState` と同じ形。

```tsx
import { useSearchParam, useSearchState } from "@squadbase/vantage/router"

const [region, setRegion] = useSearchParam("region", "all")   // 常に string
const [segments, setSegments] = useSearchState<string[]>("segments", []) // JSON になる値
```

デフォルト値(または `null`)を書くとキーは URL から消える。履歴は既定で `replace`
(`{ replace: false }` で push)。

### 動的パラメータの「3 つの綴り」を同期させる

崩すと静かにマッチしなくなる不変条件:

- ファイル名 `sales/[customerId].tsx`
- 表示ルート `/sales/:customerId`
- リンクトークン `to="/sales/$customerId"` + `params={{ customerId }}`

```tsx
import { Link, useParams } from "@squadbase/vantage/router"

<Link to="/sales/$customerId" params={{ customerId: row.id }}>{row.name}</Link>

// 詳細ページ側で取り出す
const { customerId } = useParams()
```

## データ取得(server を持たない fetch)

外部 API を叩くだけなら `server/` は不要。`@squadbase/vantage/query` の `useQuery` を使う:

```tsx
import { useQuery } from "@squadbase/vantage/query"
import { Loading, ErrorState } from "@squadbase/vantage/ui"

const q = useQuery({ queryKey: ["stats"], queryFn: () => fetch("/…").then((r) => r.json()) })
if (q.isPending) return <Loading />
if (q.isError) return <ErrorState message={(q.error as Error).message} />
```

`QueryClient` は Vantage が 1 つだけ管理する(staleTime 30s・retry 1・
refetchOnWindowFocus false・networkMode "always")。挙動を変えたいときはクエリ側のオプションで
上書きする。
自分の `server/api` を叩くときは `useQuery` ではなく `useApiQuery`(→「API を持つ(fullstack
モード)」)。

## API を持つ(fullstack モード)

**`server/` ディレクトリがあれば fullstack モード**(無いアプリに足せば、その時点で切り替わる)。
`server/api/**` の各ファイルが API ルートになる。

`server/api/monthly-analysis.ts` → `GET /api/monthly-analysis`:

```ts
import type { ApiContext } from "@squadbase/vantage/server"
import { HttpError } from "@squadbase/vantage/server"

export async function GET({ params, env }: ApiContext) {
  if (!env.API_KEY) throw new HttpError(500, "API_KEY missing")
  return Response.json({ ok: true })
}
```

- API モジュールは**大文字の HTTP メソッド**(`GET`/`POST`/`PUT`/`PATCH`/`DELETE`/`OPTIONS`)を
  エクスポートする。それ以外の名前は `INVALID_API_EXPORT` エラー。
- 動的 API も `[id].ts` 記法: `server/api/customers/[id].ts` → `GET /api/customers/:id`。
  `params.id` で取り出す(`noUncheckedIndexedAccess` が効くので narrowing が要る)。
- **クライアントに見せたいエラーは `HttpError(status, msg)` を throw する。** それ以外の throw は
  ログに記録され汎用の 500 に丸められる。
- **シークレットは `ApiContext.env` にだけ届く**(クライアントには決して届かない)。

クライアント側からは `useApiQuery` で `/api/*` を叩く。ベース URL の解決・JSON パース・
非 2xx の `ApiError` 化・クエリキー(`["api", url]`)が入っている:

```tsx
import { useApiQuery, useApiMutation } from "@squadbase/vantage/query"

const q = useApiQuery<Customer>(`/api/customers/${customerId}`)
if (q.isError) return <ErrorState message={q.error.message} />  // HttpError のメッセージ

// クエリ文字列は search で。undefined の項目は落ちる
const rows = useApiQuery<Row[]>("/api/customers", { search: { segment } })

// 書き込み。変数がそのまま JSON ボディになる
const save = useApiMutation<Customer, Payload>("/api/customers", { method: "POST" })
```

`ApiError` は `message`・`status`・`body`・`requestId` を持つ。hook が使えない場所では
`apiJson(path, init)`、生の `Response` が要るときは `apiFetch`。

## 環境変数

- **クライアントで読めるのは `import.meta.env.PUBLIC_*` と `MODE`/`DEV`/`PROD`/`SSR`/`BASE_URL`
  のみ。** `VITE_` 系の公開 API は無い。
- サーバー側のシークレットは `ApiContext.env.MY_SECRET` で読む(`server/` 内のみ)。

## 組み込み UI / コンポーネントの入口

- **プリミティブ**は `@squadbase/vantage/ui` から import する(`Button`・`Loading`・
  `ErrorState`・`Empty`・`Select`・`Checkbox` ほか)。
- **複合パーツ**は `@squadbase/vantage/components` から(`PageShell`・`DashboardCardPreset`・
  `DataTablePreset`・`EChart` ほか)。
- **どの名前が import 可能か / props の詳細は `vantage docs` で引く。** ガイドとコンポーネント
  リファレンスはパッケージに同梱されていて、オフラインでも読める(→「ドキュメントを引く」)。
  **名前が分からないとき**はやりたいことで `vantage search` する(→ 同節)。
- **UI は import して使うのが既定。取り出す(eject)必要はない。** `vantage add ui|block` は
  ソースを手元にコピーして**改造したいとき専用**のコマンドで、取り出せるのは
  `ui: data-table` と `block: sales-overview` の 2 つだけ。それ以外の名前は import 専用で
  `add` の対象ではない(未知名で実行すると候補が一覧表示される)。

## ドキュメントを引く(`vantage docs` / `vantage search`)

```bash
vantage docs                  # 全ページの一覧(ガイド + コンポーネント)
vantage docs button           # 1 ページ表示(短縮名。ui/button に解決される)
vantage docs parts/data-table # 完全な slug でも引ける
vantage docs data-table --json  # { slug, title, description, section, content }
vantage docs --all            # 全ページを連結(まとめて読み込む用)
vantage docs routing --lang en  # 英語版(既定は ja)
```

props の表・使用例・落とし穴はコンポーネントのページに載っている。**推測で props を書く前に
`vantage docs <name>` を引くこと。** 本文中のリンクは slug なので、`[DataTable](parts/data-table)`
は `vantage docs parts/data-table` で開ける。

**名前が分からないときは検索する。** 対象は `vantage docs` と同じ同梱ドキュメント。

```bash
vantage search 期間を選ぶ UI が欲しい       # 自然言語(BM25)。やりたいことで引く
vantage search "enable[A-Z]\w+" --regex    # 正規表現で props を横断(行番号付き)
vantage search テーブル --limit 5 --json    # 機械可読(slug + score + snippet)
```

結果の slug はそのまま `vantage docs <slug>` に渡せる。

## 検証・ビルド・プレビュー

```bash
pnpm check     # 静的診断(禁止ファイル・src/ の分裂・ルート衝突・境界・API export・env 誤用)
pnpm routes    # ページ + API の URL マップ
pnpm build     # dist/ に client(+ server)+ vantage-manifest.json
pnpm preview   # 本番ビルドをローカル実行
```

`vantage-manifest.json` の `mode`(`spa` / `fullstack`)は `server/` の有無から自動で決まる
(手で書かない)。`vantage routes` は `--pages` / `--apis` で片側だけに絞れ、`--detail` を足すと
各ルートの静的な仕様(ページ: パスパラメータ + `definePage` のメタ / API: メソッド・query・
body・レスポンスの status と形)まで出る。`vantage check --json` / `vantage routes --json` は
エージェント向けの機械可読出力。dev では `console.warn` / `console.error` とランタイムエラーが開発ターミナルへ
転送される(`console.log` は転送されない)。エラーの全画面オーバーレイは `vantage dev --no-overlay` で消せる。

## さらに詳しく(同梱 Skill)

- **`vantage-app`** — アプリを一から作る / 構成を広げるときの進め方と検証の順序
- **`vantage-add-feature`** — 既存アプリに page / api / ui を 1 つ足す定型
- **`vantage-pitfalls`** — Base UI(≠ Radix)の癖など、静かに壊れる落とし穴のリファレンス

手順書の本体は `SKILL.md` というファイルで、置き場所はアプリによって違う(ルート直下・
`.claude/skills/`・`.squadbase/skills/` など)。**探す必要はない ― CLI が探す:**

```bash
vantage add skill          # 同梱 skill の一覧と、それぞれの配置場所
```

配置済みならその場所が出るので、その `SKILL.md` を読む。`not placed` のものだけ配置する:

```bash
vantage add skill --all                        # 配置済みはスキップ(場所を報告するだけ)
vantage add skill --all --dir .claude/skills   # 置き場所を指定(既定はルート直下)
```

`add skill` はプロジェクト内を走査してから動くので、**再実行しても二重に配置されない**。
配置済みのコピーを新しいバージョンに更新したいときだけ `--force` を付ける(見つかった場所を
そのまま書き換える)。
