import { ProductTable } from "@/components/product-table";

export default function ProductsPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-8">
      <h1 className="text-3xl font-bold">Products</h1>
      <p className="text-muted-foreground">
        Manage your product catalog.
      </p>
      <ProductTable />
    </div>
  );
}
