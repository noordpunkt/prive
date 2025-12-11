import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Custom font configuration - Using only 2 fonts
const customFont = localFont({
  src: [
    {
      path: "../fonts/AB-Prive-Regular-L.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/AB-Prive-SemiBold-L.otf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-custom",
  fallback: ["system-ui", "arial"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Privé à la Carte - Services Platform",
  description: "Discover premium private services à la carte: private chefs, hairdressers, cleaning, gardening, chauffeurs, babysitting, personal shopping, styling, and interior design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${customFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
