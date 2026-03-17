import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContentForge — AI SEO Content System",
  description:
    "Generate SEO briefs, article outlines, meta tags, and full drafts with AI. Built for marketing agencies and content teams.",
  openGraph: {
    title: "ContentForge — AI SEO Content System",
    description:
      "Generate SEO briefs, article outlines, meta tags, and full drafts with AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Navbar />
        <main style={{ paddingTop: "80px" }}>{children}</main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#161a1d",
              color: "#f0f4f8",
              border: "1px solid #1d2327",
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#070809",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#070809",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
