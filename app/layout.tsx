import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boxes | Intelligent Communications",
  description:
    "A next-generation global communications agency blending strategy, finance and digital.",
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
