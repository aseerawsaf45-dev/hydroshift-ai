"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  Circle,
  CircleMarker,
  Tooltip,
  ScaleControl,
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
} from "lucide-react";

export * from "./map-data";
import {
  Site,
  Forecast,
  MapWrapperProps,
  PolderPolygon,
  KhulnaRegion,
  KHULNA_UPAZILA_REGIONS,
  KHULNA_DISTRICT_BOUNDS,
  RISK_TIERS_CONFIG,
  RiskTier,
  CANONICAL_KHULNA_STATIONS,
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
// 2. PROFESSIONAL GIS VECTOR STATION SYMBOLOGY (CLEAN & NON-OVERLAPPING)
// -------------------------------------------------------------
const createGisStationIcon = (
  category: "swot" | "gauge" | "intake",
  risk: string,
  isSelected: boolean,
  displayValue: string,
  stationCode: string,
  showLabel: boolean
) => {
  const isCrit = risk === "CRITICAL";
  const isWarn = risk === "WARNING";

  // GIS Symbology Color Standards
  const fillColor = isCrit
    ? "#e11d48" // Rose 600 (High hazard >= 4.0 dS/m)
    : isWarn
    ? "#d97706" // Amber 600 (Moderate 2.5 - 4.0 dS/m)
    : category === "swot"
    ? "#0284c7" // Sky 600 (NASA SWOT Reach)
    : category === "intake"
    ? "#7c3aed" // Violet 600 (Municipal WASA Intake)
    : "#059669"; // Emerald 600 (Fresh / Nominal < 2.5 dS/m)

  const pulseRing = isCrit
    ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid #f43f5e;animation:gisPing 1.8s infinite;pointer-events:none;"></div>`
    : "";

  // Category SVG glyphs:
  // - Gauge: concentric sonar target
  // - Intake: water droplet
  // - SWOT Reach: satellite diamond
  const iconGlyph =
    category === "swot" ? (
      `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.8"><polygon points="12 2 22 12 12 22 2 12"/></svg>`
    ) : category === "intake" ? (
      `<svg width="9" height="9" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`
    ) : (
      `<svg width="8" height="8" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="12" r="5"/></svg>`
    );

  const markerShape =
    category === "swot"
      ? "border-radius: 4px; transform: rotate(45deg);"
      : "border-radius: 50%;";
  const innerGlyphTransform = category === "swot" ? "transform: rotate(-45deg);" : "";

  // Compact floating callout label (rendered above pin with down carrot)
  const labelHtml =
    showLabel || isSelected
      ? `
    <div style="position:absolute;bottom:calc(100% + 5px);left:50%;transform:translateX(-50%);white-space:nowrap;background:rgba(8,19,31,0.92);border:1px solid ${fillColor};color:#ffffff;font-family:ui-monospace,SFMono-Regular,monospace;font-size:10px;font-weight:700;padding:1.5px 5px;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.7);pointer-events:none;z-index:20;">
      <span>${displayValue}</span>
      <div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);border-width:4px 4px 0 4px;border-style:solid;border-color:rgba(8,19,31,0.92) transparent transparent transparent;"></div>
    </div>
  `
      : "";

  const selectedRing = isSelected
    ? `box-shadow: 0 0 0 3px #ffffff, 0 0 16px ${fillColor}; transform: scale(1.18);`
    : `box-shadow: 0 2px 8px rgba(0,0,0,0.7);`;

  return L.divIcon({
    className: "gis-station-marker",
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;cursor:pointer;">
        ${pulseRing}
        ${labelHtml}
        <div style="width:20px;height:20px;${markerShape}background:${fillColor};border:2px solid #ffffff;${selectedRing}display:flex;align-items:center;justify-content:center;transition:transform 0.15s ease;">
          <div style="${innerGlyphTransform}display:flex;align-items:center;justify-content:center;">
            ${iconGlyph}
          </div>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
  });
};

// -------------------------------------------------------------
// 3. MAIN HIGH-PRECISION GIS MAP WRAPPER COMPONENT
// -------------------------------------------------------------
export default function MapWrapper({
  selectedSiteId,
  onSelectSite,
  selectedRegionId = null,
  onSelectRegion,
  showRiskChoropleth = true,
  showSwot = true,
  showGauges = true,
  showSalinityFront = true,
  showIsohalines = true,
  showPolders = true,
  showThalweg = true,
  showLabels = false,
  basemap = "satellite",
  horizon = "now",
  searchQuery = "",
  riskFilter = "all",
  flyToCoords = null,
  onSelectCorridor,
  onSelectPolder,
}: MapWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [sites, setSites] = useState<Site[]>(CANONICAL_KHULNA_STATIONS);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [cursorCoords, setCursorCoords] = useState<[number, number]>([22.65, 89.56]);
  const [internalBasemap, setInternalBasemap] = useState<"satellite" | "dark" | "topo" | "osm">(basemap);

  const activeRegion = useMemo(() => {
    if (!selectedRegionId) return null;
    return KHULNA_UPAZILA_REGIONS.find((r) => r.id === selectedRegionId) || null;
  }, [selectedRegionId]);

  // Sync external basemap prop
  useEffect(() => {
    if (basemap) setInternalBasemap(basemap);
  }, [basemap]);

  useEffect(() => {
    setMounted(true);
    setMapKey((k) => k + 1);
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

    Promise.all([
      fetch(`${API_URL}/api/v1/reaches`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/api/v1/reaches/forecasts/all`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([loadedSites, loadedForecasts]) => {
      if (loadedSites && loadedSites.length > 0) {
        const merged = [...CANONICAL_KHULNA_STATIONS];
        for (const s of loadedSites) {
          if (!merged.some((m) => m.id === s.id)) {
            merged.push({
              ...s,
              category: s.id.startsWith("3124") || s.id.toLowerCase().includes("swot") ? "swot" : "gauge",
              river: "Estuary",
              baselineEc: 4.2,
              wsePwd: 2.1,
              distanceKm: 50.0,
            });
          }
        }
        setSites(merged);
      }
      if (loadedForecasts && loadedForecasts.length > 0) {
        setForecasts(loadedForecasts);
      }
    });
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
            Initializing GIS Delta Cartography...
          </span>
        </div>
      </div>
    );
  }

  const currentTileConfig = BASEMAP_TILES[internalBasemap] || BASEMAP_TILES.satellite;

  // Approximate estuarine chainage calculation from cursor latitude
  const cursorChainageKm = Math.max(
    0,
    Math.min(82.0, (cursorCoords[0] - 21.75) * (82.0 / (22.825 - 21.75)))
  ).toFixed(1);

  return (
    <div className="w-full h-full relative z-0 min-h-[480px] overflow-hidden select-none">
      {/* 1. GIS CSS KEYFRAMES & POPUP THEME */}
      <style>{`
        .leaflet-container {
          background-color: #0c1824 !important;
          font-family: inherit;
        }

        @keyframes gisPing {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* High-Definition GIS Popups */
        .leaflet-popup-content-wrapper {
          background: rgba(8, 19, 31, 0.96) !important;
          color: #f1f6f8 !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          backdrop-filter: blur(20px) !important;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.85) !important;
          border-radius: 16px !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip {
          background: rgba(8, 19, 31, 0.96) !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
        }
        .leaflet-popup-content {
          margin: 12px 14px !important;
          line-height: 1.4 !important;
        }
        .leaflet-popup-close-button {
          color: #94a3b8 !important;
          padding: 6px 8px !important;
          font-size: 16px !important;
        }
        .leaflet-popup-close-button:hover {
          color: #ffffff !important;
        }

        /* Crisp GIS Tooltip */
        .leaflet-tooltip {
          background: rgba(8, 19, 31, 0.94) !important;
          color: #f8fafc !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          backdrop-filter: blur(12px) !important;
          border-radius: 8px !important;
          padding: 5px 8px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.7) !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: rgba(8, 19, 31, 0.94) !important;
        }

        /* Scale Bar Styling */
        .leaflet-control-scale-line {
          background: rgba(8, 19, 31, 0.85) !important;
          color: #f1f6f8 !important;
          border: 2px solid rgba(255, 255, 255, 0.4) !important;
          border-top: none !important;
          font-family: ui-monospace, SFMono-Regular, monospace !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          padding: 2px 5px !important;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5) !important;
        }
      `}</style>

      {/* 2. FLOATING GIS BASEMAP SELECTOR (TOP-RIGHT) */}
      <div className="absolute top-3 right-3 z-[500] flex flex-col items-end gap-2 pointer-events-none">
        <div className="bg-[#08131f]/95 backdrop-blur-xl border border-white/15 p-1 rounded-xl shadow-2xl pointer-events-auto flex items-center gap-1">
          <button
            onClick={() => setInternalBasemap("satellite")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 ${
              internalBasemap === "satellite"
                ? "bg-primary text-black shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-white"
            }`}
            title="NASA Earth Data / Esri Satellite Imagery with Place Labels"
          >
            <Satellite className="w-3 h-3" />
            <span>Satellite</span>
          </button>
          <button
            onClick={() => setInternalBasemap("dark")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 ${
              internalBasemap === "dark"
                ? "bg-primary text-black shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-white"
            }`}
            title="CartoDB Dark GIS Cartography"
          >
            <Layers className="w-3 h-3" />
            <span>Dark GIS</span>
          </button>
          <button
            onClick={() => setInternalBasemap("topo")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 ${
              internalBasemap === "topo"
                ? "bg-primary text-black shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-white"
            }`}
            title="Hydrographic Topographic Contours"
          >
            <Waves className="w-3 h-3" />
            <span>Topo</span>
          </button>
          <button
            onClick={() => setInternalBasemap("osm")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 ${
              internalBasemap === "osm"
                ? "bg-primary text-black shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-white"
            }`}
            title="OpenStreetMap Street Infrastructure"
          >
            <Compass className="w-3 h-3" />
            <span>Street</span>
          </button>
        </div>
      </div>

      {/* 3. FOCUSED REGION BANNER (WHEN REGION IS ISOLATED) */}
      {activeRegion && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[600] pointer-events-none flex justify-center animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-[#08131f]/95 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl shadow-2xl pointer-events-auto flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: activeRegion.color }} />
              <span className="font-bold text-white font-sans text-sm">{activeRegion.name}</span>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded text-white shadow"
                style={{ backgroundColor: activeRegion.color }}
              >
                {activeRegion.riskTier} ({activeRegion.avgEc} dS/m)
              </span>
            </div>
            <span className="text-muted-foreground text-[11px] hidden md:inline">| Other regions opted out</span>
            <button
              onClick={() => onSelectRegion && onSelectRegion(null)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-300 text-[11px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 border border-white/10"
            >
              <span>View All Khulna</span>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 4. AUTHENTIC 5-TIER RISK LEGEND & NORTH ARROW (MATCHING USER GRAPHIC) */}
      {!activeRegion && (
        <div className="absolute bottom-12 right-4 z-[500] pointer-events-none flex flex-col items-end space-y-2 animate-in fade-in duration-300">
          <div className="bg-[#08131f]/95 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-2xl pointer-events-auto flex flex-col space-y-2 min-w-[150px]">
            {/* Title */}
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <span className="font-serif font-bold text-white text-sm tracking-wide">Risk</span>
              <span className="text-[9px] font-mono text-muted-foreground uppercase">Khulna</span>
            </div>

            {/* 5-Tier Items */}
            <div className="flex flex-col space-y-1">
              {RISK_TIERS_CONFIG.map((tier) => {
                return (
                  <div
                    key={tier.tier}
                    className="flex items-center gap-2 px-1 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => {
                      const match = KHULNA_UPAZILA_REGIONS.find((r) => r.riskTier === tier.tier);
                      if (match && onSelectRegion) {
                        onSelectRegion(match);
                      }
                    }}
                    title={`Click to focus: ${tier.label} (${tier.range})`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-sm shrink-0 border border-black/40 shadow-sm"
                      style={{ backgroundColor: tier.color }}
                    />
                    <div className="flex items-baseline justify-between flex-1 gap-2">
                      <span className="text-[11px] font-serif text-white font-medium">{tier.label}</span>
                      <span className="text-[9px] font-mono text-muted-foreground">{tier.range}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* North Arrow & Scale (Matching User Graphic) */}
            <div className="pt-2 border-t border-white/10 flex flex-col items-center justify-center space-y-1 text-white">
              <div className="flex flex-col items-center">
                <span className="font-serif font-bold text-xs tracking-widest">N</span>
                <svg width="18" height="22" viewBox="0 0 24 28" fill="none" className="drop-shadow">
                  <polygon points="12,2 18,22 12,17 6,22" fill="#ffffff" stroke="#000" strokeWidth="1" />
                  <polygon points="12,2 12,17 6,22" fill="#94a3b8" />
                </svg>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground">
                <span>0</span>
                <span>5</span>
                <span>10</span>
                <span>20 Miles</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. GIS CURSOR & COORDINATES HUD (BOTTOM-LEFT) */}
      <div className="absolute bottom-4 left-4 z-[500] pointer-events-none flex flex-col space-y-1">
        <div className="bg-[#08131f]/95 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-xl shadow-2xl pointer-events-auto flex items-center gap-3 text-[11px] font-mono text-white/90">
          <div className="flex items-center gap-1.5 text-primary font-bold">
            <Crosshair className="w-3.5 h-3.5" />
            <span>WGS84:</span>
          </div>
          <span>
            {cursorCoords[0].toFixed(4)}°N, {cursorCoords[1].toFixed(4)}°E
          </span>
          <div className="h-3 w-px bg-white/15" />
          <span className="text-muted-foreground">
            Thalweg: <strong className="text-sky-300">{cursorChainageKm} km</strong>
          </span>
          <div className="h-3 w-px bg-white/15 hidden sm:block" />
          <span className="text-muted-foreground hidden sm:inline">
            Datum: <strong className="text-emerald-300">PWD (+0.46m)</strong>
          </span>
        </div>
      </div>

      {/* 6. LEAFLET MAP CONTAINER */}
      <MapContainer
        key={`gis-map-v${mapKey}-${internalBasemap}`}
        center={[22.65, 89.56]}
        zoom={11}
        minZoom={9}
        maxZoom={16}
        maxBounds={[
          [21.50, 88.50],
          [24.20, 90.50],
        ]}
        maxBoundsViscosity={0.9}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", minHeight: "480px", background: "#0c1824" }}
      >
        <MapController
          coords={flyToCoords}
          zoom={12}
          regionBounds={activeRegion ? activeRegion.bounds : null}
          onCursorMove={handleCursorMove}
        />
        <ScaleControl position="bottomleft" imperial={false} metric={true} />

        {/* Base GIS TileLayer */}
        <TileLayer
          key={`tile-base-${currentTileConfig.name}`}
          attribution={currentTileConfig.attribution}
          url={currentTileConfig.base}
          subdomains={currentTileConfig.subdomains || "abc"}
          maxZoom={19}
        />

        {/* Reference Labels & Hydrography Layer (Satellite Hybrid) */}
        {currentTileConfig.ref && (
          <TileLayer
            key={`tile-ref-${currentTileConfig.ref}`}
            attribution=""
            url={currentTileConfig.ref}
            maxZoom={18}
            opacity={0.9}
            pane="overlayPane"
          />
        )}

        {/* ------------------------------------------------------------- */}
        {/* 5. KHULNA 5-TIER SALINITY RISK CHOROPLETH REGIONS            */}
        {/* ------------------------------------------------------------- */}
        {showRiskChoropleth &&
          KHULNA_UPAZILA_REGIONS.map((region) => {
            const isSelected = selectedRegionId === region.id;
            const isAnySelected = Boolean(selectedRegionId);
            const isOptedOut = isAnySelected && !isSelected;

            return (
              <Polygon
                key={region.id}
                positions={region.coordinates}
                pathOptions={{
                  fillColor: isOptedOut ? "#05070d" : region.fillColor,
                  fillOpacity: isSelected ? 0.65 : isOptedOut ? 0.72 : 0.40,
                  color: isSelected ? "#ffffff" : isOptedOut ? "#ffffff10" : region.color,
                  weight: isSelected ? 3.5 : isOptedOut ? 1 : 2,
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
                  <div className="flex flex-col space-y-1 p-1 min-w-[200px] text-foreground font-sans">
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-white">{region.name}</span>
                        <span className="text-[10px] text-muted-foreground">{region.bengaliName}</span>
                      </div>
                      <span
                        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-white shadow-sm"
                        style={{ backgroundColor: region.color }}
                      >
                        {region.riskTier}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-300 font-mono">
                      Avg Salinity: <strong className="text-white">{region.avgEc} dS/m</strong> &bull; Soil: <strong className="text-white">{region.soilEc} dS/m</strong>
                    </div>
                    <div className="text-[10px] text-amber-300 line-clamp-2">
                      {region.boroVulnerability}
                    </div>
                    <div className="text-[9px] text-cyan-300 font-mono pt-1 border-t border-white/10">
                      {isSelected ? "Click to deselect (View All)" : "Click to narrow down & opt out others"}
                    </div>
                  </div>
                </Tooltip>
              </Polygon>
            );
          })}

        {/* Active Region Center Pin */}
        {activeRegion && (
          <CircleMarker
            center={activeRegion.center}
            radius={7}
            pathOptions={{
              color: "#ffffff",
              fillColor: activeRegion.color,
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -10]}>
              <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-white bg-black/90 px-2 py-1 rounded-lg border border-white/30 shadow-2xl">
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: activeRegion.color }} />
                <span>{activeRegion.name}</span>
                <span className="text-[10px] px-1 py-0.2 rounded text-white" style={{ backgroundColor: activeRegion.color }}>
                  {activeRegion.riskTier}
                </span>
              </div>
            </Tooltip>
          </CircleMarker>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 6. COASTAL POLDER BOUNDARIES (GIS CADASTRE & EMBANKMENTS)     */}
        {/* ------------------------------------------------------------- */}
        {showPolders &&
          COASTAL_POLDERS.map((polder) => (
            <Polygon
              key={polder.id}
              positions={polder.coordinates}
              pathOptions={{
                color: polder.color,
                fillColor: polder.color,
                fillOpacity: polder.id === "sundarbans-boundary" ? 0.08 : 0.16,
                weight: polder.id === "sundarbans-boundary" ? 1.5 : 2.5,
                dashArray: polder.id === "sundarbans-boundary" ? "4, 4" : undefined,
              }}
              eventHandlers={{
                click: () => onSelectPolder && onSelectPolder(polder),
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-1 p-0.5">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-white">
                    <ShieldAlert className="w-3.5 h-3.5" style={{ color: polder.color }} />
                    <span>{polder.name}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Upazila: <span className="text-white">{polder.upazila}</span> &bull; Area:{" "}
                    <span className="text-white">{polder.areaKm2} km²</span> &bull; Elev:{" "}
                    <span className="text-white">{polder.elevationM}m PWD</span>
                  </div>
                  <div className="text-[10px] text-amber-300 font-medium">
                    {polder.salinityRisk}
                  </div>
                </div>
              </Tooltip>
            </Polygon>
          ))}

        {/* ------------------------------------------------------------- */}
        {/* 7. PASSUR-RUPSHA CURVILINEAR THALWEG CENTERLINE & MILEPOSTS   */}
        {/* ------------------------------------------------------------- */}
        {showThalweg && (
          <>
            <Polyline
              positions={PASSUR_RUPSHA_THALWEG}
              pathOptions={{
                color: "#38bdf8",
                weight: 4,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
              }}
            >
              <Tooltip sticky>
                <span className="font-mono text-sky-300 font-bold text-xs">
                  Passur-Rupsha Curvilinear Thalweg (SWORD Centerline: 0 - 82 km)
                </span>
              </Tooltip>
            </Polyline>

            {/* Thalweg Chainage Milestones */}
            {THALWEG_MILESTONES.map((m) => (
              <CircleMarker
                key={m.label}
                center={m.coords}
                radius={4}
                pathOptions={{
                  color: "#ffffff",
                  fillColor: "#0284c7",
                  fillOpacity: 1,
                  weight: 2,
                }}
              >
                <Tooltip permanent={false}>
                  <span className="font-mono text-[10px] font-bold text-sky-200">
                    Chainage: {m.label}
                  </span>
                </Tooltip>
              </CircleMarker>
            ))}
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 8. POLDER SLUICE FLAP-GATES (GRAVITY DRAINAGE HYDRAULICS)    */}
        {/* ------------------------------------------------------------- */}
        {POLDER_SLUICE_GATES.map((gate) => (
          <Marker
            key={gate.id}
            position={gate.coords}
            icon={L.divIcon({
              className: "sluice-gate-icon",
              html: `
                <div style="width:18px;height:18px;background:#f59e0b;border:2px solid #ffffff;border-radius:4px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.7);cursor:pointer;" title="${gate.name}">
                  <div style="width:6px;height:6px;background:#05070d;border-radius:1px;"></div>
                </div>
              `,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            })}
          >
            <Tooltip sticky>
              <div className="flex flex-col space-y-0.5 text-xs">
                <span className="font-mono font-bold text-amber-400">{gate.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {gate.polder} &bull; Status: <strong className="text-white">{gate.status}</strong>
                </span>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {/* ------------------------------------------------------------- */}
        {/* 9. NASA SWOT 120-KM WIDE-SWATH KA-BAND RADAR ORBIT FOOTPRINT  */}
        {/* ------------------------------------------------------------- */}
        {showSwot && (
          <>
            {/* Left KaRIn 50km Radar Swath */}
            <Polygon
              positions={SWOT_LEFT_SWATH}
              pathOptions={{
                color: "#06b6d4",
                fillColor: "#06b6d4",
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: "6, 8",
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5">
                  <span className="font-bold text-cyan-400 font-mono">
                    NASA SWOT KaRIn Swath (West Channel - 50 km)
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Ka-band Radar Interferometry @ 35.75 GHz | 20m Pixel Scale
                  </span>
                </div>
              </Tooltip>
            </Polygon>

            {/* Right KaRIn 50km Radar Swath */}
            <Polygon
              positions={SWOT_RIGHT_SWATH}
              pathOptions={{
                color: "#06b6d4",
                fillColor: "#06b6d4",
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: "6, 8",
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5">
                  <span className="font-bold text-cyan-400 font-mono">
                    NASA SWOT KaRIn Swath (East Channel - 50 km)
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Measuring River Elevation &amp; Hydraulic Slope S₀ across Delta
                  </span>
                </div>
              </Tooltip>
            </Polygon>

            {/* Sub-Satellite Nadir Ground Track */}
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
                <span className="font-mono text-cyan-300 font-bold">
                  SWOT Sub-Satellite Nadir Ground Track (Orbit #22)
                </span>
              </Tooltip>
            </Polyline>
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 10. ESTUARINE SALINITY INGRESS CORRIDORS                      */}
        {/* ------------------------------------------------------------- */}
        {showSalinityFront && (
          <>
            {/* Marine Tidal Ingress Vector: Bay of Bengal -> Mongla Port (>7.0 dS/m) */}
            <Polyline
              positions={PASSUR_MARINE_INGRESS_CORRIDOR}
              pathOptions={{
                color: "#f43f5e",
                weight: 5.5,
                opacity: 0.95,
                lineCap: "round",
              }}
              eventHandlers={{
                click: () => onSelectCorridor && onSelectCorridor("Passur"),
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-bold text-rose-400 font-mono">
                      Passur Hyper-Saline Marine Front (&gt;7.0 dS/m)
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Direct Bay of Bengal tidal surge entering Mongla Port &amp; Sundarbans
                  </span>
                </div>
              </Tooltip>
            </Polyline>

            {/* Transitional Salinity Front: Mongla -> Rampal -> Khulna City (4.0 - 7.0 dS/m) */}
            <Polyline
              positions={PASSUR_TRANSITION_CORRIDOR}
              pathOptions={{
                color: "#f59e0b",
                weight: 4.5,
                opacity: 0.95,
                lineCap: "round",
              }}
              eventHandlers={{
                click: () => onSelectCorridor && onSelectCorridor("Rupsha"),
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-bold text-amber-400 font-mono">
                      Rupsha Salinity Hazard Transition (4.0 - 7.0 dS/m)
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Breaches 4.0 dS/m Boro Rice safety threshold up to Khulna WASA Intake
                  </span>
                </div>
              </Tooltip>
            </Polyline>

            {/* Northern Gorai Dilution Flush (<2.5 dS/m) */}
            <Polyline
              positions={RUPSHA_FRESHWATER_DILUTION}
              pathOptions={{
                color: "#10b981",
                weight: 4,
                opacity: 0.85,
                lineCap: "round",
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5">
                  <span className="font-bold text-emerald-400 font-mono">
                    Freshwater Dilution Head (&lt;2.5 dS/m)
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Upstream Gorai-Bhairab freshwater pushing back tidal salinity
                  </span>
                </div>
              </Tooltip>
            </Polyline>

            {/* Western Shibsa Estuarine Corridor */}
            <Polyline
              positions={SHIBSA_WESTERN_CORRIDOR}
              pathOptions={{
                color: "#38bdf8",
                weight: 4,
                opacity: 0.9,
                lineCap: "round",
              }}
              eventHandlers={{
                click: () => onSelectCorridor && onSelectCorridor("Shibsa"),
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5">
                  <span className="font-bold text-sky-400 font-mono">
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
        {/* 11. 4.0 dS/m BORO RICE AGRICULTURAL HAZARD ISOHALINE          */}
        {/* ------------------------------------------------------------- */}
        {showIsohalines && (
          <Circle
            center={[22.58, 89.58]}
            radius={8500}
            pathOptions={{
              color: "#f59e0b",
              fillColor: "#f59e0b",
              fillOpacity: 0.08,
              weight: 2,
              dashArray: "5, 8",
            }}
          >
            <Tooltip sticky>
              <div className="flex flex-col space-y-0.5">
                <span className="font-bold text-amber-400 font-mono">
                  4.0 dS/m Agricultural Danger Isohaline
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Inundation of polders inside this zone causes severe Boro rice sterilization
                </span>
              </div>
            </Tooltip>
          </Circle>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 12. GIS STATION MARKERS & SATELLITE REACH BEACONS             */}
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
            site.id,
            showLabels
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
              <Popup className="custom-gis-popup">
                <div className="flex flex-col space-y-3 p-1 min-w-[270px] text-foreground font-sans">
                  {/* Popup Header with Agency & Status Pill */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-1.5">
                      {isSwot ? (
                        <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                      ) : isIntake ? (
                        <Droplets className="w-3.5 h-3.5 text-pink-400" />
                      ) : (
                        <Radio className="w-3.5 h-3.5 text-sky-400" />
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
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : risk === "WARNING"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      {risk}
                    </span>
                  </div>

                  {/* Station Name & Coordinates */}
                  <div className="flex flex-col space-y-0.5">
                    <h4 className="font-bold text-white text-sm leading-snug">
                      {site.name}
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ID: {site.id} &bull; River: {site.river || "Khulna Estuary"} &bull; {site.distanceKm || 50} km to Sea
                    </span>
                    <span className="text-[9px] text-muted-foreground/75 font-mono">
                      GPS: {site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°E
                    </span>
                  </div>

                  {/* Telemetry KPI Box */}
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {forecast ? "PINN Forward Forecast:" : "Baseline Salinity (EC):"}
                      </span>
                      <span className="font-mono text-base font-bold text-white">
                        {displayVal}
                      </span>
                    </div>

                    {/* Hazard Meter Bar vs 4.0 dS/m Limit */}
                    <div className="flex flex-col space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
                        <span>Safe (&lt;2.5)</span>
                        <span className="text-amber-400">Hazard: 4.0</span>
                        <span className="text-rose-400">Acute (&gt;7.0)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
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
                    <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-[10px] text-rose-300 font-mono">
                      &bull; {site.intakeHazard}
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {site.description}
                  </p>

                  {/* Action Shortcuts */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <button
                      onClick={() => onSelectSite && onSelectSite(site)}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>GIS Feature Dossier</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <a
                      href={`/app/reaches/${site.id}`}
                      className="text-[10px] text-muted-foreground hover:text-white flex items-center gap-1"
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
