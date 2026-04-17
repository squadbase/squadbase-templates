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

## ドキュメント

各テンプレートの詳細なドキュメントは、`skills/source/` 配下の Skill ファイルを参照してください。

Squadbase プラットフォームのドキュメントは [Squadbase Docs](https://www.squadbase.dev/ja/docs) をご覧ください。

## コントリビュート

コントリビュートを歓迎します。バグ報告や機能要望は、プルリクエストや Issue でお気軽にお寄せください。

## サポート

- [ドキュメント](https://www.squadbase.dev/ja/docs)
- [GitHub Issues](https://github.com/squadbase/squadbase-templates/issues)
