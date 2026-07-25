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
│   ├── CLAUDE.md             # ★ファイル構成ルール (コロケーション/インライン優先)。下記の命名規約を上書き
│   └── <template-name>/
│       ├── manifest.json
│       ├── pages/            # home.tsx (チャートは inline のオプションビルダ関数)
│       └── lib/              # mock-data.ts / types.ts (relabel:false のデータ層)
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

ユースケース非依存のUI骨格 (KPI重視、チャート格子、テーブル重視、ファネル、タブ構成 など)。

**ファイル構成ルールは [`ui-templates/CLAUDE.md`](./ui-templates/CLAUDE.md) を参照** (このセクションより優先)。要点:

- **1テンプレ = 1ディレクトリ (コロケーション)**: テンプレ固有ファイルは適用先 `src/templates/<slug>/` に集約する。旧来の `src/components/ui-template-<slug>/` / `src/lib/ui-template-<slug>-*.ts` / `src/types/ui-template-<slug>.ts` というプレフィックス分散方式は**廃止**
- **インライン優先**: `data → EChartsOption → <EChart>` の薄いチャートラッパ component は作らず、`home.tsx` 内のオプションビルダ関数 + `EChart` 直レンダにする
- **データ層は分離**: `mock-data.ts` / `types.ts` は `src/templates/<slug>/` の別ファイルに保ち `relabel: false` を付ける

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

`add` コマンドに `--prompt` を渡すと、テンプレート適用直後に **Vercel AI SDK 経由で AI が画面コピー (表示文言) を最小限ドメインに寄せる (見た目アライン)**。完成済みテンプレの構造・データ・ロジックはそのままに、表示文言だけを軽く相対替えする軽量パスで、コーディングエージェントが Read/Edit を多段で繰り返すよりはるかに高速。

> **設計前提 (重要)**: 表示ラベルは component / page の **プレーンな文字列リテラル** に置き、`lib/*.ts` のデータ配列 (mock-data, derive-insights, types) は `manifest.files[].relabel: false` で **relabel 対象から除外** する。これにより AI は数値・構造が密に混在するデータ配列を一切開かず、構文破壊や数値改変を構造的に防ぐ。テンプレ作成時もこの規約に従うこと (KPI 名・stage 名・chart 軸名などの表示ラベルは描画 component 側に literal/const として持たせ、データ配列には値・id・generic な sample text のみを置く)。

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
| `--model <id>` | モデル ID。provider ごとにデフォルトあり (`gpt-5.4-mini-2026-03-17`, `claude-sonnet-4-5`, `gemini-3.5-flash`, …)。 |
| `--apiKey <key>` | 省略時は `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` (alias: `GOOGLE_AI_API_KEY`) 等の環境変数 fallback。 |
| `--env-file <path>` | 指定した .env ファイルを読み込んでから AI を起動。既存 `process.env` を優先 (`.env` は補完のみ)。Node.js 20.12+ 必須。`--prompt` 併用必須。dotenv 等の追加依存なし (Node 標準 `process.loadEnvFile` を使用、`${VAR}` 展開非対応)。 |
| `--base-url <url>` | OpenAI 互換エンドポイント (任意)。 |
| `--dry-run` | AI 出力を unified diff で表示するだけ、disk 書き込みなし。 |
| `--json` | 結果 (edits, unchanged, skipped, failedVerification, aiError, notes) を JSON で stdout 出力。エージェント呼び出し用。 |

**動作**:
1. `applyTemplate()` でテンプレートを通常通りコピー (全ファイル。`relabel: false` も**コピーはされる**)
2. `manifest.files` のうち **`relabel !== false` のファイルだけ**を relabel 対象集合とし、内容を読み込む (`readInputFiles`)
3. **ファイル 1 つにつき 1 回の `generateObject` を並列実行** (`mapWithConcurrency`, 上限 `RELABEL_CONCURRENCY=4`)。各 call は自ファイル内容のみを user prompt に埋め、schema enum の `path` をそのファイルに固定。出力は小さく切断しにくい
4. AI は各 call で `{ edits: [{ path, old_content, new_content, rationale }], notes }` を返す。`old_content` は置換対象の現在のスニペット (search/replace 方式)
5. **失敗隔離**: あるファイルの call が失敗 (JSON 切断・パース失敗) しても `aiError[]` に積んで継続。他ファイルは巻き添えにならない (旧・単発一括呼び出しの致命点を解消)
6. 各 edit を適用前に **`old_content` を現在のファイル内容と照合** (`applyEditsToFile()`)。見つからない / 複数一致 (非一意) なら、そのファイルの全 edits は破棄して `failedVerification[]` に積む
7. 検証成功した edits をファイル単位で適用し disk に書き戻し (dry-run なら unified diff 表示のみ)

**制約**:
- AI が書き換えるのは **文字列リテラル (表示コピー) の改名のみ**。数値・配列長・データ形状・`import` 行・ロジック・型・JSX 構造は変更しない (system prompt で明示)。新規 import を増やす余地が無いため、旧 IMPORT_CEILING 機構は廃止済み
- AI が編集できるのは **manifest.files のうち `relabel !== false` の dest のみ**。`relabel: false` のデータファイル (mock-data / derive-insights / types) や列挙外のパスは relabel 集合に含めず、万一返ってきても `skipped[]` に積まれる
- `routes.tsx` は触らない (ui-templates / templates は 1 ルート設計)
- 全文書き換えではなく **コンテンツアンカーの search/replace 差分編集** で、変更スニペットのみを AI に出力させる (出力トークン削減 + 大きなファイル対応)
- `old_content` は **ファイル内で一意** である必要がある。AI には system prompt で「曖昧なら周辺コンテキストを足して一意にせよ」と指示済み

**依存**: `ai` / `@ai-sdk/*` は `optionalDependencies`。`--prompt` 指定時のみ動的 import される。未 install 時は親切な `npm install` ガイダンスを表示して exit 1。

**失敗時**: per-file 並列なので、あるファイルの AI 呼び出しが失敗してもそのファイルだけ未変更 (`aiError[]`) で済み、成功した他ファイルは適用される。書き換え済みファイルはそのまま残るので `git status` / `git diff` で確認し、必要なら revert すること。

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
