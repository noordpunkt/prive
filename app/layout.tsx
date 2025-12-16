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

// Grand-Medium font for service titles
const grandMediumFont = localFont({
  src: [
    {
      path: "../fonts/Grand-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-grand-medium",
  fallback: ["system-ui", "arial"],
  display: "swap",
});

// Grand-Regular font for main hero title
const grandRegularFont = localFont({
  src: [
    {
      path: "../fonts/Grand-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-grand-regular",
  fallback: ["system-ui", "arial"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Privé à la Carte - Services Platform",
  description: "Discover premium private services à la carte: private chefs, hairdressers, gardening, styling, and interior design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${customFont.variable} ${grandMediumFont.variable} ${grandRegularFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
