import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cosmos — Explore the observable universe",
  description: "An interactive journey from Earth to the observable universe.",
};

export default function UniverseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
