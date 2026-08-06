import { definePage } from "@squadbase/vantage"
import {
  PageShell,
  PageShellContent,
  PageShellDescription,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
} from "@squadbase/vantage/components"

export const page = definePage({
  title: "ブランク",
  description:
    "タイトルと説明のみの PageShell。ダッシュボードをゼロから構築するための最小骨格",
})

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
