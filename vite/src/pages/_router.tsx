import { Suspense, useEffect, useState } from "react";
import { Routes, Route, Link, useSearchParams } from "react-router";
import { Loader } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { routes } from "@/routes";

// しばらく復帰しなければ「更新中」表示から控えめな再読み込み案内へ降格する
const DEGRADE_AFTER_MS = 6000;

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}

function NotFound() {
  const [searchParams] = useSearchParams();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Link
        to={{ pathname: "/", search: searchParams.toString() }}
        className="text-sm underline hover:text-foreground"
      >
        Go home
      </Link>
    </div>
  );
}

function PageError({ error }: { error: Error }) {
  // 初期は「更新中」のソフトな見た目（ローディングと区別しにくい）。
  // 一定時間たっても回復しなければ、控えめな再読み込み案内に降格する。
  // dev では HMR の vite:beforeUpdate で ErrorBoundary 側が自動リセットするため、
  // コードを直して保存すればこの画面ごと消える。
  const [degraded, setDegraded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDegraded(true), DEGRADE_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!degraded) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-base text-muted-foreground">Working on it…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-base text-muted-foreground">
        This view is taking longer than expected to update.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
      >
        Reload
      </button>
      {import.meta.env.DEV && (
        <details className="max-w-lg text-left">
          <summary className="cursor-pointer text-xs text-muted-foreground">
            Details
          </summary>
          <pre className="mt-2 max-w-lg overflow-auto rounded bg-muted p-4 text-xs">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  );
}

export function PageRouter() {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.name}
          path={route.path}
          element={
            <ErrorBoundary fallback={(error) => <PageError error={error} />}>
              <Suspense fallback={<PageFallback />}>
                <route.component />
              </Suspense>
            </ErrorBoundary>
          }
        />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
