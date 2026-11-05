"use client";

import React from "react";

export function AmbientAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transform-gpu"
    >
      {/* 1. Multimillion-dollar Mesh Gradients (Fluid Multi-Orb Atmospheric Dynamics) */}
      {/* Orb A: River Cyan Pulse */}
      <div
        className="absolute -top-[20%] left-[15%] w-[850px] h-[580px] rounded-full blur-[140px] opacity-25 animate-float-slow"
        style={{
          background:
            "radial-gradient(circle, rgba(87,214,208,0.35) 0%, rgba(14,165,233,0.18) 45%, transparent 70%)",
        }}
      />

      {/* Orb B: Deep Marine Indigo Flow */}
      <div
        className="absolute top-[25%] -right-[15%] w-[900px] h-[750px] rounded-full blur-[160px] opacity-20 animate-float-reverse"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.28) 0%, rgba(14,165,233,0.15) 50%, transparent 75%)",
        }}
      />

      {/* Orb C: Fresh Estuarine Emerald Drift */}
      <div
        className="absolute top-[60%] left-[5%] w-[750px] h-[600px] rounded-full blur-[150px] opacity-15 animate-pulse-gentle"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.22) 0%, rgba(87,214,208,0.12) 45%, transparent 70%)",
        }}
      />

      {/* Orb D: Deep Oceanic Trench Base */}
      <div
        className="absolute -bottom-[20%] right-[10%] w-[1000px] h-[650px] rounded-full blur-[170px] opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(3,105,161,0.3) 0%, rgba(30,58,138,0.2) 50%, transparent 75%)",
        }}
      />

      {/* 2. Precision Spacecraft & Hydrological Grid */}
      <div
        className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,#57d6d0_1px,transparent_1px),linear-gradient(to_bottom,#57d6d0_1px,transparent_1px)] bg-[size:56px_56px]"
      />

      {/* 3. Subtle Animated Scanline / Wave Gradient Bar (Runs top to bottom smoothly) */}
      <div
        className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(180deg,transparent_0%,rgba(87,214,208,0.4)_50%,transparent_100%)] bg-[length:100%_400px] animate-scan-slow"
      />

      {/* 4. Peripheral Cinematic Vignette & Corner Reticles */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_45%,rgba(4,8,15,0.85)_100%]" />

      {/* Precision corner reticles for aerospace feel */}
      <div className="absolute top-6 left-6 font-mono text-[9px] text-white/10 tracking-widest hidden md:block">
        + 22.845° N // 89.560° E // GANGES DELTA
      </div>
      <div className="absolute top-6 right-6 font-mono text-[9px] text-white/10 tracking-widest hidden md:block">
        ALT.SWOT.KaRIn // PASSUR-RUPSHA-BHAIRAB +
      </div>
      <div className="absolute bottom-6 left-6 font-mono text-[9px] text-white/10 tracking-widest hidden md:block">
        SYS.STATE // NOMINAL 60/60 VERIFIED +
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[9px] text-white/10 tracking-widest hidden md:block">
        + HYDROSHIFT AI // MULTI-ORBITAL DSS
      </div>
    </div>
  );
}
