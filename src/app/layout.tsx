import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ShellGate } from "@/components/workspaces/ShellGate";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HyperCLI - Skills & Shared Knowledge",
  description: "Agent skills and shared knowledge management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${plusJakarta.variable} font-sans antialiased h-screen overflow-hidden`}
      >
        <ShellGate>{children}</ShellGate>
      </body>
    </html>
  );
}
