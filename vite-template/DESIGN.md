# DESIGN.md — Squadbase ダッシュボード・データアプリ デザインガイドライン

Squadbase の Vite テンプレート（Vite + React 19 + Tailwind CSS v4 + shadcn/ui）を使ってダッシュボード・データアプリを構築する際の UI/UX 設計指針。

---

## 1. デザイン哲学

### 意図的なデザイン

コードを書く前に、必ず設計の方向性を決める。「なんとなくそれっぽいUI」ではなく、目的・対象・文脈に応じた意図的な選択をすること。

- **目的を先に決める**: このダッシュボードは何を伝えるか、誰が使うかを言語化する
- **データが主役**: 装飾や過度なビジュアルエフェクトよりデータの明快な伝達を優先する
- **一貫性**: カラー・タイポグラフィ・間隔のルールを画面全体で統一する
- **「映える」を意図的に設計する**: 整然と情報が並んでいるだけでは人を惹きつけない。視覚的なリズム・ヒエラルキー・ストーリーテリングを意識し、ユーザーが「使いたい」と感じるビジュアルを作る

### ダッシュボードの分類

設計前にどちらのタイプかを決める:

| タイプ | 特徴 | 例 |
|--------|------|-----|
| **提示型** | 重要な指標を一覧で表示、シンプルな構成、受け手が受動的に読む | 経営KPIダッシュボード、週次レポート |
| **探索型** | フィルター・ドリルダウン対応、ユーザーが能動的に分析する | 売上分析ツール、運用モニタリング |

提示型は「見て即理解できること」を、探索型は「目的のデータにすばやくたどり着けること」を最優先にする。

---

## 2. 情報アーキテクチャ（設計前の確認事項）

コードを書く前に以下を決める:

```
Who  : 誰が見るか（経営者・現場担当者・エンジニア）
What : 何を伝えるか（KPI・トレンド・異常検知・詳細明細）
Why  : なぜ必要か（意思決定・監視・報告）
When : いつ見るか（リアルタイム・日次・週次）
Where: どのデバイスで見るか（デスクトップ主体か、モバイル対応も必要か）
```

### コンテンツ優先度

画面上部から下部に向かって、重要度順に配置する:

1. **ページタイトル + 概要説明** — 何の画面かを一瞬で伝える
2. **最重要 KPI カード** — 最も見てほしい数値を最上部に
3. **トレンドチャート** — 時系列・比較を視覚化
4. **詳細テーブル** — ドリルダウン用の明細データ
5. **補足情報** — 脚注・更新日時・データ出典

---

## 3. レイアウト原則

### 基本構造

```tsx
// ページの標準コンテナ
<div className="container mx-auto max-w-6xl space-y-6 p-8">
  <div>
    <h1 className="text-3xl font-bold">ページタイトル</h1>
    <p className="text-muted-foreground">概要説明</p>
  </div>
  {/* KPI カード行 */}
  {/* チャート行 */}
  {/* テーブル行 */}
</div>
```

### グリッドパターン

| 用途 | クラス |
|------|--------|
| KPI カード（4列） | `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` |
| KPI カード（3列） | `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` |
| チャート2列並び | `grid gap-6 lg:grid-cols-2` |
| チャート（大）+ サイドバー | `grid gap-6 lg:grid-cols-3` （2:1比率は `lg:col-span-2` を使用）|
| 全幅チャート/テーブル | 単一カラム |

### 視覚の流れ

- **左上 → 右下**のZ字・F字スキャンパターンに従って重要情報を配置する
- 各セクション間の余白は `space-y-6`（24px）を基本とし、関連要素間は `gap-4`（16px）
- セクション内の詰め込みを避ける。情報量が多い場合はタブで分割する

### 視覚的ヒエラルキーの作り方

単調な均等グリッドは避け、主役と脇役の差をレイアウトで表現する:

- **主役チャート**: 全幅（`col-span-full`）または2/3幅（`lg:col-span-2`）で大きく表示する
- **脇役カード**: 1/3幅や小サイズで主役を補完する
- **KPIカード行**: 均等並びでも構わないが、特に重要な1枚を大きくする選択もある
- **KPIカードはメインチャートの上に小さく配置する**: KPIカードの面積はメインチャートより大幅に小さくする。「数値で概要 → チャートで詳細」という視線フローを意図的に設計する

```tsx
// 主役チャート（2/3） + サマリーパネル（1/3）の例
<div className="grid gap-6 lg:grid-cols-3">
  <Card className="lg:col-span-2"> {/* 主役 */}
    <EChartsWrapper height="360px" ... />
  </Card>
  <Card> {/* 脇役 */}
    ...
  </Card>
</div>
```

### ヘッダーゾーンのパターン

ページヘッダーはタイトル + 説明文だけに留めず、ダッシュボードの目的に応じたパターンを選ぶ:

| パターン | 特徴 | 向くケース |
|----------|------|-----------|
| **フィルター型** | ヘッダー右側に日付レンジ・期間切り替えを配置 | データ分析・探索型ダッシュボード |
| **ステータス要約型** | 最重要KPIをヘッダーエリアに要約表示 | 経営KPI・モニタリング |
| **ストーリーテリング型** | 「今日の売上は前日比+12%」のように文章でサマリーを示す | 日次レポート・提示型ダッシュボード |

いずれのパターンでも、ヘッダーが「ページに入った瞬間の文脈理解」を助けることが目的。

```tsx
// ストーリーテリング型ヘッダーの例（ウェルカムメッセージ + 日付）
<div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
  <div>
    <h1 className="text-3xl font-bold">おかえりなさい、Keita さん</h1>
    <p className="text-muted-foreground">今日の売上は昨日比 +12%。好調です。</p>
  </div>
  <div className="rounded-md border bg-muted/40 px-3 py-1.5 text-right text-sm text-muted-foreground">
    <span className="font-medium text-foreground">2024年12月21日（木）</span>
    <br />
    <span>直近30日間のデータ</span>
  </div>
</div>
```

### 絶対に避けること

- 1画面に10個以上のチャートを並べる
- 全てのカードを同じサイズ・同じ重みで均等に並べる（主役がいないレイアウト）
- スクロールなしで全情報を詰め込もうとする
- ヘッダーをタイトル + 説明文だけで終わらせる

---

## 4. カラーシステム

### CSS 変数（`src/index.css`）の活用

ハードコードした色は使わず、必ず CSS 変数（Tailwind クラス）を使う。ダークモードが自動で機能する。

**セマンティックカラー（用途別）:**

| 変数 / Tailwindクラス | 用途 |
|---|---|
| `bg-background` / `text-foreground` | ページ背景・本文テキスト |
| `bg-card` / `text-card-foreground` | カード背景 |
| `text-muted-foreground` | 補足テキスト・ラベル |
| `bg-primary` / `text-primary-foreground` | 強調ボタン・アクションアイテム |
| `text-destructive` | エラー・警告・マイナス指標 |
| `border-border` | ボーダー・区切り線 |

**チャート専用カラー:**

`--chart-1` 〜 `--chart-5` を ECharts の系列色として使用する（後述の実装パターン参照）。

### アクセシビリティ基準

- テキストと背景のコントラスト比: **4.5:1 以上**
- グラフ要素（線・棒）のコントラスト比: **3:1 以上**
- **色だけで情報を区別しない**: 必ずラベル・パターン・アイコンを併用する
- 色覚多様性への配慮: グレースケールで表示しても情報が読み取れるか確認する

### チャートでの色使い

- 系列は **5色まで**（`--chart-1` 〜 `--chart-5`）
- ポジティブ指標 → `--chart-2`（緑系）、ネガティブ指標 → `--destructive`（赤系）
- 強調したい系列を濃く、背景的な系列は薄くする

---

## 5. タイポグラフィ

### 見出し階層

```tsx
// ページタイトル
<h1 className="text-3xl font-bold">ダッシュボード名</h1>

// セクションタイトル（カード内）
<CardTitle className="text-base font-semibold">売上推移</CardTitle>

// カードのラベル
<CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>

// KPI 数値
<div className="text-2xl font-bold">¥4,523,100</div>

// 補足テキスト
<p className="text-xs text-muted-foreground">先月比 +20.1%</p>
```

### 数値の表示

- 大きな数値は単位を省略して読みやすくする（例: `¥4.5M`、`2,350件`）
- 増減は必ず符号付きで表示し、ポジティブ/ネガティブを色で補足する

```tsx
// 増減表示のパターン
<p className={cn("text-xs", change >= 0 ? "text-green-600" : "text-destructive")}>
  {change >= 0 ? "+" : ""}{change}% 先月比
</p>
```

---

## 6. コンポーネント使用ガイドライン

### KPI カード

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
    <TrendingUp className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">¥4,523,100</div>
    <p className="text-xs text-muted-foreground">+20.1% 先月比</p>
  </CardContent>
</Card>
```

- アイコンは `lucide-react` から選ぶ。サイズは `h-4 w-4`、色は `text-muted-foreground`
- KPI カードのアイコンは「装飾」であり「情報」ではない。数値・ラベルが主役

#### 設計原則: 1カード = 1つの問い

各カードは「1つの問いへの答え」として自己完結するよう設計する。カードを個別に見ても・全体で見ても意味が通じる構成にすること。

- KPIカード: 「今の数値は？」→ 数値 + 前期比 + スパークライン（任意）で完結
- チャートカード: 「どんな傾向か？」→ チャート + ラベル + ローカルフィルター（任意）で完結
- 1カードに複数の独立した問いを詰め込まない

### データテーブル

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
```

- ソート可能な列にはソートアイコン（`<ArrowUpDown>`）を付ける
- 行数が多い場合は必ずページネーションを実装する
- ステータス列には `<Badge>` を使い、色でも意味を補足する
- 数値列は右揃え、テキスト列は左揃え

### フィルター・コントロール

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MultiSelect } from "@/components/ui/multi-select";
```

- フィルターエリアはページ上部またはカード内ヘッダーに配置する
- フィルターの変更は即座にデータに反映させる（送信ボタン不要）
- 選択中のフィルター条件はユーザーが常に確認できる状態にする

#### グローバルフィルターとカードローカルフィルターの使い分け

- **グローバルフィルター**（ページ上部・ヘッダー直下）: 全カードに共通する期間・対象の絞り込み
- **カードローカルフィルター**（カード内右上のセレクト等）: 特定カードの粒度・比較軸の変更
- 両者の二重構造で「全体の文脈を保ちつつ個別カードを深掘りできる」体験を実現する

例: グローバルで「2024年通年」を選択しつつ、特定チャートカードだけ「月次 ↔ 週次」を切り替える

### ローディング・空状態

```tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Empty } from "@/components/ui/empty";

// ローディング中
<Skeleton className="h-[300px] w-full rounded-xl" />

// データなし
<Empty description="データが見つかりませんでした" />
```

- データ取得中は必ず `<Skeleton>` で placeholderを表示する
- データが0件の場合は `<Empty>` を使い、理由や次のアクションを示す

---

## 7. チャート選択ガイド

### 用途別早見表

| チャートタイプ | 最適な用途 | 避けるべきケース |
|----------------|-----------|----------------|
| **折れ線グラフ** | 時系列トレンド、複数系列の変化比較 | 系列が6本以上 |
| **棒グラフ（縦）** | カテゴリ間の数値比較 | カテゴリが20個以上 |
| **棒グラフ（横）** | ランキング、長いラベルのカテゴリ比較 | — |
| **積み上げ棒グラフ** | 合計値と内訳の同時表示 | 系列が5個以上 |
| **面グラフ** | 合計量の時系列変化と内訳 | 系列が4個以上 |
| **円グラフ** | 全体に占める割合（構成比） | 項目が6個以上、数値差が小さい |
| **散布図** | 2変数間の相関関係 | — |

### 選択フローチャート

```
「時系列データか?」
  → Yes: 「量の変化を見たい?」
           → Yes: 折れ線グラフ or 面グラフ
           → No（累積・割合）: 積み上げ面グラフ
  → No: 「カテゴリ比較か?」
          → Yes: 「順位/ランキングか?」
                   → Yes: 横棒グラフ
                   → No: 縦棒グラフ
          → No: 「割合か?」
                  → Yes（項目5個以下）: 円グラフ
                  → Yes（項目6個以上）: 横棒グラフ
                  → No（相関）: 散布図
```

### チャートタイプの多様性を保つ

1画面に複数チャートを配置する場合、同じタイプを並べるだけにしない:

| 避けるべき例 | 推奨例 |
|---|---|
| 棒グラフ × 3 並び | 折れ線（トレンド）+ 棒（比較）+ ドーナツ（構成比） |
| 折れ線 × 4 並び | 面グラフ（累積）+ 横棒（ランキング）+ KPIカード |

**目安**: チャートが3つ以上並ぶ画面では、最低2種類以上のタイプを混在させる。チャートタイプの多様性がそのままダッシュボードの視覚的リッチさにつながる。

---

## 8. ECharts 実装パターン

### 基本インポートと使用

```tsx
import { EChartsWrapper } from "@/components/ui/echarts";
import type { EChartsOption } from "echarts";

// CSS 変数から色を取得するヘルパー
function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}
```

### ダークモード対応の色設定

ECharts は CSS 変数を直接参照できないため、JavaScript で値を取得して渡す:

```tsx
const option: EChartsOption = {
  backgroundColor: "transparent",
  textStyle: {
    color: getCssVar("--foreground") || "#1a1a1a",
  },
  color: [
    getCssVar("--chart-1") || "#e76e50",
    getCssVar("--chart-2") || "#2a9d8f",
    getCssVar("--chart-3") || "#264653",
    getCssVar("--chart-4") || "#e9c46a",
    getCssVar("--chart-5") || "#f4a261",
  ],
  // ...
};
```

### 折れ線グラフの標準パターン

```tsx
<EChartsWrapper
  option={{
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" },
    legend: { bottom: 0 },
    grid: { left: "3%", right: "4%", bottom: "10%", containLabel: true },
    xAxis: {
      type: "category",
      data: ["1月", "2月", "3月", "4月", "5月", "6月"],
      axisLine: { lineStyle: { color: getCssVar("--border") } },
    },
    yAxis: {
      type: "value",
      min: 0, // Y軸は必ず0から始める
      axisLine: { show: false },
      splitLine: { lineStyle: { color: getCssVar("--border") } },
    },
    series: [
      {
        name: "売上",
        type: "line",
        smooth: true,
        data: [820, 932, 901, 934, 1290, 1330],
      },
    ],
  }}
  height="300px"
/>
```

### 棒グラフの標準パターン

```tsx
<EChartsWrapper
  option={{
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" },
    grid: { left: "3%", right: "4%", bottom: "10%", containLabel: true },
    xAxis: { type: "category", data: categories },
    yAxis: { type: "value", min: 0 },
    series: [{ type: "bar", data: values, barMaxWidth: 60 }],
  }}
  height="300px"
/>
```

### チャートを Card 内に配置する標準パターン

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>月次売上推移</CardTitle>
  </CardHeader>
  <CardContent>
    <EChartsWrapper option={option} height="300px" />
  </CardContent>
</Card>
```

### やってはいけないこと

- `height` を省略しない（デフォルトの 400px で問題ない場合は明示的に指定）
- Y軸の `min` を 0 以外に設定しない（視覚的な誇張になる）
- `tooltip` を省略しない（データ読み取りに必須）
- 凡例（`legend`）は系列が2つ以上ある場合は必ず設定する
- 3D チャートは使わない（データの正確な読み取りが困難になる）

---

## 9. Do's & Don'ts

### Do ✓

- **最重要情報を画面の最上部・左上に配置する**
- **主役チャートは大きく表示する**（全幅 or 2/3幅）
- **ヘッダーエリアを活用してリズムを作る**（フィルター・要約・ストーリーなど目的に応じたパターンを選ぶ）
- **カード内部にスパークライン・進捗バーなど複合要素を持たせてリッチにする**
- **一貫したカラースキームを使う**（CSS 変数を守る）
- **余白を十分に取る**（詰め込まない）
- **データの文脈を示す**（比較値・前期比・目標値）
- **ローディング・エラー・空状態を必ず実装する**
- **チャートには必ず tooltip を設定する**
- **数値には単位を明記する**

### Don't ✗

- **全てのカードを同じサイズ・同じ重みで並べない**（単調なグリッドは避ける）
- **ヘッダーをタイトル + 説明文だけで終わらせない**
- **色だけで情報を区別しない**（ラベル・形状を併用）
- **Y軸を 0 以外から始めない**（データの誇張になる）
- **3D グラフを使わない**
- **グラフを装飾として使わない**（データを持たないグラフは不要）
- **1ページに10個以上のチャートを並べない**
- **凡例をチャートから離れた場所に配置しない**
- **ハードコードした色を使わない**（`bg-blue-500` ではなく CSS 変数を使う）
- **スマートフォンでの表示確認を怠らない**（`sm:` `lg:` ブレークポイントを活用）

---

## 10. 映えるダッシュボードの設計原則

LovableやBase44のダッシュボードテンプレートが「微妙」に見える理由は、均等グリッド・素朴なKPIカードの羅列・タイトルだけのヘッダーという単調な構成にある。以下の原則を意識することで、ユーザーが「使いたい」と感じるビジュアルを実現する。

### 主役と脇役の差をつける

最も伝えたいチャートを全幅または2/3幅で大きく表示し、残りのカードで補完する。全要素が同じサイズ・同じ重みのレイアウトは視覚的な退屈さを生む。

- 「このダッシュボードで最も重要なチャートはどれか」を設計前に決める
- 主役は `lg:col-span-2` や `col-span-full` で大きく
- 小チャート・サマリーカードは主役を引き立てる脇役として配置する

### カード内をリッチにする

KPIカードに数値だけを置かない。スパークライン・進捗バー・ミニチャートを組み合わせることで、1枚のカードから読み取れる情報量と視覚的な豊かさが増す。

KPIカード行を並べる際は、全カードの内部構造（アイコン + 数値 + 増減 + ミニチャート）を統一することで水平方向の視覚的リズムが生まれる。カードごとに要素がバラバラだと、同じ行に並んでいても視線が安定しない。

```tsx
// リッチなKPIカードの例（数値 + スパークライン + トレンド）
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">月間売上</CardTitle>
    <TrendingUp className="h-4 w-4 text-green-600" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">¥4,523,100</div>
    <p className="text-xs text-green-600">+20.1% 先月比</p>
    {/* スパークライン */}
    <EChartsWrapper option={sparklineOption} height="40px" className="mt-2" />
  </CardContent>
</Card>
```

### カードで情報グループを明確にする

論理的にまとまる情報はカードの境界で括る。カード内にセクションラベルを入れてグループ名を明示することで、情報の整理感が生まれる。背景色やシャドウの強さでカードの重要度を表現することも有効。

### ストーリーテリング感を持たせる（提示型ダッシュボードで特に有効）

データを「事実の羅列」ではなく「文脈のあるストーリー」として提示する。パーソナルな言葉を使うことでダッシュボードへの親近感が増す。

- 「今週最も売れた商品」「直近7日間のトレンド」のように時間的な文脈を持たせる
- ヘッダーのサマリー文でページ全体の「今の状況」を一言で伝える
- ただし、このアプローチはレポート型・提示型に向く。探索型には不向きなので無理に使わない
