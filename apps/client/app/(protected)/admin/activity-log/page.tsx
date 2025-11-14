"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { getActivityLogs } from "@/lib/activity.service";
import { PaginatedResponse, ActivityLog } from "@iam-project/types";

const logsFetcher = ([url, page]: [string, number]) => getActivityLogs(page);

export default function AdminActivityLogPage() {
  const [page, setPage] = useState(1);

  const {
    data: paginatedResponse,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<ActivityLog>>(
    ["/activity-log", page],
    logsFetcher
  );

  if (error) {
    return <div>Failed to load logs. You may not have permission.</div>;
  }

  return (
    <div>
      <h3> Audit Log</h3>
      {isLoading ? (
        <div> Loading activity logs...</div>
      ) : (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
            }}
          >
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                <th style={{ padding: "8px" }}>Actor</th>
                <th style={{ padding: "8px" }}>Action</th>
                <th style={{ padding: "8px" }}>Status</th>
                <th style={{ padding: "8px" }}>Target</th>
                <th style={{ padding: "8px" }}>Date</th>
              </tr>
            </thead>

            <tbody>
              {paginatedResponse?.data.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}>
                    {log.actorSnapshot?.email || "System"}
                  </td>

                  <td style={{ padding: "8px" }}>{log.actionType}</td>
                  <td style={{ padding: "8px" }}>{log.status}</td>
                  <td style={{ padding: "8px" }}>
                    {" "}
                    {new Date(log.createdAt).toLocaleString()}
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
                style={{ marginLeft: "0.5pem" }}
              >
                Next
              </button>
            </div>
            <span>
              Page {paginatedResponse?.meta.page} of{" "}
              {paginatedResponse?.meta.total} ({paginatedResponse?.meta.total}{" "}
              total logs)
            </span>
          </div>
        </>
      )}
    </div>
  );
}
