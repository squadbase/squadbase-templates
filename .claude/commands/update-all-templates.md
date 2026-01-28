# 全てのテンプレートをアップデート

指定されたアップデート指示ファイルに基づいて、テンプレートを更新します。対象は`templates`ディレクトリ以下の全てのテンプレートです。

## 利用方法

Format: `/update-template <update-instructions-path>`

[Example] Update All templates under `templates`: `/update-template updates/nextjs-dashboard-starter/v1-to-v2/instruction.md`

## ステップ

1. `templates`ディレクトリ直下にある全てのテンプレートフォルダを取得する。
2. 各テンプレートフォルダに対して、指定されたアップデート指示ファイルを使用してテンプレートを更新する。サブエージェントを活用して並列に処理を行うこと。
