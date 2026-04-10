import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ESINA — Brand Identity Infrastructure",
  description:
    "AI agents recommend based on popularity, not identity. Your brand becomes invisible. One line of code fixes that.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>◆</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
