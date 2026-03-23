#!/bin/bash
set -euo pipefail
REGISTRY=http://localhost:4873
AUTH_FLAG="--//localhost:4873/:_authToken=dummy"
SCOPE_FLAG="--@squadbase:registry=$REGISTRY"

# Verdaccio から最新の connectors をインストール
npm install @squadbase/connectors --no-save $SCOPE_FLAG $AUTH_FLAG

pnpm build

# 同一バージョンの再 publish を許可
npm unpublish @squadbase/vite-server --force $SCOPE_FLAG $AUTH_FLAG 2>/dev/null || true
npm publish $SCOPE_FLAG $AUTH_FLAG --tag latest

echo "Published @squadbase/vite-server to Verdaccio ($REGISTRY)"
