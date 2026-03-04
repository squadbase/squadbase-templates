# フロントエンド開発スキル - TSX Pages

## プロジェクト構造

- 作業ディレクトリ: `packages/app/`（`packages/app-template/` のコピー）
- Tech stack: Vite + React + Tailwind CSS v4 + TypeScript
- ページファイル: `src/pages/{pageName}.tsx`
- 各ページは **default export** で React コンポーネントをエクスポートする
- `_` prefix のファイルはルーターから除外される（例: `_router.tsx`）
- ルーティング: `home.tsx` → `/`, `dashboard.tsx` → `/dashboard`
- HMR: 既存ファイルの編集は即座に反映。新ファイル作成時は自動 full reload

## ページの基本構造

```tsx
export default function DashboardPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {/* page content */}
    </div>
  );
}
```

## 利用可能な shadcn/ui コンポーネント

すべて `@/components/ui/{name}` からインポート可能。

### Layout & Structure
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` — from `@/components/ui/card`
- `Separator` — from `@/components/ui/separator`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` — from `@/components/ui/tabs`
- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` — from `@/components/ui/accordion`
- `Sidebar`, `SidebarProvider`, etc. — from `@/components/ui/sidebar`
- `Sheet`, `SheetTrigger`, `SheetContent`, etc. — from `@/components/ui/sheet`

### Data Display
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` — from `@/components/ui/table`
- `Badge` — from `@/components/ui/badge`
- `Progress` — from `@/components/ui/progress`
- `Skeleton` — from `@/components/ui/skeleton`
- `Spinner` — from `@/components/ui/spinner`
- `Empty` — from `@/components/ui/empty`

### Forms & Inputs
- `Button` — from `@/components/ui/button`
- `Input` — from `@/components/ui/input`
- `Textarea` — from `@/components/ui/textarea`
- `Label` — from `@/components/ui/label`
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` — from `@/components/ui/select`
- `Checkbox` — from `@/components/ui/checkbox`
- `RadioGroup`, `RadioGroupItem` — from `@/components/ui/radio-group`
- `Switch` — from `@/components/ui/switch`
- `Combobox` — from `@/components/ui/combobox`
- `MultiSelect` — from `@/components/ui/multi-select`
- `DatePicker` — from `@/components/ui/date-picker`
- `DateRangePicker` — from `@/components/ui/date-range-picker`
- `Calendar` — from `@/components/ui/calendar`

### Overlays & Navigation
- `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` — from `@/components/ui/dialog`
- `Popover`, `PopoverTrigger`, `PopoverContent` — from `@/components/ui/popover`
- `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` — from `@/components/ui/tooltip`
- `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` — from `@/components/ui/dropdown-menu`
- `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbSeparator`, `BreadcrumbPage` — from `@/components/ui/breadcrumb`
- `Alert`, `AlertTitle`, `AlertDescription` — from `@/components/ui/alert`
- `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext` — from `@/components/ui/pagination`

### Charts
- `EChartsWrapper` — from `@/components/ui/echarts`

---

## カスタム Props リファレンス（非自明なコンポーネント）

### Combobox

```tsx
import { Combobox } from "@/components/ui/combobox";

type ComboboxOption = { value: string; label: string };

<Combobox
  placeholder="Select team..."
  options={[{ value: "eng", label: "Engineering" }, { value: "sales", label: "Sales" }]}
  disabled={false}
  name="team"
  width="240px"
  className="my-2"
/>
```

### DatePicker

```tsx
import { DatePicker } from "@/components/ui/date-picker";

<DatePicker
  value={date}
  placeholder="Pick a date"
  disabled={false}
  name="startDate"
  width="240px"
  onSelect={(d) => setDate(d)}
/>
```

### DateRangePicker

```tsx
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";

<DateRangePicker
  value={{ from: startDate, to: endDate }}
  placeholder="Select range"
  disabled={false}
  name="period"
  width="300px"
  onSelect={(range) => setRange(range)}
/>
```

### MultiSelect

```tsx
import { MultiSelect } from "@/components/ui/multi-select";

type MultiSelectOption = { value: string; label: string };

<MultiSelect
  placeholder="Select regions..."
  options={[{ value: "tokyo", label: "Tokyo" }, { value: "osaka", label: "Osaka" }]}
  disabled={false}
  name="regions"
  width="300px"
/>
```

### EChartsWrapper

```tsx
import { EChartsWrapper } from "@/components/ui/echarts";
import type { EChartsOption } from "echarts";

<EChartsWrapper
  option={chartOption}   // EChartsOption — 必須
  height="400px"         // デフォルト "400px"
  className="mt-4"
  theme="light"          // "light" | "dark"（省略時は自動）
/>
```

---

## データソース連携: `useDataSourceQuery` hook

```tsx
import { useDataSourceQuery } from "@/hooks/use-data-source-query";

export default function SalesPage() {
  const { data, isLoading, error } = useDataSourceQuery("sales-summary");

  if (isLoading) return <Spinner />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data.map((row: { date: string; amount: number }) => (
        <p key={row.date}>{row.date}: ¥{row.amount.toLocaleString()}</p>
      ))}
    </div>
  );
}
```

### パラメータ付きクエリ

```tsx
const [region, setRegion] = useState("tokyo");
const { data, isLoading } = useDataSourceQuery("sales-by-region", { region });
```

- 第1引数: data-api のデータソーススラッグ
- 第2引数（省略可）: パラメータオブジェクト
- 返り値: `{ data, isLoading, error }` — `data` は配列

---

## EChartsWrapper の使い方

```tsx
import { EChartsWrapper } from "@/components/ui/echarts";
import type { EChartsOption } from "echarts";

function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  const option: EChartsOption = {
    xAxis: { type: "category", data: data.map((d) => d.month) },
    yAxis: { type: "value" },
    series: [{ type: "bar", data: data.map((d) => d.revenue) }],
    tooltip: { trigger: "axis" },
  };

  return <EChartsWrapper option={option} height="400px" />;
}
```

- `option`: ECharts のオプションオブジェクトをそのまま渡す
- `height`: グラフの高さ（デフォルト `"400px"`）
- `className`: 追加の CSS クラス
- 公式ドキュメント: https://echarts.apache.org/en/option.html

---

## TanStack Table でのデータテーブル

```tsx
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";

function DataTable({ data }: { data: SalesRow[] }) {
  const columns: ColumnDef<SalesRow>[] = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "amount", header: "Amount", cell: (info) => `¥${info.getValue<number>().toLocaleString()}` },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id}>
            {hg.headers.map((h) => (
              <TableHead key={h.id}>
                {flexRender(h.column.columnDef.header, h.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## Tailwind CSS v4 パターン

- レスポンシブ: `sm:`, `md:`, `lg:`, `xl:` prefix
- グリッド: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- フレックス: `flex items-center gap-4`
- コンテナ: `container mx-auto max-w-6xl p-8`
- スペーシング: `space-y-6`, `space-x-4`
- テーマカラー: `text-foreground`, `text-muted-foreground`, `bg-background`, `bg-muted`, `text-primary`, `text-destructive`

---

## ページテンプレート例

### ダッシュボードページ

```tsx
import { useDataSourceQuery } from "@/hooks/use-data-source-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EChartsWrapper } from "@/components/ui/echarts";
import { Spinner } from "@/components/ui/spinner";
import type { EChartsOption } from "echarts";

export default function DashboardPage() {
  const { data: salesData, isLoading } = useDataSourceQuery("monthly-sales");

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const chartOption: EChartsOption = {
    xAxis: { type: "category", data: salesData?.map((d: any) => d.month) ?? [] },
    yAxis: { type: "value" },
    series: [{ type: "bar", data: salesData?.map((d: any) => d.revenue) ?? [] }],
    tooltip: { trigger: "axis" },
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">¥1,234,567</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Orders</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">1,234</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Customers</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">567</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
        <CardContent>
          <EChartsWrapper option={chartOption} height="400px" />
        </CardContent>
      </Card>
    </div>
  );
}
```

### フォームページ

```tsx
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="container mx-auto max-w-2xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <Card>
        <CardHeader><CardTitle>Send a message</CardTitle></CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Your message..." rows={4} />
            </div>
            <Button type="submit">Send</Button>
            {submitted && (
              <p className="text-sm text-muted-foreground">Message sent!</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## コンポーネント分割アーキテクチャ

複雑なページ（3つ以上のセクションや複数のデータソース）を新規作成する際は、
ページファイルとコンポーネントファイルに分割する。

### いつ分割するか
- 新規ページで 3+ セクション（Card群、チャート、テーブル等）がある場合
- 複数の useDataSourceQuery を使う場合
- TanStack Table やフォームなどの複雑なロジックがある場合

### いつ分割しないか
- 既存ページの部分的な修正（色変更、テキスト変更等）
- シンプルな 1-2 セクションのページ
- ユーザーが明示的に単一ファイルを要求した場合

### ファイル構成
- コンポーネント: `src/components/{pageName}/{component-name}.tsx`
- ページ: `src/pages/{pageName}.tsx`

### 生成順序（重要: インクリメンタル方式）
1. **`warmDataSourceCache`** でキャッシュを事前に温める
2. **`scaffoldPage`** でスケルトンプレースホルダーのページを生成
3. **`buildPageSection`** をセクションごとに順番に呼び出す
   - Haiku サブエージェントがコンポーネント TSX を生成
   - コンポーネントファイル書き込み + ページの Skeleton 差し替えを自動実行
   - Vite HMR で即座にプレビュー反映
   - 最後のセクション完了時に Skeleton import が自動除去される

この方式の利点:
- 各セクションが完成次第ユーザーに表示される
- メインエージェントはスペック指示のみ、コード生成はサブエージェントに委譲
- 最終 writeFile ステップが不要

### Step 2 — scaffoldPage でプレースホルダー生成

`filePath` と `content`（フル TSX テキスト）を渡す。セクションの見出し・説明文を含め、`{/* label */}` コメント + `<Skeleton>` でプレースホルダーを示す。

```json
{
  "filePath": "src/pages/dashboard.tsx",
  "content": "import { Skeleton } from \"@/components/ui/skeleton\";\n\nexport default function DashboardPage() {\n  return (\n    <div className=\"container mx-auto max-w-6xl space-y-8 p-8\">\n      <div className=\"space-y-2\">\n        <h1 className=\"text-2xl font-bold\">ダッシュボード</h1>\n        <p className=\"text-muted-foreground\">プロダクトの主要指標を一覧で確認できます。</p>\n      </div>\n      <section className=\"space-y-4\">\n        <h2 className=\"text-xl font-semibold\">KPI サマリー</h2>\n        {/* KPIカード */}\n        <div className=\"grid grid-cols-4 gap-4\">\n          <Skeleton className=\"h-24 rounded-xl\" />\n          <Skeleton className=\"h-24 rounded-xl\" />\n          <Skeleton className=\"h-24 rounded-xl\" />\n          <Skeleton className=\"h-24 rounded-xl\" />\n        </div>\n      </section>\n      <section className=\"space-y-4\">\n        <h2 className=\"text-xl font-semibold\">MRR 推移</h2>\n        {/* MRR チャート */}\n        <Skeleton className=\"h-64 w-full rounded-xl\" />\n      </section>\n      <section className=\"space-y-4\">\n        <h2 className=\"text-xl font-semibold\">注文一覧</h2>\n        {/* 注文テーブル */}\n        <Skeleton className=\"h-48 w-full rounded-xl\" />\n      </section>\n    </div>\n  );\n}"
}
```

**ポイント:**
- `content` はエスケープ済み JSON 文字列として渡す（または multiline string）
- 各セクションを `<section className="space-y-4">` でラップし `<h2>` 見出しを付ける
- プレースホルダーは必ず `{/* label */}` コメント + `<Skeleton>` の順で記述（buildPageSection が comment を検索して置換するため）
- `buildPageSection` 完了後のページ例（Skeleton が実コンポーネントに置き換わる）:

```tsx
import KpiCards from "@/components/dashboard/kpi-cards";
import MrrChart from "@/components/dashboard/mrr-chart";
import OrderTable from "@/components/dashboard/order-table";

export default function DashboardPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">プロダクトの主要指標を一覧で確認できます。</p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">KPI サマリー</h2>
        <KpiCards />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">MRR 推移</h2>
        <MrrChart />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">注文一覧</h2>
        <OrderTable />
      </section>
    </div>
  );
}
```

### Step 3 — buildPageSection でセクションを順次生成

```json
{
  "sectionLabel": "KPIカード",
  "componentName": "StatsCards",
  "componentFileName": "stats-cards",
  "pagePath": "src/pages/dashboard.tsx",
  "componentDir": "src/components/dashboard",
  "componentSpec": "4つのKPIカードを横並びグリッドで表示。データソース dashboard-kpi-stats を使用。各カードは Card + CardHeader + CardContent。指標: total_revenue(¥), order_count, customer_count, avg_order_value(¥)。",
  "dataSources": [{
    "slug": "dashboard-kpi-stats",
    "description": "ダッシュボードKPI集計",
    "schema": [
      { "name": "total_revenue", "type": "number" },
      { "name": "order_count", "type": "number" }
    ]
  }]
}
```

### コンポーネントファイルのテンプレート

各コンポーネントは default export し、データ取得やロジックを自己完結させる:

```tsx
// src/components/dashboard/stats-cards.tsx
import { useDataSourceQuery } from "@/hooks/use-data-source-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCards() {
  const { data, isLoading } = useDataSourceQuery("dashboard-stats");
  if (isLoading) return <div className="grid grid-cols-3 gap-6">{Array.from({length: 3}, (_, i) => <Skeleton key={i} className="h-32" />)}</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* ... */}
    </div>
  );
}
```

---

## ツール使用ワークフロー

### ページ作成前の確認

1. `listComponents` → 2. `listDataSources` → 3. `createDataSource` (必要時)
4. `warmDataSourceCache` → 5. `scaffoldPage` → 6. `buildPageSection` ×N (各セクション)

### 新規ページ作成

1. `writeFile` で `src/pages/{pageName}.tsx` を作成
2. Vite が自動検出して full reload → ブラウザに反映

### 既存ページ更新

1. `readFile` で `src/pages/{pageName}.tsx` を読む
2. 変更を加えた内容を `writeFile` で書き戻す
3. Vite HMR で即座に反映

### データ連携ページ

1. `listDataSources` で利用可能なデータソースを確認
2. 必要なら `createDataSource` で新しいデータソースを作成
3. `writeFile` で TSX ページを作成（`useDataSourceQuery` hook を使用）

### readFile / writeFile

- パスは app プロジェクトルート（`packages/app/`）からの相対パス
- ページ: `src/pages/dashboard.tsx`
- コンポーネント: `src/components/ui/button.tsx`（読み取り専用で参照）

### bash

- 作業ディレクトリ: `packages/app/`
- ファイル構造確認、npm 操作に使用

---

## ベストプラクティス

1. **コンテナパターン**: `<div className="container mx-auto max-w-6xl space-y-8 p-8">` でページをラップ
2. **ローディング状態**: データ取得中は `<Spinner />` を表示
3. **エラーハンドリング**: `useDataSourceQuery` の `error` をチェックして表示
4. **型安全**: データの型を定義してから使用する
5. **コンポーネント分割**: 複雑なページはページ内でローカルコンポーネントに分割
6. **shadcn/ui 活用**: UI要素はすべて `@/components/ui/` からインポートして使う
7. **ECharts**: グラフは `EChartsWrapper` に `EChartsOption` を渡す。公式ドキュメントのオプションがそのまま使える
8. **レスポンシブ**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` でレスポンシブグリッド

---

## コンポーネント生成時の注意事項（buildPageSection 用）

### 存在しない Import パス（使用禁止）
- `@/components/ui/chart` → 代わりに `@/components/ui/echarts` を使う
- `@/components/ui/form` → 代わりに Input, Label, Select 等を個別インポート
- `@/components/ui/toast` → 存在しない
- `@/lib/utils` → 使わない。Tailwind CSS クラスを直接使う

### React Import のルール
- `import React from "react"` は書いてはいけない（Vite JSX Transform で自動処理）
- hooks を使う場合のみ `import { useState, useEffect } from "react"` と名前付きインポート
- 型のみ必要な場合は `import type { EChartsOption } from "echarts"` を使う

### コンポーネントの Export
- 必ず `export default function ComponentName()` でデフォルトエクスポート
- named export (`export const`, `export function`) は使わない
