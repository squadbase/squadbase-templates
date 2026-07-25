# CLAUDE.md — vantage-template

Squadbase Vantage プロジェクトの初期化・カスタマイズ用 CLI ツール（`@squadbase/vantage-template`）。ランタイム依存なし — Node.js 組み込みモジュールのみ使用（AI カスタマイズ時のみ `ai` / `@ai-sdk/*` を動的 import）。

> **Skill の置き場所**: ベーステンプレート同梱の Skill 実体は `base-template/.squadbase/skills/`（`../vantage/.squadbase/skills/` から同期）。`AGENTS.md` はフレームワーク所有で末尾に `vantage add skill --all --dir .claude/skills` と書くが、これは framework 側の既定であり `vantage upgrade` のたびに書き戻される。**このコマンドを実行しない** — 同じ Skill が `.claude/skills/` にも増えるだけ。

`vite-template` の Vantage 版。フレームワークが `@squadbase/vite-server` + 手書きの `src/routes.tsx` から [`@squadbase/vantage`](https://vantage-framework-vantage.vercel.app/) に変わったことで、下記の差分がある。

## ディレクトリ構成

```
vantage-template/
├── src/
│   ├── index.ts              # CLI エントリ — parseArgs + コマンドルーティング
│   ├── commands/
│   │   ├── init.ts           # init コマンド — base-template/ を cwd にコピー
│   │   ├── add.ts            # add コマンド — プロジェクト検証、manifest 読み込み、apply 呼び出し
│   │   └── list.ts           # list コマンド — ui-templates/ を走査して manifest を表示
│   ├── apply.ts              # ファイルコピー（それだけ — パッチ処理は無い）
│   ├── manifest.ts           # 型定義 (TemplateManifest, FileEntry) + ローダー
│   ├── ai/                   # add --prompt の AI relabel パス
│   └── logger.ts             # ANSI カラーログ
├── ui-templates/             # UIパターン別テンプレート (kpi-chart-simple, funnel, etc.)
│   ├── CLAUDE.md             # ★ファイル構成ルール・import 規約。テンプレを触る前に必読
│   └── <template-name>/
│       ├── manifest.json
│       ├── pages/            # index.tsx → 適用先の index.tsx
│       ├── lib/              # mock-data.ts / types.ts (relabel:false のデータ層)
│       ├── server/           # server/api/*.ts（API から配信するテンプレのみ）
│       └── components/       # 分割した場合のみ
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
| ルート追加 | `src/routes.tsx` を文字列パッチ | **パッチ処理は無い**（ファイル追加＝ルート。ナビもベーステンプレートが `useRoutes()` から組む） |
| chart preset | `src/themes/theme-default.css` を全置換 | **無し**（下記「chart コマンドを持たない理由」） |
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
- `base-template/` — Vantage ベースプロジェクトのフルコピー（`init` コマンド用）

### パス解決

tsup が全てを `dist/index.js` にバンドルするため、`__dirname` は常に `dist/` に解決される。アセットディレクトリは1階層上で参照:

- `join(__dirname, "..", "ui-templates")` → `vantage-template/ui-templates/`
- `join(__dirname, "..", "base-template")` → `vantage-template/base-template/`

## CLI

```bash
npx @squadbase/vantage-template init                    # ベーステンプレートを cwd に展開 + npm install
npx @squadbase/vantage-template init --skip-install
npx @squadbase/vantage-template list                    # UI テンプレートを列挙
npx @squadbase/vantage-template list --lang ja          # JA バリアントだけ列挙
npx @squadbase/vantage-template list --json             # JSON で取得 (preview 画像 URL 含む)
npx @squadbase/vantage-template add kpi-chart-simple    # UI テンプレートを適用
npx @squadbase/vantage-template add kpi-chart-simple --dry-run
```

EN/JA は `<name>` と `<name>-ja` のペアで、`files[].dest` は EN/JA で同一（上書き = 相互排他）、`name` だけ異なる。EN/JA を同時に add してはいけない。

## chart コマンドを持たない理由

vite-template には `chart <preset>` があり、`--chart-1..5` トークンを差し替えていた。vantage-template には**無い**。vite 版の `EChart` は `getComputedStyle` で `--chart-*` を読んで light/dark の echarts テーマを組み立てていたが、`@squadbase/vantage` の `EChart` は薄いラッパーで、**CSS 変数を読まない**（canvas 描画なので読めない。`vantage-pitfalls` skill 参照）。トークンを書き換えてもチャートの配色は 1 ピクセルも変わらないため、「効くように見えて効かない」コマンドごと落とした。

配色を変えたいときは `EChartsOption` の `color` に明示的なパレットを渡す。`--chart-*` は Tailwind の `bg-chart-1` などのユーティリティとしては生きている（`@squadbase/vantage/theme.css` が定義）ので、そちらは `styles.css` の override で変えられる。

## `apply.ts` はファイルをコピーするだけ

vite-template の `src/routes.tsx` 文字列パッチに相当する処理は**無い**。Vantage ではファイル追加がそのままルート追加で、ベーステンプレートの `_layout.tsx` が `useRoutes()`（`@squadbase/vantage` v0.1.1〜）からナビを組むため、ページを 1 枚コピーすればルートにもナビにも載る。`manifest` に `nav[]` は存在しない。

ナビの表示名は `definePage({ navLabel })` で調整する（未指定なら `title`、それも無ければパス）。

コピーしかしない結果として `add` は2つの警告を出す（`--json` 時は抑制）:

- **`index.tsx` の上書き予告** — エントリは `action: "replace"` なので `checkConflicts` の対象外で、`--force` 無しでも消える。
- **旧テンプレの残留ファイル検出** — 全 manifest の `add` dest を走査し、今回適用したテンプレ（と、その EN/JA 対）以外の dest がディスク上に残っていれば列挙する。テンプレを乗り換えると前のテンプレの `components/<slug>/` や `server/api/*` が誰からも import されないまま残るため。削除はしない（ユーザーが編集済みかもしれない）。

## テンプレートの追加方法

**ファイル構成ルール・import 規約は [`ui-templates/CLAUDE.md`](./ui-templates/CLAUDE.md) を参照**（このセクションより優先）。要点:

1. `ui-templates/<name>/` ディレクトリを作成
2. `manifest.json` に `name`, `description`, `version`, `files[]`（`pages/index.tsx` → `index.tsx` を `action: "replace"`、他は `components/<name>/` へ `action: "add"`）を定義
3. `pages/index.tsx` をエントリポイントとし、`definePage` でタイトル/説明を宣言（**リテラルのみ**）
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
- `old_content` は **ファイル内で一意** である必要がある

**依存**: `ai` / `@ai-sdk/*` は `optionalDependencies`。`--prompt` 指定時のみ動的 import される。未 install 時は親切な `npm install` ガイダンスを表示して exit 1。
