"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { getActivityLogs } from "@/lib/activity.service";
import {
  PaginatedResponse,
  ActivityLog,
  ActivityLogChanges,
  ActivityLogContext,
} from "@iam-project/types";

// Helper component to render JSON objects cleanly
const JsonViewer = ({
  data,
}: {
  data: ActivityLogChanges | ActivityLogContext | null;
}) => {
  if (!data || Object.keys(data).length === 0) {
    return <span style={{ color: "#888" }}>N/A</span>;
  }
  return (
    <pre
      style={{
        backgroundColor: "#f4f4f4",
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "0.8rem",
        whiteSpace: "pre-wrap", // wrap long lines
        wordBreak: "break-all", // break long words/tokens
        margin: 0,
      }}
    >
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
};

// Helper component for formatting the date
const FormattedDate = ({ dateString }: { dateString: string }) => {
  try {
    const date = new Date(dateString);
    const formatted = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
    return <time dateTime={dateString}>{formatted}</time>;
  } catch (e) {
    return <span style={{ color: "red" }}>Invalid Date</span>;
  }
};

// Helper component for the status badge
const StatusBadge = ({
  status,
  failureReason,
}: {
  status: string;
  failureReason: string | null;
}) => {
  const isSuccess = status.toUpperCase() === "SUCCESS";
  const style: React.CSSProperties = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: isSuccess ? "#28a745" : "#dc3545",
  };

  return (
    <div>
      <span style={style}>{status}</span>
      {failureReason && (
        <div style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "4px" }}>
          {failureReason}
        </div>
      )}
    </div>
  );
};

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
    return <div>Failed to load logs. You may not have permission.</div>;
  }

  // Styles for the table (makes it more readable)
  const thStyle: React.CSSProperties = {
    padding: "10px 12px",
    textAlign: "left",
    borderBottom: "2px solid #ccc",
    backgroundColor: "#f9f9f9",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderBottom: "1px solid #eee",
    color: "#1f777eff",
    verticalAlign: "top",
    fontSize: "0.9rem",
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "0.5rem " }}>
        Audit Log
      </h3>
      {isLoading ? (
        <div> Loading activity logs...</div>
      ) : (
        <>
          {/* This div makes the table responsive */}
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                color: "black",
                minWidth: "1000px", // Force horizontal scroll on small screens
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Actor</th>
                  <th style={thStyle}>Action</th>
                  <th style={thStyle}>Entity</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Changes</th>
                  <th style={thStyle}>Context</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>

              <tbody>
                {paginatedResponse?.data.map((log) => (
                  <tr key={log.id}>
                    <td style={tdStyle}>
                      <div style={{ fontSize: "0.8rem", color: "#372fb3ff" }}>
                        <strong>{log.actorSnapshot?.email || "System"}</strong>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#555" }}>
                        {log.actorSnapshot?.roles.map((r) => r.name).join(", ")}
                      </div>
                    </td>
                    <td style={tdStyle}>{log.actionType}</td>
                    <td style={tdStyle}>
                      <div>
                        <strong>{log.entityType}</strong>
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#555",
                          wordBreak: "break-all",
                        }}
                      >
                        {log.entityId || "N/A"}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge
                        status={log.status}
                        failureReason={log.failureReason}
                      />
                    </td>
                    <td style={tdStyle}>
                      <JsonViewer data={log.changes} />
                    </td>
                    <td style={tdStyle}>
                      <JsonViewer data={log.context} />
                    </td>
                    <td style={tdStyle}>
                      <FormattedDate dateString={log.createdAt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #eee",
            }}
          >
            <div>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                aria-label="Go to previous page"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={paginatedResponse?.meta.lastPage || isLoading}
                style={{ marginLeft: "0.5rem" }}
                aria-label="Go to next page"
              >
                Next
              </button>
            </div>
            <span>
              Page {paginatedResponse?.meta.page} of{" "}
              {paginatedResponse?.meta.totalPages} (
              {paginatedResponse?.meta.total} total logs)
            </span>
          </div>
        </>
      )}
    </div>
  );
}
