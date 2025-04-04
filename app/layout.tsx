"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/context/UserContext";
import { useEffect } from "react";
import { setupGlobalErrorListeners } from "@/lib/utils/global-error-display";
import { GlobalErrorDisplay } from "@/lib/utils/global-error-display";
import React from "react";

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
    
    // Clear any corrupted localStorage
    if (typeof window !== 'undefined') {
      try {
        // Check for localStorage keys that might be corrupted
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.')) {
            const value = localStorage.getItem(key);
            if (value === 'undefined' || value === 'null' || (value && value.startsWith('b'))) {
              console.log('Removing corrupted localStorage item:', key);
              localStorage.removeItem(key);
            }
          }
        });
      } catch (e) {
        console.error('Error cleaning localStorage:', e);
      }
    }
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
          <React.Fragment key="layout-content">
            {children}
            <GlobalErrorDisplay key="global-error-display" />
          </React.Fragment>
        </UserProvider>
      </body>
    </html>
  );
}
