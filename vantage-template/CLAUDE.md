# CLAUDE.md — vantage-template

Squadbase Vantage プロジェクトの初期化・カスタマイズ用 CLI ツール（`@squadbase/vantage-template`）。ランタイム依存なし — Node.js 組み込みモジュールのみ使用（AI カスタマイズ時のみ `ai` / `@ai-sdk/*` を動的 import）。

> **Skill の置き場所**: ベーステンプレート同梱の Skill 実体は `base-template/.squadbase/skills/`（`../vantage/.squadbase/skills/` から同期）。`AGENTS.md` は v0.2.1 で「まず配置済みの Skill を探し、無いときだけ配置する」に変わったが、そこが挙げる探索先は `ls .claude/skills` と `ls -d vantage-*` の2つで、**`.squadbase/skills/` は挙がらない**。`vantage add skill` を実行する前に `ls .squadbase/skills` を確認すること — 実行すると同じ Skill が二重になる。

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
│   ├── apply.ts              # ファイルコピー（それだけ — パッチ処理は無い）
│   ├── chart-presets.ts      # chart-presets/*.css の読み込みと styles.css への適用
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
| ルート追加 | `src/routes.tsx` を文字列パッチ | **パッチ処理は無い**（ファイル追加＝ルート。ナビもベーステンプレートが `useRoutes()` から組む） |
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

## chart コマンド

`chart <preset>` は `chart-presets/<preset>.css` の `--chart-1..5` を、プロジェクトの `styles.css` にマーカーで囲んだブロックとして書き込む。マーカー内だけを差し替えるので、ユーザーが同じファイルに書いた他の override は壊れない。再実行しても積み上がらない。

**このコマンドは `@squadbase/vantage` v0.2.1 以上が前提**（v0.2.2 以上を推奨）。v0.2.0 までの `EChart` は薄いラッパーでトークンを読まず、書き換えてもチャートの配色は 1 ピクセルも変わらなかった（そのため一度削除した）。v0.2.1 で `EChart` が init 時に `getComputedStyle` で `--chart-1..5`（系列色）と文字色/境界色トークン（軸・凡例・ツールチップ）を解決し、`class` / `style` / `data-theme` の変化と `prefers-color-scheme` を MutationObserver で追うようになったため、プリセットが実際に効くようになった。v0.2.2 でスタイルシート自体の差し替えも監視対象に入った。

- 各プリセットは `:root` と `.dark, [data-theme="dark"]` の両方を定義する（フレームワークの `theme.css` と同じセレクタ）。片方だけだとダークモードで既定に落ちる。
- **`dev` 中の適用も v0.2.2 以降はリロード不要。** `EChart` が `document.head` のスタイルシート変化（`<style>` / `<link>` の追加・差し替え・`href` / `media` / `disabled` の変化）も監視するようになり、Vite が CSS だけ差し替える HMR でも読み直す。トークンの実値が変わった時だけ再描画するので、無関係な CSS 更新でチラつくこともない。v0.2.1 では HMR が拾われず「DOM のトークンは変わっているのにチャートだけ前の色」になっていた。
- 個別のチャートだけ配色を変えたいときは `EChartsOption` の `color` を渡す。option はテーマより優先され、軸まわりのトークン追従は残る。
- `theme` プロップを渡すとトークン追従は完全に止まる。ui-templates では使わない。

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
