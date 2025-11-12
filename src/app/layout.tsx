import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./nyx-theme.css"; // NyxBot Dark Purple Theme
import Providers from "./providers";
import BanGuard from "@/components/BanGuard";
import { Analytics } from "@vercel/analytics/react";
import { FavoritesProvider } from "@/context/FavoritesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NyxBot Dashboard",
  description: "Professional NyxBot Management Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <FavoritesProvider>
            <BanGuard />
            {children}
          </FavoritesProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
