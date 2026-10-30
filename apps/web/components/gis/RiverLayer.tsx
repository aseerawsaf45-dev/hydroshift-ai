"use client";

import React, { useMemo } from "react";
import { Polyline, Tooltip, Popup, Marker } from "react-leaflet";
import L from "leaflet";
import { Waves, ArrowDown } from "lucide-react";
import { GisRiver } from "../gis-khulna-data";

interface RiverLayerProps {
  rivers: GisRiver[];
  isAcademic?: boolean;
  visible?: boolean;
  goraiFlowDelta?: number;
  tidalSurge?: number;
}

export function RiverLayer({
  rivers,
  isAcademic = true,
  visible = true,
  goraiFlowDelta = 0,
  tidalSurge = 0,
}: RiverLayerProps) {
  // Compute hydrodynamically calibrated river flushing velocity & animation speed
  const { flowDuration, estimatedVelocityMs, flushingRegime } = useMemo(() => {
    // Baseline dry season flushing velocity is ~0.75 - 0.85 m/s in southwest Bangladesh
    const baseVelocity = 0.82;
    const flowModifier = 1 + goraiFlowDelta / 100;
    const surgeResistance = tidalSurge * 0.12;
    const v = Math.max(0.18, Math.min(2.1, Number((baseVelocity * flowModifier - surgeResistance).toFixed(2))));

    // Animation cycle duration (seconds): faster flow = shorter cycle
    // 50% flow -> ~2.2s, 0% flow -> ~4.2s, -80% flow -> ~9.0s
    const dur = Math.max(1.8, Math.min(10.0, Number((4.2 / (v / baseVelocity)).toFixed(1))));

    let regime = "Equilibrium Fluvial Flushing";
    if (goraiFlowDelta >= 25) regime = "Accelerated Freshwater Flushing (Monsoon/Active Gorai)";
    else if (goraiFlowDelta <= -40 && tidalSurge >= 0.8) regime = "Severe Tidal Intrusion Head (Suppressed Outflow)";
    else if (goraiFlowDelta <= -40) regime = "Sluggish Baseflow (Drought Stress)";
    else if (tidalSurge >= 1.0) regime = "High Tidal Surge Resistance";

    return { flowDuration: dur, estimatedVelocityMs: v, flushingRegime: regime };
  }, [goraiFlowDelta, tidalSurge]);

  if (!visible) return null;

  const baseStrokeColor = isAcademic ? "#0369a1" : "#0284c7";
  const flowOverlayColor = isAcademic ? "#38bdf8" : "#7dd3fc";

  return (
    <React.Fragment>
      {/* 1. Global CSS for directional downstream flow animation */}
      <style>{`
        @keyframes downstreamFlushingFlow {
          from {
            stroke-dashoffset: 48;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .river-flow-animated-path {
          stroke-dasharray: 10, 16;
          animation: downstreamFlushingFlow ${flowDuration}s linear infinite;
        }
        .river-centerline-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>

      {rivers.map((river) => {
        // Dynamic weight scaled with channel cross-sectional width
        const baseWeight = Math.max(2.8, Math.min(5.6, river.widthM / 180));
        const flowWeight = Math.max(1.6, Math.min(3.4, river.widthM / 260));

        // Derive mid-reach coordinate for directional flow indicator
        const midIdx = Math.floor(river.coordinates.length / 2);
        const midCoord = river.coordinates[midIdx] || river.labelCoord;

        return (
          <React.Fragment key={river.id}>
            {/* 1a. Base River Channel Bed (Deep Solid Color) */}
            <Polyline
              positions={river.coordinates}
              pane="riversPane"
              pathOptions={{
                color: baseStrokeColor,
                weight: baseWeight,
                opacity: isAcademic ? 0.88 : 0.8,
                lineCap: "round",
                lineJoin: "round",
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5 text-xs font-sans">
                  <div className="flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5 text-sky-500" />
                    <span className="font-serif font-bold text-sky-700 dark:text-sky-300">
                      {river.name} {river.bengaliName ? `(${river.bengaliName})` : ""}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Channel: {river.widthM}m &bull; Flow: ~{estimatedVelocityMs} m/s (North &rarr; South)
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    {river.salinityRegime}
                  </span>
                </div>
              </Tooltip>

              <Popup className="custom-gis-popup">
                <div className="flex flex-col space-y-2.5 p-1 min-w-[260px] text-foreground font-sans">
                  <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5 text-sky-500" />
                      <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-sky-600 dark:text-sky-400">
                        River Thalweg
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-300">
                      {river.widthM}m Width
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                      {river.name}
                    </h4>
                    <span className="text-[11px] text-muted-foreground">
                      {river.bengaliName} &bull; Khulna Estuarine Network
                    </span>
                  </div>

                  {/* Flow Dynamics Box */}
                  <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-muted-foreground font-bold uppercase">Directional Flushing:</span>
                      <span className="font-bold text-sky-600 dark:text-sky-300 flex items-center gap-1">
                        North &rarr; South <ArrowDown className="w-3 h-3 text-sky-500 animate-bounce" />
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-muted-foreground">Current Est. Velocity:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {estimatedVelocityMs} m/s
                      </span>
                    </div>
                    <div className="text-[9px] text-muted-foreground font-mono leading-tight pt-0.5 border-t border-sky-200/60 dark:border-sky-800/40">
                      Regime: <span className="text-slate-800 dark:text-slate-200">{flushingRegime}</span>
                    </div>
                  </div>

                  {/* Salinity Regime Box */}
                  <div className="text-[11px] p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                    <div className="text-muted-foreground text-[10px] uppercase font-mono font-bold">
                      Salinity Characteristics
                    </div>
                    <div className="text-amber-600 dark:text-amber-400 font-medium">
                      {river.salinityRegime}
                    </div>
                  </div>

                  <div className="text-[9px] font-mono text-muted-foreground pt-1 border-t border-slate-200 dark:border-white/10 flex justify-between">
                    <span>SWOT SWORD Reach &bull; BWDB</span>
                    <span>WGS 84 (EPSG:4326)</span>
                  </div>
                </div>
              </Popup>
            </Polyline>

            {/* 1b. Directional Fluvial Flushing Overlay (Pulsing Dash Streaming Southward) */}
            <Polyline
              positions={river.coordinates}
              pane="riversPane"
              pathOptions={{
                color: flowOverlayColor,
                weight: flowWeight,
                opacity: 0.95,
                className: "river-flow-animated-path",
                lineCap: "round",
                lineJoin: "round",
              }}
              interactive={false}
            />

            {/* 1c. Directional Flow Arrow Marker Along Channel Thalweg */}
            <Marker
              position={midCoord}
              pane="labelsPane"
              icon={L.divIcon({
                className: "river-flow-direction-icon",
                html: `
                  <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 18px;
                    height: 18px;
                    border-radius: 9999px;
                    background: ${isAcademic ? "rgba(2, 132, 199, 0.9)" : "rgba(56, 189, 248, 0.85)"};
                    box-shadow: 0 0 6px rgba(2, 132, 199, 0.5);
                    color: #ffffff;
                    pointer-events: none;
                  ">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <polyline points="19 12 12 19 5 12"></polyline>
                    </svg>
                  </div>
                `,
                iconSize: [18, 18],
                iconAnchor: [9, 9],
              })}
              interactive={false}
            />

            {/* 1d. River Italicized Directional Label */}
            <Marker
              position={river.labelCoord}
              pane="labelsPane"
              icon={L.divIcon({
                className: "river-centerline-label",
                html: `
                  <div style="
                    font-family: Georgia, 'Times New Roman', serif;
                    font-style: italic;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    color: ${isAcademic ? "#0369a1" : "#bae6fd"};
                    text-shadow: ${
                      isAcademic
                        ? "0 0 3px #ffffff, 0 0 6px #ffffff"
                        : "0 0 4px #000000, 0 0 8px #000000"
                    };
                    white-space: nowrap;
                    transform: translate(-50%, -50%) rotate(-20deg);
                    pointer-events: none;
                  ">
                    ${river.name}
                  </div>
                `,
                iconSize: [90, 18],
                iconAnchor: [45, 9],
              })}
              interactive={false}
            />
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
}

export default RiverLayer;
