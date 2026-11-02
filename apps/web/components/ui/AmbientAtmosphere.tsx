"use client";

import React from "react";

export function AmbientAtmosphere() {
  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* 1. Deep Oceanic Delta Radial Glows */}
      <div 
        className="absolute -top-[15%] left-[20%] w-[800px] h-[500px] rounded-full bg-primary/6 blur-[150px] animate-pulse" 
        style={{ animationDuration: "12s" }}
      />
      <div 
        className="absolute top-[40%] -right-[10%] w-[700px] h-[600px] rounded-full bg-accent/4 blur-[180px] animate-pulse" 
        style={{ animationDuration: "16s" }}
      />
      <div 
        className="absolute -bottom-[10%] left-[10%] w-[900px] h-[550px] rounded-full bg-sky-950/20 blur-[160px]" 
      />

      {/* 2. Tactical Lat-Lon Coordinate Grid (Sparse & Subtle) */}
      <div 
        className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:64px_64px]" 
      />

      {/* 3. Subtle Vignette Border */}
      <div 
        className="absolute inset-0 bg-radial-[circle_at_center,transparent_30%,rgba(5,7,13,0.7)_100%]" 
      />
    </div>
  );
}

