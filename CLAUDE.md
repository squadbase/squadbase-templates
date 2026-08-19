# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This repository contains templates for [Squadbase](https://www.squadbase.dev/) — a platform where users create projects, get a template deployed to an editor environment, and build dashboards and data apps with Squadbase AI (a coding agent).

## ブランチ運用

**ブランチ = 環境**です。新規プロジェクトの scaffold はこのリポジトリのブランチを直接 remix するため（front-dashboard が env ごとに `github.com/squadbase/squadbase-templates/tree/{branch}/vantage` を引く）、ブランチにコミットが載った時点でその環境の新規プロジェクトに反映されます。publish もビルドも挟みません。

| ブランチ | 環境 |
|---|---|
| `dev1` | DEV1（開発） |
| `dev2` | DEV2（検証） |
| `main` | 本番 |

変更は **`dev1` → `dev2` → `main` の一方向**に流します。

```
feature/xxx ──PR──> dev1 ──PR──> dev2 ──PR──> main
```

1. `dev1` から `feature/xxx` を切り、`dev1` へ PR を出す
2. DEV1 で確認できたら `dev1` → `dev2` の PR を出す（昇格。head が `dev1`、base が `dev2`）
3. DEV2 で確認できたら `dev2` → `main` の PR を出す

**PR はすべて merge commit でマージします（squash / rebase 禁止）。** 昇格 PR が squash されると、同じ変更が別コミットとして各ブランチに積まれ、次の昇格で merge-base が進まず conflict します。

### 禁止事項

- **`dev2` / `main` を直接の変更先にしない。** これらのブランチへ入る変更は、必ず一つ手前のブランチからの昇格 PR 経由にすること。`feature/xxx` → `main` の直行や、同じ変更を 3 ブランチへ別々の PR で入れることはしない
- 本番だけを直したい場合も同じで、**`dev1` から流す**。緊急時に順序を飛ばさないこと

同じ変更を各ブランチへ別々に適用すると、内容は同じでもコミットが別 SHA になり、以後の昇格 PR がすべて conflict します。3 ブランチの内容は常に一致している（`main` は `dev2` の、`dev2` は `dev1` の祖先である）状態を保ってください。

```bash
git diff --stat origin/dev2 origin/dev1   # 差分が無ければ揃っている
git diff --stat origin/main origin/dev2
```

ずれてしまった場合は、内容を揃えたうえで昇格 merge を 2 本通せば祖先関係が復活します（内容が同じであれば merge は素通りします）。

## Directory Structure

`vite/` と `vantage/` の指針は各ディレクトリの `AGENTS.md`、
`vite-server/` `vite-template/` `vantage-template/` は各ディレクトリの `CLAUDE.md` にある。特定ディレクトリで作業する際は先にそれを読むこと。

## Pre-commit Hook

Husky runs `npm run build:all` before every commit — it builds `vite/` and `vantage/`, then verifies that `vantage/AGENTS.md` is not stale (`npm run agents:check`). The commit is rejected if any template build fails or the composed AGENTS.md is out of date.

## `vantage/AGENTS.md` Composition

`vantage/AGENTS.md` は**生成物**（コミット対象）。直接編集しない。

```
vantage/node_modules/@squadbase/vantage/templates/AGENTS.md   # フレームワーク正本
  + agents/vantage/*.md                                        # テンプレート固有（ファイル名順）
  = vantage/AGENTS.md
```

```bash
npm run agents        # 再生成
npm run agents:check  # disk と一致するか検証（build:all が実行する）
```

- **追記は末尾のみ。** 正本の本文にアンカーを置いて割り込まない — `vantage upgrade` で正本が書き換わっても合成が壊れないため。フレームワークの不変条件リストや import サブパス表に足したい内容は、テンプレート側セクションの中に「追加の不変条件」「追加の import サブパス」として自前で持たせる。
- 区切り・`# テンプレート固有の規約` 見出し・優先順位の注記は `scripts/build-agents.js` が所有する。`agents/vantage/*.md` は `##` セクションの中身だけを持つ。
- **`agents/` はリポジトリルートに置く**（`vantage/` の中ではない）。`vantage-template` の `sync-base` が `../vantage/` を丸ごと rsync するので、`vantage/` に置くとビルド用ファイルが出荷される。
- 合成スクリプトの npm script も**ルートの `package.json`** に置く。`vantage/package.json` は利用者に出荷される managed ファイル。
- フレームワーク由来の記述を直したいときは、正本を持つ `@squadbase/vantage` 側を直す（このリポジトリでは上書きできない）。

## Vite vs Vantage

Both are React dashboard templates, but they hand off responsibility differently, so the conventions do **not** transfer:

| | `vite/` + `vite-template/` | `vantage/` + `vantage-template/` |
|---|---|---|
| Framework | App owns `vite.config.ts`, `main.tsx`, `routes.tsx` | `@squadbase/vantage` owns all of it; config files are forbidden |
| Routing | Explicit table in `src/routes.tsx` | File-based (`src/index.tsx` → `/`, `src/sales/[id].tsx` → `/sales/:id`) |
| Building blocks | Copied into `src/components/` (editable) | Imported from `@squadbase/vantage/{ui,components}` (managed) |
| Import style | `@/` alias | Package subpaths + extensionless relative specifiers |
| Backend | `@squadbase/vite-server` + `server-logic/` | `server/api/**` handlers built into the framework — **at the project root, not under `src/`** |
| UI primitives | Radix (`asChild`) | Base UI (`render` prop) |

When working in either tree, read that directory's own guidance file first (上記「Directory Structure」参照)。

## Skills Workflow

The source of truth for Agent Skills is `skills/source/squadbase-vite-react/`. The `vite/skills/` directory is a copy — do not edit it directly.

To sync skills into the Vite template:

```bash
cd vite && npx @squadbase/skills --clean
```

When changing server logic behavior in `vite-server/`, always update the corresponding skill file at `skills/source/squadbase-vite-react/server-logic-development/SKILL.md`.
