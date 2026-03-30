import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProviderWrapper } from "@/components/providers/session-provider";
import { ThemeProvider } from "next-themes";
import Script from 'next/script'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // ── Basic ──────────────────────────────────────────────
  title: {
    default: "Propely - Property Management Made Simple",
    template: "%s | Propely", // page titles become "Leases | Propely"
  },
  description:
    "Propely helps landlords manage properties, tenants, leases, and payments — all in one place. Built for modern property management.",
  keywords: [
    "property management",
    "landlord software",
    "rental management",
    "tenant portal",
    "lease management",
    "rent collection",
    "real estate management",
  ],
  authors: [{ name: "Propely", url: "https://propely.site" }],
  creator: "Propely",
  metadataBase: new URL("https://propely.site"), 

  other: {
    "google-adsense-account": "ca-pub-1335845015981714",
  },

  // ── Canonical & robots ────────────────────────────────
  alternates: {
    canonical: "https://propely.site",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },

  // ── Open Graph (Facebook, LinkedIn, WhatsApp previews) ─
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://propely.site",
    siteName: "Propely",
    title: "Propely - Property Management Made Simple",
    description:
      "Manage properties, tenants, leases, and payments all in one place.",
    images: [
      {
        url: "/og-image.png", // create a 1200x630px image and put it in /public
        width: 1200,
        height: 630,
        alt: "Propely - Property Management",
      },
    ],
  },

  // ── Twitter/X card ────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "Propely - Property Management Made Simple",
    description:
      "Manage properties, tenants, leases, and payments all in one place.",
    images: ["/og-image.png"], // same image as og
    // creator: "@yourtwitter", // add if you have a Twitter account
  },

  // ── PWA / browser tab ─────────────────────────────────
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1335845015981714"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased activity-scroll`}
      >
        <SessionProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProviderWrapper>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
