import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const configuredSiteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: configuredSiteUrl ? new URL(configuredSiteUrl) : undefined,
  title: "FindFlow | AI Automation & Software Development",
  description:
    "FindFlow designs AI automation, SaaS products, custom software and high-performance websites for ambitious startups, SMEs and product teams across Europe.",
  keywords: [
    "AI automation company",
    "software development company",
    "SaaS development",
    "custom software development",
    "product design",
    "web development Europe",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: configuredSiteUrl ? { canonical: "/" } : undefined,
  openGraph: {
    title: "FindFlow | AI Automation & Software Development",
    description:
      "AI automation, SaaS products, custom software and high-performance websites for ambitious European teams.",
    type: "website",
    siteName: "FindFlow",
    url: configuredSiteUrl || undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: "FindFlow | AI Automation & Software Development",
    description:
      "AI automation, SaaS products, custom software and high-performance websites for ambitious European teams.",
  },
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
