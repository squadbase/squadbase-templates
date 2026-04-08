import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const sampleProducts = [
  { id: 1, name: "Wireless Headphones", category: "Electronics", price: 79.99, stock: 142, status: "Active" },
  { id: 2, name: "Running Shoes", category: "Footwear", price: 129.99, stock: 58, status: "Active" },
  { id: 3, name: "Coffee Maker", category: "Home", price: 49.99, stock: 0, status: "Out of Stock" },
  { id: 4, name: "Yoga Mat", category: "Fitness", price: 29.99, stock: 203, status: "Active" },
  { id: 5, name: "Desk Lamp", category: "Office", price: 39.99, stock: 87, status: "Active" },
];

export function ProductTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Stock</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleProducts.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
            <TableCell className="text-right">{product.stock}</TableCell>
            <TableCell>
              <Badge variant={product.status === "Active" ? "default" : "secondary"}>
                {product.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
