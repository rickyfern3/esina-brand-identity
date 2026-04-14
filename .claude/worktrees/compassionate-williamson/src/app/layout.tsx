import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ESINA — Identity Matching Engine",
  description:
    "Normalized identity matching for agentic commerce. See how brand identity data produces better matches than generic AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
