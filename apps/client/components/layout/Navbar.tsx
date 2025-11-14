"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useAuthorization } from "@/hooks/use-authorization";
import { logger } from "@/lib/logger";
import "./Navbar.css";

export function Navbar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const { permissions } = useAuthorization();
  const canSeeAdminPanel = permissions.includes("MANAGE:all");

  const handleLogout = () => {
    logger.log("User clicking logout");
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link href="/" className="navbar-brand">
          HelpingBots
        </Link>
        <div className="navbar-links">
          {isAuthenticated && (
            <Link href="/dashboard" className="navbar-link">
              Dashboard
            </Link>
          )}

          {canSeeAdminPanel && (
            <Link href="/admin/users" className="navbar-link">
              Admin Panel
            </Link>
          )}
          {canSeeAdminPanel && (
            <Link href="/admin/activity-log" className="navbar-link">
              Activity Logs
            </Link>
          )}
        </div>
      </div>
      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <Link href="/profile" className="navbar-link">
              Profile
            </Link>
            <button onClick={handleLogout} className="navbar-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="navbar-link">
              Login
            </Link>
            <Link href="/register" className="navbar-button">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
