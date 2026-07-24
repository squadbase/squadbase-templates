# CLAUDE.md — vantage-template

Squadbase Vantage プロジェクトの初期化・カスタマイズ用 CLI ツール（`@squadbase/vantage-template`）。ランタイム依存なし — Node.js 組み込みモジュールのみ使用（AI カスタマイズ時のみ `ai` / `@ai-sdk/*` を動的 import）。

`vite-template` の Vantage 版。フレームワークが `@squadbase/vite-server` + 手書きの `src/routes.tsx` から [`@squadbase/vantage`](https://vantage-framework-vantage.vercel.app/) に変わったことで、下記の差分がある。

## ディレクトリ構成

```
vantage-template/
├── src/
│   ├── index.ts              # CLI エントリ — parseArgs + コマンドルーティング
│   ├── commands/
│   │   ├── init.ts           # init コマンド — base-template/ を cwd にコピー
│   │   ├── add.ts            # add コマンド — プロジェクト検証、manifest 読み込み、apply 呼び出し
│   │   ├── chart.ts          # chart コマンド — styles.css の chart トークンを差し替え
│   │   └── list.ts           # list コマンド — ui-templates/ を走査して manifest を表示
│   ├── apply.ts              # ファイルコピー + lib/navigation.ts パッチ
│   ├── chart-presets.ts      # chart-presets/*.css の読み込みと styles.css への適用
│   ├── manifest.ts           # 型定義 (TemplateManifest, FileEntry, NavEntry) + ローダー
│   ├── ai/                   # add --prompt の AI relabel パス
│   └── logger.ts             # ANSI カラーログ
├── ui-templates/             # UIパターン別テンプレート (kpi-chart-simple, funnel, etc.)
│   ├── CLAUDE.md             # ★ファイル構成ルール・import 規約。テンプレを触る前に必読
│   └── <template-name>/
│       ├── manifest.json
│       ├── pages/            # home.tsx → 適用先の index.tsx
│       ├── lib/              # mock-data.ts / types.ts (relabel:false のデータ層)
│       └── components/       # 分割した場合のみ
├── chart-presets/            # chart コマンド用の --chart-* トークン CSS
├── base-template/            # ビルド時に ../vantage/ からコピー（gitignore 対象）
├── tsup.config.ts            # dist/index.js にバンドル（#!/usr/bin/env node バナー付き）
├── tsconfig.json
├── package.json
├── .gitignore
└── .npmignore
```

## vite-template との差分（重要）

| | vite-template | vantage-template |
|---|---|---|
| テンプレのエントリ dest | `src/pages/home.tsx` | **`index.tsx`**（ルート直下。Vantage のファイルベースルーティングの `/`） |
| テンプレ固有ファイルの dest | `src/templates/<slug>/` | **`components/<slug>/`**（`templates/` に `.tsx` を置くと意図しないルートが生える） |
| ルート追加 | `src/routes.tsx` を文字列パッチ | **ルート追加は無い**（ファイル追加＝ルート）。代わりに `manifest.nav[]` が `lib/navigation.ts` をパッチ |
| chart preset の適用先 | `src/themes/theme-default.css` を全置換 | **`styles.css` のマーカーブロック**を差し替え（ユーザーの他の override を壊さない） |
| プロジェクト検証 | `src/routes.tsx` の存在 | **`package.json` の `@squadbase/vantage` 依存** |
| テンプレ種別 | `templates/` + `ui-templates/`（`--ui` フラグ） | **`ui-templates/` のみ**（フラグ不要） |
| import | `@/components/...` エイリアス | **`@squadbase/vantage/{ui,components,router,query}`** |

## ビルドプロセス

`npm run build` は以下を順番に実行:

1. **`sync-base`** — `rsync -a --delete ../vantage/ base-template/`（node_modules, dist, .vantage, package-lock.json, *.tsbuildinfo, *.log を除外）
2. **`tsup`** — `src/index.ts` を `dist/index.js` にバンドル（ESM 単一ファイル + shebang）

### npm に公開される内容

- `dist/` — コンパイル済み CLI
- `ui-templates/` — UIパターン別テンプレートデータ
- `chart-presets/` — チャート配色プリセット
- `base-template/` — Vantage ベースプロジェクトのフルコピー（`init` コマンド用）

### パス解決

tsup が全てを `dist/index.js` にバンドルするため、`__dirname` は常に `dist/` に解決される。アセットディレクトリは1階層上で参照:

- `join(__dirname, "..", "ui-templates")` → `vantage-template/ui-templates/`
- `join(__dirname, "..", "chart-presets")` → `vantage-template/chart-presets/`
- `join(__dirname, "..", "base-template")` → `vantage-template/base-template/`

## 開発コマンド

```bash
npm run build      # ../vantage/ からベーステンプレートを同期 + tsup でビルド
npm run release    # npm に公開（@squadbase:registry）
```

## CLI

```bash
npx @squadbase/vantage-template init                    # ベーステンプレートを cwd に展開 + npm install
npx @squadbase/vantage-template init --skip-install --chart sunset
npx @squadbase/vantage-template list                    # UI テンプレートを列挙
npx @squadbase/vantage-template list --lang ja          # JA バリアントだけ列挙
npx @squadbase/vantage-template list --json             # JSON で取得 (preview 画像 URL 含む)
npx @squadbase/vantage-template add kpi-chart-simple    # UI テンプレートを適用
npx @squadbase/vantage-template add kpi-chart-simple --dry-run
npx @squadbase/vantage-template chart ocean             # チャート配色を差し替え
```

EN/JA は `<name>` と `<name>-ja` のペアで、`files[].dest` は EN/JA で同一（上書き = 相互排他）、`name` だけ異なる。EN/JA を同時に add してはいけない。

## `lib/navigation.ts` パッチの仕組み

Vantage にはルートテーブルが無いので、テンプレートが寄与できるのは**ナビの項目**だけ。`manifest.nav[]` が空でないとき、`apply.ts` が文字列操作（AST ではなく）で `lib/navigation.ts` をパッチする:

1. `lib/navigation.ts` を読み込み
2. `href: "<href>"` で重複をチェック
3. lucide アイコンが未 import なら `import { ... } from "lucide-react"` に追記
4. 最後の `]`（`NAV_ITEMS` 配列の閉じ括弧）の手前にエントリを挿入

`navigation.ts` はベーステンプレートが管理する固定構造のため、この方式で動作する。現行の ui-templates はすべて 1 ルート設計なので `nav` は空配列で、このパスは通らない。

## テンプレートの追加方法

**ファイル構成ルール・import 規約は [`ui-templates/CLAUDE.md`](./ui-templates/CLAUDE.md) を参照**（このセクションより優先）。要点:

1. `ui-templates/<name>/` ディレクトリを作成
2. `manifest.json` に `name`, `description`, `version`, `files[]`（`pages/home.tsx` → `index.tsx` を `action: "replace"`、他は `components/<name>/` へ `action: "add"`）, `nav[]`（空）を定義
3. `pages/home.tsx` をエントリポイントとし、`definePage` でタイトル/説明を宣言（**リテラルのみ**）
4. `lib/mock-data.ts` / `lib/types.ts` は `relabel: false` を付ける
5. `node dist/index.js add <name> --dry-run` で適用レイアウトを確認
6. 実際に適用して `npx vantage check` と `npx tsc --noEmit` が通ることを確認

## AI カスタマイズ (`add --prompt`)

`add` コマンドに `--prompt` を渡すと、テンプレート適用直後に **Vercel AI SDK 経由で AI が画面コピー（表示文言）を最小限ドメインに寄せる（見た目アライン）**。完成済みテンプレの構造・データ・ロジックはそのままに、表示文言だけを軽く相対替えする軽量パスで、コーディングエージェントが Read/Edit を多段で繰り返すよりはるかに高速。

> **設計前提（重要）**: 表示ラベルは component / page の **プレーンな文字列リテラル** に置き、`lib/*.ts` のデータ配列（mock-data, types）は `manifest.files[].relabel: false` で **relabel 対象から除外** する。これにより AI は数値・構造が密に混在するデータ配列を一切開かず、構文破壊や数値改変を構造的に防ぐ。

```bash
npx @squadbase/vantage-template add kpi-chart-simple \
  --prompt "SaaS の MRR / ARR / 解約率 / 新規MRR ダッシュボード化" \
  --provider openai \
  --model gpt-4o \
  --apiKey $OPENAI_API_KEY
```

| Flag | 説明 |
|---|---|
| `--prompt <text>` | カスタマイズ意図。**未指定なら AI を起動せず従来挙動**。 |
| `--provider <name>` | `openai` / `anthropic` / `google` / `mistral` / `xai` / `groq` 等。`open-ai` 表記も正規化。 |
| `--model <id>` | モデル ID。provider ごとにデフォルトあり。 |
| `--apiKey <key>` | 省略時は `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` 等の環境変数 fallback。 |
| `--env-file <path>` | 指定した .env ファイルを読み込んでから AI を起動。既存 `process.env` を優先。Node.js 20.12+ 必須。`--prompt` 併用必須。 |
| `--base-url <url>` | OpenAI 互換エンドポイント（任意）。 |
| `--dry-run` | AI 出力を unified diff で表示するだけ、disk 書き込みなし。 |
| `--json` | 結果（edits, unchanged, skipped, failedVerification, aiError, notes）を JSON で stdout 出力。エージェント呼び出し用。 |

**動作**:
1. `applyTemplate()` でテンプレートを通常通りコピー（全ファイル。`relabel: false` も**コピーはされる**）
2. `manifest.files` のうち **`relabel !== false` のファイルだけ**を relabel 対象集合とし、内容を読み込む
3. **ファイル 1 つにつき 1 回の `generateObject` を並列実行**（上限 `RELABEL_CONCURRENCY=4`）
4. AI は各 call で `{ edits: [{ path, old_content, new_content, rationale }], notes }` を返す（search/replace 方式）
5. **失敗隔離**: あるファイルの call が失敗しても `aiError[]` に積んで継続。他ファイルは巻き添えにならない
6. 各 edit を適用前に **`old_content` を現在のファイル内容と照合**。見つからない / 非一意ならそのファイルの全 edits を破棄して `failedVerification[]` に積む
7. 検証成功した edits をファイル単位で適用し disk に書き戻し（dry-run なら unified diff 表示のみ）

**制約**:
- AI が書き換えるのは **文字列リテラル（表示コピー）の改名のみ**。数値・配列長・データ形状・`import` 行・ロジック・型・JSX 構造は変更しない
- AI が編集できるのは **manifest.files のうち `relabel !== false` の dest のみ**
- `lib/navigation.ts` は触らない（ui-templates は 1 ルート設計）
- `old_content` は **ファイル内で一意** である必要がある

**依存**: `ai` / `@ai-sdk/*` は `optionalDependencies`。`--prompt` 指定時のみ動的 import される。未 install 時は親切な `npm install` ガイダンスを表示して exit 1。
