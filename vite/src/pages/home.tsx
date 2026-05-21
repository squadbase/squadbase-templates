import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Placeholder } from "@/components/common/placeholder";

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Sample data — replace with your own to get started.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <span className="text-sm text-muted-foreground">Metric 1</span>
          </CardHeader>
          <CardContent>
            <Placeholder className="text-2xl font-bold">1,234</Placeholder>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <span className="text-sm text-muted-foreground">Metric 2</span>
          </CardHeader>
          <CardContent>
            <Placeholder className="text-2xl font-bold">5,678</Placeholder>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <span className="text-sm text-muted-foreground">Metric 3</span>
          </CardHeader>
          <CardContent>
            <Placeholder className="text-2xl font-bold">90.1%</Placeholder>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <span className="text-sm text-muted-foreground">Metric 4</span>
          </CardHeader>
          <CardContent>
            <Placeholder className="text-2xl font-bold">$12.3k</Placeholder>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <span className="text-base font-semibold">Chart 1</span>
          </CardHeader>
          <CardContent>
            <Placeholder className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <span className="text-base font-semibold">Chart 2</span>
          </CardHeader>
          <CardContent>
            <Placeholder className="h-64 w-full" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
