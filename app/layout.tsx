import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";

import { Analytics } from "@vercel/analytics/next";

import AppFooter from "@/components/layouts/app-footer";
import { Header } from "@/components/layouts/app-header";
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

const fontSans = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`min-h-dvh bg-background text-foreground ${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
        <AppProviders>
          <div className="flex min-h-dvh flex-col items-center">
            <Header />
            <main className="flex w-full flex-1 overflow-auto">{children}</main>
            <AppFooter />
          </div>
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
