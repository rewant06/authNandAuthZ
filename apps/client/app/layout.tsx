// apps/client/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ClientToasters from "@/components/ui/ClientToasters";

export const metadata: Metadata = {
  title: "HelpingBots",
  description: "Production Ready",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* ClientToasters is a client component imported directly (allowed) */}
        <ClientToasters />

        <Navbar />

        <main>{children}</main>
      </body>
    </html>
  );
}
