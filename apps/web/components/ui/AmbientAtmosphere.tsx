"use client";

import React from "react";

/**
 * Calm, quiet atmospheric backdrop following unslop principles.
 * Keeps chrome and surfaces quiet, leaving rich color exclusively to data moments.
 */
export function AmbientAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* Calm, quiet subtle vignette */}
      <div className="absolute inset-0 bg-[#090e17]" />
      
      {/* Subtle telemetry coordinates - quiet and non-distracting */}
      <div className="absolute top-6 left-6 font-mono text-[9px] text-white/[0.08] tracking-widest hidden md:block">
        22.845° N // 89.560° E // GANGES DELTA
      </div>
      <div className="absolute top-6 right-6 font-mono text-[9px] text-white/[0.08] tracking-widest hidden md:block">
        NASA SWOT KaRIn // IN-SITU CALIBRATED
      </div>
    </div>
  );
}
