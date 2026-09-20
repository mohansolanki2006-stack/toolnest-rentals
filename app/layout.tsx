import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toolnest — Rent Professional Tools Nearby",
  description: "Find and reserve professional tools from trusted rental shops near you.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
