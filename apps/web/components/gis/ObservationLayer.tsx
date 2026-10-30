"use client";

import React from "react";
import { Tooltip, Popup, Marker } from "react-leaflet";
import L from "leaflet";
import { Radio, Satellite, Droplets, AlertTriangle } from "lucide-react";
import { GisStation, getSalinityClassForEc } from "../gis-khulna-data";

interface ObservationLayerProps {
  stations: GisStation[];
  selectedStationId: string | null;
  onSelectStation: (station: GisStation | null) => void;
  isAcademic?: boolean;
  visible?: boolean;
}

export function ObservationLayer({
  stations,
  selectedStationId,
  onSelectStation,
  isAcademic = true,
  visible = true,
}: ObservationLayerProps) {
  if (!visible) return null;

  return (
    <React.Fragment>
      {/* 1. Global CSS for Station Radar Pulses */}
      <style>{`
        @keyframes stationRadarPulse {
          0% {
            transform: scale(0.9);
            opacity: 0.9;
          }
          70% {
            transform: scale(2.2);
            opacity: 0;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
        .station-radar-pulse {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          animation: stationRadarPulse 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite;
          pointer-events: none;
        }
      `}</style>

      {stations.map((st) => {
        const isSelected = selectedStationId === st.id;
        const classInfo = getSalinityClassForEc(st.ecMean);
        const isSwot = st.id.includes("SWOT") || st.id.startsWith("3124");
        const isIntake = st.id.includes("p14") || st.id.includes("intake");
        const isCritical = st.ecMean >= 4.0;

        // Custom Station Pin DivIcon
        const customIcon = L.divIcon({
          className: "custom-station-pin",
          html: `
            <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <!-- Outer Telemetry Pulse Ring -->
              <div class="station-radar-pulse" style="background-color: ${classInfo.color}; opacity: 0.45;"></div>

              <!-- Inner Solid Node Ring -->
              <div style="
                width: ${isSelected ? "22px" : "18px"};
                height: ${isSelected ? "22px" : "18px"};
                border-radius: 9999px;
                background-color: ${classInfo.color};
                border: 2.5px solid ${isSelected ? "#38bdf8" : isCritical ? "#f87171" : isAcademic ? "#ffffff" : "#0f172a"};
                box-shadow: 0 2px 8px rgba(0,0,0,0.35);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                transition: transform 0.2s ease;
                transform: ${isSelected ? "scale(1.15)" : "scale(1)"};
              ">
                <div style="width: 5px; height: 5px; border-radius: 9999px; background-color: #ffffff;"></div>
              </div>

              <!-- Mini Top Badge for Intake or SWOT -->
              ${
                isIntake
                  ? `<div style="position: absolute; top: -6px; right: -6px; width: 14px; height: 14px; border-radius: 9999px; background: #ec4899; border: 1.5px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; font-size: 8px; font-weight: bold; box-shadow: 0 1px 4px rgba(0,0,0,0.3);">W</div>`
                  : isSwot
                  ? `<div style="position: absolute; top: -6px; right: -6px; width: 14px; height: 14px; border-radius: 9999px; background: #06b6d4; border: 1.5px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; font-size: 8px; font-weight: bold; box-shadow: 0 1px 4px rgba(0,0,0,0.3);">S</div>`
                  : ""
              }
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        return (
          <Marker
            key={st.id}
            position={[st.latitude, st.longitude]}
            pane={isSelected ? "highlightPane" : "stationsPane"}
            icon={customIcon}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                onSelectStation(isSelected ? null : st);
              },
            }}
          >
            {/* Interactive Tooltip on Hover */}
            <Tooltip sticky direction="top" offset={[0, -10]}>
              <div className="flex flex-col space-y-1 font-sans text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  {isIntake ? (
                    <Droplets className="w-3.5 h-3.5 text-pink-500" />
                  ) : isSwot ? (
                    <Satellite className="w-3.5 h-3.5 text-cyan-500" />
                  ) : (
                    <Radio className="w-3.5 h-3.5 text-sky-500" />
                  )}
                  <span>{st.name}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-[11px] font-mono">
                  <span className="text-muted-foreground">{st.river}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: classInfo.color }}
                  >
                    {st.ecMean.toFixed(1)} dS/m
                  </span>
                </div>
                {isIntake && (
                  <div className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold font-mono">
                    Khulna WASA Drinking Water Intake Point
                  </div>
                )}
              </div>
            </Tooltip>

            {/* Scientific Telemetry Popup on Click */}
            <Popup className="custom-gis-popup">
              <div className="flex flex-col space-y-2.5 p-1 min-w-[280px] text-foreground font-sans">
                {/* Station Type Header */}
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isSwot ? (
                      <Satellite className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    ) : isIntake ? (
                      <Droplets className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    ) : (
                      <Radio className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    )}
                    <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-muted-foreground">
                      {st.stationType}
                    </span>
                  </div>
                  <span
                    className="text-[9px] font-mono font-bold px-2 py-0.5 rounded text-white shadow-sm"
                    style={{ backgroundColor: classInfo.color }}
                  >
                    {classInfo.id} ({st.ecMean.toFixed(1)} dS/m)
                  </span>
                </div>

                {/* Station Name & Geographic Placement */}
                <div>
                  <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {st.name}
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Snapped on: <strong className="text-sky-600 dark:text-sky-400">{st.river}</strong> &bull; {st.distanceKm} km to Sea
                  </span>
                </div>

                {/* KPI Metrics Box */}
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-mono text-[11px]">Mean Salinity (EC):</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {st.ecMean.toFixed(2)} dS/m
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>Observed Range:</span>
                    <span className="font-bold text-slate-700 dark:text-zinc-300">
                      {st.ecMin.toFixed(1)} &ndash; {st.ecMax.toFixed(1)} dS/m
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>Water Level (WSE PWD):</span>
                    <span className="font-bold text-slate-700 dark:text-zinc-300">
                      {st.wsePwd.toFixed(2)} m (Danger: {st.dangerLevel} m)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>Telemetry Samples:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {st.obsCount} verified records
                    </span>
                  </div>
                </div>

                {/* Special WASA Intake or SWOT Advisory */}
                {isIntake && (
                  <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800/40 text-[10px] space-y-0.5 font-mono">
                    <div className="flex items-center gap-1 font-bold text-pink-700 dark:text-pink-300">
                      <AlertTriangle className="w-3 h-3 text-pink-600" />
                      <span>Khulna WASA Intake Limit: 1.0 dS/m</span>
                    </div>
                    <p className="text-muted-foreground leading-tight">
                      When river EC exceeds 1.0 dS/m, water intake requires dilution from Madhumati/Bhairab freshwater conveyance.
                    </p>
                  </div>
                )}

                {isSwot && (
                  <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/40 text-[10px] space-y-0.5 font-mono">
                    <div className="flex items-center gap-1 font-bold text-cyan-700 dark:text-cyan-300">
                      <Satellite className="w-3 h-3 text-cyan-600" />
                      <span>NASA SWOT KaRIn Interferometer Reach</span>
                    </div>
                    <p className="text-muted-foreground leading-tight">
                      Calibrated with Hydrocron reach 31241400581 at 120 km radar swath with &plusmn;10cm water surface height accuracy.
                    </p>
                  </div>
                )}

                {/* Footer Metadata */}
                <div className="text-[9px] font-mono text-muted-foreground pt-1.5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <span>{st.agency}</span>
                  <span>{st.firstObs.slice(0, 10)} to {st.lastObs.slice(0, 10)}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </React.Fragment>
  );
}

export default ObservationLayer;
