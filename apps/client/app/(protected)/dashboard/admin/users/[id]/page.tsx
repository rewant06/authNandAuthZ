"use client";

import React, { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  getUserById, 
  updateUserRoles,
  manuallyVerifyUser,
  getUserActivity
} from "@/lib/user.service";
import { User, PaginatedResponse, ActivityLog } from "@/types/index";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ArrowLeft, 
  Shield, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Code,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check
} from "lucide-react";

// --- Fetcher for User Details ---
const fetcher = (url: string) => getUserById(url.split("/").pop()!);

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { mutate } = useSWRConfig();
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: user, error, isLoading } = useSWR<User>(
    userId ? `/users/${userId}` : null,
    () => getUserById(userId)
  );

  // --- Handlers ---

  const handleRoleToggle = async (roleName: string, checked: boolean) => {
    if (!user) return;
    let newRoles = user.roles.map((r) => r.name);
    
    if (checked) {
      newRoles.push(roleName);
    } else {
      newRoles = newRoles.filter((r) => r !== roleName);
    }

    try {
      const updated = await updateUserRoles(userId, newRoles);
      mutate(`/users/${userId}`, updated, false); 
      toast.success(`Role ${roleName} ${checked ? "assigned" : "removed"}`);
    } catch (err) {
      toast.error("Failed to update roles");
    }
  };

  const handleManualVerify = async () => {
    if (!confirm("Are you sure you want to verify this user manually?")) return;
    setIsVerifying(true);
    try {
      const updated = await manuallyVerifyUser(userId);
      mutate(`/users/${userId}`, updated, false);
      toast.success("User manually verified.");
    } catch (err) {
      toast.error("Failed to verify user.");
    } finally {
      setIsVerifying(false);
    }
  };

  const hasRole = (roleName: string) => user?.roles.some((r) => r.name === roleName);

  if (isLoading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  
  if (error) return <div className="p-8 text-destructive">User not found</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{user?.name}</h2>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Mail className="h-3 w-3" /> {user?.email}
            <span className="mx-1">•</span>
            <span className="font-mono text-xs">ID: {user?.id}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
           {user?.isEmailVerified ? (
             <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-0 gap-1 py-1 px-3">
               <CheckCircle2 className="h-4 w-4" /> Verified
             </Badge>
           ) : (
             <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-0 gap-1 py-1 px-3">
                  <XCircle className="h-4 w-4" /> Pending
                </Badge>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs border-green-500/30 text-green-600 hover:bg-green-500/10 hover:text-green-700"
                  onClick={handleManualVerify}
                  disabled={isVerifying}
                >
                  {isVerifying ? <Loader2 className="h-3 w-3 animate-spin"/> : <Check className="h-3 w-3 mr-1"/>}
                  Mark Active
                </Button>
             </div>
           )}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Permissions
              </CardTitle>
              <CardDescription>Manage user access levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Administrator</Label>
                  <p className="text-xs text-muted-foreground">Full system access</p>
                </div>
                <Switch
                  checked={hasRole("ADMIN")}
                  onCheckedChange={(c) => handleRoleToggle("ADMIN", c)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                 <div className="space-y-0.5">
                  <Label className="text-base">Standard User</Label>
                  <p className="text-xs text-muted-foreground">Basic access</p>
                </div>
                <Switch
                  checked={hasRole("USER")}
                  onCheckedChange={(c) => handleRoleToggle("USER", c)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Joined
                </span>
                <span>{format(new Date(user?.createdAt || new Date()), "PPP")}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{format(new Date(user?.updatedAt || new Date()), "PPP")}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activity Logs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
              <TabsTrigger value="sessions" disabled>Sessions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Actions performed by {user?.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Real Table Component */}
                  <UserActivityTable userId={userId} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// --- Fully Functional Activity Table ---

// NOTE: We use a custom fetcher that accepts the PAGE as argument
const activityFetcher = (url: string) => {
  // url is like: /api/activity?userId=123&page=1
  // We parse this or just use our service wrapper. 
  // Service wrapper approach is cleaner for Types.
  
  // Extract args from the unique key string passed by useSWR
  // Key format: ["activity", userId, pageIndex]
  return null; 
};

function UserActivityTable({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  
  // Fetcher wrapper to pass to SWR
  const fetcher = () => getUserActivity(userId, page, 10);

  const { data: response, isLoading } = useSWR<PaginatedResponse<ActivityLog>>(
    ["user-activity", userId, page],
    fetcher,
    { keepPreviousData: true }
  );

  if (isLoading && !response) {
    return <div className="p-8 text-center text-muted-foreground">Loading activity...</div>;
  }

  if (!response?.data || response.data.length === 0) {
     return (
        <div className="p-8 text-center border rounded-lg border-dashed">
           <p className="text-muted-foreground">No activity recorded for this user.</p>
        </div>
     );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {response.data.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {log.actionType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{log.entityType}</span>
                    {log.entityId && (
                      <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[80px]">
                        {log.entityId}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={
                      log.status === "SUCCESS" 
                        ? "bg-green-500/15 text-green-700 border-0 text-[10px]" 
                        : "bg-destructive/15 text-destructive border-0 text-[10px]"
                    }
                  >
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {log.changes && Object.keys(log.changes).length > 0 ? (
                     <Popover>
                       <PopoverTrigger asChild>
                         <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Code className="h-3 w-3" />
                         </Button>
                       </PopoverTrigger>
                       <PopoverContent className="w-80">
                         <div className="space-y-2">
                           <h4 className="font-medium leading-none text-sm">Changes</h4>
                           <ScrollArea className="h-[200px] w-full rounded-md border p-2 bg-muted/50">
                              <pre className="text-[10px]">{JSON.stringify(log.changes, null, 2)}</pre>
                           </ScrollArea>
                         </div>
                       </PopoverContent>
                     </Popover>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {format(new Date(log.createdAt), "MMM d, HH:mm")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {response.meta.page} of {response.meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
               variant="outline"
               size="sm"
               className="h-8 w-8 p-0"
               onClick={() => setPage(p => p + 1)}
               disabled={response.meta.lastPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
      </div>
    </div>
  );
}