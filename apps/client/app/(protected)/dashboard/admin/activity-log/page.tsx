"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { getActivityLogs } from "@/lib/activity.service";
import {
  PaginatedResponse,
  ActivityLog,
} from "@iam-project/types";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Code, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Fetcher function
const logsFetcher = ([_, page]: [string, number]) => getActivityLogs(page);

export default function AdminActivityLogPage() {
  const [page, setPage] = useState(1);
  const swrKey: [string, number] = ["/api/admin/activity-log", page];

  const {
    data: paginatedResponse,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<ActivityLog>>(swrKey, logsFetcher);

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load logs. Access denied or server error.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">Track system activities and security events.</p>
        </div>
      </div>

      <Card className="glass-effect border-border/50">
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
          <CardDescription>View chronological events across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="h-64 flex items-center justify-center text-muted-foreground">
               Loading logs...
             </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedResponse?.data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{log.actorSnapshot?.email || "System"}</span>
                          <span className="text-xs text-muted-foreground">
                            {log.actorSnapshot?.roles.map((r) => r.name).join(", ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {log.actionType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col text-sm">
                           <span className="font-medium">{log.entityType}</span>
                           <span className="text-xs text-muted-foreground truncate max-w-[100px]" title={log.entityId || ""}>
                             {log.entityId || undefined}
                           </span>
                         </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            log.status === "SUCCESS" 
                              ? "bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25 border-0" 
                              : "bg-destructive/15 text-destructive hover:bg-destructive/25 border-0"
                          }
                        >
                          {log.status}
                        </Badge>
                        {log.failureReason && (
                           <p className="text-[10px] text-destructive mt-1 max-w-[150px] leading-tight">
                             {log.failureReason}
                           </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                           {/* Changes Popover */}
                           {log.changes && Object.keys(log.changes).length > 0 && (
                             <Popover>
                               <PopoverTrigger asChild>
                                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Code className="h-4 w-4" />
                                 </Button>
                               </PopoverTrigger>
                               <PopoverContent className="w-80">
                                 <div className="space-y-2">
                                   <h4 className="font-medium leading-none">Changes</h4>
                                   <ScrollArea className="h-[200px] w-full rounded-md border p-2 bg-muted/50">
                                      <pre className="text-xs">{JSON.stringify(log.changes, null, 2)}</pre>
                                   </ScrollArea>
                                 </div>
                               </PopoverContent>
                             </Popover>
                           )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
               Page {paginatedResponse?.meta.page} of {paginatedResponse?.meta.totalPages}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={paginatedResponse?.meta.lastPage || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}