import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PageWrapper from "@/components/PageWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReviewShield | AI-Powered Fake Review Detection",
  description: "Protect your e-commerce business from deceptive feedback. Analyze single reviews, perform bulk CSV audits, and monitor ratings anomalies with probabilistic risk assessments.",
  keywords: ["review fraud", "fake review detection", "ecommerce moderation", "AI review analysis", "rating integrity"],
  authors: [{ name: "ReviewShield Team" }],
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
      <body className="min-h-full bg-gray-50 text-gray-900 font-sans">
        <PageWrapper>{children}</PageWrapper>
      </body>
    </html>
  );
}

