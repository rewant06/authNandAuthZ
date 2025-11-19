"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { getAllUsers } from "@/lib/user.service";
import { User, PaginatedResponse } from "@/types/index";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Shield,
  Mail,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// Fetcher function
const usersFetcher = ([_, page]: [string, number]) => getAllUsers(page);

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);

  const {
    data: paginatedResponse,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<User>>(["/users", page], usersFetcher, {
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  // Helper to generate initials for Avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2 animate-fade-in">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load users. Please try again later.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage access and user details.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
          Add User
        </Button>
      </div>

      <Card className="glass-effect border-border/50">
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>
            A list of all registered users including their roles and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !paginatedResponse ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Loading users...
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResponse?.data.map((user) => (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3 relative group">
                            <Link
                              href={`/dashboard/admin/users/${user.id}`}
                              className="absolute inset-0 z-10"
                            />
                            <Avatar className="h-9 w-9 border border-border">
                              <AvatarImage
                                src={undefined}
                                alt={user.name || "User"}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {getInitials(user.name || "User")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {user.name}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <Badge
                                key={role.name}
                                variant="outline"
                                className="flex items-center gap-1 px-2 py-0.5 text-xs font-normal"
                              >
                                <Shield className="h-3 w-3" />
                                {role.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.isEmailVerified
                                ? "bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25 border-0"
                                : "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/25 border-0"
                            }
                          >
                            {user.isEmailVerified ? "Verified" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigator.clipboard.writeText(user.id)
                                }
                              >
                                Copy ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Edit User</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Page {paginatedResponse?.meta.page} of{" "}
                  {paginatedResponse?.meta.totalPages}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
