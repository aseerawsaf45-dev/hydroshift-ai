"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "icon-only" | "lockup";
  className?: string;
  glow?: boolean;
}

const SIZE_MAP = {
  xs: { box: 20, stroke1: 7, stroke2: 5, dot: 4 },
  sm: { box: 28, stroke1: 7.5, stroke2: 5.5, dot: 4.5 },
  md: { box: 36, stroke1: 8, stroke2: 6, dot: 5 },
  lg: { box: 48, stroke1: 8.5, stroke2: 6.5, dot: 5.5 },
  xl: { box: 64, stroke1: 9, stroke2: 7, dot: 6 },
};

export function BrandLogoMark({
  size = "md",
  className,
  glow = true,
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  glow?: boolean;
}) {
  const { box, stroke1, stroke2, dot } = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      className={cn(
        "relative rounded-xl flex items-center justify-center shrink-0 select-none transition-transform duration-200",
        glow && "hover:scale-105",
        className
      )}
      style={{ width: box, height: box }}
    >
      <svg
        viewBox="0 0 120 120"
        width={box}
        height={box}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="blGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#38bdf8" }} />
            <stop offset="40%" style={{ stopColor: "#06b6d4" }} />
            <stop offset="100%" style={{ stopColor: "#10b981" }} />
          </linearGradient>

          <linearGradient id="blGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: "#10b981" }} />
            <stop offset="50%" style={{ stopColor: "#22d3ee" }} />
            <stop offset="100%" style={{ stopColor: "#0284c7" }} />
          </linearGradient>

          {glow && (
            <filter id="blGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}
        </defs>

        <g filter={glow ? "url(#blGlow)" : undefined}>
          {/* Primary Radar Swath / Northern Loop Arc */}
          <path
            d="M36,46 C36,31 48,22 64,22 C78,22 90,30 90,44 C90,56 79,62 67,65 C51,69 32,74 32,90 C32,102 44,110 60,110 C76,110 88,100 90,92"
            fill="none"
            stroke="url(#blGrad1)"
            strokeWidth={stroke1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Secondary Estuarine Counter-Streamline */}
          <path
            d="M84,40 C84,33 76,28 66,28 C54,28 44,35 44,46 C44,55 53,60 65,63 C81,67 96,73 96,88 C96,101 84,108 68,108 C54,108 42,100 38,91"
            fill="none"
            stroke="url(#blGrad2)"
            strokeWidth={stroke2}
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Center KaRIn Satellite Nadir Axis Dot */}
          <circle cx="60" cy="65" r={dot} fill="#ffffff" />
          <circle cx="60" cy="65" r={dot + 3.5} fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.65" strokeDasharray="2, 2" />

          {/* Apex Orbital Anchor Nodes */}
          <circle cx="64" cy="22" r={dot * 0.7} fill="#38bdf8" />
          <circle cx="60" cy="110" r={dot * 0.7} fill="#10b981" />
        </g>
      </svg>
    </div>
  );
}

export function BrandLogo({
  size = "md",
  variant = "lockup",
  className,
  glow = true,
}: BrandLogoProps) {
  if (variant === "icon-only") {
    return <BrandLogoMark size={size} className={className} glow={glow} />;
  }

  return (
    <div className={cn("flex items-center gap-2.5 group select-none", className)}>
      <div className="p-1 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-primary/40 transition-colors shadow-sm">
        <BrandLogoMark size={size} glow={glow} />
      </div>
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold tracking-tight text-white text-xs uppercase font-sans">
            HydroShift
          </span>
          <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold text-[9px] font-mono border border-primary/30 leading-none">
            AI
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">
          Delta Hydrology Platform
        </span>
      </div>
    </div>
  );
}

export default BrandLogo;
