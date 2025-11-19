"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 glass-effect p-12 rounded-3xl border border-border/50 shadow-elevated animate-scale-in">
        <h1 className="text-9xl font-bold text-gradient">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground text-lg">
            Oops! The page you're looking for doesn't exist.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-105"
        >
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}
