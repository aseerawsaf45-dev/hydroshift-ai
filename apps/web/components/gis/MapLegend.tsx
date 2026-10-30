"use client";

import { useState } from "react";
import { SALINITY_CLASSES } from "../gis-khulna-data";

interface MapLegendProps {
  activeVariable: string;
  onSelectVariable?: (v: string) => void;
  isAcademic?: boolean;
}

export function MapLegend({
  activeVariable,
  isAcademic = true,
}: MapLegendProps) {
  const getVariableTitle = () => {
    switch (activeVariable) {
      case "risk":
        return "Soil Salinity Risk (SRDI / CEGIS)";
      case "period1":
        return "Period 1: Post-Monsoon Flushing (Nov)";
      case "period2":
        return "Period 2: Mid-Dry Season / Boro (Feb)";
      case "period3":
        return "Period 3: Peak Dry Season (Apr)";
      case "river":
        return "River Surface Water Salinity (Kriging)";
      case "shallow_gw":
        return "Shallow Aquifer Salinity (15-35m)";
      case "deep_gw":
        return "Deep Pleistocene Aquifer (220-280m)";
      default:
        return "Soil Salinity (EC in dS/m)";
    }
  };

  const isRasterMode = ["river", "shallow_gw", "deep_gw", "risk"].includes(activeVariable);

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute top-16 right-4 z-[490] pointer-events-none animate-in fade-in duration-300 max-w-[270px]">
      <div
        className={`p-3 rounded-xl shadow-xl pointer-events-auto border transition-all ${
          isAcademic
            ? "bg-white text-slate-900 border-slate-800 shadow-slate-300"
            : "bg-[#08131f]/95 text-white border-white/20 backdrop-blur-xl"
        }`}
      >
        {/* Header & Quick Period Tabs */}
        <div className={`flex flex-col space-y-1.5 border-b pb-1.5 mb-1.5 ${isAcademic ? "border-slate-300" : "border-white/10"}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`font-serif font-bold text-xs tracking-wide ${isAcademic ? "text-slate-900" : "text-white"}`}>
              {getVariableTitle()}
            </span>
            <div className="flex items-center gap-1">
              <span className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded ${isAcademic ? "bg-slate-100 text-slate-800 border border-slate-300" : "bg-sky-500/15 text-sky-300"}`}>
                dS/m (EC)
              </span>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={`text-[10px] px-1 ${isAcademic ? "text-slate-600 hover:text-slate-900" : "text-muted-foreground hover:text-white"}`}
                title={collapsed ? "Expand legend" : "Collapse legend"}
              >
                {collapsed ? "▼" : "▲"}
              </button>
            </div>
          </div>
        </div>

        {!collapsed && (
          <>
            {/* 5-Class Swatches matching Publication "Risk" Header */}
            <div className="flex flex-col space-y-1.5 my-1">
              <div className={`font-serif font-bold text-sm tracking-tight flex items-center justify-between ${isAcademic ? "text-slate-900" : "text-white"}`}>
                <span>Risk</span>
                <span className={`text-[10px] font-sans font-medium ${isAcademic ? "text-slate-600" : "text-muted-foreground"}`}>Threshold</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5 font-serif text-xs">
                {SALINITY_CLASSES.map((c) => (
                  <div key={c.id} className="flex items-center gap-2.5">
                    <span
                      className="w-5 h-3.5 rounded-none shrink-0 border border-slate-900 shadow-sm"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="font-serif text-[12px] font-medium tracking-tight flex items-center justify-between w-full pr-1">
                      <strong className={`font-serif ${isAcademic ? "text-slate-900 font-bold" : "text-slate-100"}`}>{c.name}</strong>
                      <span className={`font-mono text-[10px] font-medium ${isAcademic ? "text-slate-700" : "text-muted-foreground"}`}>{c.range}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Mode Explanatory Footer */}
            <div className={`mt-2 pt-1.5 border-t flex flex-col space-y-0.5 text-[8.5px] font-mono ${isAcademic ? "border-slate-300 text-slate-600" : "border-white/10 text-muted-foreground"}`}>
              <div className="flex items-center justify-between">
                <span>{isRasterMode ? "Boundary-Clipped RBF Surface" : "Survey Cadastre"}</span>
                <span>WGS 84</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MapLegend;
