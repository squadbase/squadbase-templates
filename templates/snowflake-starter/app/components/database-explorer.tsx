"use client";

import { useState } from "react";
import { useSnowflakeDatabases } from "@/hooks/use-snowflake-databases";
import { useSnowflakeSchemas } from "@/hooks/use-snowflake-schemas";
import { useSnowflakeTables } from "@/hooks/use-snowflake-tables";
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
  FolderTree,
  Table as TableIcon,
  Eye,
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

export function DatabaseExplorer() {
  const { data: databases, isLoading, error } = useSnowflakeDatabases();
  const [expandedDatabases, setExpandedDatabases] = useState<Set<string>>(
    new Set()
  );
  const [expandedSchemas, setExpandedSchemas] = useState<
    Set<string>
  >(new Set());

  const toggleDatabase = (dbName: string) => {
    const newExpanded = new Set(expandedDatabases);
    if (newExpanded.has(dbName)) {
      newExpanded.delete(dbName);
      // Also collapse all schemas in this database
      const newExpandedSchemas = new Set(expandedSchemas);
      expandedSchemas.forEach((key) => {
        if (key.startsWith(`${dbName}.`)) {
          newExpandedSchemas.delete(key);
        }
      });
      setExpandedSchemas(newExpandedSchemas);
    } else {
      newExpanded.add(dbName);
    }
    setExpandedDatabases(newExpanded);
  };

  const toggleSchema = (dbName: string, schemaName: string) => {
    const key = `${dbName}.${schemaName}`;
    const newExpanded = new Set(expandedSchemas);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSchemas(newExpanded);
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
            Failed to fetch databases. Please check your Snowflake connection.
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
            Database Explorer
          </CardTitle>
          <CardDescription>
            {databases?.length || 0} database
            {databases?.length !== 1 ? "s" : ""} accessible by your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {databases && databases.length > 0 ? (
            <div className="space-y-2">
              {databases.map((db) => (
                <DatabaseItem
                  key={db.name}
                  database={db}
                  isExpanded={expandedDatabases.has(db.name)}
                  onToggle={() => toggleDatabase(db.name)}
                  expandedSchemas={expandedSchemas}
                  onToggleSchema={(schemaName) =>
                    toggleSchema(db.name, schemaName)
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No databases found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface DatabaseItemProps {
  database: any;
  isExpanded: boolean;
  onToggle: () => void;
  expandedSchemas: Set<string>;
  onToggleSchema: (schemaName: string) => void;
}

function DatabaseItem({
  database,
  isExpanded,
  onToggle,
  expandedSchemas,
  onToggleSchema,
}: DatabaseItemProps) {
  const { data: schemas, isLoading } = useSnowflakeSchemas(
    isExpanded ? database.name : undefined
  );

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
              <span className="font-semibold">{database.name}</span>
              <div className="flex items-center gap-2 ml-auto">
                {database.is_current === "Y" && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Current
                  </Badge>
                )}
                {database.is_default === "Y" && (
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
            ) : schemas && schemas.length > 0 ? (
              <div className="space-y-2 mt-2">
                {schemas.map((schema) => (
                  <SchemaItem
                    key={schema.name}
                    schema={schema}
                    databaseName={database.name}
                    isExpanded={expandedSchemas.has(
                      `${database.name}.${schema.name}`
                    )}
                    onToggle={() => onToggleSchema(schema.name)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4">
                No schemas found
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface SchemaItemProps {
  schema: any;
  databaseName: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function SchemaItem({
  schema,
  databaseName,
  isExpanded,
  onToggle,
}: SchemaItemProps) {
  const { data: tables, isLoading } = useSnowflakeTables(
    isExpanded ? databaseName : undefined,
    isExpanded ? schema.name : undefined
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

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className="border-muted">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start p-3 h-auto hover:bg-primary/20 data-[state=open]:bg-primary/15 data-[state=open]:text-foreground"
          >
            <div className="flex items-center gap-2 w-full">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
              <FolderTree className="h-4 w-4 shrink-0" />
              <span className="font-medium">{schema.name}</span>
              {isExpanded && tables && (
                <div className="flex gap-2 ml-auto">
                  <Badge variant="secondary" className="gap-1">
                    <TableIcon className="h-3 w-3" />
                    {stats.tables}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Eye className="h-3 w-3" />
                    {stats.views}
                  </Badge>
                </div>
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-3 pl-9">
            {isLoading ? (
              <div className="space-y-2 mt-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : tables && tables.length > 0 ? (
              <div className="rounded-md border mt-2">
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
                    {tables.map((table, idx) => (
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
