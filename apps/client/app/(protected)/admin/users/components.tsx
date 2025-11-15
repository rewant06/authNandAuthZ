"use client";

import { User } from "@iam-project/types";
import { StatusBadge } from "../../../../components/ui/status-badge";

// The UsersTable is specific to the `User` type,
// so it's co-located with its page.
export const UsersTable = ({ users }: { users: User[] }) => {
  return (
    <div className="overflow-x-auto rounded-t-lg border-x border-t border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
            >
              Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
            >
              Email
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
            >
              Roles
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name || "N/A"}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {user.email}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user.roles.map((role) => role.name).join(", ")}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <StatusBadge verified={user.isEmailVerified || false} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
