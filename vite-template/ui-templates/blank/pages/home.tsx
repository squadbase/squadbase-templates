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
          <PageShellTitle>[Template] Blank</PageShellTitle>
          <PageShellDescription>
            Start building your dashboard here.
          </PageShellDescription>
        </PageShellHeading>
      </PageShellHeader>
      <PageShellContent>
        {/* Add content */}
      </PageShellContent>
    </PageShell>
  )
}
