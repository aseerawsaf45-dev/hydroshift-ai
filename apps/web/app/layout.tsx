import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AmbientAtmosphere } from "@/components/ui/AmbientAtmosphere";

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
    <html lang="en" className={cn("font-sans dark")}>
      <body
        className="font-sans antialiased bg-[#060b13] text-foreground selection:bg-primary/30 selection:text-white relative min-h-[100dvh]"
      >
        <AmbientAtmosphere />
        <div className="relative z-10 flex flex-col min-h-[100dvh]">
          {children}
        </div>
      </body>
    </html>
  );
}
