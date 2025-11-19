import React, { forwardRef } from "react";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type ActiveLinkProps = LinkProps & {
  className?: string;
  activeClassName?: string;
  exact?: boolean;
  children: React.ReactNode;
};

/**
 * ActiveLink
 * - Applies `activeClassName` when the current pathname matches `href`.
 * - `exact` toggles exact vs prefix matching.
 * - Uses your `cn` util to merge classes.
 */
const ActiveLink = forwardRef<HTMLAnchorElement, ActiveLinkProps>(
  ({ href, className, activeClassName = "text-indigo-600", exact = false, children, ...props }, ref) => {
    const pathname = usePathname() || "/";
    const to = typeof href === "string" ? href : href.pathname ?? "/";
    const isActive = exact ? pathname === to : pathname.startsWith(to === "/" ? "/" : to);

    return (
      <Link href={href} {...props} ref={ref} className={cn(className, isActive ? activeClassName : "")}>
        {children}
      </Link>
    );
  }
);

ActiveLink.displayName = "ActiveLink";

export default ActiveLink;
