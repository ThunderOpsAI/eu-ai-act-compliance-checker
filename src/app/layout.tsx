import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://euaipass.com"),
  title: "EU AI Pass | EU AI Act Compliance Checker",
  description:
    "Instant EU AI Act risk tier classification in 3 minutes. Zero data retention. Get your full statutory obligations audit PDF for $29 — instead of $5,000 in legal fees.",
  keywords: [
    "EU AI Act compliance",
    "Regulation EU 2024 1689",
    "AI risk classification",
    "AI Act checker",
    "GPAI compliance",
    "Annex III",
    "high risk AI",
  ],
  openGraph: {
    type: "website",
    url: "https://euaipass.com",
    title: "EU AI Pass | EU AI Act Compliance Checker",
    description:
      "Classify your AI system against Regulation (EU) 2024/1689 in 3 minutes. Zero data retention. Full PDF audit report for $29.",
    siteName: "EU AI Pass",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EU AI Act Compliance Checker — Instant Risk Tier Classification",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EU AI Pass | EU AI Act Compliance Checker",
    description:
      "Classify your AI system against the EU AI Act in 3 minutes. Zero data retention. Full PDF audit report for $29.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
