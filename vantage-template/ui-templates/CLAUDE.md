# CLAUDE.md — ui-templates (Vantage)

UIパターン別テンプレート（KPI重視・チャート格子・テーブル重視・ファネル など）。ユースケース非依存の **UI 骨格の見本市**。コーディングエージェントがこれを起点にユーザー要望のダッシュボードを実装する。

**画面として重複するテンプレは置かない。** 追加を検討する際は、既存テンプレのプレビュー画像と並べて「別の絵になるか」で判断する。`tabbed-dashboard` は Tab 1 が `kpi-chart-simple`、Tab 2 が `table-focus` の再掲でサムネイルが見分けられなかったため削除した（タブは既存テンプレに `<Tabs>` を巻けば作れる）。

このファイルは `vantage-template/ui-templates/` 配下のファイル構成ルールを定義する。デザイン要件・AI relabel・EN/JA・CLI の挙動は親 [`../CLAUDE.md`](../CLAUDE.md) に従う。

> **Vite 版との差分**: 適用先が Vantage アプリ（`@squadbase/vantage`）になったため、(1) エントリは `src/pages/home.tsx` ではなく **ルートの `index.tsx`**、(2) テンプレ固有ファイルは `src/templates/<slug>/` ではなく **`components/<slug>/`**、(3) 全ての building block を `@squadbase/vantage/*` から import する（ローカルコピーは持たない）。

## 設計目標

テンプレートは「出発点」であり、適用後にエージェントが本実装を被せていく。そのため次の3点を最優先する:

1. **探索コスト最小** — テンプレ由来のコードが一目で分かること
2. **デッドコード/削除コスト最小** — 不要になったら迷わず一掃できること
3. **indirection 最小** — エージェントが編集対象に最短で到達できること

## ファイル構成の原則

### 1. 1テンプレ = 1ディレクトリ（コロケーション）

適用先では、`index.tsx`（エントリ）以外のテンプレ固有ファイルを **`components/<slug>/` 1ディレクトリに集約** する。

```
# 適用先（dest）レイアウト
index.tsx                             # エントリ（ルート "/"）
components/<slug>/
  mock-data.ts                        # データ層（relabel:false / 差し替え対象）
  types.ts                            # 型（index と data で共有）
  ...（分割した場合のみ追加ファイル）
```

- **探索**: `components/<slug>/` を見ればテンプレ由来が一覧完結
- **削除**: `rm -rf components/<slug>/` で一掃

**`components/` を使う理由（重要）**: Vantage は**ファイルベースルーティング**で、`.tsx` ファイルは原則すべてページ扱いになる。`components/` / `hooks/` / `lib/` / `server/` / `public/` だけがルート走査から除外される（`NON_ROUTE_DIRS`）ため、`templates/<slug>/` のようなディレクトリに `.tsx` を置くと **`/templates/<slug>/...` という意図しないルートが生え、`vantage check` が `MISSING_DEFAULT_EXPORT` で落ちる**。データファイル（`.ts`）も同じディレクトリに置いてコロケーションを保つ。

### 2. インライン優先 — 薄いラッパ component を作らない

**`data → EChartsOption → <EChart>` だけの薄いチャート component は作らず、`index.tsx` 内のオプションビルダ関数にする。**

```tsx
// ✅ 推奨: index.tsx 内のオプションビルダ関数 + EChart 直レンダ
function areaOption(data: TimePoint[]): EChartsOption {
  return { /* ... */ }
}
// JSX 内:
<EChart option={areaOption(timeSeries)} height="280px" />
```

チャート整形ヘルパ（`getBaseGrid` / `formatNumber` 等）も同様に `index.tsx` 内へ inline する。

**チャートに色をハードコードしない。** `@squadbase/vantage` v0.2.1 以降、`EChart` は init 時に `--chart-1..5`（系列色）と文字色/境界色トークン（軸・凡例・ツールチップ）を読み、light / dark の切り替えにも追従する。`option.color` / `itemStyle.color` / ラベルの `color` を書くと、その分だけテンプレがテーマ差し替え（`vantage-template chart <preset>` や `styles.css` の override）から外れる。**ui-templates では書かない**のが既定 — 意味色（成功=緑・失敗=赤など）を出したいときだけ、その series に限って指定する。`theme` プロップは使わない（渡した時点でトークン追従が完全に止まる）。

### 3. データ層（mock-data / types）は分離する

`mock-data.ts` と `types.ts` は `index.tsx` に inline せず、`components/<slug>/` の別ファイルに保つ。表示ラベル（KPI名・軸名・stage名など）は描画側（`index.tsx`）の literal/const に置き、データ配列には値・id・generic な sample text のみ置く。

### 3-b. API 版テンプレ（`server/api` から配信する場合）

`kpi-chart-simple` はモック配列を直読みせず、**`server/api` から `useApiQuery` で取る**構成になっている。実データ接続までの導線を1本コードで示すためのもので、この構成を採るテンプレは dest の置き場が変わる:

```
index.tsx                                # useApiQuery + useSearchParam
components/<slug>/*.tsx                  # 表示コンポーネント
lib/<slug>/types.ts                      # ★ client と server が共有する型（relabel:false）
server/api/<endpoint>.ts                 # ★ サンプルデータ + GET ハンドラ（relabel:false）
```

- **共有型は `components/` ではなく `lib/`** に置く。クライアントは `server/` を import できない（`CLIENT_IMPORTS_SERVER`）ので、両者が参照できる中立な場所が要る。`lib/` もルート走査対象外なので安全。
- **サンプルデータはサーバー側に置く。** 「実装者が差し替える場所」がハンドラ1箇所に集約され、`KpiSummary` のような payload 型さえ保てばページを触らずに実データへ移行できる。
- **絞り込みは `useSearchParam` + `useApiQuery` の `search`** で組む。`search` はクエリ文字列とキャッシュキーの両方に入るので、URL を変えれば再取得される。
- クライアントに見せたいエラーは `HttpError(status, msg)` を throw する。`useApiQuery` の `error` は `ApiError` なのでキャスト不要で `.message` が読める。

新しくテンプレを足すときにこの構成を必須にはしない（UI 骨格の見本市なのでモックのままでよい）。ただし**モックを使うテンプレでも絞り込み状態は `useState` のままでよい** — URL 化は実データに繋ぐ段階の話で、`kpi-chart-simple` がその見本になっている。

### 4. デッドコードを残さない

テンプレに未使用の関数・型・import を残さない。

### 分割してよい例外

**再利用される** / **内部 state・interaction を持つ** / **`index.tsx` が 400〜500 行を超える** のいずれかに当てはまる UI のみ、`components/<slug>/` 配下に切り出してよい。迷ったら inline。

## import 規約（Vantage）

すべての building block は `@squadbase/vantage/*` から import する。`@/` エイリアスは**存在しない**。

| 用途 | import 元 |
| --- | --- |
| `PageShell*` / `DashboardCard*` / `EChart` / `EChartsOption` / `DataTable*` / `ColumnDef` / `DateRangePicker` / `FilterBar*` / `FunnelSteps` / `MetricValue` / `TrendIndicator` / `StatusBadge` / `SegmentedControl` / `MultiSelect` / `SearchableSelect` / `SectionHeader` / `AppShell` / `Placeholder` / `Sparkline` | `@squadbase/vantage/components` |
| `Button` / `Input` / `Badge` / `Tabs*` / `ToggleGroup*` / `Table*` / `Select*` / `Dialog*` / `cn` ほか shadcn プリミティブ | `@squadbase/vantage/ui` |
| `definePage` | `@squadbase/vantage` |
| `Link` / `Outlet` / `useParams` / `useSearch` / `useNavigate` / `useRoutes` / `useCurrentRoute` / `useSearchParam` / `useSearchState` | `@squadbase/vantage/router` |
| `useApiQuery` / `useApiMutation` / `useQuery` / `useMutation` / `apiFetch` | `@squadbase/vantage/query` |
| `MarkdownRenderer` | `@squadbase/vantage/markdown` |

**禁止**: `echarts` / `@tanstack/*` / `@base-ui/react` / `hono` / `vite` / `tailwindcss` の直接 import。`EChartsOption` は `@squadbase/vantage/components` から、`ColumnDef` も同じくそこから取る。`lucide-react` と `date-fns` の直接 import は可（ベーステンプレートの dependencies に入っている）。

**相対 import は拡張子なしで書く**（`@squadbase/vantage` v0.2.0 で `.js` 指定子の規約は廃止。既存の `.js` 付き import も動くが、新規テンプレでは付けない）。

```tsx
// index.tsx から
import { MOCK_SERIES } from "./components/<slug>/mock-data"

// components/<slug>/detail-table.tsx から
import type { Row } from "./types"
```

`Placeholder` / `Sparkline` はローカルコピーではなく `@squadbase/vantage/components` から取る（v0.1.1 でフレームワークに入った）。

### Base UI と Radix の差分（`vantage-pitfalls` skill も参照）

Vantage の UI キットは Radix ではなく **Base UI** ベース。移植時に踏みやすい差分:

- `asChild` は**無い** → `render` prop を使う（`<DialogTrigger render={<button />}>`）
- `ToggleGroup` の `value` は**配列**（単一選択でも `string[]`）
- `Select` の `onValueChange` は `string | null` を返す
- `Checkbox` の中間状態は `indeterminate` prop

`Select` の value/label は v0.2.1 で Vantage 側が `SelectItem` の children から集めるようになったので、`items` は書かなくてよい（`SelectItem` を別コンポーネントが返している場合だけ明示する）。

## エントリの必須要件

`index.tsx` は **default export の React component** が必須（無いと `vantage check` が `MISSING_DEFAULT_EXPORT`）。加えてタイトル/説明を `definePage` で宣言する:

```tsx
import { definePage } from "@squadbase/vantage"

export const page = definePage({
  title: "KPI + Chart",
  description: "...",
  // ナビの表示名。省略時は title が使われる
  navLabel: "KPI",
})

export default function Home() { /* ... */ }
```

`definePage` の値は**ビルド時に静的抽出される**ため、変数・関数呼び出し・テンプレート補間は使えない（リテラルのみ）。

## ソースのオーサリング構造（このリポジトリ側）

```
ui-templates/<slug>/
  manifest.json
  preview-square.png / preview-wide.png
  pages/index.tsx       → dest: index.tsx                          (replace)
  lib/mock-data.ts      → dest: components/<slug>/mock-data.ts     (add, relabel:false)
  lib/types.ts          → dest: components/<slug>/types.ts         (add, relabel:false)
  components/*.tsx      → dest: components/<slug>/*.tsx            (add)  ※分割した場合のみ
  server/*.ts           → dest: server/api/*.ts                    (add, relabel:false) ※API 版のみ
```

API 版（`kpi-chart-simple`）では `lib/types.ts` の dest が `lib/<slug>/types.ts` になり、`lib/mock-data.ts` は無く、代わりに `server/*.ts` を持つ。上の「3-b」を参照。

## manifest.json

```json
{
  "name": "<slug>",
  "description": "...",
  "version": "0.1.0",
  "files": [
    { "src": "pages/index.tsx", "dest": "index.tsx", "action": "replace" },
    { "src": "lib/mock-data.ts", "dest": "components/<slug>/mock-data.ts", "action": "add", "relabel": false },
    { "src": "lib/types.ts", "dest": "components/<slug>/types.ts", "action": "add", "relabel": false }
  ]
}
```

- `files[]` が manifest の全て（`nav[]` は無い）。ベーステンプレートのナビは `useRoutes()` からルート一覧を組むので、ページファイルをコピーすればナビにも載る
- データファイルには `"relabel": false` を必ず付ける

## 見本市の例外ルール

`ui-templates/` は「UI 構造の見本市」として、レイアウトの幅を意図的に出す。以下の default は意図的に崩してよい:

- **PageShellSummary（insight cards）は必須ではない** — KPI 重視のテンプレ（`kpi-chart-advanced`）のみに残し、他では省く
- **本体最初の行を KPI カードで始める必要はない** — テーブル中心 / チャート中心 / ファネル中心など、テーマに合わせて開始要素を変える
- **PageShellHeaderEnd の中身は DateRangePicker 限定ではない** — 検索ボックス、Export ボタン、Filter chips、ステージ選択など
- **2 カラム（本体 + サイドバー）のレイアウトを使ってよい**

ただし以下は維持する（テンプレ群としての一貫性のため）:
- `PageShell` / `PageShellHeader` / `PageShellHeading` / `PageShellTitle` の使用
- `DashboardCard` / `DashboardCardPreset` の使用（raw `Card` ではなく）
- `EChart` の使用（生の `echarts` を触らない）

## チェックリスト（テンプレ追加・改修時）

1. テンプレ固有ファイルの `dest` は `components/<slug>/` 配下か（`templates/` に `.tsx` を置いていないか）
2. `@/` エイリアスや `echarts` / `@tanstack/*` の直接 import、`Placeholder` / `Sparkline` のローカル import が残っていないか
3. 相対 import に `.js` 拡張子が残っていないか（v0.2.0 で規約廃止）
4. 薄いチャートラッパ component を作っていないか。チャートに色をハードコードしていないか（`option.color` / `itemStyle.color` / `theme`）
5. `mock-data.ts` / `types.ts` / `server/*.ts` は分離され `relabel:false` が付いているか
6. 未使用の関数・型・import が残っていないか
7. 適用先で `npx vantage check` と `npx tsc --noEmit` が通るか
8. EN/JA 両方を同じ構成に揃えたか
9. レイアウトを変えたなら `preview-wide.png` (1600x900) / `preview-square.png` (1200x1200) を撮り直したか
