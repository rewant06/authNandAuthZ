"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Existing Logic
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

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
      setIsOpen(false);
    } catch (err) {
      logger.error("Logout failed", err);
    }
  };

  /* Focus trap & ESC handling logic preserved from your original code */
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

  // --- LOVABLE UI STRUCTURE STARTS HERE ---
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" tabIndex={0}>
            <div className="relative h-10 w-10 md:h-12 md:w-12 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="HelpingBots Logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              HelpingBots
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "text-sm font-medium transition-colors duration-300 relative group",
                  isActive(link.path)
                    ? "text-primary"
                    : "text-foreground/80 hover:text-primary"
                )}
              >
                {link.name}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300",
                    isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"
                  )}
                />
              </Link>
            ))}

            {/* Auth Buttons (Logic: Yours | UI: Lovable) */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user?.name ?? "User"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-primary-foreground"
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={triggerRef}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div 
            ref={menuRef}
            className="md:hidden py-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.path)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted"
                  )}
                >
                  {link.name}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 border-t border-border">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {user?.name ?? "User"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="justify-start w-full">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-primary-foreground"
                  >
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      Get Started
                    </Link>
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