"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  Circle,
  CircleMarker,
  Tooltip,
  ScaleControl,
  ImageOverlay,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Satellite,
  Radio,
  Droplets,
  Waves,
  ShieldAlert,
  Compass,
  Layers,
  MapPin,
  ExternalLink,
  ChevronRight,
  Activity,
  AlertTriangle,
  Info,
  Crosshair,
  TrendingUp,
  X,
  BookOpen,
  Maximize2,
  Eye,
  EyeOff,
  Sliders,
  Zap,
} from "lucide-react";

export * from "./map-data";
import {
  Site,
  Forecast,
  MapWrapperProps,
  PolderPolygon,
  KhulnaRegion,
  HydrologicDomain,
  SalinityTier,
  DomainConfig,
  DOMAIN_CONFIGS,
  DOMAIN_ISOHALINES,
  KHULNA_RIVER_SYSTEM,
  BAY_OF_BENGAL_LOCATION,
  getRegionDomainValue,
  getDomainTier,
  getRegionDomainColor,
  convertPptToEc,
  convertEcToPpt,
  KHULNA_UPAZILA_REGIONS,
  COASTAL_DELTA_UPAZILAS,
  ALL_STUDY_REGIONS,
  PUBLICATION_STUDY_BOUNDS,
  PUBLICATION_STUDY_CENTER,
  KHULNA_DISTRICT_BOUNDS,
  KHULNA_DISTRICT_CENTER,
  KHULNA_REGIONAL_LANDMASS,
  RISK_TIERS_CONFIG,
  RiskTier,
  CANONICAL_KHULNA_STATIONS,
  CANONICAL_KHULNA_FORECASTS,
  PASSUR_MARINE_INGRESS_CORRIDOR,
  PASSUR_TRANSITION_CORRIDOR,
  RUPSHA_FRESHWATER_DILUTION,
  SHIBSA_WESTERN_CORRIDOR,
  SWOT_LEFT_SWATH,
  SWOT_RIGHT_SWATH,
  SWOT_NADIR_GROUND_TRACK,
  BASEMAP_TILES,
  COASTAL_POLDERS,
  PASSUR_RUPSHA_THALWEG,
  THALWEG_MILESTONES,
  POLDER_SLUICE_GATES,
} from "./map-data";

// -------------------------------------------------------------
// 1. MAP CONTROLLER & REAL-TIME CURSOR TELEMETRY
// -------------------------------------------------------------
function MapController({
  coords,
  zoom,
  regionBounds,
  onCursorMove,
}: {
  coords: [number, number] | null;
  zoom: number;
  regionBounds?: [[number, number], [number, number]] | null;
  onCursorMove?: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useMapEvents({
    mousemove(e) {
      if (onCursorMove) {
        onCursorMove(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  // Smoothly fit bounds when a region is selected or reset
  useEffect(() => {
    if (map) {
      try {
        if (regionBounds) {
          map.fitBounds(regionBounds, { padding: [45, 45], maxZoom: 13, duration: 1.2 });
        }
      } catch {
        // Prevent animation crashes
      }
    }
  }, [regionBounds, map]);

  useEffect(() => {
    if (coords && coords[0] && coords[1] && map && !regionBounds) {
      try {
        map.flyTo(coords, zoom, { duration: 1.2, easeLinearity: 0.25 });
      } catch {
        // Prevent unmounted map crash during animation/HMR
      }
    }
  }, [coords, zoom, map, regionBounds]);

  return null;
}

// -------------------------------------------------------------
// 2. PROFESSIONAL GIS VECTOR STATION SYMBOLOGY
// -------------------------------------------------------------
const createGisStationIcon = (
  category: "swot" | "gauge" | "intake",
  risk: string,
  isSelected: boolean,
  displayValue: string,
  stationCode: string
) => {
  const isCrit = risk === "CRITICAL";
  const isWarn = risk === "WARNING";

  const fillColor = isCrit
    ? "#d92526" // Crimson Red
    : isWarn
    ? "#f5a623" // Amber
    : category === "swot"
    ? "#0284c7" // Sky Blue
    : category === "intake"
    ? "#7c3aed" // Violet
    : "#059669"; // Emerald

  const markerShape =
    category === "swot"
      ? "border-radius: 2px; transform: rotate(45deg);"
      : "border-radius: 50%;";

  const diameter = isSelected ? 16 : 11;
  const outerBox = diameter + 8;

  return L.divIcon({
    className: "custom-gis-station-marker",
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: ${outerBox}px; height: ${outerBox}px;">
        ${isSelected ? `<div style="position:absolute;inset:0px;border-radius:50%;border:2px solid #0284c7;animation:gisPing 1.8s infinite;pointer-events:none;"></div>` : ""}
        <div style="
          width: ${diameter}px; 
          height: ${diameter}px; 
          background-color: ${fillColor}; 
          border: 2px solid #ffffff; 
          ${markerShape}
          display: flex; 
          align-items: center; 
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          cursor: pointer;
        ">
        </div>
      </div>
    `,
    iconSize: [outerBox, outerBox],
    iconAnchor: [outerBox / 2, outerBox / 2],
  });
};

// -------------------------------------------------------------
// 3. MAIN MAPWRAPPER COMPONENT
// -------------------------------------------------------------
export default function MapWrapper({
  selectedSiteId,
  onSelectSite,
  selectedRegionId = null,
  onSelectRegion,
  hydrologicDomain = "river",
  onSelectDomain,
  showRiskChoropleth = true,
  showSwot = true,
  showGauges = true,
  showSalinityFront = true,
  showIsohalines = true,
  showPolders = true,
  showThalweg = true,
  showLabels = true,
  showRivers = true,
  showGraticule = true,
  basemap = "radar",
  horizon = "now",
  searchQuery = "",
  riskFilter = "all",
  flyToCoords = null,
  onSelectCorridor,
  onSelectPolder,
  salinityUnit = "ppt",
  onToggleUnit,
  compactLegend = false,
  standaloneTitle,
  rasterOpacity = 0.85,
  onOpacityChange,
  showRasterOverlay = true,
  onToggleRasterOverlay,
  studyArea = "khulna_basin",
  onSelectStudyArea,
}: MapWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [sites, setSites] = useState<Site[]>(CANONICAL_KHULNA_STATIONS);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [cursorCoords, setCursorCoords] = useState<[number, number]>(KHULNA_DISTRICT_CENTER);
  const [internalBasemap, setInternalBasemap] = useState<"radar" | "academic" | "topo">(basemap as any);
  const [internalOpacity, setInternalOpacity] = useState(rasterOpacity);
  const [internalShowRaster, setInternalShowRaster] = useState(showRasterOverlay);

  useEffect(() => {
    setInternalOpacity(rasterOpacity);
  }, [rasterOpacity]);

  useEffect(() => {
    setInternalShowRaster(showRasterOverlay);
  }, [showRasterOverlay]);

  const activeRegion = useMemo(() => {
    if (!selectedRegionId) return null;
    return KHULNA_UPAZILA_REGIONS.find((r) => r.id === selectedRegionId) || null;
  }, [selectedRegionId]);

  const displayRegions = useMemo(() => {
    return KHULNA_UPAZILA_REGIONS;
  }, []);

  // Continuous inverse-distance weighted salinity sampling at cursor
  const sampledSalinity = useMemo(() => {
    let num = 0;
    let den = 0;
    for (const reg of displayRegions) {
      const dLat = cursorCoords[0] - reg.center[0];
      const dLon = cursorCoords[1] - reg.center[1];
      const distSq = dLat * dLat + dLon * dLon;
      if (distSq < 0.0004) {
        const directVal = getRegionDomainValue(reg, hydrologicDomain);
        return salinityUnit === "ppt" ? directVal.toFixed(2) : convertPptToEc(directVal).toFixed(2);
      }
      const weight = 1.0 / (distSq * distSq);
      num += weight * getRegionDomainValue(reg, hydrologicDomain);
      den += weight;
    }
    if (den <= 0) return "0.00";
    const interp = num / den;
    return salinityUnit === "ppt" ? interp.toFixed(2) : convertPptToEc(interp).toFixed(2);
  }, [cursorCoords, displayRegions, hydrologicDomain, salinityUnit]);

  const hoveredRegion = useMemo(() => {
    return displayRegions.find(r =>
      cursorCoords[0] >= r.bounds[0][0] - 0.02 &&
      cursorCoords[0] <= r.bounds[1][0] + 0.02 &&
      cursorCoords[1] >= r.bounds[0][1] - 0.02 &&
      cursorCoords[1] <= r.bounds[1][1] + 0.02
    ) || null;
  }, [cursorCoords, displayRegions]);

  // Sync external basemap prop
  useEffect(() => {
    if (basemap) setInternalBasemap(basemap);
  }, [basemap]);

  useEffect(() => {
    setMounted(true);
    setMapKey((k) => k + 1);
    // 100% Hardcoded Canonical GIS Data - ZERO external API dependencies
    setSites(CANONICAL_KHULNA_STATIONS);
    setForecasts(CANONICAL_KHULNA_FORECASTS);
  }, []);

  const handleCursorMove = useCallback((lat: number, lng: number) => {
    setCursorCoords([lat, lng]);
  }, []);

  // Map forecast values onto sites for risk computation
  const forecastMap = useMemo(() => {
    const map: Record<string, Forecast> = {};
    for (const f of forecasts) {
      if (!map[f.site_id] || f.target_variable.includes("Salinity")) {
        map[f.site_id] = f;
      }
    }
    return map;
  }, [forecasts]);

  // Active domain configuration
  const currentDomainConfig = useMemo(() => {
    return DOMAIN_CONFIGS[hydrologicDomain] || DOMAIN_CONFIGS.river;
  }, [hydrologicDomain]);

  // Filter sites strictly to Khulna Geographic Envelope
  const khulnaSites = useMemo(() => {
    return sites.filter((site) => {
      const inEnvelope =
        site.latitude >= 22.20 &&
        site.latitude <= 23.95 &&
        site.longitude >= 89.00 &&
        site.longitude <= 89.95;
      if (!inEnvelope) return false;

      const isSwot =
        site.category === "swot" ||
        site.id.startsWith("3124") ||
        site.id.toLowerCase().includes("swot");
      if (isSwot && !showSwot) return false;
      if (!isSwot && !showGauges) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = site.name.toLowerCase().includes(q);
        const matchesId = site.id.toLowerCase().includes(q);
        const matchesDesc = (site.description || "").toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDesc) return false;
      }

      const forecast = forecastMap[site.id];
      const val = forecast?.value ?? site.baselineEc ?? 3.5;
      if (riskFilter === "critical" && val < 4.0) return false;
      if (riskFilter === "warning" && (val < 2.5 || val >= 4.0)) return false;
      if (riskFilter === "nominal" && val >= 2.5) return false;

      // When a region is selected, narrow down stations strictly to that region
      if (activeRegion) {
        const isAssociated = activeRegion.associatedStationIds.includes(site.id);
        const insideBox =
          site.latitude >= activeRegion.bounds[0][0] - 0.04 &&
          site.latitude <= activeRegion.bounds[1][0] + 0.04 &&
          site.longitude >= activeRegion.bounds[0][1] - 0.04 &&
          site.longitude <= activeRegion.bounds[1][1] + 0.04;
        if (!isAssociated && !insideBox) return false;
      }

      return true;
    });
  }, [sites, showSwot, showGauges, searchQuery, riskFilter, forecastMap, activeRegion]);

  if (!mounted || mapKey === 0) {
    return (
      <div className="w-full h-full bg-[#05070d] flex items-center justify-center text-muted-foreground text-xs min-h-[480px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs uppercase tracking-wider text-primary">
            Initializing Scientific Delta Cartography...
          </span>
        </div>
      </div>
    );
  }

  const currentTileConfig = BASEMAP_TILES[internalBasemap] || BASEMAP_TILES.radar;

  const cursorChainageKm = Math.max(
    0,
    Math.min(82.0, (cursorCoords[0] - 21.75) * (82.0 / (22.825 - 21.75)))
  ).toFixed(1);

  const isAcademic = internalBasemap === "academic";

  return (
    <div className="w-full h-full relative z-0 min-h-[480px] overflow-hidden select-none">
      {/* 1. GIS CSS KEYFRAMES & POPUP THEME */}
      <style>{`
        .leaflet-container {
          background-color: ${currentTileConfig.waterColor || (isAcademic ? "#e0f2fe" : "#08131f")} !important;
          font-family: inherit;
        }

        @keyframes gisPing {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* High-Definition GIS Popups */
        .leaflet-popup-content-wrapper {
          background: ${isAcademic ? "rgba(255, 255, 255, 0.98)" : "rgba(8, 19, 31, 0.96)"} !important;
          color: ${isAcademic ? "#0f172a" : "#f1f6f8"} !important;
          border: 1px solid ${isAcademic ? "rgba(0,0,0,0.2)" : "rgba(255, 255, 255, 0.18)"} !important;
          backdrop-filter: blur(20px) !important;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.6) !important;
          border-radius: 16px !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip {
          background: ${isAcademic ? "rgba(255, 255, 255, 0.98)" : "rgba(8, 19, 31, 0.96)"} !important;
          border: 1px solid ${isAcademic ? "rgba(0,0,0,0.2)" : "rgba(255, 255, 255, 0.18)"} !important;
        }
        .leaflet-popup-content {
          margin: 12px 14px !important;
          line-height: 1.4 !important;
        }
        .leaflet-popup-close-button {
          color: ${isAcademic ? "#475569" : "#94a3b8"} !important;
          padding: 6px 8px !important;
          font-size: 16px !important;
        }

        /* Crisp GIS Tooltip */
        .leaflet-tooltip {
          background: ${isAcademic ? "rgba(255, 255, 255, 0.96)" : "rgba(8, 19, 31, 0.94)"} !important;
          color: ${isAcademic ? "#0f172a" : "#f8fafc"} !important;
          border: 1px solid ${isAcademic ? "rgba(0,0,0,0.2)" : "rgba(255, 255, 255, 0.2)"} !important;
          backdrop-filter: blur(12px) !important;
          border-radius: 8px !important;
          padding: 5px 8px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.4) !important;
        }

        /* Permanent Label Anti-Collision */
        .upazila-permanent-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .bay-of-bengal-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .river-centerline-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* 2. TOP COORDINATE GRATICULE TICKS (MATCHING REFERENCE FIGURE) */}
      {showGraticule && (
        <>
          <div className={`absolute top-0 left-0 right-0 z-[490] pointer-events-none flex justify-between px-16 py-0.5 text-[9px] font-mono font-bold tracking-tight border-b ${
            isAcademic 
              ? "bg-white/90 text-slate-800 border-slate-300 shadow-sm" 
              : "bg-black/60 text-zinc-300 border-white/10"
          }`}>
            <span>90.00°E</span>
            <span>90.25°E</span>
            <span>90.50°E</span>
            <span>90.75°E</span>
            <span>91.00°E</span>
          </div>

          <div className={`absolute top-8 bottom-16 left-0 z-[490] pointer-events-none flex flex-col justify-between py-6 px-1 text-[9px] font-mono font-bold tracking-tight border-r ${
            isAcademic 
              ? "bg-white/80 text-slate-800 border-slate-300" 
              : "bg-black/40 text-zinc-300 border-white/10"
          }`}>
            <span>23.50°N</span>
            <span>23.00°N</span>
            <span>22.50°N</span>
            <span>22.00°N</span>
            <span>21.50°N</span>
          </div>
        </>
      )}

      {/* 3. FLOATING BASEMAP & REMOTE SENSING TOOLBAR (TOP-RIGHT) */}
      <div className="absolute top-7 right-3 z-[500] flex flex-col items-end gap-2 pointer-events-none">
        {/* Basemap Switcher - 100% Offline Local Themes */}
        <div className={`p-1 rounded-xl shadow-xl pointer-events-auto flex items-center gap-1 border ${
          isAcademic ? "bg-white/95 border-slate-300" : "bg-[#08131f]/95 border-white/15 backdrop-blur-xl"
        }`}>
          <button
            onClick={() => setInternalBasemap("radar")}
            className={`px-2 py-1 rounded-lg text-[11px] font-serif font-bold transition-all flex items-center gap-1 ${
              internalBasemap === "radar"
                ? "bg-emerald-600 text-white shadow-sm"
                : isAcademic ? "text-slate-600 hover:text-black" : "text-zinc-400 hover:text-white"
            }`}
            title="Instant Dark Radar GIS (100% Offline Local Vector)"
          >
            <Zap className="w-3 h-3" />
            <span>Radar</span>
          </button>
          <button
            onClick={() => setInternalBasemap("academic")}
            className={`px-2 py-1 rounded-lg text-[11px] font-serif font-bold transition-all flex items-center gap-1 ${
              internalBasemap === "academic"
                ? "bg-sky-600 text-white shadow-sm"
                : isAcademic ? "text-slate-600 hover:text-black" : "text-zinc-400 hover:text-white"
            }`}
            title="Clean Paper GIS Cartography matching academic journal figure"
          >
            <BookOpen className="w-3 h-3" />
            <span>Academic</span>
          </button>
          <button
            onClick={() => setInternalBasemap("topo")}
            className={`px-2 py-1 rounded-lg text-[11px] font-serif font-bold transition-all flex items-center gap-1 ${
              internalBasemap === "topo"
                ? "bg-sky-600 text-white shadow-sm"
                : isAcademic ? "text-slate-600 hover:text-black" : "text-zinc-400 hover:text-white"
            }`}
            title="Topographic River & Polder Elevation"
          >
            <Waves className="w-3 h-3" />
            <span>Topo</span>
          </button>
        </div>

        {/* Remote Sensing Raster Blend & Opacity Slider */}
        <div className={`p-1.5 px-2.5 rounded-xl shadow-xl pointer-events-auto flex items-center gap-2.5 border text-xs ${
          isAcademic ? "bg-white/95 border-slate-300 text-slate-800" : "bg-[#08131f]/95 border-white/15 text-white backdrop-blur-xl"
        }`}>
          <button
            onClick={() => {
              const next = !internalShowRaster;
              setInternalShowRaster(next);
              if (onToggleRasterOverlay) onToggleRasterOverlay();
            }}
            className={`p-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1 ${
              internalShowRaster ? "text-sky-600 dark:text-sky-400 bg-sky-500/15" : "text-slate-400 hover:text-slate-200"
            }`}
            title={internalShowRaster ? "Hide remote sensing raster heatmap" : "Show remote sensing raster heatmap"}
          >
            {internalShowRaster ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="font-mono text-[10px] font-bold hidden sm:inline">Raster</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground hidden md:inline">Blend:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(internalOpacity * 100)}
              onChange={(e) => {
                const val = Number(e.target.value) / 100;
                setInternalOpacity(val);
                if (onOpacityChange) onOpacityChange(val);
              }}
              className="w-20 sm:w-24 h-1.5 accent-sky-500 rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-700"
              title={`Adjust remote sensing raster transparency: ${Math.round(internalOpacity * 100)}%`}
            />
            <span className="font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400 w-7 text-right">
              {Math.round(internalOpacity * 100)}%
            </span>
          </div>
        </div>

        {/* Publication Metric Scale & North Arrow (Top-Right of Reference) */}
        <div className={`px-3 py-1.5 rounded-xl shadow-lg border flex items-center gap-3 ${
          isAcademic ? "bg-white/95 border-slate-300 text-slate-900" : "bg-[#08131f]/90 border-white/15 text-white"
        }`}>
          {/* North Arrow */}
          <div className="flex flex-col items-center">
            <span className="font-serif font-bold text-[11px] leading-tight">N</span>
            <svg width="14" height="18" viewBox="0 0 24 28" fill="none">
              <polygon points="12,2 18,22 12,17 6,22" fill={isAcademic ? "#0f172a" : "#ffffff"} stroke="#000" strokeWidth="1" />
              <polygon points="12,2 12,17 6,22" fill={isAcademic ? "#64748b" : "#94a3b8"} />
            </svg>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-white/20" />

          {/* Metric Scale Bar 0 - 10 - 20 - 40 Km */}
          <div className="flex flex-col items-center font-serif text-[10px]">
            <div className="flex justify-between w-24 text-[9px] font-mono font-bold leading-none mb-0.5">
              <span>0</span>
              <span>10</span>
              <span>20</span>
              <span>40 Km</span>
            </div>
            <div className="w-24 h-2 border border-slate-800 dark:border-white flex overflow-hidden">
              <div className="w-1/4 bg-slate-900 dark:bg-white h-full" />
              <div className="w-1/4 bg-white dark:bg-black h-full" />
              <div className="w-1/4 bg-slate-900 dark:bg-white h-full" />
              <div className="w-1/4 bg-white dark:bg-black h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. FOCUSED REGION BANNER (WHEN REGION IS ISOLATED) */}
      {activeRegion && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[600] pointer-events-none flex justify-center animate-in fade-in slide-in-from-top-2 duration-300">
          <div className={`px-4 py-2 rounded-2xl shadow-2xl pointer-events-auto flex items-center gap-3 text-xs border ${
            isAcademic ? "bg-white/95 border-slate-400 text-slate-900" : "bg-[#08131f]/95 border-white/20 text-white backdrop-blur-xl"
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: getRegionDomainColor(activeRegion, hydrologicDomain) }} />
              <span className="font-bold font-serif text-sm">{activeRegion.name}</span>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded text-white shadow"
                style={{ backgroundColor: getRegionDomainColor(activeRegion, hydrologicDomain) }}
              >
                {salinityUnit === "ppt" 
                  ? `${getRegionDomainValue(activeRegion, hydrologicDomain)} ppt` 
                  : `${convertPptToEc(getRegionDomainValue(activeRegion, hydrologicDomain))} dS/m`}
              </span>
            </div>
            <span className="text-muted-foreground text-[11px] hidden md:inline">| Other regions opted out</span>
            <button
              onClick={() => onSelectRegion && onSelectRegion(null)}
              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>View All Regions</span>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 5. SCIENTIFIC PUBLICATION SALINITY LEGEND CARD (EXACT REPLICATION OF PAPER FIGURE) */}
      <div className={`absolute bottom-3 ${compactLegend ? "left-3" : "left-3 md:left-6"} z-[500] pointer-events-none animate-in fade-in duration-300`}>
        <div className={`p-3 rounded-xl shadow-2xl pointer-events-auto border transition-all ${
          isAcademic
            ? "bg-white/98 text-slate-900 border-slate-400 shadow-slate-500/20"
            : "bg-[#08131f]/95 text-white border-white/20 backdrop-blur-xl"
        }`}>
          {/* Card Title Matching Academic Figure Header */}
          <div className="flex items-center justify-between gap-3 border-b pb-1.5 mb-2 border-slate-300 dark:border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-xs sm:text-sm tracking-wide">
                {standaloneTitle || `${currentDomainConfig.title} (${salinityUnit})`}
              </span>
            </div>

            {/* Quick 3-Domain Switcher (a, b, c) */}
            {onSelectDomain && (
              <div className="flex items-center gap-1">
                {(["river", "shallow_gw", "deep_gw"] as HydrologicDomain[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => onSelectDomain(d)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-serif font-bold transition-all ${
                      hydrologicDomain === d
                        ? "bg-sky-600 text-white shadow-sm"
                        : isAcademic 
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300" 
                        : "bg-white/10 hover:bg-white/20 text-zinc-300"
                    }`}
                    title={DOMAIN_CONFIGS[d].title}
                  >
                    {DOMAIN_CONFIGS[d].panelId}
                  </button>
                ))}

                {onToggleUnit && (
                  <button
                    onClick={onToggleUnit}
                    className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30"
                    title="Toggle between ppt (parts per thousand) and dS/m (electrical conductivity)"
                  >
                    {salinityUnit === "ppt" ? "dS/m" : "ppt"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2-Column x 3-Row Grid Matching User's Publication Graphic */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-serif text-xs">
            {currentDomainConfig.tiers.map((tier) => {
              const minVal = salinityUnit === "ppt" ? tier.min : convertPptToEc(tier.min);
              const maxVal = salinityUnit === "ppt" ? tier.max : convertPptToEc(tier.max);
              const displayLabel =
                salinityUnit === "ppt"
                  ? tier.label
                  : `${minVal.toFixed(2)} to ${maxVal.toFixed(2)}`;

              return (
                <div key={tier.label} className="flex items-center gap-2">
                  <span
                    className="w-5 h-3.5 rounded-none shrink-0 border border-slate-800 shadow-sm"
                    style={{ backgroundColor: tier.fillColor }}
                  />
                  <span className="font-serif text-[11px] font-medium tracking-tight">
                    {displayLabel}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Depth and Context Footnote */}
          <div className="mt-2 pt-1.5 border-t border-slate-300 dark:border-white/10 flex items-center justify-between text-[9px] font-mono text-muted-foreground">
            <span>{currentDomainConfig.waterSource}</span>
            <span>Depth: {currentDomainConfig.targetDepth}</span>
          </div>
        </div>
      </div>

      {/* 6. GIS CURSOR & COORDINATES HUD (BOTTOM-RIGHT) */}
      <div className="absolute bottom-3 right-4 z-[500] pointer-events-none hidden sm:flex flex-col space-y-1">
        <div className={`px-3 py-1.5 rounded-xl shadow-xl pointer-events-auto flex items-center gap-3 text-[11px] font-mono border ${
          isAcademic ? "bg-white/95 text-slate-800 border-slate-300" : "bg-[#08131f]/95 text-white/90 border-white/15 backdrop-blur-xl"
        }`}>
          <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
            <Crosshair className="w-3.5 h-3.5" />
            <span>WGS84:</span>
          </div>
          <span>
            {cursorCoords[0].toFixed(4)}°N, {cursorCoords[1].toFixed(4)}°E
          </span>
          <div className="h-3 w-px bg-slate-300 dark:bg-white/15" />
          <span className="text-muted-foreground">
            Sampled: <strong className="text-sky-600 dark:text-sky-300">{sampledSalinity} {salinityUnit}</strong>
          </span>
          {hoveredRegion && (
            <>
              <div className="h-3 w-px bg-slate-300 dark:bg-white/15" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {hoveredRegion.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 7. LEAFLET MAP CONTAINER */}
      <MapContainer
        key={`scientific-map-${mapKey}-${internalBasemap}-${hydrologicDomain}`}
        center={activeRegion ? activeRegion.center : KHULNA_DISTRICT_CENTER}
        zoom={10}
        minZoom={8}
        maxZoom={15}
        maxBounds={[
          [21.60, 88.80],
          [23.50, 90.10],
        ]}
        maxBoundsViscosity={0.9}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", minHeight: "480px" }}
      >
        <MapController
          coords={flyToCoords}
          zoom={11}
          regionBounds={activeRegion ? activeRegion.bounds : null}
          onCursorMove={handleCursorMove}
        />
        <ScaleControl position="bottomleft" imperial={false} metric={true} />

        {/* 100% Offline Regional Coastal Delta Landmass (ZERO network requests) */}
        <Polygon
          positions={KHULNA_REGIONAL_LANDMASS}
          pathOptions={{
            fillColor: currentTileConfig.landColor || (isAcademic ? "#f1f5f9" : "#0c1b2b"),
            fillOpacity: 1,
            color: currentTileConfig.borderColor || (isAcademic ? "#94a3b8" : "#1e3a5f"),
            weight: 1.5,
            lineCap: "round",
            lineJoin: "round",
          }}
          interactive={false}
        />

        {/* ------------------------------------------------------------- */}
        {/* A. CONTINUOUS REMOTE SENSING RASTER OVERLAY                   */}
        {/* Georeferenced RBF continuous salinity field for Publication   */}
        {/* ------------------------------------------------------------- */}
        {internalShowRaster && (
          <ImageOverlay
            url={
              hydrologicDomain === "river"
                ? "/gis/salinity_river.png"
                : hydrologicDomain === "shallow_gw"
                ? "/gis/salinity_shallow_gw.png"
                : "/gis/salinity_deep_gw.png"
            }
            bounds={PUBLICATION_STUDY_BOUNDS}
            opacity={internalOpacity}
            zIndex={100}
          />
        )}

        {/* ------------------------------------------------------------- */}
        {/* B. UPAZILA VECTOR BOUNDARIES & INTERACTIVE DOSSIERS           */}
        {/* ------------------------------------------------------------- */}
        {showRiskChoropleth &&
          displayRegions.map((region) => {
            const isSelected = selectedRegionId === region.id;
            const isAnySelected = Boolean(selectedRegionId);
            const isOptedOut = isAnySelected && !isSelected;

            const domainValPpt = getRegionDomainValue(region, hydrologicDomain);
            const domainColor = getRegionDomainColor(region, hydrologicDomain);
            const domainTier = getDomainTier(domainValPpt, hydrologicDomain);
            const domainValDisplay =
              salinityUnit === "ppt"
                ? `${domainValPpt.toFixed(2)} ppt`
                : `${convertPptToEc(domainValPpt).toFixed(2)} dS/m`;

            return (
              <Polygon
                key={region.id}
                positions={region.coordinates}
                pathOptions={{
                  fillColor: isOptedOut 
                    ? (isAcademic ? "#f8fafc" : "#05070d") 
                    : isSelected 
                    ? domainColor 
                    : (internalShowRaster ? "transparent" : domainColor),
                  fillOpacity: isSelected ? 0.45 : isOptedOut ? 0.88 : (internalShowRaster ? 0 : 0.40),
                  color: isSelected 
                    ? "#0284c7" 
                    : isOptedOut 
                    ? (isAcademic ? "#cbd5e1" : "#ffffff10") 
                    : (isAcademic ? "#0f172a" : "#ffffff70"),
                  weight: isSelected ? 3.5 : isOptedOut ? 1 : 1.5,
                  dashArray: isOptedOut ? "4, 4" : undefined,
                  lineJoin: "round",
                  lineCap: "round",
                }}
                eventHandlers={{
                  click: () => {
                    if (onSelectRegion) {
                      onSelectRegion(isSelected ? null : region);
                    }
                  },
                }}
              >
                <Tooltip sticky direction="center">
                  <div className="flex flex-col space-y-1.5 p-1 min-w-[220px] text-foreground font-sans">
                    <div className="flex items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-1">
                      <div className="flex flex-col">
                        <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                          {region.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{region.bengaliName}</span>
                      </div>
                      <span
                        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-white shadow-sm"
                        style={{ backgroundColor: domainColor }}
                      >
                        {domainValDisplay}
                      </span>
                    </div>

                    <div className="text-[11px] font-serif font-medium text-slate-700 dark:text-zinc-200">
                      {currentDomainConfig.title}: <strong className="text-sky-600 dark:text-sky-400">{domainValDisplay}</strong> ({domainTier.label})
                    </div>

                    <div className="text-[10px] text-muted-foreground font-mono">
                      Aquifer: <span className="font-sans text-slate-800 dark:text-zinc-200">{region.aquiferDepthM}</span>
                    </div>

                    <div className="text-[10px] text-rose-600 dark:text-rose-300 font-medium leading-snug">
                      {region.drinkingSafety}
                    </div>

                    <div className="text-[9px] text-sky-600 dark:text-sky-300 font-mono pt-1 border-t border-black/10 dark:border-white/10">
                      {isSelected ? "Click to deselect (View All)" : "Click to narrow down & opt out others"}
                    </div>
                  </div>
                </Tooltip>
              </Polygon>
            );
          })}

        {/* ------------------------------------------------------------- */}
        {/* C. HYDROGRAPHIC RIVERS (PASSUR, SHIBSA, RUPSHA, KOBODAK)      */}
        {/* ------------------------------------------------------------- */}
        {showRivers &&
          KHULNA_RIVER_SYSTEM.map((river) => (
            <div key={river.id}>
              <Polyline
                positions={river.coordinates}
                pathOptions={{
                  color: isAcademic ? "#0284c7" : "#38bdf8",
                  weight: river.width,
                  opacity: isAcademic ? 0.95 : 0.85,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              >
                <Tooltip sticky>
                  <span className="font-serif font-bold text-xs text-sky-600 dark:text-sky-300">
                    {river.name} ({river.bengaliName})
                  </span>
                </Tooltip>
              </Polyline>

              {/* River Centerline Text Label */}
              <Marker
                position={river.labelCoord}
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
                      text-shadow: ${isAcademic 
                        ? "0 0 3px #ffffff, 0 0 6px #ffffff" 
                        : "0 0 4px #000000, 0 0 8px #000000"};
                      white-space: nowrap;
                      transform: translate(-50%, -50%) rotate(-25deg);
                      pointer-events: none;
                    ">
                      ${river.name}
                    </div>
                  `,
                  iconSize: [80, 18],
                  iconAnchor: [40, 9],
                })}
                interactive={false}
              />
            </div>
          ))}

        {/* ------------------------------------------------------------- */}
        {/* D. PERMANENT UPAZILA LABELS (PRINTED ON LANDMASS LIKE PAPER)  */}
        {/* ------------------------------------------------------------- */}
        {showLabels &&
          displayRegions.map((region) => {
            const isSelected = selectedRegionId === region.id;
            const isAnySelected = Boolean(selectedRegionId);
            const isOptedOut = isAnySelected && !isSelected;
            if (isOptedOut) return null;

            const labelHtml = `
              <div style="
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-weight: 800;
                font-size: 11px;
                letter-spacing: 0.04em;
                color: ${isAcademic ? "#0f172a" : "#ffffff"};
                text-shadow: ${isAcademic 
                  ? "0 0 4px #ffffff, 0 0 6px #ffffff, 0 1px 2px rgba(255,255,255,0.9)" 
                  : "0 0 4px #000000, 0 0 8px #000000, 0 1px 3px rgba(0,0,0,0.9)"};
                pointer-events: none;
                white-space: nowrap;
                text-align: center;
                transform: translate(-50%, -50%);
              ">
                <span>${region.name.replace(" Upazila", "")}</span>
              </div>
            `;

            return (
              <Marker
                key={`label-${region.id}`}
                position={region.center}
                icon={L.divIcon({
                  className: "upazila-permanent-label",
                  html: labelHtml,
                  iconSize: [90, 20],
                  iconAnchor: [45, 10],
                })}
                interactive={false}
              />
            );
          })}

        {/* ------------------------------------------------------------- */}
        {/* E. SOUTHERN BAY OF BENGAL MARITIME LABEL                      */}
        {/* ------------------------------------------------------------- */}
        <Marker
          position={BAY_OF_BENGAL_LOCATION}
          icon={L.divIcon({
            className: "bay-of-bengal-label",
            html: `
              <div style="
                font-family: Georgia, 'Times New Roman', serif;
                font-style: italic;
                font-size: 16px;
                font-weight: 700;
                letter-spacing: 0.18em;
                color: ${isAcademic ? "#1e3a5f" : "#7dd3fc"};
                text-shadow: ${isAcademic 
                  ? "0 0 6px rgba(255,255,255,0.9)" 
                  : "0 0 8px rgba(0,0,0,0.9)"};
                white-space: nowrap;
                text-align: center;
                transform: translate(-50%, -50%);
                pointer-events: none;
              ">
                Bay of Bengal
              </div>
            `,
            iconSize: [180, 30],
            iconAnchor: [90, 15],
          })}
          interactive={false}
        />

        {/* Active Region Center Pin */}
        {activeRegion && (
          <CircleMarker
            center={activeRegion.center}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              fillColor: getRegionDomainColor(activeRegion, hydrologicDomain),
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -10]}>
              <div className="flex items-center gap-1.5 font-bold font-serif text-xs text-white bg-slate-900/95 px-2.5 py-1 rounded-lg border border-white/30 shadow-2xl">
                <span>{activeRegion.name}</span>
                <span className="text-[10px] font-mono px-1 rounded text-white" style={{ backgroundColor: getRegionDomainColor(activeRegion, hydrologicDomain) }}>
                  {salinityUnit === "ppt" 
                    ? `${getRegionDomainValue(activeRegion, hydrologicDomain)} ppt` 
                    : `${convertPptToEc(getRegionDomainValue(activeRegion, hydrologicDomain))} dS/m`}
                </span>
              </div>
            </Tooltip>
          </CircleMarker>
        )}

        {/* ------------------------------------------------------------- */}
        {/* F. COASTAL POLDER CADASTRE & EMBANKMENTS (KHULNA REGION)      */}
        {/* ------------------------------------------------------------- */}
        {showPolders &&
          COASTAL_POLDERS.map((polder) => (
            <Polygon
              key={polder.id}
              positions={polder.coordinates}
              pathOptions={{
                color: isAcademic ? "#047857" : polder.color,
                fillColor: polder.color,
                fillOpacity: polder.id === "sundarbans-boundary" ? 0.08 : 0.16,
                weight: polder.id === "sundarbans-boundary" ? 1.5 : 2,
                dashArray: polder.id === "sundarbans-boundary" ? "4, 4" : undefined,
              }}
              eventHandlers={{
                click: () => onSelectPolder && onSelectPolder(polder),
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-1 p-0.5 font-sans">
                  <div className="flex items-center gap-1.5 font-bold font-serif text-xs">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{polder.name}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Upazila: <span className="font-sans font-medium text-foreground">{polder.upazila}</span> &bull; Elev:{" "}
                    <span className="font-sans font-medium text-foreground">{polder.elevationM}m PWD</span>
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-300 font-medium">
                    {polder.salinityRisk}
                  </div>
                </div>
              </Tooltip>
            </Polygon>
          ))}

        {/* ------------------------------------------------------------- */}
        {/* G. PASSUR-RUPSHA CURVILINEAR THALWEG CENTERLINE (KHULNA)      */}
        {/* ------------------------------------------------------------- */}
        {showThalweg && (
          <>
            <Polyline
              positions={PASSUR_RUPSHA_THALWEG}
              pathOptions={{
                color: isAcademic ? "#0369a1" : "#38bdf8",
                weight: 3.5,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
              }}
            >
              <Tooltip sticky>
                <span className="font-mono text-sky-600 dark:text-sky-300 font-bold text-xs">
                  Passur-Rupsha Curvilinear Thalweg (SWORD Centerline: 0 - 82 km)
                </span>
              </Tooltip>
            </Polyline>

            {THALWEG_MILESTONES.map((m) => (
              <CircleMarker
                key={m.label}
                center={m.coords}
                radius={3.5}
                pathOptions={{
                  color: "#ffffff",
                  fillColor: "#0284c7",
                  fillOpacity: 1,
                  weight: 2,
                }}
              >
                <Tooltip permanent={false}>
                  <span className="font-mono text-[10px] font-bold text-sky-700 dark:text-sky-200">
                    Chainage: {m.label}
                  </span>
                </Tooltip>
              </CircleMarker>
            ))}
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* H. POLDER SLUICE GATES (KHULNA REGION)                         */}
        {/* ------------------------------------------------------------- */}
        {POLDER_SLUICE_GATES.map((gate) => (
          <Marker
            key={gate.id}
            position={gate.coords}
            icon={L.divIcon({
              className: "sluice-gate-icon",
              html: `
                <div style="width:16px;height:16px;background:#f59e0b;border:2px solid #ffffff;border-radius:3px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.5);cursor:pointer;" title="${gate.name}">
                  <div style="width:5px;height:5px;background:#05070d;border-radius:1px;"></div>
                </div>
              `,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Tooltip sticky>
              <div className="flex flex-col space-y-0.5 text-xs font-sans">
                <span className="font-serif font-bold text-amber-600 dark:text-amber-400">{gate.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {gate.polder} &bull; Status: <strong className="text-foreground">{gate.status}</strong>
                </span>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {/* ------------------------------------------------------------- */}
        {/* I. NASA SWOT KA-BAND RADAR ORBIT FOOTPRINT                    */}
        {/* ------------------------------------------------------------- */}
        {showSwot && (
          <>
            <Polygon
              positions={SWOT_LEFT_SWATH}
              pathOptions={{
                color: "#06b6d4",
                fillColor: "#06b6d4",
                fillOpacity: isAcademic ? 0.08 : 0.12,
                weight: 1.5,
                dashArray: "6, 8",
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5 font-sans">
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                    NASA SWOT KaRIn Swath (West Channel - 50 km)
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Ka-band Radar Interferometry @ 35.75 GHz | 20m Pixel Scale
                  </span>
                </div>
              </Tooltip>
            </Polygon>

            <Polygon
              positions={SWOT_RIGHT_SWATH}
              pathOptions={{
                color: "#06b6d4",
                fillColor: "#06b6d4",
                fillOpacity: isAcademic ? 0.08 : 0.12,
                weight: 1.5,
                dashArray: "6, 8",
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5 font-sans">
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                    NASA SWOT KaRIn Swath (East Channel - 50 km)
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Measuring River Elevation &amp; Hydraulic Slope S₀ across Delta
                  </span>
                </div>
              </Tooltip>
            </Polygon>

            <Polyline
              positions={SWOT_NADIR_GROUND_TRACK}
              pathOptions={{
                color: "#22d3ee",
                weight: 2,
                dashArray: "4, 6",
                opacity: 0.8,
              }}
            >
              <Tooltip sticky>
                <span className="font-mono text-cyan-600 dark:text-cyan-300 font-bold">
                  SWOT Sub-Satellite Nadir Ground Track (Orbit #22)
                </span>
              </Tooltip>
            </Polyline>
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* J. ESTUARINE SALINITY INGRESS CORRIDORS                       */}
        {/* ------------------------------------------------------------- */}
        {showSalinityFront && (
          <>
            <Polyline
              positions={PASSUR_MARINE_INGRESS_CORRIDOR}
              pathOptions={{
                color: "#d92526",
                weight: 4.5,
                opacity: 0.95,
                lineCap: "round",
              }}
              eventHandlers={{
                click: () => onSelectCorridor && onSelectCorridor("Passur"),
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5 font-sans">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                      Passur Hyper-Saline Marine Front (&gt;7.0 dS/m)
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Direct Bay of Bengal tidal surge entering Mongla Port &amp; Sundarbans
                  </span>
                </div>
              </Tooltip>
            </Polyline>

            <Polyline
              positions={PASSUR_TRANSITION_CORRIDOR}
              pathOptions={{
                color: "#f5a623",
                weight: 4,
                opacity: 0.95,
                lineCap: "round",
              }}
              eventHandlers={{
                click: () => onSelectCorridor && onSelectCorridor("Rupsha"),
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5 font-sans">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                      Rupsha Salinity Hazard Transition (4.0 - 7.0 dS/m)
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Breaches 4.0 dS/m Boro Rice safety threshold up to Khulna WASA Intake
                  </span>
                </div>
              </Tooltip>
            </Polyline>

            <Polyline
              positions={RUPSHA_FRESHWATER_DILUTION}
              pathOptions={{
                color: "#10b981",
                weight: 3.5,
                opacity: 0.85,
                lineCap: "round",
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5 font-sans">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    Freshwater Dilution Head (&lt;2.5 dS/m)
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Upstream Gorai-Bhairab freshwater pushing back tidal salinity
                  </span>
                </div>
              </Tooltip>
            </Polyline>

            <Polyline
              positions={SHIBSA_WESTERN_CORRIDOR}
              pathOptions={{
                color: "#0284c7",
                weight: 3.5,
                opacity: 0.9,
                lineCap: "round",
              }}
              eventHandlers={{
                click: () => onSelectCorridor && onSelectCorridor("Shibsa"),
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5 font-sans">
                  <span className="font-bold text-sky-600 dark:text-sky-400 font-mono">
                    Western Shibsa Tidal Channel (~4.2 dS/m)
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Paikgachha &amp; Western Dacope mangrove polder belt
                  </span>
                </div>
              </Tooltip>
            </Polyline>
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* K. GIS MONITORING STATIONS & SURFACE REACHES                  */}
        {/* ------------------------------------------------------------- */}
        {khulnaSites.map((site) => {
          const isSwot =
            site.category === "swot" ||
            site.id.startsWith("3124") ||
            site.id.toLowerCase().includes("swot");
          const isIntake = site.category === "intake" || site.id.includes("p14");
          const isSelected = selectedSiteId === site.id;
          const forecast = forecastMap[site.id];

          let risk = "NOMINAL";
          let currentVal = site.baselineEc ?? 3.5;
          let unit = "dS/m";

          if (forecast) {
            currentVal = horizon === "14d" ? forecast.value * 1.15 : forecast.value;
            unit = forecast.unit;
          }

          if (currentVal >= 4.0) risk = "CRITICAL";
          else if (currentVal >= 2.5) risk = "WARNING";

          const displayVal = `${currentVal.toFixed(1)} ${unit}`;

          const markerIcon = createGisStationIcon(
            isSwot ? "swot" : isIntake ? "intake" : "gauge",
            risk,
            isSelected,
            displayVal,
            site.id
          );

          return (
            <Marker
              key={site.id}
              position={[site.latitude, site.longitude]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectSite) onSelectSite(site);
                },
              }}
            >
              <Tooltip sticky direction="top">
                <div className="flex items-center gap-1.5 font-sans text-xs">
                  <span className="font-serif font-bold text-slate-900 dark:text-white">{site.name}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-sm"
                    style={{ backgroundColor: risk === "CRITICAL" ? "#d92526" : risk === "WARNING" ? "#f5a623" : "#0284c7" }}
                  >
                    {displayVal}
                  </span>
                </div>
              </Tooltip>
              <Popup className="custom-gis-popup">
                <div className="flex flex-col space-y-2.5 p-1 min-w-[270px] text-foreground font-sans">
                  {/* Popup Header with Agency & Status Pill */}
                  <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
                    <div className="flex items-center gap-1.5">
                      {isSwot ? (
                        <Satellite className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      ) : isIntake ? (
                        <Droplets className="w-3.5 h-3.5 text-purple-600 dark:text-pink-400" />
                      ) : (
                        <Radio className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      )}
                      <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-muted-foreground">
                        {isSwot
                          ? "NASA SWOT Reach"
                          : isIntake
                          ? "WASA Municipal Intake"
                          : "BWDB Tidal Station"}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        risk === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/40"
                          : risk === "WARNING"
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      {risk}
                    </span>
                  </div>

                  {/* Station Name & Coordinates */}
                  <div className="flex flex-col space-y-0.5">
                    <h4 className="font-serif font-bold text-slate-900 dark:text-white text-sm leading-snug">
                      {site.name}
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ID: {site.id} &bull; River: {site.river || "Khulna Estuary"} &bull; {site.distanceKm || 50} km to Sea
                    </span>
                  </div>

                  {/* Telemetry KPI Box */}
                  <div className="bg-slate-100 dark:bg-white/5 p-2 rounded-xl border border-slate-200 dark:border-white/10 flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {forecast ? "PINN Forward Forecast:" : "Baseline Salinity (EC):"}
                      </span>
                      <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                        {displayVal}
                      </span>
                    </div>

                    {/* Hazard Meter Bar vs 4.0 dS/m Limit */}
                    <div className="flex flex-col space-y-1">
                      <div className="w-full h-1.5 rounded-full bg-slate-300 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            currentVal >= 4.0
                              ? "bg-rose-500"
                              : currentVal >= 2.5
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                          }`}
                          style={{ width: `${Math.min(100, (currentVal / 10.0) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Advisory Notice */}
                  {site.intakeHazard && (
                    <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-[10px] text-rose-700 dark:text-rose-300 font-mono">
                      &bull; {site.intakeHazard}
                    </div>
                  )}

                  {/* Action Shortcuts */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-white/10">
                    <button
                      onClick={() => onSelectSite && onSelectSite(site)}
                      className="text-xs font-serif font-bold text-sky-600 dark:text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>GIS Feature Dossier</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <a
                      href={`/app/reaches/${site.id}`}
                      className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <span>Sluice &amp; Hydraulics</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
