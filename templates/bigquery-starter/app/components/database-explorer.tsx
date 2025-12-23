"use client";

import { useState } from "react";
import { useBigQueryDatabases } from "@/hooks/use-bigquery-databases";
import { useBigQueryTables } from "@/hooks/use-bigquery-tables";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Database,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Table as TableIcon,
  Eye,
  ChevronLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ITEMS_PER_PAGE = 20;

export function DatabaseExplorer() {
  const { data: databases, isLoading, error } = useBigQueryDatabases();
  const [expandedDatabases, setExpandedDatabases] = useState<Set<string>>(
    new Set()
  );
  const [tablePages, setTablePages] = useState<Map<string, number>>(new Map());

  const toggleDatabase = (dbName: string) => {
    const newExpanded = new Set(expandedDatabases);
    if (newExpanded.has(dbName)) {
      newExpanded.delete(dbName);
    } else {
      newExpanded.add(dbName);
    }
    setExpandedDatabases(newExpanded);
  };

  const setTablePage = (datasetName: string, page: number) => {
    const newPages = new Map(tablePages);
    newPages.set(datasetName, page);
    setTablePages(newPages);
  };

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
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
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
            Failed to load datasets. Please check your BigQuery connection.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Datasets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {databases && databases.length > 0 ? (
            <div className="space-y-2">
              {databases.map((db) => (
                <DatasetItem
                  key={db.name}
                  dataset={db}
                  isExpanded={expandedDatabases.has(db.name)}
                  onToggle={() => toggleDatabase(db.name)}
                  currentPage={tablePages.get(db.name) || 0}
                  onPageChange={(page) => setTablePage(db.name, page)}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No datasets found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface DatasetItemProps {
  dataset: any;
  isExpanded: boolean;
  onToggle: () => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

function DatasetItem({
  dataset,
  isExpanded,
  onToggle,
  currentPage,
  onPageChange,
}: DatasetItemProps) {
  const { data: tables, isLoading } = useBigQueryTables(
    isExpanded ? dataset.name : undefined,
    isExpanded ? dataset.name : undefined
  );

  const stats = tables
    ? {
        tables: tables.filter((t) => t.kind.toUpperCase().includes("TABLE"))
          .length,
        views: tables.filter((t) => t.kind.toUpperCase().includes("VIEW"))
          .length,
        total: tables.length,
      }
    : { tables: 0, views: 0, total: 0 };

  const paginatedTables = tables
    ? tables.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
      )
    : [];
  const totalPages = tables ? Math.ceil(tables.length / ITEMS_PER_PAGE) : 0;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className="border-muted">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start p-4 h-auto hover:bg-primary/20 data-[state=open]:bg-primary/15 data-[state=open]:text-foreground"
          >
            <div className="flex items-center gap-2 w-full">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
              <Database className="h-4 w-4 shrink-0" />
              <span className="font-semibold">{dataset.name}</span>
              {isExpanded && tables && (
                <div className="flex gap-2 ml-auto">
                  <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60">
                    <TableIcon className="h-3 w-3" />
                    {stats.tables}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60">
                    <Eye className="h-3 w-3" />
                    {stats.views}
                  </Badge>
                </div>
              )}
              <div className="flex items-center gap-2 ml-auto">
                {dataset.is_current === "Y" && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Current
                  </Badge>
                )}
                {dataset.is_default === "Y" && (
                  <Badge variant="secondary">Default</Badge>
                )}
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 pl-10">
            {isLoading ? (
              <div className="space-y-2 mt-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : tables && tables.length > 0 ? (
              <div className="mt-2">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead className="text-right">Rows</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTables.map((table, idx) => (
                        <TableRow key={`${table.name}-${idx}`}>
                          <TableCell className="font-medium">
                            {table.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                table.kind.toUpperCase().includes("VIEW")
                                  ? "outline"
                                  : "default"
                              }
                              className="gap-1"
                            >
                              {table.kind.toUpperCase().includes("VIEW") ? (
                                <Eye className="h-3 w-3" />
                              ) : (
                                <TableIcon className="h-3 w-3" />
                              )}
                              {table.kind.toUpperCase().includes("VIEW")
                                ? "VIEW"
                                : "TABLE"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {table.owner}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-sm">
                            {table.rows !== null && table.rows !== undefined
                              ? table.rows.toLocaleString()
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 text-sm">
                    <span className="text-muted-foreground">
                      {currentPage * ITEMS_PER_PAGE + 1}-
                      {Math.min((currentPage + 1) * ITEMS_PER_PAGE, tables.length)}{" "}
                      of {tables.length}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4">
                No tables or views found
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
