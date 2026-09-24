import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anime Sanyasi — Digital Worlds",
  description: "Immersive digital projects built for curiosity.",
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
