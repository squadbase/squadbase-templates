# データ API 開発スキル - Hono Data Sources

## アーキテクチャ概要

- データ API サーバー: `packages/data-api/`（Hono + PostgreSQL）
- ポート: 3280（app-template に統合、`/api` プレフィックスで公開）
- レジストリベースのプラグインシステム: `src/data-source/` 内のファイルが起動時に自動登録される
- 各ファイルは `DataSourceDefinition` をデフォルトエクスポート

## DataSourceDefinition 型

```typescript
interface ParameterMeta {
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
  required?: boolean;
}

interface SchemaField {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  fields?: SchemaField[];   // object 型の場合
  items?: SchemaField[];    // array 型の場合
}

interface DataSourceDefinition {
  description: string;
  parameters: ParameterMeta[];
  schema: SchemaField[];
  handler: (params: Record<string, unknown>) => Promise<unknown> | unknown;
}
```

## JsonDataSourceDefinition 型（JSON ファイル形式）

`createDataSource` ツールが生成するデータソース定義の JSON フォーマット。

```typescript
interface JsonDataSourceDefinition {
  description: string;
  parameters: ParameterMeta[];
  schema: SchemaField[];
  query: string;
  connectorType?: string;   // 省略時: デフォルト PostgreSQL
  connectorSlug?: string;   // 省略時: SQUADBASE_POSTGRESQL_URL を使用
  cache?: {                  // 省略時: キャッシュなし
    ttl: number;             // キャッシュ有効期間（秒）。0 = キャッシュなし
    staleWhileRevalidate?: boolean; // TTL 切れ後も古いデータを返しバックグラウンドリフレッシュ
  };
}
```

- `connectorType`: 接続先 DB の種別。対応値: `"postgresql"`, `"bigquery"`, `"snowflake"`
- `connectorSlug`: `.squadbase/connections.json` に登録された接続識別子。外部 DB に接続する場合は必須。
- `query`: SQL クエリ。パラメータは `{{paramName}}` プレースホルダで記述。
  実行時に data-api の `registry.ts` が値を埋め込む。
  **string 型パラメータは自動的にシングルクォートで囲まれる**ため、
  SQL テンプレート内でクォートを追加してはいけない（二重クォート化するバグになる）。
  - ✓ 正: `WHERE date >= {{start_date}}`
  - ✗ 誤: `WHERE date >= '{{start_date}}'`

## データソースの作成

### 手順

1. `packages/data-api/src/data-source/{slug}.ts` にファイルを作成
2. ファイル名（拡張子なし）がスラッグになる（例: `get-users.ts` → スラッグ `get-users`）
3. `DataSourceDefinition` をデフォルトエクスポート
4. dev モードでは tsx watch が自動リスタートするため、ファイル作成後に自動で認識される

### 例: 静的データ

```typescript
import type { DataSourceDefinition } from "../types/data-source.js";

const users = [
  { id: 1, name: "Alice", role: "admin", active: true },
  { id: 2, name: "Bob", role: "user", active: true },
  { id: 3, name: "Charlie", role: "guest", active: false },
];

export default {
  description: "ユーザー一覧",
  parameters: [
    { name: "role", type: "string", description: "ロールでフィルタ" },
  ],
  schema: [
    { name: "id", type: "number", description: "ユーザーID" },
    { name: "name", type: "string", description: "名前" },
    { name: "role", type: "string", description: "ロール" },
    { name: "active", type: "boolean", description: "有効かどうか" },
  ],
  handler(params) {
    let result = users;
    if (typeof params.role === "string") {
      result = result.filter((u) => u.role === params.role);
    }
    return result;
  },
} satisfies DataSourceDefinition;
```

### 例: データベースクエリ

```typescript
import type { DataSourceDefinition } from "../types/data-source.js";
import { pool } from "../pg.js";

export default {
  description: "売上データ取得",
  parameters: [
    { name: "limit", type: "number", description: "取得件数上限" },
  ],
  schema: [
    { name: "date", type: "string", description: "日付" },
    { name: "amount", type: "number", description: "売上金額" },
    { name: "category", type: "string", description: "カテゴリ" },
  ],
  async handler(params) {
    const limit = typeof params.limit === "number" ? params.limit : 100;
    const { rows } = await pool.query("SELECT date, amount, category FROM sales ORDER BY date DESC LIMIT $1", [limit]);
    return rows;
  },
} satisfies DataSourceDefinition;
```

## API ルート

| エンドポイント | メソッド | 説明 |
|---------------|---------|------|
| `/api/data-source/:slug` | POST | データソース handler を実行。body: `{ params: {...} }` → response: `{ data: result }` |
| `/api/data-source-meta` | GET | 登録済みデータソース一覧（slug, description, parameters, schema） |
| `/api/data-source-meta/:slug` | GET | 特定データソースのメタ情報 |
| `/api/cache/stats` | GET | キャッシュ統計（サイズ、ヒット率、エントリ一覧） |
| `/api/cache/invalidate` | POST | キャッシュ全体を削除 |
| `/api/cache/invalidate/:slug` | POST | 特定スラッグのキャッシュエントリを全削除 |

## データベース

- PostgreSQL（pg ライブラリ）、接続: `SQUADBASE_POSTGRESQL_URL` 環境変数
- インポート: `import { pool } from "../pg.js";`
- 非同期 API: `pool.query(sql, params)` → `{ rows }`

## レジストリパターン

- `src/data-source/` 内の `.ts` / `.js` ファイルが起動時に自動読み込み
- `.d.ts` / `.map` ファイルはスキップ
- モジュールは `handler` 関数を持つ `default` エクスポートが必要
- スラッグ = ファイル名（拡張子なし）

## データソース作成フロー（コネクタ種別ごと）

### フロー A: CSV アップロード → PostgreSQL（既存フロー）

```
uploadFile → insertCSVToPostgres（自動的にデータソース生成まで行う）
```

`insertCSVToPostgres` は内部で自動的に `runDataSourceAgent` を呼び出すため、
CSV の場合は追加の手順不要。

### フロー B: BigQuery データソース作成

```
1. runConnectorSQL（connectorSlug）でテーブル一覧・スキーマ確認
2. runDataSourceAgent（tableNames, connectorType="bigquery", connectorSlug）
   → データソース JSON ファイルを自動生成（connectorSlug 付き）
3. writeFile で TSX ページを作成（useDataSourceQuery hook でデータ連携）
```

または手動で `createDataSource` ツールを使う場合:

```
1. runConnectorSQL でスキーマ・サンプルデータ確認
2. createDataSource（slug, query, connectorType="bigquery", connectorSlug）
3. writeFile で TSX ページを作成
```

### フロー C: Snowflake データソース作成

BigQuery と同じフローで `connectorType="snowflake"` を指定する。

```
1. runConnectorSQL（connectorSlug）で DB.SCHEMA.TABLE 確認
2. runDataSourceAgent（tableNames, connectorType="snowflake", connectorSlug）
3. writeFile で TSX ページを作成
```

### フロー D: data-api を直接起動時の自動登録

`data-api` は `src/data-source/` ディレクトリを fs.watch しており、
JSON ファイルの作成・更新を検出すると 300ms 後に自動リロードする。
**bash でサーバーを再起動する必要はない**（ファイル作成後、数秒待てば反映される）。

> 注意: フロー B・C の `runDataSourceAgent` は現在 PostgreSQL のスキーマ取得ロジック（`information_schema.columns`）を使用しているため、外部 DB には完全対応していない。外部 DB の場合は `createDataSource` ツールで手動作成することを推奨する。

## 外部コネクタ（BigQuery/Snowflake）のデータソース作成

### connectorSlug とは

`.squadbase/connections.json` に登録された外部データベース接続の識別子。
`createDataSource` および `runDataSourceAgent` ツールで外部 DB を使う際に指定する。

```json
// .squadbase/connections.json の例
{
  "my-bigquery": {
    "connectorType": "bigquery",
    "envVars": {
      "project-id": "GCP_PROJECT_ID",
      "service-account-json-base64": "GCP_SA_JSON_BASE64"
    }
  },
  "my-snowflake": {
    "connectorType": "snowflake",
    "envVars": {
      "account": "SNOWFLAKE_ACCOUNT",
      "user": "SNOWFLAKE_USER",
      "role": "SNOWFLAKE_ROLE",
      "warehouse": "SNOWFLAKE_WAREHOUSE",
      "private-key-base64": "SNOWFLAKE_PRIVATE_KEY_BASE64"
    }
  }
}
```

利用可能な connectorSlug の一覧は、bash で以下のファイルを確認する:

```bash
cat .squadbase/connections.json
```

### createDataSource ツールでの指定方法

```typescript
// BigQuery の例
createDataSource({
  slug: "bq-sales-summary",
  description: "BigQuery から月次売上サマリを取得",
  connectorType: "bigquery",
  connectorSlug: "my-bigquery",  // connections.json のキー名
  query: `
    SELECT
      FORMAT_DATE('%Y-%m', date) AS month,
      SUM(revenue) AS total_revenue,
      COUNT(*) AS order_count
    FROM \`project.dataset.orders\`
    WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL {{months}} MONTH)
    GROUP BY month
    ORDER BY month DESC
  `,
  parameters: [
    { name: "months", type: "number", description: "過去N ヶ月", default: 6 }
  ],
  schema: [
    { name: "month", type: "string", description: "年月 (YYYY-MM)" },
    { name: "total_revenue", type: "number", description: "合計売上" },
    { name: "order_count", type: "number", description: "注文件数" }
  ]
})
```

### 生成される JSON ファイルの形式

```json
{
  "description": "BigQuery から月次売上サマリを取得",
  "parameters": [
    { "name": "months", "type": "number", "description": "過去Nヶ月", "default": 6 }
  ],
  "schema": [
    { "name": "month", "type": "string", "description": "年月 (YYYY-MM)" },
    { "name": "total_revenue", "type": "number", "description": "合計売上" },
    { "name": "order_count", "type": "number", "description": "注文件数" }
  ],
  "query": "SELECT FORMAT_DATE('%Y-%m', date) AS month, ...",
  "connectorType": "bigquery",
  "connectorSlug": "my-bigquery"
}
```

`connectorSlug` と `connectorType` が JSON に含まれると、`data-api` の `registry.ts` が
`connector-client.ts` 経由で対応する DB クライアントを選択する。

### runDataSourceAgent ツールでの指定方法

外部 DB に対して複数テーブルを分析してデータソースを一括生成する場合:

```typescript
runDataSourceAgent({
  tableNames: ["orders", "customers", "products"],
  connectorType: "bigquery",
  connectorSlug: "my-bigquery"
})
```

> 注意: `runDataSourceAgent` の内部実装は現在 PostgreSQL の `information_schema.columns`
> を使用しているため、外部 DB への完全対応は今後の課題。外部 DB の場合は
> `runConnectorSQL` でスキーマを手動確認後、`createDataSource` で個別作成を推奨。

## マルチコネクタデータソースのパターン集

### パターン 1: BigQuery データソース

BigQuery は GoogleSQL（旧 Standard SQL）を使用する。PostgreSQL との主な差異:

| 項目 | PostgreSQL | BigQuery (GoogleSQL) |
|-----|-----------|----------------------|
| テーブル参照 | `schema.table` | `` `project.dataset.table` ``（バッククォート必須） |
| 日付関数 | `DATE_TRUNC('month', d)` | `DATE_TRUNC(d, MONTH)` |
| 文字列結合 | `\|\|` または `CONCAT` | `CONCAT` または `\|\|` |
| 現在日時 | `NOW()` | `CURRENT_TIMESTAMP()` |
| 日付フォーマット | `TO_CHAR(d, 'YYYY-MM')` | `FORMAT_DATE('%Y-%m', d)` |
| パラメータ | `$1, $2` | `$1, $2`（`{{param}}` プレースホルダ経由で変換） |
| LIMIT | `LIMIT n` | `LIMIT n` |

```json
// BigQuery データソース JSON の例
{
  "description": "BigQuery: 日別ページビュー集計",
  "parameters": [
    { "name": "start_date", "type": "string", "description": "開始日 (YYYY-MM-DD)", "required": true }
  ],
  "schema": [
    { "name": "date", "type": "string" },
    { "name": "pageviews", "type": "number" },
    { "name": "unique_users", "type": "number" }
  ],
  "query": "SELECT FORMAT_DATE('%Y-%m-%d', date) AS date, SUM(pageviews) AS pageviews, COUNT(DISTINCT user_id) AS unique_users FROM `myproject.analytics.page_events` WHERE date >= DATE({{start_date}}) GROUP BY date ORDER BY date DESC LIMIT 90",
  "connectorType": "bigquery",
  "connectorSlug": "my-bigquery"
}
```

### パターン 2: Snowflake データソース

Snowflake は Snowflake SQL を使用する。PostgreSQL との主な差異:

| 項目 | PostgreSQL | Snowflake |
|-----|-----------|-----------|
| テーブル参照 | `schema.table` | `DATABASE.SCHEMA.TABLE`（完全修飾名推奨） |
| 文字列関数 | `LOWER`, `UPPER` | `LOWER`, `UPPER`（互換） |
| 日付トランケート | `DATE_TRUNC('month', d)` | `DATE_TRUNC('MONTH', d)` |
| 現在日時 | `NOW()` | `CURRENT_TIMESTAMP()` |
| 日付フォーマット | `TO_CHAR(d, 'YYYY-MM')` | `TO_CHAR(d, 'YYYY-MM')` |
| QUALIFY 句 | なし | `QUALIFY ROW_NUMBER() OVER(...) = 1` |

```json
// Snowflake データソース JSON の例
{
  "description": "Snowflake: 顧客別売上集計",
  "parameters": [
    { "name": "limit", "type": "number", "description": "取得件数上限", "default": 100 }
  ],
  "schema": [
    { "name": "customer_id", "type": "string" },
    { "name": "customer_name", "type": "string" },
    { "name": "total_amount", "type": "number" }
  ],
  "query": "SELECT c.CUSTOMER_ID, c.NAME AS customer_name, SUM(o.AMOUNT) AS total_amount FROM MYDB.PUBLIC.CUSTOMERS c JOIN MYDB.PUBLIC.ORDERS o ON c.CUSTOMER_ID = o.CUSTOMER_ID GROUP BY c.CUSTOMER_ID, c.NAME ORDER BY total_amount DESC LIMIT {{limit}}",
  "connectorType": "snowflake",
  "connectorSlug": "my-snowflake"
}
```

```json
// Snowflake データソース JSON の例（文字列パラメータ）
// string 型は registry.ts が自動クォートするため、SQL 内にクォート不要
{
  "description": "Snowflake: 期間別売上集計（文字列パラメータの例）",
  "parameters": [
    { "name": "start_date", "type": "string", "description": "開始日 (YYYY-MM-DD)", "default": "2025-01-01" }
  ],
  "schema": [
    { "name": "order_date", "type": "string" },
    { "name": "total_amount", "type": "number" }
  ],
  "query": "SELECT ORDER_DATE AS order_date, SUM(AMOUNT) AS total_amount FROM MYDB.PUBLIC.ORDERS WHERE ORDER_DATE >= {{start_date}} GROUP BY ORDER_DATE ORDER BY ORDER_DATE DESC",
  "connectorType": "snowflake",
  "connectorSlug": "my-snowflake"
}
```

### パターン 3: 同一ページで複数コネクタを使う

異なる DB のデータを同一ダッシュボードで表示する場合:

```json
// runtimeData.queries に異なるコネクタのデータソースを並列宣言
{
  "runtimeData": {
    "queries": [
      { "key": "bq-pageviews" },
      { "key": "sf-sales-summary" },
      { "key": "pg-users" }
    ]
  }
}
```

各データソース JSON はそれぞれ独自の `connectorSlug` を持ち、`data-api` が個別に接続する。

## パラメータバインディングとの連携

TSX ページから `useDataSourceQuery` hook でパラメータを渡す場合の設計パターン。

### データソース側の設計

フロントエンドから受け取るパラメータは `parameters` 配列に宣言し、`query` の `{{paramName}}` プレースホルダで参照する。

```json
{
  "description": "期間・地域フィルタ付き売上集計",
  "parameters": [
    { "name": "start_date", "type": "string", "description": "開始日 (ISO 8601)", "required": false },
    { "name": "end_date", "type": "string", "description": "終了日 (ISO 8601)", "required": false },
    { "name": "region", "type": "string", "description": "地域コード", "required": false }
  ],
  "schema": [
    { "name": "date", "type": "string" },
    { "name": "region", "type": "string" },
    { "name": "total_amount", "type": "number" }
  ],
  "query": "SELECT DATE(order_date) AS date, region, SUM(amount) AS total_amount FROM orders WHERE order_date >= {{start_date}} AND order_date <= {{end_date}} AND region = {{region}} GROUP BY date, region ORDER BY date DESC"
}
```

### フロントエンド側のパラメータ渡し (TSX)

```tsx
import { useState } from "react";
import { useDataSourceQuery } from "@/hooks/use-data-source-query";

export default function SalesDashboard() {
  const [region, setRegion] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useDataSourceQuery("sales-by-region", {
    ...(region && { region }),
    ...(startDate && { start_date: startDate }),
    ...(endDate && { end_date: endDate }),
  });

  // ... render with Select, DatePicker, charts, tables
}
```

- `useDataSourceQuery` の第2引数のキーが data-api の `{{paramName}}` に対応
- 空文字やundefinedのパラメータは渡さないようにすること

### パラメータ未設定時の動作

- `useDataSourceQuery` に渡されないパラメータは data-api 側で `params: {}` として扱われる
- data-api ハンドラは必須でないパラメータはデフォルト値を使用するか、WHERE 句を省略する設計にすること

### handler でのオプショナルパラメータ対応例

```typescript
handler(params) {
  let query = "SELECT * FROM orders WHERE 1=1";
  const values: unknown[] = [];

  if (typeof params.region === "string" && params.region) {
    query += ` AND region = $${values.length + 1}`;
    values.push(params.region);
  }
  if (typeof params.start_date === "string" && params.start_date) {
    query += ` AND order_date >= $${values.length + 1}`;
    values.push(params.start_date.substring(0, 10)); // ISO → YYYY-MM-DD
  }

  return pool.query(query, values).then(({ rows }) => rows);
}
```

## クエリキャッシュ

### 概要

data-api はプロセス内 LRU インメモリキャッシュを備えている。`JsonDataSourceDefinition` の `cache` フィールドでデータソースごとにキャッシュを設定できる。

### `cache` フィールド

```typescript
interface DataSourceCacheConfig {
  /** キャッシュの有効期間（秒）。0 または未指定 = キャッシュなし */
  ttl: number;
  /** true: TTL 切れ後も古いデータを即座に返し、バックグラウンドでリフレッシュ。デフォルト: false */
  staleWhileRevalidate?: boolean;
}
```

`JsonDataSourceDefinition` での指定:

```json
{
  "description": "月次売上サマリ",
  "parameters": [],
  "schema": [],
  "query": "SELECT ...",
  "cache": {
    "ttl": 300,
    "staleWhileRevalidate": true
  }
}
```

- `cache` フィールド未指定、または `ttl: 0` の場合はキャッシュなし（後方互換性）
- パラメータが異なるリクエストは別々のキャッシュエントリとして保存される
  - 例: `params={"region":"tokyo"}` と `params={"region":"osaka"}` は別キャッシュ

### 推奨 TTL 値ガイド

| ユースケース | TTL (秒) | staleWhileRevalidate | 説明 |
|------------|---------|---------------------|------|
| リアルタイムモニタリング | 10-30 | `true` | 常に最新に近いデータが必要。staleWhileRevalidate で UX 維持 |
| 日次レポート・集計 | 300-600 | `true` | 5-10 分の遅延は許容。バックグラウンドリフレッシュ推奨 |
| マスタデータ（地域一覧等） | 3600+ | `false` | ほぼ変わらないデータ。長い TTL で DB 負荷削減 |
| 履歴データ・過去分析 | 3600+ | `false` | 変更されないデータ。最大 TTL で OK |

### レスポンスヘッダー

キャッシュが有効なデータソースのレスポンスには以下のヘッダーが付与される:

| ヘッダー | 値 | 説明 |
|---------|---|------|
| `X-Cache` | `HIT` / `MISS` / `STALE` | キャッシュの状態 |
| `X-Cache-Age` | 秒数 | キャッシュエントリの経過時間 |
| `Cache-Control` | `max-age=N` | 残り有効期間 |

### キャッシュ管理 API

デバッグ・テスト用のキャッシュ管理エンドポイント:

| エンドポイント | メソッド | 説明 |
|-------------|--------|------|
| `/cache/stats` | GET | キャッシュ統計（サイズ、ヒット率、エントリ一覧） |
| `/cache/invalidate` | POST | キャッシュ全体を削除 |
| `/cache/invalidate/:slug` | POST | 特定スラッグの全エントリを削除 |

```bash
# 統計確認
curl -s http://localhost:3280/api/cache/stats | jq .

# 特定データソースのキャッシュをクリア
curl -s -X POST http://localhost:3280/api/cache/invalidate/sales-by-region | jq .

# 全キャッシュをクリア
curl -s -X POST http://localhost:3280/api/cache/invalidate | jq .
```

### 例: キャッシュ付きパラメータ化データソース JSON

```json
{
  "description": "地域・期間フィルタ付き売上集計（キャッシュ 5 分、staleWhileRevalidate 有効）",
  "parameters": [
    { "name": "region", "type": "string", "description": "地域コード", "required": false },
    { "name": "start_date", "type": "string", "description": "開始日 (YYYY-MM-DD)", "required": false },
    { "name": "end_date", "type": "string", "description": "終了日 (YYYY-MM-DD)", "required": false }
  ],
  "schema": [
    { "name": "date", "type": "string" },
    { "name": "region", "type": "string" },
    { "name": "total_amount", "type": "number" },
    { "name": "order_count", "type": "number" }
  ],
  "query": "SELECT DATE(order_date) AS date, region, SUM(amount) AS total_amount, COUNT(*) AS order_count FROM orders WHERE order_date >= {{start_date}} AND order_date <= {{end_date}} AND region = {{region}} GROUP BY date, region ORDER BY date DESC",
  "cache": {
    "ttl": 300,
    "staleWhileRevalidate": true
  }
}
```

### キャッシュの注意事項

- キャッシュはプロセス内メモリに保持（最大 100 エントリ、LRU エビクション）
- サーバー再起動でキャッシュは全消去される
- `staleWhileRevalidate: true` の場合、TTL 切れ後の最初のリクエストは古いデータを即座に返し、バックグラウンドでリフレッシュする。**ユーザーは次回アクセス時に新しいデータを取得する**
- パラメータ付きデータソースでは、パラメータの組み合わせごとに別キャッシュエントリが生成される。フィルタの選択肢が多い場合はキャッシュヒット率が下がる点に注意

## ツール使用上の注意

- data-api のファイル作成には `writeFile` を使う（パスは app プロジェクトルートからの相対パスなので `../data-api/src/data-source/my-source.ts`）
- handler は同期・非同期どちらも可
- 戻り値は API ルートで `{ data: result }` にラップされる
- parameters はリクエストボディの `params` オブジェクトとして渡される
- schema はメタデータ/ドキュメント用でランタイムでは検証されない
- `createDataSource` の `connectorSlug` は `.squadbase/connections.json` に登録済みのキーのみ指定可能
- BigQuery のクエリ内のテーブル名はバッククォートで囲む（例: `` `project.dataset.table` ``）
- Snowflake のクエリ内のテーブル名は完全修飾名を推奨（例: `DB.SCHEMA.TABLE`）
- `{{paramName}}` プレースホルダはすべての DB 方言で共通して使える（`$1, $2` への変換は data-api が担う）
- **string 型パラメータは `registry.ts` が自動的にシングルクォートで囲む**。
  SQL テンプレートに `'{{param}}'` と書くと二重クォートになるため、必ず `{{param}}` のみ記述すること。
  （number 型は裸の数値に置換されるため、クォート問題は発生しない）
- data-api の `connector-client.ts` は現在 `postgresql`/`squadbase-db` のみ対応。BigQuery/Snowflake は coding-agent 側の `connector-query.ts` で処理され、data-api ランタイムとは経路が異なる点に注意
