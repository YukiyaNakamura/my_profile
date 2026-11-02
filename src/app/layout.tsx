import type { Metadata } from "next";
import { profile } from "@/data/profile";
import "./globals.css";
export const metadata: Metadata = { title: profile.metadata.title, description: profile.metadata.description };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
