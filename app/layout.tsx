"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/context/UserContext";
import { useEffect } from "react";
import { setupGlobalErrorListeners } from "@/lib/utils/global-error-display";
import { GlobalErrorDisplay } from "@/lib/utils/global-error-display";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Set up global error handling
  useEffect(() => {
    setupGlobalErrorListeners();
  }, []);

  return (
    <html lang="en">
      <head>
        <title>EcoTrack - Carbon Footprint Tracker</title>
        <meta name="description" content="Personalized carbon footprint tracking for eco-conscious individuals" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          {children}
          <GlobalErrorDisplay />
        </UserProvider>
      </body>
    </html>
  );
}
