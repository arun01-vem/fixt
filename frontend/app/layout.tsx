import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "FIXT | Doorstep Phone Repair",
  description: "Book certified doorstep phone repair with transparent estimates and pay-after-service support.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
  openGraph: {
    title: "FIXT | Doorstep Phone Repair",
    description:
      "Book certified doorstep phone repair with transparent estimates and pay-after-service support.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "FIXT logo" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FIXT | Doorstep Phone Repair",
    description:
      "Book certified doorstep phone repair with transparent estimates and pay-after-service support.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
