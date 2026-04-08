import { OrderChart } from "@/components/order-chart";

export default function OrdersPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-8">
      <h1 className="text-3xl font-bold">Orders</h1>
      <p className="text-muted-foreground">
        Track and analyze your orders.
      </p>
      <OrderChart />
    </div>
  );
}
