# CLAUDE.md — ui-templates

UIパターン別テンプレート（KPI重視・チャート格子・テーブル重視・ファネル・タブ構成 など）。ユースケース非依存の **UI 骨格の見本市**。コーディングエージェントがこれを起点にユーザー要望のダッシュボードを実装する。

このファイルは **`ui-templates/` 配下のファイル構成ルール** を定義し、親 [`../CLAUDE.md`](../CLAUDE.md) の「命名規約 `ui-template-<slug>` プレフィックス」を **上書きする**（プレフィックスは廃止）。デザイン要件・AI relabel・EN/JA・CLI の挙動は親に従う。

## 設計目標

テンプレートは「出発点」であり、適用後にエージェントが本実装を被せていく。そのため次の3点を最優先する:

1. **探索コスト最小** — テンプレ由来のコードが一目で分かること
2. **デッドコード/削除コスト最小** — 不要になったら迷わず一掃できること
3. **indirection 最小** — エージェントが編集対象に最短で到達できること

## ファイル構成の原則

### 1. 1テンプレ = 1ディレクトリ（コロケーション）

適用先では、`home.tsx`（エントリ）以外のテンプレ固有ファイルを **`src/templates/<slug>/` 1ディレクトリに集約** する。`src/components/`・`src/lib/`・`src/types/` にプレフィックス名で散らさない。

```
# 適用先（dest）レイアウト
src/pages/home.tsx                    # エントリ（routes が指す固定パス）
src/templates/<slug>/
  mock-data.ts                        # データ層（relabel:false / 差し替え対象）
  types.ts                            # 型（home と data で共有）
  ...（分割した場合のみ追加ファイル）
```

- **探索**: `src/templates/<slug>/` を見ればテンプレ由来が一覧完結
- **削除**: `rm -rf src/templates/<slug>/` で一掃。何がテンプレ由来か自明
- import は `@/templates/<slug>/*`（`@/* → ./src/*` エイリアスで解決）

### 2. インライン優先 — 薄いラッパ component を作らない

**`data → EChartsOption → <EChart>` だけの薄いチャート component は作らず、`home.tsx` 内のオプションビルダ関数にする。**

真のラッパは `@/components/data/echart` の `EChart`（echarts init・テーマ解決・dark/light・resize を担う）。テンプレ側で各チャートを React component で包み直しても、内部 state も再利用もなければ indirection（home → charts.tsx → option → EChart）を増やすだけ。

```tsx
// ❌ 避ける: 薄いラッパ component を別ファイルに分割
// components/charts.tsx
export function AreaChart({ data }: { data: TimePoint[] }) {
  const option: EChartsOption = { /* ... */ }
  return <EChart option={option} height="280px" />
}

// ✅ 推奨: home.tsx 内のオプションビルダ関数 + EChart 直レンダ
function areaOption(data: TimePoint[]): EChartsOption {
  return { /* ... */ }
}
// JSX 内:
<EChart option={areaOption(timeSeries)} height="280px" />
```

チャート整形ヘルパ（`getBaseGrid` / `formatNumber` 等）も同様に `home.tsx` 内へ inline する。

### 3. データ層（mock-data / types）は分離する

`mock-data.ts` と `types.ts` は `home.tsx` に inline せず、`src/templates/<slug>/` の別ファイルに保つ。

- **実データ接続が明快**: モックは `mock-data.ts` 1枚を差し替えるだけ。巨大ファイルの手術にならない
- **AI relabel（`add --prompt`）と整合**: データ配列は `manifest.files[].relabel: false` で relabel 対象から除外する（数値・構造の破壊防止）。ファイル単位で除外する仕組みなので、分離していれば機能はそのまま維持される
- 表示ラベル（KPI名・軸名・stage名など）は描画側（`home.tsx`）の literal/const に置き、データ配列には値・id・generic な sample text のみ置く（親 CLAUDE.md「AI カスタマイズ」の設計前提に従う）

### 4. デッドコードを残さない

テンプレに未使用の関数・型・import を残さない（例: チャートで使わない `formatCurrency` は削除）。テンプレはエージェントの見本になるため、未使用コードは混乱とノイズの元。

### 分割してよい例外

次のいずれかに当てはまる UI は、`src/templates/<slug>/` 配下に component ファイルを切り出してよい（プレフィックスは付けず、ディレクトリで隔離されている前提）:

- **再利用される** — 同じ表を複数箇所で使う等
- **内部 state / interaction を持つ** — 行展開・ローカルフィルタ・モーダル等
- **home.tsx が長くなりすぎる** — 目安として 1 ファイル 400〜500 行を超えるなら、テーマの主役要素だけ切り出す（例: `kpi-chart-advanced` の大きなテーブル）

迷ったら inline。「component に分けると綺麗」は分割理由にならない（再利用も state も無ければ indirection を増やすだけ）。

## ソースのオーサリング構造（このリポジトリ側）

`ui-templates/<slug>/` 内のソース配置と、適用先 `dest` の対応:

```
ui-templates/<slug>/
  manifest.json
  preview-square.png / preview-wide.png
  pages/home.tsx        → dest: src/pages/home.tsx            (replace)
  lib/mock-data.ts      → dest: src/templates/<slug>/mock-data.ts  (add, relabel:false)
  lib/types.ts          → dest: src/templates/<slug>/types.ts      (add, relabel:false)
  components/*.tsx       → dest: src/templates/<slug>/*.tsx         (add)  ※分割した場合のみ
```

## manifest.json

```json
{
  "name": "<slug>",
  "description": "...",
  "version": "0.1.0",
  "files": [
    { "src": "pages/home.tsx", "dest": "src/pages/home.tsx", "action": "replace" },
    { "src": "lib/mock-data.ts", "dest": "src/templates/<slug>/mock-data.ts", "action": "add", "relabel": false },
    { "src": "lib/types.ts", "dest": "src/templates/<slug>/types.ts", "action": "add", "relabel": false }
  ],
  "routes": []
}
```

- `routes[]` は **常に空**（ui-templates は 1 ルート設計。`home.tsx` を起点にする）
- データファイルには `"relabel": false` を必ず付ける
- 分割した component は `{ "src": "components/<x>.tsx", "dest": "src/templates/<slug>/<x>.tsx", "action": "add" }` を追加

## EN/JA・見本市の例外・デザイン要件・CLI

これらは親 [`../CLAUDE.md`](../CLAUDE.md) の記述に従う（このファイルでは変更しない）:

- **EN/JA ペア**: `<slug>` と `<slug>-ja`。`files[].dest` は EN/JA で同一（上書き = 相互排他）、`name` だけ異なる。同時 add しない
- **見本市の例外ルール**: PageShellSummary 非必須・開始要素は自由・HeaderEnd は DateRangePicker 限定でない・2カラム可（ただし `PageShell` / `DashboardCard` / `EChart` ラッパは維持）
- **AI カスタマイズ（`add --prompt`）**: 表示ラベルは描画側 literal、データ配列は `relabel:false`
- **CLI**: `--ui` フラグ必須（`list --ui` / `add --ui <name>` / `--dry-run`）

## チェックリスト（テンプレ追加・改修時）

1. テンプレ固有ファイルの `dest` は `src/templates/<slug>/` 配下か（プレフィックス命名を使っていないか）
2. 薄いチャートラッパ component を作っていないか（オプションビルダ関数 + `EChart` 直レンダにしたか）
3. `mock-data.ts` / `types.ts` は分離され `relabel:false` が付いているか
4. 未使用の関数・型・import が残っていないか
5. `node dist/index.js add --ui <slug> --dry-run` で適用レイアウトを確認し、適用先で `tsc -b` / `eslint` が通るか
6. EN/JA 両方を同じ構成に揃えたか
