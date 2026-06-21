import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "F-P Collection — L'élégance à votre portée",
    template: "%s — F-P Collection",
  },
  description:
    "Marketplace premium africaine. Maroquinerie, joaillerie, prêt-à-porter et accessoires d'exception.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans bg-ink text-bone antialiased">
        {children}
      </body>
    </html>
  );
}
