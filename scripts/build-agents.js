#!/usr/bin/env node

/**
 * vantage/AGENTS.md を「フレームワーク正本 + テンプレート固有の追記」から組み立てる。
 *
 *   フレームワーク正本  vantage/node_modules/@squadbase/vantage/templates/AGENTS.md
 *                       (= `vantage upgrade` が撒くのと同じファイル。手で触らない)
 *   テンプレート固有    agents/vantage/*.md  (ファイル名順に連結)
 *   出力                vantage/AGENTS.md    (生成物だがコミットする)
 *
 * 追記は**末尾のみ**。正本の本文にアンカーを置いて割り込むことはしないので、
 * `vantage upgrade` で正本が書き換わっても合成が壊れない。フレームワークの規約に
 * 割り込みたい内容(不変条件・import サブパス表など)は、テンプレート側セクションの中に
 * 「追加の不変条件」「追加の import サブパス」として自前で持たせる。
 *
 *   node scripts/build-agents.js           # 生成して書き出す
 *   node scripts/build-agents.js --check   # 生成結果と disk が一致するか検証(CI / pre-commit 用)
 */

const { readFileSync, writeFileSync, readdirSync, existsSync } = require("fs");
const { join } = require("path");

const repoRoot = join(__dirname, "..");

const FRAMEWORK_SOURCE = join(
  repoRoot,
  "vantage/node_modules/@squadbase/vantage/templates/AGENTS.md"
);
const OVERLAY_DIR = join(repoRoot, "agents/vantage");
const OUTPUT = join(repoRoot, "vantage/AGENTS.md");

/**
 * テンプレート側セクションの見出し。構造(区切り・見出し・優先順位の注記)はこのスクリプトが
 * 所有し、`agents/vantage/*.md` は中身の `##` セクションだけを持つ。
 */
const OVERLAY_HEADER = `---

# テンプレート固有の規約(Squadbase テンプレート)

> ここから下は、Squadbase のテンプレートがフレームワーク正本に足した規約です。上の
> フレームワーク規約と矛盾する場合は**こちらが優先**します。
>
> \`vantage upgrade\` はこのファイルをフレームワーク同梱の正本で丸ごと上書きするため、
> このセクションは消えます。消えたら squadbase-templates リポジトリの \`agents/vantage/\`
> から貼り直してください(リポジトリ側では \`npm run agents\` が正本と結合して再生成します)。`;

function fail(message) {
  console.error(`\x1b[0;31m${message}\x1b[0m`);
  process.exit(1);
}

function compose() {
  if (!existsSync(FRAMEWORK_SOURCE)) {
    fail(
      `フレームワーク正本が見つかりません: ${FRAMEWORK_SOURCE}\n` +
        `  → vantage/ で npm install を実行してください。`
    );
  }

  const framework = readFileSync(FRAMEWORK_SOURCE, "utf8").trimEnd();

  const overlayFiles = existsSync(OVERLAY_DIR)
    ? readdirSync(OVERLAY_DIR)
        .filter((name) => name.endsWith(".md"))
        .sort()
    : [];

  if (overlayFiles.length === 0) {
    return `${framework}\n`;
  }

  const overlays = overlayFiles.map((name) =>
    readFileSync(join(OVERLAY_DIR, name), "utf8").trimEnd()
  );

  return `${[framework, OVERLAY_HEADER, ...overlays].join("\n\n")}\n`;
}

function main() {
  const composed = compose();
  const checkOnly = process.argv.includes("--check");
  const current = existsSync(OUTPUT) ? readFileSync(OUTPUT, "utf8") : null;

  if (current === composed) {
    console.log(
      `\x1b[0;32m[agents] vantage/AGENTS.md is up to date\x1b[0m`
    );
    return;
  }

  if (checkOnly) {
    fail(
      `[agents] vantage/AGENTS.md が生成結果と一致しません。\n` +
        `  vantage/AGENTS.md は生成物です。直接編集せず、以下のどちらかを行ってください:\n` +
        `    - テンプレート固有の内容 → agents/vantage/*.md を編集\n` +
        `    - フレームワーク由来の内容 → vantage/ で @squadbase/vantage を更新\n` +
        `  そのうえで \`npm run agents\` を実行し、差分をコミットしてください。`
    );
  }

  writeFileSync(OUTPUT, composed);
  console.log(
    `\x1b[0;32m[agents] wrote vantage/AGENTS.md\x1b[0m (framework + ${
      readdirSync(OVERLAY_DIR).filter((n) => n.endsWith(".md")).length
    } overlay file(s))`
  );
}

main();
