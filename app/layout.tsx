// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { getMainPageFrameMetadata, getMiniAppMetadata } from "@/lib/frame-metadata";

const baseUrl = process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000";

// Frame image for main app (1.91:1 aspect ratio, 1200x630)
const frameImageUrl = `${baseUrl}/og-image.jpg`;

// Base Mini App preview image (3:2 aspect ratio, 1200x800)
const miniAppImageUrl = `${baseUrl}/base-og-image.jpg`;

// Generate Frame metadata for main app page
const frameMetadata = getMainPageFrameMetadata(frameImageUrl, baseUrl);

// Generate Base Mini App embed metadata
const miniAppMetadata = getMiniAppMetadata(miniAppImageUrl, baseUrl);

// Viewport configuration for mobile browser chrome handling
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "PumpMyBag - Pump your bag every day on Base",
  description: "Daily pump streak tracker on Base blockchain. Pump your bag once per day and build your streak!",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.jpg", sizes: "1024x1024", type: "image/jpeg" }],
    apple: [{ url: "/icon.jpg", sizes: "180x180", type: "image/jpeg" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PumpMyBag",
  },
  openGraph: {
    title: "PumpMyBag - Pump your bag every day on Base",
    description: "Daily pump streak tracker on Base blockchain. Pump your bag and track your consistency!",
    url: baseUrl,
    siteName: "PumpMyBag",
    images: [{ url: `${baseUrl}/og-image.jpg`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PumpMyBag - Pump your bag every day on Base",
    description: "Daily pump streak tracker on Base blockchain. Pump your bag and build your streak!",
    images: [`${baseUrl}/og-image.jpg`],
  },
  // Farcaster Frame and Mini App embed metadata
  other: {
    ...frameMetadata,
    "fc:frame": miniAppMetadata,
    "fc:miniapp": miniAppMetadata,
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
        {/* 🟢 Meta Farcaster/Base */}
        <meta name="base:app_id" content="6983376ebd202a51855da5b2" />
        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#0891b2', color: '#fff' },
              success: { duration: 3000, iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
