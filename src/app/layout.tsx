import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UrbanPath AI - Smart Mobility Intelligence System",
  description: "AI-powered micro-solution for urban mobility with route optimization, safety alerts, and congestion prediction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}