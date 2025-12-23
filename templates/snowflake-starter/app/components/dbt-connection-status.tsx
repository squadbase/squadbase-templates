"use client";

import { useDbdStatus } from "@/hooks/use-dbt-status";
import Image from "next/image";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function DbtConnectionStatus() {
  const { data: status, isLoading } = useDbdStatus();

  if (isLoading) {
    return (
      <div className="h-20 bg-muted rounded-lg animate-pulse" />
    );
  }

  // dbtが接続されている場合
  if (status?.configured) {
    return (
      <div className="-mt-6">
        <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-50">
                  ✅ dbt Connected
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Your dbt models are integrated and ready to use
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // dbtが接続されていない場合、Tips を表示
  return (
    <div className="rounded-2xl border border-border bg-card p-8 md:p-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 rounded-lg bg-primary/10">
            <Image
              src="/assets/dbt-logo.png"
              alt="dbt"
              width={40}
              height={24}
              className="h-6 w-10 md:h-8 md:w-12"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
              💡 Tip: Enhance Vibe Dashboard with dbt Integration
            </h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Run <span className="px-2 py-0.5 bg-primary/10 rounded text-primary font-mono text-sm font-semibold">Setup dbt</span> to connect your dbt models. The AI gains deeper understanding of your data structure and creates more contextually aware dashboards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
