[English](./README.md) | 日本語

# Squadbase Templates

[Squadbase](https://www.squadbase.dev) 向けの、プロダクション対応テンプレート集です。

## Squadbase について

Squadbase は、BI（Business Intelligence）のための Vibe Coding プラットフォームです。AI エージェントと対話するだけで、ビジネスダッシュボードを構築できます。フルクラウドのソリューションとしてインフラ構築は一切不要で、数分でダッシュボードの作成を始められます。

Squadbase にはいくつかのデータ接続が標準搭載されていますが、本リポジトリでは単なる接続だけでなく、より実践的ですぐに使えるテンプレートを提供します。これらのテンプレートは実際のビジネスユースケース向けに事前設定されたダッシュボードであり、データ接続を切り替えるだけですぐに利用できます。

## テンプレート

| テンプレート | 説明 |
|----------|-------------|
| [Core Template](./core/) | Squadbase のコアテンプレート |
| [Vite Template](./vite/) | フルスタックテンプレート: Vite 8 + React 19 + @squadbase/vite-server + TypeScript + Tailwind CSS v4 + shadcn/ui |
| [Vantage Template](./vantage/) | @squadbase/vantage ベースの設定ファイル不要テンプレート — ファイルベースルーティング + マネージド UI キット |

### Vite テンプレート

React 19 の SPA と @squadbase/vite-server バックエンドを組み合わせたフルスタックテンプレートで、HMR に対応しています。

**スタック:** Vite 8 · React 19 · @squadbase/vite-server · TypeScript · Tailwind CSS v4 · shadcn/ui · TanStack Query · Apache ECharts

> **@squadbase/vite-server** — Hono ベースのバックエンドサーバーで、SQL / TypeScript のサーバーロジックを管理・実行し、ファイル変更時の自動リロードに対応します。

**コマンド:**

```bash
npm run dev      # 開発サーバーを起動（HMR 有効）
npm run build    # クライアント（dist/client/）とサーバー（dist/server/）をビルド
npm run start    # プロダクションサーバーを起動
```

**開発手順（[`@squadbase/vite-template`](https://www.npmjs.com/package/@squadbase/vite-template) CLI）:**

`@squadbase/vite-template` は、Squadbase Vite プロジェクトの初期化・カスタマイズを行う CLI ツールです。ベーステンプレートの展開や、既存プロジェクトへの追加テンプレート適用（`src/routes.tsx` のパッチを含む）を行えます。

```bash
# 新規プロジェクトを初期化（カレントディレクトリにベーステンプレートをコピー）
npx @squadbase/vite-template init
npx @squadbase/vite-template init --force           # 既存ファイルを上書き

# 既存プロジェクトにテンプレートを適用
npx @squadbase/vite-template add <template-name>
npx @squadbase/vite-template add <template-name> --dry-run   # 変更内容をプレビュー
npx @squadbase/vite-template add <template-name> --force     # 既存ファイルを上書き

# 利用可能なテンプレート一覧を表示
npx @squadbase/vite-template list
```

初期化後の起動:

```bash
npm install
npm run dev
```

テンプレート作成の詳細（`manifest.json` / `files[]` / `routes[]` の仕様）は [`vite-template/README.md`](./vite-template/README.md) を参照してください。

**Skills（AI エージェント向けガイドライン）:**

Skill ファイルの正式な配置場所は `skills/source/squadbase-vite-react/` で、[`@squadbase/skills`](https://www.npmjs.com/package/@squadbase/skills) として公開されています。`vite/skills/` ディレクトリはコピーなので、直接編集しないでください。

| Skill | ソース | 説明 |
|-------|--------|-------------|
| `frontend-development` | `skills/source/squadbase-vite-react/frontend-development/SKILL.md` | React フロントエンド開発のガイドライン |
| `server-logic-development` | `skills/source/squadbase-vite-react/server-logic-development/SKILL.md` | サーバーロジック開発のガイドライン |
| `component-generation` | `skills/source/squadbase-vite-react/component-generation/SKILL.md` | buildPageSection 向け TSX コンポーネント生成ルール |

Skill ファイルを `vite/skills/` に同期するには:

```bash
cd vite && npx @squadbase/skills --clean
```

### Vantage テンプレート

設定ファイル不要（config-free）な React フレームワーク [`@squadbase/vantage`](https://vantage-framework-vantage.vercel.app/) の上に構築したダッシュボードテンプレートです。`vite.config.ts` も `main.tsx` もルートテーブルもありません。書くのは `src/index.tsx` だけで、ルーティング・TanStack Query・Tailwind v4・UI キット・開発サーバー・API サーバー・ビルドはすべてフレームワークが所有します。

**スタック:** @squadbase/vantage（Vite 8 · React 19 · TanStack Router/Query · Tailwind CSS v4 · Base UI · Apache ECharts）

**コマンド:**

```bash
npm run dev      # vantage dev --no-overlay — 開発サーバー + API を :5173 で起動（HMR）
npm run build    # vantage build → dist/（クライアント + サーバー）
npm start        # プロダクションサーバーを起動
npm run check    # vantage check — 静的診断（ルート・境界・禁止ファイル）
npm run routes   # vantage routes — ページ / API のルートマップ
```

v0.2.3 以降、`vantage routes` は `--pages` / `--apis` で片側だけに絞れ、`--detail` を足すと各ルートの静的な仕様（ページ: メタ情報とパスパラメータ / API: メソッド・query キー・リクエストボディ・レスポンスの status と形）まで出ます。どちらも `--json` と併用できます。

v0.3.0 以降、ページ探索ルートは `src/` です（`src/` は URL に現れません: `src/sales/[id].tsx` → `/sales/:id`）。`server/` と `public/` はプロジェクトルート直下のままで、ページを両側に置くと `vantage check` が `SRC_DIR_SPLIT` エラーにします。

v0.5.0 以降、ブラウザから開発ターミナルへの転送は Vite の `server.forwardConsole` に置き換わりました。転送されるのは `console.warn` / `console.error` と未捕捉のエラーだけで（`console.log` は転送されないので、ターミナルで見たいログは `console.warn` で出します）、未捕捉のエラーはソースマップを解決した位置とコードフレーム付きで出ます。テンプレートの `dev` スクリプトは `--no-overlay` を渡していて、エラーが全画面のオーバーレイで画面を覆わずターミナル側だけに出ます。オーバーレイを戻したいときはフラグを外す（または `--overlay` を渡す）だけです。

**開発手順（[`@squadbase/vantage-template`](./vantage-template/) CLI）:**

プロジェクトの初期化と、UI パターン別テンプレートの適用を行います。

```bash
npx @squadbase/vantage-template init          # ベーステンプレートを展開
npx @squadbase/vantage-template list          # 利用可能な UI テンプレートを列挙
npx @squadbase/vantage-template add funnel    # 適用
npx @squadbase/vantage-template chart ocean   # チャート配色プリセットを切り替え
```

## ドキュメント

各テンプレートの詳細なドキュメントは、`skills/source/` 配下の Skill ファイルを参照してください。Vantage テンプレートはエージェント向けガイダンスを `vantage/AGENTS.md` と `vantage/.squadbase/skills/` に同梱しています（どちらもフレームワーク由来。`AGENTS.md` は `npx vantage upgrade`、Skill は `npx vantage add skill --all --force` で再同期されます）。

> v0.2.2 以降、`vantage add skill` はコピー前にプロジェクト内を走査するため、`.squadbase/skills/` にコミット済みの実体を見つけて場所を報告するだけで済み、二重配置は起きません。引数なしで実行すると同梱 Skill と現在の配置先が一覧できます。`--force` は見つかった場所をそのまま更新するので、`--dir` が要るのは初回配置のときだけです。

Squadbase プラットフォームのドキュメントは [Squadbase Docs](https://www.squadbase.dev/ja/docs) をご覧ください。

## コントリビュート

コントリビュートを歓迎します。バグ報告や機能要望は、プルリクエストや Issue でお気軽にお寄せください。

## サポート

- [ドキュメント](https://www.squadbase.dev/ja/docs)
- [GitHub Issues](https://github.com/squadbase/squadbase-templates/issues)
