"use client";

import { useBigQueryDatabases } from "@/hooks/use-bigquery-databases";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DatabaseList() {
  const { data: databases, isLoading, error } = useBigQueryDatabases();

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
            Failed to fetch databases. Please check your BigQuery connection.
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
          <CardDescription>
            {databases?.length || 0} dataset{databases?.length !== 1 ? "s" : ""} accessible by your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {databases && databases.length > 0 ? (
            <div className="space-y-3">
              {databases.map((db) => (
                <Card key={db.datasetId} className="border-muted">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{db.name}</h3>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex gap-4 flex-wrap">
                            <span>
                              <strong>Project:</strong> {db.projectId}
                            </span>
                            <span>
                              <strong>Location:</strong>{" "}
                              <Badge variant="outline">{db.location || "N/A"}</Badge>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
