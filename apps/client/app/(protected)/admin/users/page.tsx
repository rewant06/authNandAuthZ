"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { getAllUsers } from "@/lib/user.service";
import { User, PaginatedResponse } from "@iam-project/types";

const usersFetcher = ([url, page]: [string, number]) => getAllUsers(page);

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const {
    data: paginatedResponse,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<User>>(["/users", page], usersFetcher);

  if (error) return <div>Failed to load users.</div>;

  return (
    <div>
      <h3> All Users </h3>
      {isLoading ? (
        <div> Loading users...</div>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
           
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                <th style={{ padding: "8px" }}>Name</th>
                <th style={{ padding: "8px" }}>Email</th>
                <th style={{ padding: "8px" }}>Roles</th>
                <th style={{ padding: "8px" }}>Verified</th>
              </tr>
            </thead>

            <tbody>
              {paginatedResponse?.data.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}> {user.name || "N/A"} </td>
                  <td style={{ padding: "8px" }}> {user.email}</td>
                  <td style={{ padding: "8px" }}>
                    {user.roles.map((role) => role.name).join(", ")}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {user.isEmailVerified ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "1rem",
            }}
          >
            <div>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={paginatedResponse?.meta.lastPage}
                style={{ marginLeft: "0.5rem" }}
              >
                Next
              </button>
            </div>

            <span>
              Page {paginatedResponse?.meta.page} of{" "}
              {paginatedResponse?.meta.totalPages} (
              {paginatedResponse?.meta.total} total users)
            </span>
          </div>
        </>
      )}
    </div>
  );
}
