import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth/AuthContext";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#7B1123",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Manglam Matrimony | Find Meaningful Connections",
  description:
    "Discover verified profiles aligned with your values, traditions, and modern aspirations. Built with privacy, dignity, and family trust at heart.",
  keywords: [
    "Matrimony",
    "Manglik Matrimony",
    "Manglam Matrimony",
    "Indian Matrimony",
    "Matchmaking",
    "Verified Profiles",
  ],
  authors: [{ name: "Manglam Matrimony" }],
  openGraph: {
    title: "Manglam Matrimony | Find Meaningful Connections",
    description:
      "Discover verified profiles aligned with your values, traditions, and modern aspirations. Built with privacy, dignity, and family trust at heart.",
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
