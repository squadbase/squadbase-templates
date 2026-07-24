# CLAUDE.md — Squadbase Vantage Template

Squadbase 上で動くダッシュボードアプリのベーステンプレート。フレームワークは [`@squadbase/vantage`](https://vantage-framework-vantage.vercel.app/)。

## まず [AGENTS.md](./AGENTS.md) を読むこと

`AGENTS.md` は **Vantage フレームワークが所有する正本のコピー**で、ルーティング規約・import サブパス・不変条件（設定ファイル禁止、`.js` 拡張子、`PUBLIC_` env など）が書かれている。**フレームワークの使い方はすべてそちらが正**。

このファイルは、その上に乗る **Squadbase 固有の事情**だけを書く。

> ⚠️ `AGENTS.md` は `npx vantage upgrade` を実行するとフレームワーク同梱の正本で**丸ごと上書きされる**。プロジェクト固有のメモをそこに書かないこと（このファイルに書く）。

## Squadbase 固有の構成

### `_layout.tsx` がプロバイダの唯一の置き場

Vantage は React root を所有するので `main.tsx` が無い。アプリ全体に効かせるプロバイダは**ルートレイアウト（`_layout.tsx`）に置く**。現状ここに `SquadbaseProvider`（`@squadbase/react`）が入っていて、`useUser()` にログインユーザーを供給している。QueryClient のプロバイダはランタイムが既に入れているので**自前で足さない**。

### `lib/navigation.ts` がナビの唯一の情報源

Vantage はルート自体はファイルシステムから導出するが、**ナビの並び順・ラベル・アイコンは導出しない**。ページファイルを追加したら（例: `monthly-analysis.tsx` → `/monthly-analysis`）、`lib/navigation.ts` の `NAV_ITEMS` にエントリを足すこと。足さないとページは存在するがヘッダーのナビに出ない。

### `components/` のローカル部品

Vantage の UI キットに無いものだけをここに置いている。フレームワーク側にあるものを再実装しないこと。

| ファイル | 何のためにあるか |
| --- | --- |
| `components/placeholder.tsx` | サンプル値であることを示すインライン `<span>`。`Skeleton` と違い `<p>` の中に置ける |
| `components/sparkline.tsx` | テーブルセル / KPI カード用の極小トレンド SVG。セルごとに ECharts インスタンスを持たせないための意図的な非 `EChart` 実装 |
| `components/user-card.tsx` | `@squadbase/react` の `useUser()` を使う認証ユーザーチップ。UI キットに `Avatar` が無いのでイニシャル丸はインライン |

### デプロイ

`squadbase.yml` の `build.framework` は `squadbase-vantage`。ビルドは `vantage build`、本番起動は `node dist/server/index.mjs`（`npm start`）。

`server/api/**` が 1 つでもあると **fullstack モード**（サーバーバンドルを生成）、無ければ SPA モードになる。`server/api/health.ts` はその種火なので、API を使わないなら `server/` ごと消してよい（そのとき `npm start` も `vantage preview` に変える）。

## よく踏む罠

- **UI キットは Radix ではなく Base UI**。`asChild` は無い（`render` prop を使う）、`ToggleGroup` の value は配列、`Select` の `onValueChange` は `string | null`。詳細は `.claude/skills/vantage-pitfalls/SKILL.md`。
- **相対 import は `.js` 拡張子で書く**（`./components/user-card.js`）。ソースが `.tsx` でも `.js`。
- **`.tsx` はどこに置いてもページになる**。ルート走査から外れるのは `components/` `hooks/` `lib/` `server/` `public/` だけ。ページでないコンポーネントを他のディレクトリに置くと `vantage check` が `MISSING_DEFAULT_EXPORT` で落ちる。
- **設定ファイルを作らない**。`vite.config.*` / `tailwind.config.*` / `postcss.config.*` / `components.json` / `vantage.config.*` はいずれも `vantage check` がエラーにする。テーマ調整は `styles.css` のトークンで行う。

## コマンド

```bash
npm run dev      # 開発サーバー（HMR + API）:5173
npm run build    # 本番ビルド → dist/
npm start        # 本番サーバー起動（fullstack 時）
npm run check    # 静的診断（ルート・境界・禁止ファイル）
npm run routes   # ページ + API の URL マップ
```
