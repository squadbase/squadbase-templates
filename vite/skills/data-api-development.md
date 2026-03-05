# データ API 開発スキル

## アーキテクチャ概要

- データ API サーバー: `packages/vite-server`（Hono ベース）
- ポート: 3280（app-template に統合、`/api` プレフィックスで公開）
- データソース定義: `<project>/data-source/*.json` ファイルとして管理
- サーバーはファイルを監視し、**JSON ファイルの変更を自動検出してリロード**（再起動不要）
- HMR サポート: TypeScript ハンドラファイルの変更も自動リロード

## データソースの種別

| 種別 | 用途 | 必須フィールド |
|---|---|---|
| SQL 型 | PostgreSQL / BigQuery / Snowflake への SQL クエリ | `description`, `query` |
| TypeScript 型 | 外部 API 呼び出し、複合データ取得、任意のサーバーサイドロジック | `description`, `type: "typescript"`, `handlerPath` |

## JSON フォーマット型定義

### SQL 型（JsonDataSourceDefinition）

```typescript
interface JsonDataSourceDefinition {
  description: string;              // REQUIRED — 説明文
  type?: "sql";                     // Optional — 省略時も SQL として扱われる
  query: string;                    // REQUIRED — SQL クエリ（{{param}} プレースホルダ使用可）
  parameters?: ParameterMeta[];     // Optional — クエリパラメータ定義
  response?: DataSourceResponse;    // Optional — レスポンス形式定義。省略時: { data: result }
  connectorType?: string;           // Optional — "postgresql" | "bigquery" | "snowflake"
  connectorSlug?: string;           // Optional — .squadbase/connections.json のキー
  cache?: DataSourceCacheConfig;    // Optional — キャッシュ設定
}
```

### TypeScript 型（JsonTypeScriptDataSourceDefinition）

```typescript
interface JsonTypeScriptDataSourceDefinition {
  description: string;              // REQUIRED — 説明文
  type: "typescript";               // REQUIRED — 必ず "typescript" と指定
  handlerPath: string;              // REQUIRED — JSON ファイルのディレクトリからの相対パス（例: "./my-handler.ts"）
  parameters?: ParameterMeta[];     // Optional — パラメータ定義（メタ情報として使用）
  response?: DataSourceResponse;    // Optional — レスポンス形式定義
  cache?: DataSourceCacheConfig;    // Optional — キャッシュ設定
}
```

### 共通型定義

```typescript
interface ParameterMeta {
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
  required?: boolean;
  default?: string | number | boolean;
}

// OpenAPI inspired レスポンス型
interface DataSourceResponse {
  description?: string;
  defaultContentType?: string;  // "application/json" | "text/csv"
  content?: Record<string, { schema?: DataSourceSchemaObject }>;
}
```

## データソースの作成フロー

### SQL 型の作成

```
createDataSource(slug, query, parameters, ...) → data-source/{slug}.json 生成 → 自動リロード
```

`createDataSource` ツールを使うか、`createDataSourceBatch` ツールで複数まとめて作成する。

### TypeScript 型の作成（2 ステップ）

**Step 1**: `createDataSource` ツールで JSON ファイルを作成（`type: "typescript"`, `handlerPath` を指定）

```typescript
createDataSource({
  slug: "user-summary",
  description: "外部 API からユーザーサマリを取得",
  type: "typescript",
  handlerPath: "./user-summary.ts",
  parameters: [
    { name: "userId", type: "string", description: "対象ユーザー ID", required: true }
  ],
  cache: { ttl: 60, staleWhileRevalidate: true }
})
```

**Step 2**: `writeFile` ツールでハンドラ .ts ファイルを作成

ファイルパスは JSON ファイルと同じディレクトリ（通常 `data-source/user-summary.ts`）。

```typescript
// data-source/user-summary.ts
import type { Context } from "hono";

export default async function handler(c: Context): Promise<unknown> {
  const body = await c.req.json().catch(() => ({}));
  const userId = (body.params?.userId as string) ?? "";

  if (!userId) return { error: "userId is required" };

  const res = await fetch(`https://api.example.com/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

### TypeScript ハンドラの書き方

**シグネチャ（必須）**:
```typescript
import type { Context } from "hono";
export default async function handler(c: Context): Promise<unknown> { ... }
```

**パラメータ取得**:
```typescript
const body = await c.req.json().catch(() => ({}));
const myParam = body.params?.myParam as string;
```

**戻り値**:
- JSON シリアライズ可能な任意の値を返す
- `response` スキーマを省略した場合、サーバーが `{ data: result }` にラップして返す
- `response.content["application/json"].schema.type = "object"` の場合はラップなし

**ルール**:
- 必ず `import type { Context } from "hono"` を使う（型のみインポート）
- `handlerPath` は JSON ファイルと同じディレクトリ内の `.ts` ファイルのみ（パストラバーサル禁止）
- `process.env` でサーバー環境変数にアクセス可能

**例: 静的データ**:
```typescript
import type { Context } from "hono";

const REGIONS = [
  { code: "tokyo", name: "東京" },
  { code: "osaka", name: "大阪" },
];

export default async function handler(c: Context): Promise<unknown> {
  return REGIONS;
}
```

**例: 外部 API 呼び出し**:
```typescript
import type { Context } from "hono";

export default async function handler(c: Context): Promise<unknown> {
  const body = await c.req.json().catch(() => ({}));
  const region = (body.params?.region as string) ?? "all";

  const res = await fetch(`https://api.example.com/data?region=${region}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

## `response` フィールドとレスポンス形式

| `response` 設定 | API レスポンス形式 |
|---|---|
| 省略 | `{ data: result }` （デフォルト、配列・オブジェクトともにラップ） |
| `content["application/json"].schema.type = "object"` + `properties` | オブジェクトをそのまま返す（ラップなし） |
| `defaultContentType = "text/csv"` | `text/csv` 形式の CSV ボディ |

### `response` の例

```json
// 行配列（スキーマ定義あり）
{
  "response": {
    "content": {
      "application/json": {
        "schema": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "number", "description": "ユーザーID" },
              "name": { "type": "string", "description": "名前" }
            }
          }
        }
      }
    }
  }
}

// ページネーション（オブジェクト、ラップなし返却）
{
  "response": {
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "rows": { "type": "array", "description": "行データ" },
            "total": { "type": "integer", "description": "総件数" }
          }
        }
      }
    }
  }
}

// CSV エクスポート
{
  "response": {
    "defaultContentType": "text/csv"
  }
}
```

## SQL 型のプレースホルダー構文とオートクォート

- SQL クエリ内のパラメータは `{{paramName}}` プレースホルダで記述
- `string` 型パラメータは **自動的にシングルクォートで囲まれる**
- SQL テンプレートに `'{{param}}'` と書くと二重クォートになるバグが発生する

```
✓ 正: WHERE date >= {{start_date}}
✗ 誤: WHERE date >= '{{start_date}}'    ← 二重クォートバグ！
```

## API ルート

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/api/data-source/:slug` | GET | パラメータなしでデータソースを実行（デバッグ用） |
| `/api/data-source/:slug` | POST | データソースを実行。body: `{ params: {...} }` |
| `/api/data-source-meta` | GET | 登録済みデータソース一覧 |
| `/api/data-source-meta/:slug` | GET | 特定データソースのメタ情報 |
| `/api/cache/stats` | GET | キャッシュ統計 |
| `/api/cache/invalidate` | POST | キャッシュ全体を削除 |
| `/api/cache/invalidate/:slug` | POST | 特定スラッグのキャッシュを削除 |

## データソース作成フロー（コネクタ種別ごと）

### フロー A: CSV アップロード → PostgreSQL（既存フロー）

```
uploadFile → insertCSVToPostgres（自動的にデータソース生成まで行う）
```

`insertCSVToPostgres` は内部で自動的に `runDataSourceAgent` を呼び出すため、
CSV の場合は追加の手順不要。

### フロー B: BigQuery / Snowflake データソース作成

```
1. runConnectorSQL（connectorSlug）でテーブル一覧・スキーマ確認
2. runDataSourceAgent（tableNames, connectorType, connectorSlug）
   → データソース JSON ファイルを自動生成（connectorSlug 付き）
3. writeFile で TSX ページを作成（useDataSourceQuery hook でデータ連携）
```

または手動で `createDataSource` ツールを使う場合:

```
1. runConnectorSQL でスキーマ・サンプルデータ確認
2. createDataSource（slug, query, connectorType, connectorSlug）
3. writeFile で TSX ページを作成
```

### フロー C: TypeScript 型データソース作成

```
1. createDataSource（slug, type="typescript", handlerPath, parameters）→ JSON 生成
2. writeFile（data-source/{slug}.ts）→ ハンドラファイル作成
3. writeFile で TSX ページを作成（useDataSourceQuery hook でデータ連携）
```

## 外部コネクタ（BigQuery/Snowflake）

### connectorSlug とは

`.squadbase/connections.json` に登録された外部データベース接続の識別子。

```json
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

利用可能な connectorSlug は `cat .squadbase/connections.json` で確認。

### SQL 方言の差異

| 機能 | PostgreSQL | BigQuery (GoogleSQL) | Snowflake |
|---|---|---|---|
| テーブル参照 | `schema.table` | `` `project.dataset.table` ``（バッククォート必須） | `DATABASE.SCHEMA.TABLE`（完全修飾名推奨） |
| 日付関数 | `DATE_TRUNC('month', d)` | `DATE_TRUNC(d, MONTH)` | `DATE_TRUNC('MONTH', d)` |
| 日付フォーマット | `TO_CHAR(d, 'YYYY-MM')` | `FORMAT_DATE('%Y-%m', d)` | `TO_CHAR(d, 'YYYY-MM')` |
| 現在日時 | `NOW()` | `CURRENT_TIMESTAMP()` | `CURRENT_TIMESTAMP()` |

## パラメータバインディングとの連携

TSX ページから `useDataSourceQuery` hook でパラメータを渡す場合の設計パターン。

```tsx
import { useState } from "react";
import { useDataSourceQuery } from "@/hooks/use-data-source-query";

export default function SalesDashboard() {
  const [region, setRegion] = useState("");

  const { data, isLoading } = useDataSourceQuery("sales-by-region", {
    ...(region && { region }),
  });

  // ... render
}
```

- `useDataSourceQuery` の第2引数のキーが `{{paramName}}` に対応
- 空文字や undefined のパラメータは渡さないようにすること

## クエリキャッシュ

```json
{
  "cache": {
    "ttl": 300,
    "staleWhileRevalidate": true
  }
}
```

| ユースケース | TTL（秒） | staleWhileRevalidate |
|---|---|---|
| リアルタイムモニタリング | 10–30 | `true` |
| 日次レポート・集計 | 300–600 | `true` |
| マスタデータ | 3600+ | `false` |
| 履歴データ | 3600+ | `false` |

## ツール使用上の注意

- **SQL 型**は `createDataSource`（単体）または `createDataSourceBatch`（複数 SQL を一括）で作成
- **TypeScript 型**は `createDataSource`（`type: "typescript"` + `handlerPath` を指定）で JSON を作成後、`writeFile` でハンドラファイルを作成する 2 ステップが必要
- `createDataSourceBatch` は SQL 型専用。TypeScript 型には使用しないこと
- `handlerPath` は JSON ファイルと同じディレクトリ内の `.ts` ファイルのみ指定可能（セキュリティ制約）
- ファイル作成後はサーバーが約 300ms で自動リロードするため、bash でサーバー再起動は不要
- `createDataSource` の `connectorSlug` は `.squadbase/connections.json` に登録済みのキーのみ指定可能
- `{{paramName}}` プレースホルダはすべての DB 方言で共通して使える
- **string 型パラメータは `registry.ts` が自動的にシングルクォートで囲む**。SQL テンプレートに `'{{param}}'` と書くと二重クォートになるため、必ず `{{param}}` のみ記述すること
