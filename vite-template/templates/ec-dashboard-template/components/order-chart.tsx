import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const monthlyOrders = [
  { month: "Jan", orders: 186 },
  { month: "Feb", orders: 205 },
  { month: "Mar", orders: 237 },
  { month: "Apr", orders: 273 },
  { month: "May", orders: 209 },
  { month: "Jun", orders: 314 },
];

export function OrderChart() {
  const maxOrders = Math.max(...monthlyOrders.map((d) => d.orders));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2" style={{ height: 200 }}>
          {monthlyOrders.map((d) => (
            <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-muted-foreground text-xs">{d.orders}</span>
              <div
                className="bg-primary w-full rounded-t"
                style={{ height: `${(d.orders / maxOrders) * 160}px` }}
              />
              <span className="text-muted-foreground text-xs">{d.month}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
