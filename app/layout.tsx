import type { Metadata } from "next";
import localFont from "next/font/local";
import { Source_Code_Pro } from "next/font/google";
import "./globals.css";

// AB-Prive font for buttons (uppercase)
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

// AU fonts for general text
const auLightFont = localFont({
  src: [
    {
      path: "../fonts/AU-Light.otf",
      weight: "300",
      style: "normal",
    },
  ],
  variable: "--font-au-light",
  fallback: ["system-ui", "arial"],
  display: "swap",
});

const auRegularFont = localFont({
  src: [
    {
      path: "../fonts/AU-Regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-au-regular",
  fallback: ["system-ui", "arial"],
  display: "swap",
});

const auBoldFont = localFont({
  src: [
    {
      path: "../fonts/AU-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-au-bold",
  fallback: ["system-ui", "arial"],
  display: "swap",
});

// Source Code Pro for monospace (prices) - Light weight
const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  weight: "300",
  variable: "--font-source-code-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Les Collectionneurs. - Services Platform",
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
        className={`${customFont.variable} ${auLightFont.variable} ${auRegularFont.variable} ${auBoldFont.variable} ${sourceCodePro.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
