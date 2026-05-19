# CLAUDE.md — vite-template

Squadbase Vite プロジェクトの初期化・カスタマイズ用 CLI ツール（`@squadbase/vite-template`）。ランタイム依存なし — Node.js 組み込みモジュールのみ使用。

## ディレクトリ構成

```
vite-template/
├── src/
│   ├── index.ts              # CLI エントリ — parseArgs + コマンドルーティング
│   ├── commands/
│   │   ├── init.ts           # init コマンド — base-template/ を cwd にコピー
│   │   ├── add.ts            # add コマンド — プロジェクト検証、manifest 読み込み、apply 呼び出し
│   │   └── list.ts           # list コマンド — templates/ を走査して manifest を表示
│   ├── apply.ts              # ファイルコピー + routes.tsx パッチ
│   ├── manifest.ts           # 型定義 (TemplateManifest, FileEntry, RouteEntry) + ローダー
│   └── logger.ts             # ANSI カラーログ
├── templates/                # ユースケース別テンプレート (sales, churn, ec, etc.)
│   └── <template-name>/
│       ├── manifest.json
│       ├── pages/
│       └── components/
├── ui-templates/             # UIパターン別テンプレート (kpi-chart-simple, funnel, etc.)
│   └── <template-name>/
│       ├── manifest.json
│       ├── pages/
│       ├── components/
│       └── lib/
├── base-template/            # ビルド時に ../vite/ からコピー（gitignore 対象）
├── tsup.config.ts            # dist/index.js にバンドル（#!/usr/bin/env node バナー付き）
├── tsconfig.json
├── package.json
├── .gitignore
└── .npmignore
```

## ビルドプロセス

`npm run build` は以下を順番に実行:

1. **`sync-base`** — `rsync -a --delete ../vite/ base-template/`（node_modules, dist, package-lock.json, *.tsbuildinfo, *.log を除外）
2. **`tsup`** — `src/index.ts` を `dist/index.js` にバンドル（ESM 単一ファイル + shebang）

### npm に公開される内容

- `dist/` — コンパイル済み CLI
- `templates/` — ユースケース別テンプレートデータ
- `ui-templates/` — UIパターン別テンプレートデータ
- `base-template/` — Vite ベースプロジェクトのフルコピー（`init` コマンド用）

### パス解決

tsup が全てを `dist/index.js` にバンドルするため、`__dirname` は常に `dist/` に解決される。アセットディレクトリは1階層上で参照:

- `join(__dirname, "..", "templates")` → `vite-template/templates/`
- `join(__dirname, "..", "ui-templates")` → `vite-template/ui-templates/`
- `join(__dirname, "..", "base-template")` → `vite-template/base-template/`

`manifest.ts` の `TemplateSource` 型 (`"templates" | "ui-templates"`) で切替する。`add` / `list` コマンドの `--ui` フラグが `source = "ui-templates"` を渡す。

## 開発コマンド

```bash
npm run build      # ../vite/ からベーステンプレートを同期 + tsup でビルド
npm run release    # npm に公開（@squadbase:registry）
```

## routes.tsx パッチの仕組み

`add` コマンドは文字列操作（AST ではなく）で `src/routes.tsx` をパッチする:

1. `src/routes.tsx` を読み込み
2. `name: "<name>"` パターンでルート重複をチェック
3. ファイル内の最後の `];`（routes 配列の閉じ括弧）を探す
4. `];` の手前に `lazy(() => import(...))` エントリを挿入

`routes.tsx` は Squadbase テンプレートが管理する固定構造のため、この方式で動作する。

## テンプレートの追加方法

**テンプレートは原則 1 ルート**: `routes[]` は空にし、追加ルートは作らない。UI ロジックは適切にコンポーネントに分割すること（`components/` 配下に配置し、`manifest.json` の `files[]` に `action: "add"` で追加）。ユーザーがルートを追加する起点は `home.tsx` とし、テンプレート自体でルートを増やさない設計にすること。

### ユースケース別テンプレート (`templates/`)

1. `templates/<name>/` ディレクトリを作成
2. `manifest.json` に `name`, `description`, `version`, `files[]`（home.tsx + コンポーネントファイル `action: "add"`）, `routes[]`（空）を定義
3. `pages/home.tsx` をエントリポイントとし、大きな UI ブロックは `components/` に分割
4. `node dist/index.js add <name> --dry-run` でテスト（Vite プロジェクトディレクトリから実行）

### UIパターン別テンプレート (`ui-templates/`)

ユースケース非依存のUI骨格 (KPI重視、チャート格子、テーブル重視、ファネル、タブ構成 など)。命名規約は `ui-template-<slug>` プレフィックスで衝突回避:
- コンポーネント: `src/components/ui-template-<slug>/`
- ライブラリ: `src/lib/ui-template-<slug>-*.ts`
- 型: `src/types/ui-template-<slug>.ts`

**ui-templates 限定の例外ルール (DESIGN.md / 「テンプレート開発ルール」よりも優先)**:

`ui-templates/` 配下のテンプレートは **「UI 構造の見本市」として、レイアウトの幅を意図的に出す** ことを目的とする。そのため以下の default を意図的に崩してよい (むしろ崩すべき):

- **PageShellSummary (insight cards) は必須ではない** — 各テンプレが同じヘッダーになるのを避けるため、原則として KPI 重視のテンプレ (`kpi-chart-advanced`) のみに残し、他テンプレでは省く
- **本体最初の行を KPI カードで始める必要はない** — テーブル中心 / チャート中心 / ファネル中心など、テンプレのテーマに合わせて開始要素を変える。KPI 行を完全に省くテンプレもあってよい
- **PageShellHeaderEnd の中身は DateRangePicker 限定ではない** — 検索ボックス、Export ボタン、Filter chips、ステージ選択など、テンプレの用途に合わせる
- **2 カラム (本体 + サイドバー) のレイアウトを使ってよい** — `PageShellContent` の中で grid を組み、左に主要素、右に補助要素を置く構成も歓迎

ただし以下は維持する (テンプレ群としての一貫性のため):
- `PageShell` / `PageShellHeader` / `PageShellHeading` / `PageShellTitle` の使用
- `DashboardCard` / `DashboardCardPreset` の使用 (raw `Card` ではなく)
- `EChart` ラッパ + `useEChartsContrastColor` の使用

CLI 操作は `--ui` フラグを必ず付ける:

```bash
node dist/index.js list --ui                # UI テンプレートを列挙
node dist/index.js list --ui --lang ja      # JA バリアントだけ列挙
node dist/index.js list --ui --json         # JSON で取得 (preview 画像 URL 含む)
node dist/index.js add --ui <name>          # UI テンプレートを適用
node dist/index.js add --ui <name> --dry-run
```

EN/JA は `<name>` と `<name>-ja` のペアで、`files[].dest` は EN/JA で同一 (上書き = 相互排他)、`name` だけ異なる。EN/JA を同時に add してはいけない。

## AI カスタマイズ (`add --prompt`)

`add` コマンドに `--prompt` を渡すと、テンプレート適用直後に **Vercel AI SDK 経由で AI が manifest.files の中身を書き換える**。コーディングエージェントが Read/Edit を多段で繰り返すよりはるかに高速。

```bash
npx @squadbase/vite-template add kpi-chart-simple --ui \
  --prompt "SaaS の MRR / ARR / 解約率 / 新規MRR ダッシュボード化" \
  --provider openai \
  --model gpt-4o \
  --apiKey $OPENAI_API_KEY
```

| Flag | 説明 |
|---|---|
| `--prompt <text>` | カスタマイズ意図。**未指定なら AI を起動せず従来挙動**。 |
| `--provider <name>` | `openai` / `anthropic` / `google` / `mistral` / `xai` / `groq` 等。`open-ai` 表記も正規化。 |
| `--model <id>` | モデル ID。provider ごとにデフォルトあり (`gpt-5.4-mini-2026-03-17`, `claude-sonnet-4-5`, `gemini-3-flash-preview`, …)。 |
| `--apiKey <key>` | 省略時は `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` (alias: `GOOGLE_AI_API_KEY`) 等の環境変数 fallback。 |
| `--env-file <path>` | 指定した .env ファイルを読み込んでから AI を起動。既存 `process.env` を優先 (`.env` は補完のみ)。Node.js 20.12+ 必須。`--prompt` 併用必須。dotenv 等の追加依存なし (Node 標準 `process.loadEnvFile` を使用、`${VAR}` 展開非対応)。 |
| `--base-url <url>` | OpenAI 互換エンドポイント (任意)。 |
| `--dry-run` | AI 出力を unified diff で表示するだけ、disk 書き込みなし。 |
| `--json` | 結果 (edits, unchanged, skipped, notes) を JSON で stdout 出力。エージェント呼び出し用。 |

**動作**:
1. `applyTemplate()` でテンプレートを通常通りコピー
2. `manifest.files[].dest` のファイル群を読み込み、system prompt (デザインルール焼き込み済み) + user prompt + ファイル本体を `generateObject` に渡す
3. AI は構造化出力で `{ edits: [{ path, content, rationale }], notes }` を返す。`path` は JSON Schema enum で manifest.dest に拘束
4. 受け取った edits を disk に書き戻し (dry-run なら diff 表示のみ)

**制約**:
- AI が編集できるのは **manifest.files に列挙された dest のみ**。それ以外のパスは `skipped[]` に積まれる
- `routes.tsx` は触らない (ui-templates / templates は 1 ルート設計)
- 部分編集 (diff/patch) ではなく **ファイル全体を返させる** 仕様

**依存**: `ai` / `@ai-sdk/*` は `optionalDependencies`。`--prompt` 指定時のみ動的 import される。未 install 時は親切な `npm install` ガイダンスを表示して exit 1。

**失敗時**: AI 呼び出しが途中で失敗した場合、書き換え済みファイルはそのまま残る。`git status` / `git diff` で確認し、必要なら revert すること。

## テンプレート開発ルール

テンプレートのページ・コンポーネントを作成する際は、以下のルールに従うこと。

### PageShell を使う

ページファイル（`pages/home.tsx`）では `PageShell` コンポーネント群（`@/components/common/page-shell`）を使ってレイアウトを構成する。raw `div` + 手動の className でページレイアウトを組まないこと。

```tsx
import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellHeaderEnd,
  PageShellContent,
} from "@/components/common/page-shell"

<PageShell>
  <PageShellHeader>
    <PageShellHeading>
      <PageShellTitle>ページタイトル</PageShellTitle>
      <PageShellDescription>概要説明</PageShellDescription>
    </PageShellHeading>
    <PageShellHeaderEnd>
      {/* DateRangePicker などのアクション */}
    </PageShellHeaderEnd>
  </PageShellHeader>
  <PageShellContent>
    {/* メインコンテンツ */}
  </PageShellContent>
</PageShell>
```

### PageShellSummary でインサイトを表示する (テーマに適した場合)

`PageShellHeader` 内に `PageShellSummary` を配置し、ダッシュボードのテーマに沿った分析インサイトをカード形式で表示する。タブ内の KPI 値をそのまま繰り返すのではなく、複数データソースを横断した導出型のインサイト（クロスタブ分析・機会の示唆・全体サマリーなど）を自然言語の文章で伝える。

- インサイトのデータ導出ロジックは `lib/` に純粋関数として分離し、コンポーネントから import する
- カードの内容はテンプレートのテーマ・データに合わせて設計する（SEOダッシュボードならSEOインサイト、売上ダッシュボードなら売上インサイト）
- `DashboardCard` composable API を使ってカードを構成する

```tsx
import {
  PageShellSummary,
} from "@/components/common/page-shell"
import { InsightCards } from "@/components/xxx-dashboard/insight-cards"

<PageShellHeader>
  <PageShellHeading>
    <PageShellTitle>ページタイトル</PageShellTitle>
    <PageShellDescription>概要説明</PageShellDescription>
  </PageShellHeading>
  <PageShellHeaderEnd>
    {/* DateRangePicker などのアクション */}
  </PageShellHeaderEnd>
  <PageShellSummary>
    <InsightCards />
  </PageShellSummary>
</PageShellHeader>
```

### DashboardCard を使う

`Card`（`@/components/ui/card`）を直接使わず、`DashboardCard`（`@/components/common/dashboard-card`）を使う。

- **シンプルなカード**（タイトル + コンテンツ）: `DashboardCardPreset` を使う
- **カスタムレイアウトが必要なカード**（KPIカードなど）: `DashboardCard` + `DashboardCardHeader` + `DashboardCardTitle` + `DashboardCardContent` 等の composable API を使う

```tsx
// シンプルなカード（チャート・テーブルの包み）
import { DashboardCardPreset } from "@/components/common/dashboard-card"

<DashboardCardPreset title="チャートタイトル">
  <EChart option={option} height="300px" />
</DashboardCardPreset>

// カスタムレイアウト（KPIカードなど）
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardAction,
  DashboardCardContent,
} from "@/components/common/dashboard-card"

<DashboardCard>
  <DashboardCardHeader>
    <DashboardCardTitle>ラベル</DashboardCardTitle>
    <DashboardCardAction>
      <Icon className="size-4 text-muted-foreground" />
    </DashboardCardAction>
  </DashboardCardHeader>
  <DashboardCardContent>
    {/* カスタムコンテンツ */}
  </DashboardCardContent>
</DashboardCard>
```

## デザインガイドライン

ダッシュボード・データアプリの UI/UX 設計指針については [DESIGN.md](./DESIGN.md) を参照。テンプレートのページ・コンポーネントを作成・修正する際はこのガイドラインに従うこと。
