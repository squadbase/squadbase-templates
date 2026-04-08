import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

const stats = [
  { title: "Total Revenue", value: "$45,231", icon: TrendingUp, change: "+20.1%" },
  { title: "Orders", value: "2,350", icon: ShoppingCart, change: "+12.5%" },
  { title: "Products", value: "573", icon: Package, change: "+3.2%" },
  { title: "Customers", value: "18,549", icon: Users, change: "+8.1%" },
];

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-8">
      <h1 className="text-3xl font-bold">EC Dashboard</h1>
      <p className="text-muted-foreground">
        Overview of your e-commerce performance.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-muted-foreground text-xs">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
