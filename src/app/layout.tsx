import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import IframeResizer from "@/components/IframeResizer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Website Cost Calculator | WebsiteHQ",
  description:
    "Calculate how much your WordPress website is really costing you in money and time. See why switching to WebsiteHQ saves you thousands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <IframeResizer />
        {children}
      </body>
    </html>
  );
}
