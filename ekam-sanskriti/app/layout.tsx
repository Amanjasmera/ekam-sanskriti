import type { Metadata } from "next";
import { Inter, Poppins, Tiro_Devanagari_Sanskrit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const tiroDevanagari = Tiro_Devanagari_Sanskrit({
  weight: '400',
  subsets: ['devanagari'],
  variable: '--font-tiro-devanagari',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Ekam Sanskriti",
  description: "One Platform · 22 Languages · Infinite Heritage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} ${tiroDevanagari.variable} font-sans antialiased bg-cream text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
