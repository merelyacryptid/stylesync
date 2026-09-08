import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StyleSync — Dress the moment",
  description: "A visual outfit curation workspace."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
