import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anime Sanyasi — Worlds",
  description: "World 1: Observable Universe. World 2 and World 3 coming soon.",
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
      <body>{children}</body>
    </html>
  );
}
