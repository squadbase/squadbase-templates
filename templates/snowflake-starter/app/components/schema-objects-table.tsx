"use client";

import { useSchemaObjects } from "@/hooks/use-schema-objects";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table as TableIcon, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

export function SchemaObjectsTable() {
  const { data: objects, isLoading, error } = useSchemaObjects();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredObjects = useMemo(() => {
    if (!objects) return [];
    if (!searchQuery) return objects;

    const query = searchQuery.toLowerCase();
    return objects.filter(
      (obj) =>
        obj.name.toLowerCase().includes(query) ||
        obj.database_name.toLowerCase().includes(query) ||
        obj.schema_name.toLowerCase().includes(query)
    );
  }, [objects, searchQuery]);

  const stats = useMemo(() => {
    if (!objects) return { tables: 0, views: 0, total: 0 };
    const tables = objects.filter((obj) =>
      obj.kind.toUpperCase().includes("TABLE")
    ).length;
    const views = objects.filter((obj) =>
      obj.kind.toUpperCase().includes("VIEW")
    ).length;
    return { tables, views, total: objects.length };
  }, [objects]);

  if (isLoading) {
    return (
      <div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to fetch tables and views. Please check your Snowflake
            connection.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                Tables & Views
              </CardTitle>
              <CardDescription>
                All tables and views across your databases
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <TableIcon className="h-3 w-3" />
                {stats.tables} Tables
              </Badge>
              <Badge variant="secondary" className="gap-1.5">
                <Eye className="h-3 w-3" />
                {stats.views} Views
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search by name, database, or schema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />

            {filteredObjects && filteredObjects.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Database</TableHead>
                      <TableHead>Schema</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead className="text-right">Rows</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredObjects.map((obj, idx) => (
                      <TableRow key={`${obj.database_name}-${obj.schema_name}-${obj.name}-${idx}`}>
                        <TableCell className="font-medium">{obj.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              obj.kind.toUpperCase().includes("VIEW")
                                ? "outline"
                                : "default"
                            }
                            className="gap-1"
                          >
                            {obj.kind.toUpperCase().includes("VIEW") ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <TableIcon className="h-3 w-3" />
                            )}
                            {obj.kind}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {obj.database_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {obj.schema_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {obj.owner}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {obj.rows !== null && obj.rows !== undefined
                            ? obj.rows.toLocaleString()
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {searchQuery
                  ? "No matching tables or views found"
                  : "No tables or views found"}
              </p>
            )}

            {searchQuery && filteredObjects.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredObjects.length} of {stats.total} objects
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
