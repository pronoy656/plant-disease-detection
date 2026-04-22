import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FloraScan | AI Plant Disease Identification",
  description: "Protect your plants with FloraScan AI. Upload an image of a leaf to identify diseases and get treatment recommendations instantly.",
  keywords: "plant disease, AI plant diagnosis, leaf identification, garden care, flora scan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
