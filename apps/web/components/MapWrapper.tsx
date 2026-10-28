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
  Tooltip,
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
} from "lucide-react";

export * from "./map-data";
import {
  Site,
  Forecast,
  MapWrapperProps,
  CANONICAL_KHULNA_STATIONS,
  PASSUR_MARINE_INGRESS_CORRIDOR,
  PASSUR_TRANSITION_CORRIDOR,
  RUPSHA_FRESHWATER_DILUTION,
  SHIBSA_WESTERN_CORRIDOR,
  SWOT_LEFT_SWATH,
  SWOT_RIGHT_SWATH,
  SWOT_NADIR_GROUND_TRACK,
  BASEMAP_TILES,
} from "./map-data";

// -------------------------------------------------------------
// 5. MAP CONTROLLER & CURSOR TELEMETRY TRACKER
// -------------------------------------------------------------
function MapController({
  coords,
  zoom,
  onCursorMove,
}: {
  coords: [number, number] | null;
  zoom: number;
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

  useEffect(() => {
    if (coords && coords[0] && coords[1] && map) {
      try {
        map.flyTo(coords, zoom, { duration: 1.2, easeLinearity: 0.25 });
      } catch {
        // Prevent unmounted map crash during animation/HMR
      }
    }
  }, [coords, zoom, map]);

  return null;
}

// -------------------------------------------------------------
// 6. MULTI-LAYER BEACON CREATOR WITH ANIMATED GLOW RINGS
// -------------------------------------------------------------
const createTacticalBeaconIcon = (
  category: "swot" | "gauge" | "intake",
  risk: string,
  isSelected: boolean,
  displayValue: string,
  stationCode: string
) => {
  const isCrit = risk === "CRITICAL";
  const isWarn = risk === "WARNING";
  
  // High-contrast neon radar palette
  const accentColor = isCrit
    ? "#f43f5e" // Vivid Neon Rose
    : isWarn
    ? "#f59e0b" // Vivid Amber
    : category === "swot"
    ? "#06b6d4" // Electric Cyan (NASA SWOT)
    : category === "intake"
    ? "#ec4899" // Hot Pink (Municipal Intake)
    : "#38bdf8"; // Sky Blue (BWDB Gauge)

  const pingClass = isCrit
    ? "beacon-ping-critical"
    : isWarn
    ? "beacon-ping-warning"
    : "beacon-ping-nominal";

  // Specialized SVG glyphs
  const glyph =
    category === "swot" ? (
      // Hexagonal Satellite Dish
      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
        <circle cx="12" cy="12" r="3.5" fill="${accentColor}" fill-opacity="0.3"/>
      </svg>`
    ) : category === "intake" ? (
      // Drinking Water Shield / Drop
      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" fill="${accentColor}" fill-opacity="0.25"/>
      </svg>`
    ) : (
      // BWDB Telemetry Sonar Ring
      `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="8" stroke-dasharray="2 3"/>
        <circle cx="12" cy="12" r="3" fill="${accentColor}"/>
      </svg>`
    );

  const borderRadius = category === "swot" ? "8px" : category === "intake" ? "10px" : "50%";
  const isSelectedStyle = isSelected
    ? `box-shadow: 0 0 0 4px ${accentColor}50, 0 0 24px ${accentColor}; transform: scale(1.15);`
    : `box-shadow: 0 0 12px ${accentColor}60;`;

  return L.divIcon({
    className: "tactical-beacon-icon",
    html: `
      <div style="position:relative;display:inline-flex;align-items:center;cursor:pointer;filter:drop-shadow(0 6px 14px rgba(0,0,0,0.8));">
        
        <!-- Animated Radar Sonar Ring -->
        <div class="${pingClass}" style="position:absolute;left:2px;top:2px;width:26px;height:26px;border-radius:${borderRadius};pointer-events:none;"></div>
        
        <!-- Hardware Core Island -->
        <div style="width:30px;height:30px;border-radius:${borderRadius};background:#05070d;border:2px solid ${accentColor};display:flex;align-items:center;justify-content:center;color:${accentColor};${isSelectedStyle}transition:all 0.3s cubic-bezier(0.16,1,0.3,1);z-index:2;flex-shrink:0;">
          ${glyph}
        </div>

        <!-- Telemetry Data Pill Badge -->
        ${
          displayValue
            ? `
          <div style="margin-left:6px;padding:2.5px 8px;border-radius:8px;background:rgba(5,7,13,0.88);border:1px solid ${accentColor}80;color:#f1f6f8;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;font-weight:700;letter-spacing:-0.02em;white-space:nowrap;backdrop-filter:blur(12px);box-shadow:0 4px 12px rgba(0,0,0,0.6);display:flex;align-items:center;gap:4px;z-index:1;">
            <span style="width:4.5px;height:4.5px;border-radius:50%;background:${accentColor};display:inline-block;"></span>
            <span>${displayValue}</span>
          </div>
        `
            : ""
        }
      </div>
    `,
    iconSize: [95, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -20],
  });
};

// -------------------------------------------------------------
// 7. MAIN HIGH-PRECISION MAP WRAPPER COMPONENT
// -------------------------------------------------------------
export default function MapWrapper({
  selectedSiteId,
  onSelectSite,
  showSwot = true,
  showGauges = true,
  showSalinityFront = true,
  showIsohalines = true,
  basemap = "dark",
  horizon = "now",
  searchQuery = "",
  riskFilter = "all",
  flyToCoords = null,
  onSelectCorridor,
}: MapWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [sites, setSites] = useState<Site[]>(CANONICAL_KHULNA_STATIONS);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [cursorCoords, setCursorCoords] = useState<[number, number]>([22.65, 89.56]);
  const [activeSwathDetails, setActiveSwathDetails] = useState<boolean>(false);
  const [activeLayerMode, setActiveLayerMode] = useState<"all" | "swot" | "salinity">("all");

  useEffect(() => {
    setMounted(true);
    setMapKey((k) => k + 1);
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

    Promise.all([
      fetch(`${API_URL}/api/v1/reaches`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/api/v1/reaches/forecasts/all`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([loadedSites, loadedForecasts]) => {
      if (loadedSites && loadedSites.length > 0) {
        // Merge with canonical stations so no critical telemetry is lost
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

  // Filter sites strictly to Khulna Geographic Envelope (22.25°N to 23.95°N, 89.00°E to 89.95°E)
  const khulnaSites = useMemo(() => {
    return sites.filter((site) => {
      const inEnvelope =
        site.latitude >= 22.20 &&
        site.latitude <= 23.95 &&
        site.longitude >= 89.00 &&
        site.longitude <= 89.95;
      if (!inEnvelope) return false;

      const isSwot = site.category === "swot" || site.id.startsWith("3124") || site.id.toLowerCase().includes("swot");
      if (isSwot && !showSwot) return false;
      if (!isSwot && !showGauges) return false;

      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = site.name.toLowerCase().includes(q);
        const matchesId = site.id.toLowerCase().includes(q);
        const matchesDesc = (site.description || "").toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDesc) return false;
      }

      // Risk level filter
      const forecast = forecastMap[site.id];
      const val = forecast?.value ?? site.baselineEc ?? 3.5;
      if (riskFilter === "critical" && val < 4.0) return false;
      if (riskFilter === "warning" && (val < 2.5 || val >= 4.0)) return false;
      if (riskFilter === "nominal" && val >= 2.5) return false;

      return true;
    });
  }, [sites, showSwot, showGauges, searchQuery, riskFilter, forecastMap]);

  // Micro-offset for co-located stations (e.g. SWOT Reach + BWDB Gauge at Mongla/Khulna)
  const placedSites = useMemo(() => {
    const locCount: Record<string, number> = {};
    return khulnaSites.map((site) => {
      const key = `${site.latitude.toFixed(2)}_${site.longitude.toFixed(2)}`;
      const index = locCount[key] || 0;
      locCount[key] = index + 1;

      if (index > 0) {
        const latOffset = (index % 2 === 1 ? -0.012 : 0.012) * Math.ceil(index / 2);
        const lonOffset = 0.015 * Math.ceil(index / 2);
        return {
          ...site,
          displayLat: site.latitude + latOffset,
          displayLon: site.longitude + lonOffset,
        };
      }
      return {
        ...site,
        displayLat: site.latitude,
        displayLon: site.longitude,
      };
    });
  }, [khulnaSites]);

  if (!mounted || mapKey === 0) {
    return (
      <div className="w-full h-full bg-[#05070d] flex items-center justify-center text-muted-foreground text-xs min-h-[480px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs uppercase tracking-wider text-primary">
            Initializing SWOT Satellite Radar Canvas...
          </span>
        </div>
      </div>
    );
  }

  const currentTileConfig = BASEMAP_TILES[basemap] || BASEMAP_TILES.dark;

  return (
    <div className="w-full h-full relative z-0 min-h-[480px] overflow-hidden select-none">
      {/* 1. EMBEDDED HAPTIC RADAR CSS & KEYFRAME ANIMATIONS */}
      <style>{`
        .leaflet-container {
          background-color: #05070d !important;
          font-family: inherit;
        }
        
        /* Animated flowing current lines */
        @keyframes tidalFlowInward {
          from { stroke-dashoffset: 240; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes tidalFlowOutward {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: 240; }
        }
        
        .animated-passur-marine {
          stroke-dasharray: 12 8;
          animation: tidalFlowInward 4s linear infinite;
          filter: drop-shadow(0 0 10px rgba(244, 63, 94, 0.9));
        }
        .animated-rupsha-transition {
          stroke-dasharray: 10 6;
          animation: tidalFlowInward 6s linear infinite;
          filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.9));
        }
        .animated-shibsa-western {
          stroke-dasharray: 8 6;
          animation: tidalFlowInward 7s linear infinite;
          filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.85));
        }
        .animated-gorai-freshwater {
          stroke-dasharray: 8 5;
          animation: tidalFlowOutward 8s linear infinite;
          filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.85));
        }

        /* Sci-Fi Sonar Radar Beacon Pings */
        @keyframes sonarPingCrit {
          0% { transform: scale(0.9); opacity: 0.9; }
          50% { transform: scale(1.8); opacity: 0.35; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes sonarPingWarn {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.6); opacity: 0.25; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes sonarPingNominal {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.9); opacity: 0; }
        }

        .beacon-ping-critical {
          border: 2px solid #f43f5e;
          animation: sonarPingCrit 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .beacon-ping-warning {
          border: 2px solid #f59e0b;
          animation: sonarPingWarn 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .beacon-ping-nominal {
          border: 2px solid #06b6d4;
          animation: sonarPingNominal 2.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        /* Glassmorphism Popups */
        .leaflet-popup-content-wrapper {
          background: rgba(8, 19, 31, 0.95) !important;
          color: #f1f6f8 !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          backdrop-filter: blur(24px) !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85) !important;
          border-radius: 20px !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip {
          background: rgba(8, 19, 31, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
        }
        .leaflet-popup-content {
          margin: 14px 16px !important;
          line-height: 1.4 !important;
        }
        .leaflet-popup-close-button {
          color: #94a3b8 !important;
          padding: 8px 10px !important;
          font-size: 16px !important;
        }
        .leaflet-popup-close-button:hover {
          color: #ffffff !important;
        }

        /* Tooltip styling */
        .leaflet-tooltip {
          background: rgba(5, 7, 13, 0.92) !important;
          color: #f8fafc !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          backdrop-filter: blur(12px) !important;
          border-radius: 10px !important;
          padding: 6px 10px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7) !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: rgba(5, 7, 13, 0.92) !important;
        }
      `}</style>

      {/* 2. TOP HUD: TACTICAL TELEMETRY STREAM & STATUS BAR */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        
        {/* Left: Basin Status Pill */}
        <div className="bg-[#08131f]/90 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-2xl flex items-center gap-3 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-white font-bold">
              SWOT Orbit 22.14 Synchronized
            </span>
          </div>

          <div className="h-3 w-px bg-white/15 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-[11px] text-muted-foreground font-mono">Max Ingress:</span>
            <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/30">
              7.9 dS/m (Mongla SW244)
            </span>
          </div>

          <div className="h-3 w-px bg-white/15 hidden md:block" />

          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-[11px] text-muted-foreground font-mono">WASA Intake:</span>
            <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
              4.6 dS/m (Caution)
            </span>
          </div>
        </div>

        {/* Right: Quick View Modes */}
        <div className="bg-[#08131f]/90 backdrop-blur-xl border border-white/15 px-2 py-1 rounded-2xl flex items-center gap-1 shadow-2xl pointer-events-auto">
          <button
            onClick={() => setActiveSwathDetails((prev) => !prev)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
              activeSwathDetails
                ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <Satellite className="w-3 h-3" />
            <span>SWOT 120km Swath</span>
          </button>
        </div>
      </div>

      {/* 3. BOTTOM-LEFT HUD: REAL-TIME CURSOR & HYDRODYNAMIC HEAD */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden md:flex flex-col space-y-1">
        <div className="bg-[#08131f]/90 backdrop-blur-xl border border-white/15 px-3 py-2 rounded-2xl shadow-2xl pointer-events-auto flex flex-col space-y-1 text-[11px] font-mono">
          <div className="flex items-center justify-between gap-4 text-muted-foreground">
            <span className="flex items-center gap-1 text-white">
              <Crosshair className="w-3 h-3 text-primary" />
              <span>RADAR POSITION:</span>
            </span>
            <span className="text-white font-bold">
              {cursorCoords[0].toFixed(4)}°N, {cursorCoords[1].toFixed(4)}°E
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[10px] text-muted-foreground border-t border-white/10 pt-1">
            <span>Datum: PWD (-0.46m EGM2008)</span>
            <span className="text-emerald-400">Tidal Ingress: +1.2 km/d</span>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM-RIGHT HUD: SALINITY GRADIENT COLORBAR SCALE */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none flex flex-col items-end space-y-2">
        <div className="bg-[#08131f]/95 backdrop-blur-xl border border-white/15 p-3 rounded-2xl shadow-2xl pointer-events-auto flex flex-col space-y-2 max-w-xs">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted-foreground font-bold">
            <span className="flex items-center gap-1 text-white">
              <Waves className="w-3 h-3 text-cyan-400" />
              <span>Salinity Hazard Gradient</span>
            </span>
            <span className="text-rose-400">4.0 dS/m Limit</span>
          </div>

          {/* Continuous Multi-Stop Gradient Bar */}
          <div className="w-48 sm:w-56 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-sky-400 via-amber-400 to-rose-600 shadow-inner border border-white/20" />

          {/* Calibration Marks */}
          <div className="flex justify-between text-[9px] font-mono text-muted-foreground px-0.5">
            <span className="text-emerald-400 font-bold">0.0 Fresh</span>
            <span className="text-sky-300">2.0 Safe</span>
            <span className="text-amber-400 font-bold">4.0 Hazard</span>
            <span className="text-rose-400 font-bold">8.0+ Marine</span>
          </div>
        </div>
      </div>

      {/* 5. LEAFLET MAP CONTAINER (REACT 19 PROTECTED WITH MAPKEY & PANE SAFETY) */}
      <MapContainer
        key={`khulna-map-v${mapKey}-${basemap}`}
        center={[22.65, 89.56]}
        zoom={11}
        minZoom={10}
        maxZoom={15}
        maxBounds={[
          [22.15, 88.85],
          [23.95, 90.15],
        ]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", minHeight: "480px", background: "#05070d" }}
      >
        <MapController coords={flyToCoords} zoom={12} onCursorMove={handleCursorMove} />

        {/* Base Cartographic Layer */}
        <TileLayer
          key={`tile-base-${currentTileConfig.base}`}
          attribution={currentTileConfig.attribution}
          url={currentTileConfig.base}
          maxZoom={19}
        />

        {/* Optional Reference Boundaries & Places */}
        {currentTileConfig.ref && (
          <TileLayer
            key={`tile-ref-${currentTileConfig.ref}`}
            attribution=""
            url={currentTileConfig.ref}
            maxZoom={18}
            opacity={0.85}
            pane="overlayPane"
          />
        )}

        {/* ------------------------------------------------------------- */}
        {/* 6. NASA SWOT 120-KM WIDE-SWATH KA-BAND RADAR ORBIT FOOTPRINT  */}
        {/* ------------------------------------------------------------- */}
        {(activeSwathDetails || showSwot) && (
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

            {/* Satellite Nadir Centerline Ground Track */}
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
        {/* 7. ANIMATED ESTUARINE SALINITY INGRESS CORRIDORS               */}
        {/* ------------------------------------------------------------- */}
        {showSalinityFront && (
          <>
            {/* Acute Marine Tidal Ingress Vector: Bay of Bengal -> Mongla Port (>7.0 dS/m) */}
            <Polyline
              positions={PASSUR_MARINE_INGRESS_CORRIDOR}
              className="animated-passur-marine"
              pathOptions={{
                color: "#f43f5e",
                weight: 6.5,
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
              className="animated-rupsha-transition"
              pathOptions={{
                color: "#f59e0b",
                weight: 5.5,
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
              className="animated-gorai-freshwater"
              pathOptions={{
                color: "#10b981",
                weight: 4.5,
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
              className="animated-shibsa-western"
              pathOptions={{
                color: "#38bdf8",
                weight: 4.5,
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
        {/* 8. 4.0 dS/m BORO RICE AGRICULTURAL HAZARD ISOHALINE           */}
        {/* ------------------------------------------------------------- */}
        {showIsohalines && (
          <Circle
            center={[22.58, 89.58]}
            radius={8500}
            pathOptions={{
              color: "#f59e0b",
              fillColor: "#f59e0b",
              fillOpacity: 0.09,
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
        {/* 9. TACTICAL STATION MARKERS & SATELLITE BEACONS               */}
        {/* ------------------------------------------------------------- */}
        {placedSites.map((site) => {
          const isSwot =
            site.category === "swot" ||
            site.id.startsWith("3124") ||
            site.id.toLowerCase().includes("swot");
          const isIntake = site.category === "intake" || site.id.includes("p14");
          const isSelected = selectedSiteId === site.id;
          const forecast = forecastMap[site.id];

          // Determine risk level based on forecast and lead horizon
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

          const markerIcon = createTacticalBeaconIcon(
            isSwot ? "swot" : isIntake ? "intake" : "gauge",
            risk,
            isSelected,
            displayVal,
            site.id
          );

          return (
            <Marker
              key={site.id}
              position={[site.displayLat, site.displayLon]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectSite) onSelectSite(site);
                },
                popupopen: () => {
                  if (onSelectSite) onSelectSite(site);
                },
              }}
            >
              <Popup className="custom-tactical-popup">
                <div className="flex flex-col space-y-3 p-1 min-w-[260px] text-foreground font-sans">
                  
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
                        {isSwot ? "NASA SWOT Reach" : isIntake ? "WASA Municipal Intake" : "BWDB Tidal Station"}
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
                  </div>

                  {/* Live Telemetry KPI Box */}
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
                            currentVal >= 4.0 ? "bg-rose-500" : currentVal >= 2.5 ? "bg-amber-400" : "bg-emerald-400"
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
                      <span>Studio Dossier</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <a
                      href={`/app/reaches/${site.id}`}
                      className="text-[10px] text-muted-foreground hover:text-white flex items-center gap-1"
                    >
                      <span>Audit Telemetry</span>
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
