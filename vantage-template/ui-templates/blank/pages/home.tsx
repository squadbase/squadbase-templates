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
  title: "Blank",
  description:
    "Empty PageShell with title and description. The minimal scaffold for building a dashboard from scratch.",
})

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
