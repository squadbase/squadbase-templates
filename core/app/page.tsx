"use client";

import Image from "next/image";

// Empty components should be removed once we have content.
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <Image
              src="/squadbase-icon.svg"
              alt="Squadbase"
              width={48}
              height={48}
              priority
            />
          </EmptyMedia>
          <EmptyTitle>Let&apos;s build something great!</EmptyTitle>
          <EmptyDescription>
            Start building your dashboard with Squadbase.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
