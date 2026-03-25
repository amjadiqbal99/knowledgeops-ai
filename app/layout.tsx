import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Claude Ops OS",
  description: "Internal operating system for knowledge, workflows, and QA.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
