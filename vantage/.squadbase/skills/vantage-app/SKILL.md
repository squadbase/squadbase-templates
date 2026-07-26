---
name: vantage-app
description: Vantage(@squadbase/vantage)ダッシュボードアプリを一から作る / 既存アプリの構成を広げるときの進め方。骨組みの用意、ルートの決め方、データ取得の選択(外部 API か自前の server/api か)、どこで手を止めて検証するかの順序を扱う。規約そのものはアプリルートの AGENTS.md が正本。
---

# Vantage アプリの作り方 — 進め方と検証の順序

規約・不変条件・import サブパスの一覧・各 API の書式は、アプリルートの **`AGENTS.md`** が正本。
**先にそれを読む**(無ければ `vantage add agents` で置ける)。このスキルは「どの順で作り、どこで
手を止めて検証するか」だけを扱い、AGENTS.md の内容は繰り返さない。

- ページ / API / UI を 1 つ足すだけなら → `vantage-add-feature`
- 実装したのに静かに壊れたら → `vantage-pitfalls`

## 全体の流れ

1. **骨組み** — `pnpm dev` が上がるところまで
2. **ルートを決める** — ページファイルを置き、`vantage routes` で URL を確認
3. **データを繋ぐ** — 外部 API か、自前の `server/api` か
4. **仕上げ** — `check` → `build` → `preview`

**各段階の終わりに `vantage check` を通す。** 静的診断(禁止ファイル・`src/` の分裂・ルート
衝突・境界違反・API export・env 誤用)はユーザーコードを実行しないので速く、エラーがあれば
exit 1 になる。
まとめて最後に回すと、原因の切り分けが難しくなる。

## Step 1 — 骨組み

新規なら `package.json` と `index.tsx` の 2 ファイルだけ。設定ファイルは**作らない**
(`vite.config.*` 等は `vantage check` がエラーにする)。ページを `src/` にまとめたいなら
`src/index.tsx` にする ― **`src/` があればページ走査はその中だけ**になり、直下に残した `.tsx`
は無視される(`SRC_DIR_SPLIT` エラー)。どちらか一方に寄せること。

```json
{
  "name": "my-dashboard",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vantage dev",
    "build": "vantage build",
    "preview": "vantage preview",
    "check": "vantage check",
    "routes": "vantage routes"
  },
  "dependencies": {
    "@squadbase/vantage": "^0.3.0",
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  }
}
```

`index.tsx` はデフォルトエクスポートの React コンポーネント 1 つ(これが `/` になる)。あとは
`pnpm install && pnpm dev` で http://localhost:5173 が上がる。

**既存アプリに合流したときは、作る前に現状を読む:**

```bash
vantage routes     # 既にあるページと API の URL マップ(file 列がページの置き場所)
vantage check      # いま壊れていないか(これから出すエラーと切り分ける)
ls src/            # あればページは src/ の中だけ。無ければプロジェクトルート直下
ls server/         # あれば fullstack モード。無ければ SPA
vantage add skill  # 配置済みの skill(このファイルの仲間)と、その場所
```

## Step 2 — ルートを決める

ファイル名がそのままルートになる(対応表は AGENTS.md「ルーティング規約」)。**ルーターを設定
する場所は無い**ので、決めるのは「どんなファイル名で置くか」だけ。

- ページを置いたら `vantage routes` で URL を確かめる。意図と違うなら**ファイル名が違う**。
- ナビゲーションはリンク配列を手で持たず、`useRoutes()` から組む。この形にしておくと以後は
  ページファイルを足すだけでナビが増える(AGENTS.md「ナビはルート一覧から組む」)。
- 共通の枠(ヘッダ・サイドバー)は `_layout.tsx`、Not Found と例外は `_404.tsx` / `_error.tsx`。
- 一覧 → 詳細を作るなら、**動的パラメータの「3 つの綴り」を先に決めてから**両方のファイルを
  書く。後から変えると静かにマッチしなくなる。

## Step 3 — データを繋ぐ

**どちらの経路かを先に決める。** ここを間違えると後で全部書き直しになる:

| データ元 | 使うもの | `server/` |
| --- | --- | --- |
| ブラウザから直接叩ける公開 API | `useQuery` + `fetch` | 不要 |
| DB / シークレットが要る / CORS で叩けない | `server/api/*.ts` + `useApiQuery` | 必要 |

**API キーが要る時点で後者しかない** — クライアントに届く env は `PUBLIC_*` だけで、
シークレットは `ApiContext.env`(= `server/` の中)にしか届かない。

後者の手順:

1. `server/api/<name>.ts` に `GET` を書く。**このディレクトリを作った時点で fullstack モード**
   になる(設定変更は不要)。
2. `vantage routes` に `/api/<name>` が出ることを確認する。
3. dev サーバーか `curl` で叩き、**返す JSON の形を確定させてから** UI を書く。エラー応答は
   `HttpError(status, msg)` を throw して作る。
4. クライアントから `useApiQuery<T>("/api/<name>")` で受ける。`isPending` / `isError` の分岐を
   最初から書く(`Loading` / `ErrorState` が `ui/` にある)。

ダッシュボードの**絞り込みは `useState` ではなく `useSearchParam` / `useSearchState`** に置く。
リロードで消えず、URL をそのまま共有できる。これも後から差し替えると全ページに波及するので、
最初のフィルタを作る時点で決める。

## Step 4 — 仕上げ

```bash
pnpm check     # エラーが残っていないか(exit 1 なら残っている)
pnpm routes    # 公開される URL の最終確認
pnpm build     # dist/ に client(+ server)+ vantage-manifest.json
pnpm preview   # 本番ビルドをローカルで動かす
```

`vantage-manifest.json` の `mode` は `server/` の有無から自動で決まる(手で書かない)。
`preview` まで通れば、そのまま同じ成果物がデプロイされる。

## 詰まったら

- ブラウザの `console.*` とランタイムエラーは、**開発ターミナルに `[browser:…]` として転送
  される**。ブラウザの devtools を開かなくても読める。
- `vantage check --json` / `vantage routes --json` は機械可読出力。
- props や規約を確かめたいときは `vantage docs <name>`、名前が思い出せないときは
  `vantage search <やりたいこと>`。**推測で props を書かない。**
- Base UI(≠ Radix)の癖など、静かに壊れる系は `vantage-pitfalls` にまとまっている。
