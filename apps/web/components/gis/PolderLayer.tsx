"use client";

import React from "react";
import { Polygon, Tooltip } from "react-leaflet";
import L from "leaflet";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { PolderPolygon } from "../map-data";

interface PolderLayerProps {
  polders: PolderPolygon[];
  selectedPolderId?: string | null;
  onSelectPolder?: (polder: PolderPolygon | null) => void;
  isAcademic?: boolean;
  visible?: boolean;
}

export function PolderLayer({
  polders,
  selectedPolderId = null,
  onSelectPolder,
  isAcademic = true,
  visible = true,
}: PolderLayerProps) {
  if (!visible || !polders || polders.length === 0) return null;

  return (
    <React.Fragment>
      {polders.map((polder) => {
        const isSelected = selectedPolderId === polder.id;
        const strokeColor = isSelected
          ? "#38bdf8"
          : polder.status === "Critical"
          ? "#ef4444"
          : polder.status === "At Risk"
          ? "#f59e0b"
          : "#10b981";

        const fillColor = strokeColor;
        const fillOpacity = isSelected ? 0.25 : isAcademic ? 0.08 : 0.12;
        const weight = isSelected ? 3.0 : 2.0;

        return (
          <Polygon
            key={`polder-${polder.id}`}
            positions={polder.coordinates}
            pane={isSelected ? "highlightPane" : "adminPane"}
            pathOptions={{
              color: strokeColor,
              weight,
              dashArray: "6, 6",
              fillColor,
              fillOpacity,
              lineCap: "round",
              lineJoin: "round",
            }}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                if (onSelectPolder) {
                  onSelectPolder(isSelected ? null : polder);
                }
              },
            }}
          >
            <Tooltip sticky direction="center">
              <div className="flex flex-col space-y-1 p-1 min-w-[210px] font-sans text-xs">
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    {polder.status === "Critical" ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span>{polder.name}</span>
                  </div>
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-white shadow-sm"
                    style={{ backgroundColor: strokeColor }}
                  >
                    {polder.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-muted-foreground pt-0.5">
                  <div>Embankment: <strong className="text-foreground">{polder.embankmentKm} km</strong></div>
                  <div>Elevation: <strong className="text-foreground">{polder.elevationM}m PWD</strong></div>
                  <div>Area: <strong className="text-foreground">{polder.areaKm2} km²</strong></div>
                  <div>Upazila: <strong className="text-foreground">{polder.upazila}</strong></div>
                </div>

                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium pt-1 border-t border-black/10 dark:border-white/10">
                  {polder.salinityRisk}
                </div>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
    </React.Fragment>
  );
}

export default PolderLayer;
