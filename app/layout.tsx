import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";

import { Analytics } from "@vercel/analytics/next";

import { AppFooter } from "@/components/layouts/app-footer";
import { AppHeader } from "@/components/layouts/app-header";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
};

// globals.css maps the sans, serif and mono theme fonts onto this variable.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistMono.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <AppProviders>
          <div className="flex min-h-dvh flex-col items-center">
            <AppHeader />
            <main className="flex w-full flex-1 overflow-auto">{children}</main>
            <AppFooter />
          </div>
          <Toaster />
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
