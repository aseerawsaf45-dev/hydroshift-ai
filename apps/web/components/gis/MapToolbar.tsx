"use client";

import { useState } from "react";
import {
  Compass,
  Search,
  Layers,
  ZoomIn,
  ZoomOut,
  X,
  BookOpen,
  Zap,
  Printer,
  Download,
} from "lucide-react";
import { GisUpazila } from "../gis-khulna-data";

interface MapToolbarProps {
  upazilas: GisUpazila[];
  selectedUpazilaId: string | null;
  onSelectUpazila: (u: GisUpazila | null) => void;
  onResetExtent: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  showBoundary: boolean;
  onToggleBoundary: () => void;
  showRaster?: boolean;
  onToggleRaster?: () => void;
  showContours?: boolean;
  onToggleContours?: () => void;
  showChoropleth: boolean;
  onToggleChoropleth: () => void;
  showRivers: boolean;
  onToggleRivers: () => void;
  showStations: boolean;
  onToggleStations: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  showBangladesh?: boolean;
  onToggleBangladesh?: () => void;
  activeVariable: string;
  onSelectVariable: (v: string) => void;
  isAcademic: boolean;
  onToggleBasemap: () => void;
  onExportMap: () => void;
}

export function MapToolbar({
  upazilas,
  onSelectUpazila,
  onResetExtent,
  onZoomIn,
  onZoomOut,
  showBoundary,
  onToggleBoundary,
  showRaster = true,
  onToggleRaster,
  showContours = true,
  onToggleContours,
  showChoropleth,
  onToggleChoropleth,
  showRivers,
  onToggleRivers,
  showStations,
  onToggleStations,
  showLabels,
  onToggleLabels,
  showBangladesh = true,
  onToggleBangladesh,
  activeVariable,
  onSelectVariable,
  isAcademic,
  onToggleBasemap,
  onExportMap,
}: MapToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const filteredUpazilas = searchQuery.trim()
    ? upazilas.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.bengaliName.includes(searchQuery)
      )
    : [];

  const isRasterMode = ["river", "shallow_gw", "deep_gw", "risk"].includes(activeVariable);

  return (
    <>
      {/* 1. TOP-LEFT: NORTH ARROW / RESET EXTENT & ZOOM DOCK */}
      <div className="absolute top-8 left-3 z-[500] pointer-events-auto flex flex-col gap-1.5 animate-in fade-in duration-300">
        <button
          id="btn-north-arrow"
          onClick={onResetExtent}
          className={`p-2 rounded-xl shadow-xl border flex flex-col items-center gap-0.5 transition-all cursor-pointer group ${
            isAcademic
              ? "bg-white/95 text-slate-800 border-slate-300 hover:border-sky-500 hover:bg-slate-50 shadow-slate-400/20"
              : "bg-[#08131f]/95 text-white border-white/20 hover:border-sky-400 hover:bg-[#0c1b2b] backdrop-blur-xl shadow-black/50"
          }`}
          title="North Arrow • Click to reset camera to Khulna District extent"
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            <Compass className="w-5 h-5 text-sky-500 transition-transform duration-300 group-hover:rotate-45" />
            <span className="absolute -top-1 font-mono font-black text-[9px] text-rose-500">
              N
            </span>
          </div>
          <span className="text-[8px] font-mono uppercase tracking-wider font-bold text-muted-foreground group-hover:text-foreground">
            Reset
          </span>
        </button>

        {/* Zoom Controls */}
        <div
          className={`rounded-xl shadow-xl border flex flex-col overflow-hidden ${
            isAcademic
              ? "bg-white/95 border-slate-300 text-slate-800 divide-y divide-slate-200"
              : "bg-[#08131f]/95 border-white/20 text-white divide-y divide-white/10 backdrop-blur-xl"
          }`}
        >
          <button
            onClick={onZoomIn}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
          <button
            onClick={onZoomOut}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      </div>

      {/* 2. TOP-CENTER: UPAZILA SEARCH BAR WITH AUTOCOMPLETE */}
      <div className="absolute top-8 left-16 sm:left-24 z-[500] pointer-events-auto max-w-[240px] sm:max-w-[300px]">
        <div className="relative">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shadow-lg border text-xs ${
              isAcademic
                ? "bg-white/95 border-slate-300 text-slate-800"
                : "bg-[#08131f]/95 border-white/20 text-white backdrop-blur-xl"
            }`}
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search Khulna Upazila..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {filteredUpazilas.length > 0 && (
            <div
              className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-2xl border overflow-hidden max-h-48 overflow-y-auto text-xs z-50 ${
                isAcademic
                  ? "bg-white border-slate-300 text-slate-900 divide-y divide-slate-100"
                  : "bg-[#08131f] border-white/20 text-white divide-y divide-white/10"
              }`}
            >
              {filteredUpazilas.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSelectUpazila(u);
                    setSearchQuery("");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="font-serif font-bold">{u.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {u.period3Ec} dS/m
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. TOP-RIGHT: GIS CONTROLS (LAYERS, THEME, EXPORT, PUBLICATION MAP) */}
      <div className="absolute top-8 right-3 z-[500] pointer-events-auto flex items-center gap-1.5">
        {/* Layer Visibility Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className={`px-2.5 py-1.5 rounded-xl shadow-lg border text-xs font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showLayerMenu
                ? "bg-sky-600 text-white border-sky-600"
                : isAcademic
                ? "bg-white/95 border-slate-300 text-slate-800 hover:bg-slate-50"
                : "bg-[#08131f]/95 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl"
            }`}
            title="Toggle GIS map layers"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layers</span>
          </button>

          {/* Layer Menu Dropdown */}
          {showLayerMenu && (
            <div
              className={`absolute top-full right-0 mt-1.5 p-3 rounded-xl shadow-2xl border w-60 text-xs space-y-2 z-50 ${
                isAcademic
                  ? "bg-white text-slate-900 border-slate-300"
                  : "bg-[#08131f] text-white border-white/20 backdrop-blur-xl"
              }`}
            >
              <div className="font-mono text-[10px] uppercase font-bold text-muted-foreground border-b pb-1 border-slate-200 dark:border-white/10">
                Active Map Layers
              </div>

              <label className="flex items-center gap-2 cursor-pointer hover:text-sky-500">
                <input
                  type="checkbox"
                  checked={showBoundary}
                  onChange={onToggleBoundary}
                  className="rounded text-sky-600 focus:ring-0 cursor-pointer"
                />
                <span>Khulna District Boundary</span>
              </label>

              {onToggleBangladesh && (
                <label className="flex items-center gap-2 cursor-pointer hover:text-sky-500">
                  <input
                    type="checkbox"
                    checked={showBangladesh}
                    onChange={onToggleBangladesh}
                    className="rounded text-sky-600 focus:ring-0 cursor-pointer"
                  />
                  <span>National Bangladesh Map Context</span>
                </label>
              )}

              {isRasterMode && onToggleRaster && (
                <label className="flex items-center gap-2 cursor-pointer hover:text-sky-500">
                  <input
                    type="checkbox"
                    checked={showRaster}
                    onChange={onToggleRaster}
                    className="rounded text-sky-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Salinity Raster Overlay (PNG)</span>
                </label>
              )}

              {isRasterMode && onToggleContours && (
                <label className="flex items-center gap-2 cursor-pointer hover:text-sky-500">
                  <input
                    type="checkbox"
                    checked={showContours}
                    onChange={onToggleContours}
                    className="rounded text-sky-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Contour Isolines (GeoJSON)</span>
                </label>
              )}

              <label className="flex items-center gap-2 cursor-pointer hover:text-sky-500">
                <input
                  type="checkbox"
                  checked={showChoropleth}
                  onChange={onToggleChoropleth}
                  className="rounded text-sky-600 focus:ring-0 cursor-pointer"
                />
                <span>{isRasterMode ? "Upazila Administrative Outlines" : "Upazila Salinity Choropleth"}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-sky-500">
                <input
                  type="checkbox"
                  checked={showRivers}
                  onChange={onToggleRivers}
                  className="rounded text-sky-600 focus:ring-0 cursor-pointer"
                />
                <span>Curvilinear River Network</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-sky-500">
                <input
                  type="checkbox"
                  checked={showStations}
                  onChange={onToggleStations}
                  className="rounded text-sky-600 focus:ring-0 cursor-pointer"
                />
                <span>In-Situ Gauge Stations</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-sky-500">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={onToggleLabels}
                  className="rounded text-sky-600 focus:ring-0 cursor-pointer"
                />
                <span>Administrative Labels</span>
              </label>

              {/* Quick domain switch inside layers dropdown */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-1">
                <div className="font-mono text-[9px] uppercase font-bold text-muted-foreground">
                  Hydrologic Domain
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                  {(["risk", "river", "shallow_gw", "deep_gw"] as const).map((dom) => (
                    <button
                      key={dom}
                      onClick={() => onSelectVariable(dom)}
                      className={`px-1.5 py-1 rounded text-center cursor-pointer transition-all ${
                        activeVariable === dom
                          ? "bg-amber-600 text-white font-bold"
                          : isAcademic
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      {dom === "risk" ? "Risk (Soil)" : dom === "river" ? "River" : dom === "shallow_gw" ? "Shallow" : "Deep"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher: Academic vs Dark Radar */}
        <button
          onClick={onToggleBasemap}
          className={`px-2.5 py-1.5 rounded-xl shadow-lg border text-xs font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isAcademic
              ? "bg-white/95 border-slate-300 text-slate-800 hover:bg-slate-50"
              : "bg-[#08131f]/95 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl"
          }`}
          title={isAcademic ? "Switch to Dark Radar GIS" : "Switch to Publication Academic GIS"}
        >
          {isAcademic ? <BookOpen className="w-3.5 h-3.5 text-sky-600" /> : <Zap className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="hidden md:inline">{isAcademic ? "Academic" : "Dark"}</span>
        </button>

        {/* Download Publication Quality Map Button */}
        <a
          href="/gis/khulna_publication_map.png"
          download="khulna_salinity_risk_publication_map.png"
          className={`p-1.5 rounded-xl shadow-lg border text-xs flex items-center gap-1 transition-all cursor-pointer ${
            isAcademic
              ? "bg-white/95 border-slate-300 text-slate-800 hover:bg-slate-50 hover:text-amber-600"
              : "bg-[#08131f]/95 border-white/20 text-white hover:bg-white/10 hover:text-amber-400 backdrop-blur-xl"
          }`}
          title="Download High-Res 600 DPI Publication Map (PNG)"
        >
          <Download className="w-4 h-4" />
        </a>

        {/* Export / Print Map Action */}
        <button
          onClick={onExportMap}
          className={`p-1.5 rounded-xl shadow-lg border text-xs flex items-center gap-1 transition-all cursor-pointer ${
            isAcademic
              ? "bg-white/95 border-slate-300 text-slate-800 hover:bg-slate-50"
              : "bg-[#08131f]/95 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl"
          }`}
          title="Export / Print Current Map View"
        >
          <Printer className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
    </>
  );
}

export default MapToolbar;
