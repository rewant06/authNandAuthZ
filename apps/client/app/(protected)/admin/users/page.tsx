"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { isAxiosError } from "axios";
import { getAllUsers } from "@/lib/user.service";
import { User, PaginatedResponse } from "@iam-project/types";
import { logger } from "@/lib/logger";
import { UsersTable } from "./components";

import { PaginationControls } from "@/components/ui/Pagination";
import {
  TableSkeleton,
  TableError,
} from "../../../../components/ui/table-feedback";

const usersFetcher = ([_url, page]: [string, number]) => getAllUsers(page);

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: paginatedResponse,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<User>>(["/users", page], usersFetcher, {
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  useEffect(() => {
    if (error) {
      let message: string;

      if (isAxiosError(error)) {
        message =
          error.response?.data?.message ||
          error.message ||
          "An unknown Axios error occurred.";
      } else if (error instanceof Error) {
        message = error.message;
      } else {
        message = "An unexpected error occurred.";
      }

      logger.error("Failed to fetch admin users:", error);
    }
  }, [error]);

  const renderContent = () => {
    if (isLoading && !paginatedResponse) {
      return <TableSkeleton />;
    }

    if (errorMessage) {
      return <TableError message={errorMessage} />;
    }

    if (!paginatedResponse || paginatedResponse.data.length === 0) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No users found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            There are no users to display for this page. *
          </p>
        </div>
      );
    }

    return (
      <div className="shadow-lg shadow-gray-500/10 dark:shadow-none">
        <UsersTable users={paginatedResponse.data} />
        <PaginationControls
          meta={paginatedResponse.meta}
          setPage={setPage}
          isLoading={isLoading}
        />
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
        All Users
      </h3>

      <div
        className={`transition-opacity duration-200 ${
          isLoading && paginatedResponse ? "opacity-60" : "opacity-100"
        }`}
      >
        {renderContent()}
      </div>
    </div>
  );
}
