import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import SiteHeader from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "GrantGo",
  description: "Scholarship discovery and management platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased px-4 sm:px-6">
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl min-h-[calc(100vh-72px)] py-8">
          {children}
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
