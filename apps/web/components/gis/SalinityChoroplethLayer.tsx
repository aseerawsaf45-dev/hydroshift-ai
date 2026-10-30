"use client";

import React from "react";
import { Polygon, Tooltip, Marker } from "react-leaflet";
import L from "leaflet";
import {
  GisUpazila,
  getUpazilaSalinity,
  getSalinityClassForEc,
} from "../gis-khulna-data";

interface SalinityChoroplethLayerProps {
  upazilas: GisUpazila[];
  activeVariable: string;
  selectedUpazilaId: string | null;
  onSelectUpazila: (upazila: GisUpazila | null) => void;
  isAcademic?: boolean;
  visible?: boolean;
  showLabels?: boolean;
}

export function SalinityChoroplethLayer({
  upazilas,
  activeVariable,
  selectedUpazilaId,
  onSelectUpazila,
  isAcademic = true,
  visible = true,
  showLabels = true,
}: SalinityChoroplethLayerProps) {
  if (!visible) return null;

  const isRasterMode = ["river", "shallow_gw", "deep_gw", "risk"].includes(activeVariable);

  return (
    <React.Fragment>
      {upazilas.map((upazila) => {
        const isSelected = selectedUpazilaId === upazila.id;
        const isAnySelected = Boolean(selectedUpazilaId);
        const isOptedOut = isAnySelected && !isSelected;

        const ecVal = getUpazilaSalinity(upazila, activeVariable);
        const classInfo = getSalinityClassForEc(ecVal);

        // When raster mode is active, hide the solid polygon choropleth fill
        // so it does not misrepresent or obstruct the underlying continuous raster surface.
        // Instead, keep a clean administrative boundary outline that preserves interactivity.
        const fillColor = isRasterMode
          ? isSelected
            ? "#0284c7"
            : "transparent"
          : isOptedOut
          ? isAcademic
            ? "#f1f5f9"
            : "#091420"
          : classInfo.color;

        const fillOpacity = isRasterMode
          ? isSelected
            ? 0.22
            : 0.0
          : isSelected
          ? 0.75
          : isOptedOut
          ? 0.15
          : isAcademic
          ? 0.65
          : 0.55;

        const strokeColor = isSelected
          ? "#0284c7"
          : isRasterMode
          ? isAcademic
            ? "rgba(100, 116, 139, 0.4)"
            : "rgba(148, 163, 184, 0.35)"
          : isOptedOut
          ? isAcademic
            ? "#cbd5e1"
            : "#334155"
          : isAcademic
          ? "#334155"
          : "#64748b";

        const weight = isSelected ? 3.0 : isRasterMode ? 0.75 : isOptedOut ? 0.8 : 1.2;
        const dashArray = isSelected ? undefined : undefined;

        return (
          <Polygon
            key={`${upazila.id}-${activeVariable}`}
            positions={upazila.coordinates}
            pane={isSelected ? "highlightPane" : "adminPane"}
            pathOptions={{
              fillColor,
              fillOpacity,
              color: strokeColor,
              weight,
              dashArray,
              lineJoin: "round",
              lineCap: "round",
            }}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                onSelectUpazila(isSelected ? null : upazila);
              },
            }}
          >
            <Tooltip sticky direction="center">
              <div className="flex flex-col space-y-1 p-1 min-w-[210px] font-sans text-xs">
                <div className="flex items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-1">
                  <div>
                    <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                      {upazila.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-1.5 font-sans">
                      ({upazila.bengaliName})
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-white shadow-sm shrink-0"
                    style={{ backgroundColor: classInfo.color }}
                  >
                    {ecVal.toFixed(1)} dS/m
                  </span>
                </div>

                <div className="text-[11px] font-medium text-slate-700 dark:text-zinc-200">
                  {isRasterMode ? (
                    <span className="font-mono text-sky-600 dark:text-sky-400">
                      {activeVariable === "river"
                        ? "River Surface Salinity"
                        : activeVariable === "shallow_gw"
                        ? "Shallow Aquifer Salinity"
                        : "Deep Pleistocene Salinity"}
                    </span>
                  ) : (
                    classInfo.label
                  )}
                </div>

                <div className="text-[10px] text-muted-foreground font-mono">
                  Area: {upazila.areaKm2} km² &bull; Depth: {upazila.aquiferDepthM.split("|")[0]}
                </div>

                <div className="text-[9px] text-sky-600 dark:text-sky-300 font-mono pt-1 border-t border-black/10 dark:border-white/10">
                  {isSelected ? "Click to clear selection" : "Click to view Upazila dossier"}
                </div>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}

      {/* Upazila Permanent Centerline Labels */}
      {showLabels &&
        upazilas.map((upazila) => {
          const isSelected = selectedUpazilaId === upazila.id;
          const isAnySelected = Boolean(selectedUpazilaId);
          const isOptedOut = isAnySelected && !isSelected;
          if (isOptedOut) return null;

          const ecVal = getUpazilaSalinity(upazila, activeVariable);
          const classInfo = getSalinityClassForEc(ecVal);

          return (
            <Marker
              key={`label-${upazila.id}-${activeVariable}`}
              position={upazila.center}
              pane="labelsPane"
              icon={L.divIcon({
                className: "upazila-center-label",
                html: `
                  <div style="
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    font-weight: 700;
                    font-size: 11px;
                    letter-spacing: 0.02em;
                    color: ${isAcademic ? "#0f172a" : "#ffffff"};
                    text-shadow: ${
                      isAcademic
                        ? "0 0 3px #ffffff, 0 0 5px #ffffff, 0 1px 2px rgba(255,255,255,0.9)"
                        : "0 0 3px #000000, 0 0 6px #000000, 0 1px 2px rgba(0,0,0,0.9)"
                    };
                    pointer-events: none;
                    white-space: nowrap;
                    text-align: center;
                    transform: translate(-50%, -50%);
                  ">
                    <span>${upazila.name.replace(" Upazila", "")}</span>
                    ${
                      !isRasterMode
                        ? `
                        <span style="
                          display: block;
                          font-size: 9px;
                          font-family: monospace;
                          font-weight: 800;
                          color: ${classInfo.color};
                          text-shadow: 0 0 2px ${isAcademic ? "#ffffff" : "#000000"};
                        ">
                          ${ecVal.toFixed(1)} dS/m
                        </span>
                        `
                        : ""
                    }
                  </div>
                `,
                iconSize: [90, 24],
                iconAnchor: [45, 12],
              })}
              interactive={false}
            />
          );
        })}
    </React.Fragment>
  );
}

export default SalinityChoroplethLayer;
