import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellContent,
} from "@/components/common/page-shell"

export default function HomePage() {
  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>[テンプレート] ブランク</PageShellTitle>
          <PageShellDescription>
            ここからダッシュボードの構築を始めましょう。
          </PageShellDescription>
        </PageShellHeading>
      </PageShellHeader>
      <PageShellContent>
        {/* コンテンツを追加 */}
      </PageShellContent>
    </PageShell>
  )
}
