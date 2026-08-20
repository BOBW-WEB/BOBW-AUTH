import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Display sans substitute per DESIGN.md ("Inter (400/500) ... comes closest").
const displaySans = Inter({
  variable: "--font-display-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Uppercase mono eyebrow/button face substitute per DESIGN.md.
const monoCaps = JetBrains_Mono({
  variable: "--font-mono-caps",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "BOBW Auth",
  description: "Générateur de token d'accès Shopify pour BOBW.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${displaySans.variable} ${monoCaps.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
