import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth/AuthContext";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#7B1123",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Manglam Matrimony",
  description: "Meaningful connections, rooted in values, family and trust.",
  keywords: [
    "Matrimony",
    "Manglik Matrimony",
    "Manglam Matrimony",
    "Indian Matrimony",
    "Matchmaking",
    "Verified Profiles",
  ],
  authors: [{ name: "Manglam Matrimony" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Manglam Matrimony",
    description: "Meaningful connections, rooted in values, family and trust.",
    type: "website",
    locale: "en_IN",
    siteName: "Manglam Matrimony",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
