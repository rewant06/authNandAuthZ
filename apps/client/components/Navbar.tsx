"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useAuthorization } from "@/hooks/use-authorization";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import ActiveLink from "@/components/ActiveLink";

/**
 * Navbar — Desktop CTA guaranteed visible (explicit Link with gradient)
 */

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { permissions } = useAuthorization();
  const canSeeAdminPanel = permissions.includes("MANAGE:all");

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "About Us", path: "/about" },
  ];

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    logger.log("User clicking logout");
    try {
      await logout();
      router.push("/");
    } catch (err) {
      logger.error("Logout failed", err);
    }
  };

  /* Focus trap & ESC handling for mobile drawer */
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const node = menuRef.current!;
    const focusableSelectors =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusable = node ? Array.from(node.querySelectorAll<HTMLElement>(focusableSelectors)) : [];

    if (focusable.length > 0) focusable[0].focus();
    else node?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key === "Tab") {
        const focusOrder = focusable.length ? focusable : [node as HTMLElement];
        const first = focusOrder[0];
        const last = focusOrder[focusOrder.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => setIsOpen(false), [pathname]);

  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-lg"
      style={{
        WebkitBackdropFilter: "saturate(180%) blur(6px)",
        backdropFilter: "saturate(180%) blur(6px)",
        color: "#111827",
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="HelpingBots home"
            tabIndex={0}
          >
            <div
              className="relative h-10 w-10 md:h-12 md:w-12 transform-gpu transition-transform duration-200 will-change-transform group-hover:scale-110 focus-visible:scale-110"
              style={{ cursor: "pointer", transformOrigin: "center" }}
            >
              <Image
                src="/logo.png"
                alt="HelpingBots Logo"
                fill
                sizes="40px"
                priority
                className="object-contain"
              />
            </div>
            <span
              className="text-xl md:text-2xl font-semibold leading-none select-none"
              style={{
                backgroundImage: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              HelpingBots
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <ActiveLink
                    key={link.path}
                    href={link.path}
                    className="relative px-1 py-1 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    activeClassName="text-indigo-600"
                    exact={link.path === "/"}
                  >
                    <span style={{ color: active ? "hsl(var(--primary))" : undefined }}>{link.name}</span>
                    <span
                      className={`absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-primary to-accent transition-all duration-150 ease-out ${
                        active ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                      aria-hidden
                    />
                  </ActiveLink>
                );
              })}
            </div>

            {/* Auth area */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user?.name ?? "User"}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-800 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-slate-800 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <Link href="/login">Sign In</Link>
                </Button>

                {/* Desktop CTA: explicit anchor with gradient (guaranteed visible) */}
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              ref={triggerRef}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              onClick={() => setIsOpen((s) => !s)}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {isOpen && (
          <div
            id="mobile-navigation"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            className="md:hidden py-4 animate-fade-in"
            style={{ color: "#111827" }}
          >
            <div className="flex flex-col gap-3 px-2">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <ActiveLink
                    key={link.path}
                    href={link.path}
                    className="px-4 py-2 rounded-md text-sm font-medium transition-colors block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    activeClassName="text-indigo-600"
                    exact={link.path === "/"}
                    onClick={() => setIsOpen(false)}
                  >
                    <span
                      style={{
                        backgroundColor: active ? "hsla(239,82%,62%,0.08)" : undefined,
                        color: active ? "hsl(var(--primary))" : undefined,
                      }}
                    >
                      {link.name}
                    </span>
                  </ActiveLink>
                );
              })}

              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 border-t border-slate-200">
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {user?.name ?? "User"}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-slate-300 text-slate-800 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full block px-4 py-2 rounded-md text-sm text-slate-800 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    Sign In
                  </Link>

                  {/* Mobile CTA uses same gradient via Button asChild for parity */}
                  <Button
                    asChild
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                  >
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
