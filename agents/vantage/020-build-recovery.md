## 構築中の一時的なエラーを「進行中」に見せる(`components/build-recovery.tsx`)

ページを書いている途中は、ファイルが書き終わる順番の都合で一瞬だけページが throw する
(まだ存在しないモジュールの import、書きかけのコンポーネント)。これを受け止めるのは
**Vantage の既定エラー画面**(`Something went wrong`)で、**テンプレートからは差し替えられない** —
`_error.tsx` はルートルート専用で、ページごとの `errorComponent` は現行プロトタイプでは
まだ結線されていない。しかも掴んでいるのは TanStack の CatchBoundary なので、HMR で
ソースが差し替わってもリセットされず、**リロードするまでエラー画面が貼り付く**。

`components/build-recovery.tsx` の `BuildRecovery` が、その画面を DOM から検知して
`Working on it…` 表示を被せ、dev では 1.2 秒待ってから自動でリロードして復帰させる
(上限 3 回。使い切ったら「再読み込み」の案内に降格し、無事に描けたら残数が戻る)。
`_error.tsx` も同じ `RecoveringState` を描くので、ルートレイアウトが throw したときの
見た目と復帰の仕方は揃っている。

### 追加の不変条件

- **`_layout.tsx` の `<BuildRecovery>` を外さない。** `<Outlet />` を包む形で 1 回だけ使う。
  外すと、書き込み途中の一瞬のエラーが `Something went wrong` のまま残る。
- **`components/build-recovery.tsx` と `_error.tsx` を消さない・作り直さない。** ページ側に
  独自のエラー UI を足す必要はない(足しても既定エラー画面より内側には入れない)。
- **`role="alert"` の中に `h2` を置かない。** これが既定エラー画面の目印なので、ページが
  同じ形を描くと `BuildRecovery` が誤検知して中身を覆ってしまう。UI キットの `Alert` /
  `ErrorState` は見出しを `div` / `p` で描くのでそのまま使ってよい。
- **データ取得の失敗は各ページが `ErrorState` で出す。** `BuildRecovery` が拾うのは
  「レンダリングが throw した」場合だけで、`useApiQuery` の `isError` はページの責任
  (→ フレームワーク規約の「データ取得」)。
