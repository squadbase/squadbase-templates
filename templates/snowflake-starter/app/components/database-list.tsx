"use client";

import { useSnowflakeDatabases } from "@/hooks/use-snowflake-databases";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DatabaseList() {
  const { data: databases, isLoading, error } = useSnowflakeDatabases();

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
            Databases
          </CardTitle>
          <CardDescription>
            {databases?.length || 0} database{databases?.length !== 1 ? "s" : ""} accessible by your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {databases && databases.length > 0 ? (
            <div className="space-y-3">
              {databases.map((db) => (
                <Card key={db.name} className="border-muted">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{db.name}</h3>
                          {db.is_current === "Y" && (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Current
                            </Badge>
                          )}
                          {db.is_default === "Y" && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex gap-4">
                            <span>
                              <strong>Type:</strong> {db.kind}
                            </span>
                            <span>
                              <strong>Owner:</strong> {db.owner || "N/A"}
                            </span>
                            {db.retention_time && (
                              <span>
                                <strong>Retention:</strong> {db.retention_time} days
                              </span>
                            )}
                          </div>
                          <div>
                            <strong>Created:</strong>{" "}
                            {new Date(db.created_on).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </div>
                          {db.comment && (
                            <div>
                              <strong>Comment:</strong> {db.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
