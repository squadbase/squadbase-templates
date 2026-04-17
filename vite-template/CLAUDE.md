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
├── templates/                # npm パッケージに同梱されるテンプレートデータ
│   └── <template-name>/
│       ├── manifest.json
│       ├── pages/
│       └── components/
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
- `templates/` — テンプレートデータ（pages, components, manifest.json）
- `base-template/` — Vite ベースプロジェクトのフルコピー（`init` コマンド用）

### パス解決

tsup が全てを `dist/index.js` にバンドルするため、`__dirname` は常に `dist/` に解決される。アセットディレクトリは1階層上で参照:

- `join(__dirname, "..", "templates")` → `vite-template/templates/`
- `join(__dirname, "..", "base-template")` → `vite-template/base-template/`

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

1. `templates/<name>/` ディレクトリを作成
2. `manifest.json` に `name`, `description`, `version`, `files[]`（home.tsx + コンポーネントファイル `action: "add"`）, `routes[]`（空）を定義
3. `pages/home.tsx` をエントリポイントとし、大きな UI ブロックは `components/` に分割
4. `node dist/index.js add <name> --dry-run` でテスト（Vite プロジェクトディレクトリから実行）

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
