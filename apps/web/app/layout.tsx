import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "SWOT Khulna | Delta Hydro-AI Platform",
  description: "NASA SWOT Satellite Radar Interferometry & Estuarine Hydrodynamic Salinity Forecasting in the Bengal Delta",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans")}>
      <body
        className={`font-sans antialiased bg-[#050505] text-white selection:bg-cyan-500/30`}
      >
        {children}
      </body>
    </html>
  );
}
