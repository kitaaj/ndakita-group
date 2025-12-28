import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ndakita.com"),
  title: "Ndakita Group | Give Haven - Connecting Hearts to Homes",
  description: "A secure, verified platform for connecting to children's homes. Transparency, dignity, and impact in every donation.",
  keywords: ["charity", "donations", "children's homes", "Give Haven", "Ndakita Group", "orphanage support", "transparent giving"],
  authors: [{ name: "Ndakita Group" }],
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Ndakita Group | Give Haven",
    description: "Make your kindness count where it matters most. Connecting generous hearts directly to verified children's homes.",
    url: "https://www.ndakita.com",
    type: "website",
    locale: "en_US",
    siteName: "Give Haven by Ndakita Group",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ndakita Group - Give Haven",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ndakita Group | Give Haven",
    description: "Make your kindness count where it matters most.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased font-sans bg-canvas-base text-text-primary selection:bg-haven-teal/20 selection:text-haven-teal`}
      >
        {children}
      </body>
    </html>
  );
}
