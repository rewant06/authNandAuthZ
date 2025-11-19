import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


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


        <Navbar />

        <main>{children}</main>
      </body>
      <Footer/>
    </html>
  );
}
