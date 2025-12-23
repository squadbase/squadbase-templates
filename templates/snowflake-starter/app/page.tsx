import { DatabaseExplorerSection } from "@/app/components/database-explorer-section";
import { ConnectionStatus } from "@/app/components/connection-status";
import { DbtConnectionStatus } from "@/app/components/dbt-connection-status";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 py-6 md:py-8 px-4 md:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent p-8 md:p-12 lg:p-16 text-primary-foreground shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative z-10 flex flex-col gap-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <Image
                src="/assets/snowflake-logo.png"
                alt="Snowflake"
                width={48}
                height={48}
                className="h-10 w-10 md:h-12 md:w-12"
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Snowflake Starter
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90 mt-1">
                Build powerful data dashboards with ease
              </p>
            </div>
          </div>

          <p className="text-base md:text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            By connecting to your Snowflake data and conversing with SquadbaseAI, you can continuously add dashboards as needed. The AI automatically discovers and explores your data via MCP, streamlining the entire process.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Connection Status */}
      <ConnectionStatus />

      {/* dbt Integration Tips - Conditional Rendering */}
      <DbtConnectionStatus />

      {/* Database Explorer Section - Only shown when connected */}
      <DatabaseExplorerSection />
    </div>
  );
}
