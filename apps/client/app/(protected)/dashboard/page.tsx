"use client";

import { useAuthStore } from "@/store/auth.store";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard (Protected)</h1>
      <p>Welcome, {user?.name || user?.email}!</p>
      <p>If you can see this, you are isAuthenticated.</p>
      <button onClick={handleLogout}>logout</button>
    </div>
  );
}
