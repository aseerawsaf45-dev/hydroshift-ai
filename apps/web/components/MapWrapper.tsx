"use client";

import { useState, useCallback, useRef, useEffect, startTransition, useSyncExternalStore } from "react";
import {
  MapContainer,
  ScaleControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Crosshair, ZoomIn, ZoomOut, Compass } from "lucide-react";

export * from "./map-data";
export * from "./gis-khulna-data";

import {
  MapWrapperProps,
  HydrologicDomain,
  COASTAL_POLDERS,
  PolderPolygon,
} from "./map-data";

import {
  KHULNA_STUDY_BOUNDS,
  KHULNA_STUDY_CENTER,
  KHULNA_GIS_UPAZILAS,
  KHULNA_GIS_RIVERS,
  KHULNA_GIS_STATIONS,
  GisUpazila,
  GisStation,
  getSalinityClassForEc,
  isInsideKhulnaStudyArea,
  findUpazilaAtCoordinates,
  findNearestGisStation,
} from "./gis-khulna-data";

import { StudyAreaLayer } from "./gis/StudyAreaLayer";
import { SalinityChoroplethLayer } from "./gis/SalinityChoroplethLayer";
import { SalinityRasterLayer } from "./gis/SalinityRasterLayer";
import { RiverLayer } from "./gis/RiverLayer";
import { PolderLayer } from "./gis/PolderLayer";
import { BangladeshBackgroundLayer } from "./gis/BangladeshBackgroundLayer";
import { ObservationLayer } from "./gis/ObservationLayer";
import { MapLegend } from "./gis/MapLegend";
import { FeatureInspector, ClickedEmptySpaceInfo } from "./gis/FeatureInspector";
import { MapToolbar } from "./gis/MapToolbar";
import { DataStatus } from "./gis/DataStatus";
import { BANGLADESH_NATIONAL_BOUNDS } from "./gis-bangladesh-data";

// -------------------------------------------------------------
// 1. LEAFLET CUSTOM PANES INITIALIZER (EXPLICIT Z-INDEX HIERARCHY)
// -------------------------------------------------------------
function LayerPanesInitializer() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const panes = [
      { name: "bangladeshPane", zIndex: 180 },
      { name: "rasterPane", zIndex: 220 },
      { name: "boundaryPane", zIndex: 250 },
      { name: "adminPane", zIndex: 300 },
      { name: "contoursPane", zIndex: 380 },
      { name: "riversPane", zIndex: 420 },
      { name: "stationsPane", zIndex: 520 },
      { name: "highlightPane", zIndex: 580 },
      { name: "labelsPane", zIndex: 620 },
    ];
    panes.forEach(({ name, zIndex }) => {
      if (!map.getPane(name)) {
        const p = map.createPane(name);
        p.style.zIndex = zIndex.toString();
      }
    });
  }, [map]);
  return null;
}

// -------------------------------------------------------------
// 2. INTERACTION CONTROLLER (FitBounds, Zoom, Pan, Empty-Click, InvalidateSize)
// -------------------------------------------------------------
interface MapControllerProps {
  resetTrigger: number;
  flyToBounds: [[number, number], [number, number]] | null;
  onEmptyMapClick: (info: ClickedEmptySpaceInfo) => void;
  mapRef: React.MutableRefObject<L.Map | null>;
}

function MapInteractionController({
  resetTrigger,
  flyToBounds,
  onEmptyMapClick,
  mapRef,
}: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      mapRef.current = map;
      map.invalidateSize();
      const container = map.getContainer();
      if (!container || typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(container);
      return () => ro.disconnect();
    }
  }, [map, mapRef]);

  useEffect(() => {
    if (resetTrigger > 0) {
      map.fitBounds(KHULNA_STUDY_BOUNDS, {
        padding: [30, 30],
        maxZoom: 11,
        animate: true,
      });
    }
  }, [resetTrigger, map]);

  useEffect(() => {
    if (flyToBounds) {
      map.fitBounds(flyToBounds, {
        padding: [45, 45],
        maxZoom: 12,
        animate: true,
      });
    }
  }, [flyToBounds, map]);

  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      const inside = isInsideKhulnaStudyArea(lat, lon);
      const parent = findUpazilaAtCoordinates(lat, lon);
      const nearest = findNearestGisStation(lat, lon);

      onEmptyMapClick({
        lat,
        lon,
        insideBoundary: inside,
        parentUpazila: parent,
        nearestStation: nearest,
      });
    },
  });

  return null;
}

// -------------------------------------------------------------
// ISOLATED CURSOR COORDINATES HUD (PREVENTS FULL COMPONENT RE-RENDERS)
// -------------------------------------------------------------
function CursorCoordinatesHUD({ isAcademic }: { isAcademic: boolean }) {
  const [coords, setCoords] = useState<[number, number]>(KHULNA_STUDY_CENTER);

  useMapEvents({
    mousemove(e) {
      setCoords([e.latlng.lat, e.latlng.lng]);
    },
  });

  return (
    <div className="absolute bottom-3 right-4 z-[500] pointer-events-none hidden sm:flex flex-col space-y-1">
      <div
        className={`px-3 py-1.5 rounded-xl shadow-xl pointer-events-auto flex items-center gap-3 text-[11px] font-mono border ${
          isAcademic
            ? "bg-white/95 text-slate-800 border-slate-300"
            : "bg-[#08131f]/95 text-white/90 border-white/15 backdrop-blur-xl"
        }`}
      >
        <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
          <Crosshair className="w-3.5 h-3.5" />
          <span>WGS84:</span>
        </div>
        <span>
          {coords[0].toFixed(4)}°N, {coords[1].toFixed(4)}°E
        </span>
        <div className="h-3 w-px bg-slate-300 dark:bg-white/15" />
        <span className="text-muted-foreground">
          Study Area: <strong className="text-emerald-600 dark:text-emerald-400">Khulna District</strong>
        </span>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DYNAMIC LEAFLET-ALIGNED GRATICULE TICKS (PANS & ZOOMS IN REAL TIME)
// -------------------------------------------------------------
function DynamicGraticuleHUD({ isAcademic }: { isAcademic: boolean }) {
  const map = useMap();
  const [ticks, setTicks] = useState<{ lats: number[]; lons: number[] }>(() => ({
    lats: [23.00, 22.80, 22.60, 22.40, 22.20],
    lons: [89.20, 89.35, 89.50, 89.65, 89.80],
  }));

  const updateTicks = useCallback(() => {
    if (!map) return;
    try {
      const b = map.getBounds();
      const south = b.getSouth();
      const north = b.getNorth();
      const west = b.getWest();
      const east = b.getEast();

      const latSpan = north - south;
      const lonSpan = east - west;

      const lats = [0.1, 0.3, 0.5, 0.7, 0.9].map((f) => Number((north - f * latSpan).toFixed(2)));
      const lons = [0.1, 0.3, 0.5, 0.7, 0.9].map((f) => Number((west + f * lonSpan).toFixed(2)));

      setTicks({ lats, lons });
    } catch {
      // safe fallback
    }
  }, [map]);

  useMapEvents({
    moveend: updateTicks,
    zoomend: updateTicks,
  });

  useEffect(() => {
    updateTicks();
  }, [updateTicks]);

  return (
    <>
      {/* Top Longitude Bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-[490] pointer-events-none flex justify-between px-16 py-0.5 text-[9px] font-mono font-bold tracking-tight border-b ${
          isAcademic
            ? "bg-white/90 text-slate-800 border-slate-300"
            : "bg-black/60 text-zinc-300 border-white/10"
        }`}
      >
        {ticks.lons.map((lon, i) => (
          <span key={`lon-${i}`}>{lon}°E</span>
        ))}
      </div>

      {/* Left Latitude Bar */}
      <div
        className={`absolute top-8 bottom-16 left-0 z-[490] pointer-events-none flex flex-col justify-between py-6 px-1 text-[9px] font-mono font-bold tracking-tight border-r ${
          isAcademic
            ? "bg-white/80 text-slate-800 border-slate-300"
            : "bg-black/40 text-zinc-300 border-white/10"
        }`}
      >
        {ticks.lats.map((lat, i) => (
          <span key={`lat-${i}`}>{lat}°N</span>
        ))}
      </div>
    </>
  );
}

// Safe hydration mount hook without setState in effect
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// -------------------------------------------------------------
// 3. MAIN SCIENTIFIC KHULNA GIS MAP COMPONENT
// -------------------------------------------------------------
export default function MapWrapper({
  selectedSiteId,
  onSelectSite,
  selectedRegionId = null,
  onSelectRegion,
  hydrologicDomain = "river",
  onSelectDomain,
  showRiskChoropleth = true,
  showGauges = true,
  showLabels = true,
  showRivers = true,
  showPolders = true,
  onSelectPolder,
  showGraticule = true,
  showRasterOverlay = true,
  showIsohalines = true,
  rasterOpacity,
  basemap = "academic",
  flyToCoords = null,
  compactLegend = false,
  standaloneTitle,
  salinityUnit = "dS/m",
  showToolbar = false,
  goraiFlowDelta = 0,
  tidalSurge = 0,
  showBangladeshBackground = true,
}: MapWrapperProps) {
  const mounted = useIsMounted();

  // Active variable selection (controlled with fallback to prop)
  const [userSelectedVariable, setUserSelectedVariable] = useState<string | null>(null);
  const activeVariable = userSelectedVariable ?? (hydrologicDomain || "river");

  // Keep userSelectedVariable synced whenever hydrologicDomain prop updates
  useEffect(() => {
    if (hydrologicDomain) {
      setUserSelectedVariable(hydrologicDomain);
    }
  }, [hydrologicDomain]);

  const [selectedUpazila, setSelectedUpazila] = useState<GisUpazila | null>(null);
  const [selectedStation, setSelectedStation] = useState<GisStation | null>(null);
  const [clickedEmptySpace, setClickedEmptySpace] = useState<ClickedEmptySpaceInfo | null>(null);
  const [flyToBounds, setFlyToBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Layer toggles (stateful with prop fallbacks)
  const [showBoundary, setShowBoundary] = useState(false);
  const [userShowRaster, setUserShowRaster] = useState<boolean | null>(null);
  const [userShowContours, setUserShowContours] = useState<boolean | null>(null);
  const [userShowChoropleth, setUserShowChoropleth] = useState<boolean | null>(null);
  const [userShowRivers, setUserShowRivers] = useState<boolean | null>(null);
  const [userShowStations, setUserShowStations] = useState<boolean | null>(null);
  const [userShowLabels, setUserShowLabels] = useState<boolean | null>(null);
  const [userBasemapAcademic, setUserBasemapAcademic] = useState<boolean | null>(null);
  const [userShowBangladesh, setUserShowBangladesh] = useState<boolean | null>(null);
  const [isNationalView, setIsNationalView] = useState(false);

  const internalShowRaster = userShowRaster ?? showRasterOverlay;
  const internalShowContours = userShowContours ?? showIsohalines;
  const internalShowChoropleth = userShowChoropleth ?? showRiskChoropleth;
  const internalShowRivers = userShowRivers ?? showRivers;
  const internalShowStations = userShowStations ?? showGauges;
  const internalShowLabels = userShowLabels ?? showLabels;
  const isAcademic = userBasemapAcademic ?? (basemap !== "radar");
  const internalShowBangladesh = userShowBangladesh ?? showBangladeshBackground;

  const mapInstanceRef = useRef<L.Map | null>(null);

  // Sync external selectedRegionId in async transition
  useEffect(() => {
    startTransition(() => {
      if (selectedRegionId) {
        const found = KHULNA_GIS_UPAZILAS.find((u) => u.id === selectedRegionId);
        setSelectedUpazila(found || null);
        if (found) setFlyToBounds(found.bounds);
      } else {
        setSelectedUpazila(null);
      }
    });
  }, [selectedRegionId]);

  // Sync external selectedSiteId in async transition
  useEffect(() => {
    startTransition(() => {
      if (selectedSiteId) {
        const found = KHULNA_GIS_STATIONS.find((s) => s.id === selectedSiteId);
        setSelectedStation(found || null);
        if (found) {
          setFlyToBounds([
            [found.latitude - 0.04, found.longitude - 0.04],
            [found.latitude + 0.04, found.longitude + 0.04],
          ]);
        }
      } else {
        setSelectedStation(null);
      }
    });
  }, [selectedSiteId]);

  // Sync flyToCoords in async transition
  useEffect(() => {
    startTransition(() => {
      if (flyToCoords) {
        setFlyToBounds([
          [flyToCoords[0] - 0.04, flyToCoords[1] - 0.04],
          [flyToCoords[0] + 0.04, flyToCoords[1] + 0.04],
        ]);
      }
    });
  }, [flyToCoords]);

  const handleSelectVariable = useCallback(
    (v: string) => {
      setUserSelectedVariable(v);
      if (
        onSelectDomain &&
        (v === "river" || v === "shallow_gw" || v === "deep_gw" || v === "risk")
      ) {
        onSelectDomain(v as HydrologicDomain);
      }
    },
    [onSelectDomain]
  );

  const handleSelectUpazila = useCallback(
    (u: GisUpazila | null) => {
      setSelectedUpazila(u);
      setClickedEmptySpace(null);
      if (u) {
        setSelectedStation(null);
        setFlyToBounds(u.bounds);
      } else {
        setFlyToBounds(null);
      }

      if (onSelectRegion) {
        if (!u) {
          onSelectRegion(null);
        } else {
          onSelectRegion({
            id: u.id,
            name: u.name,
            bengaliName: u.bengaliName,
            riskTier: u.period3Ec >= 12 ? "Very High" : u.period3Ec >= 8 ? "High" : u.period3Ec >= 4 ? "Moderate" : "Low",
            color: getSalinityClassForEc(u.period3Ec).color,
            fillColor: getSalinityClassForEc(u.period3Ec).color,
            avgEc: u.period3Ec,
            soilEc: u.period3Ec,
            areaKm2: u.areaKm2,
            population: 200000,
            polders: [],
            intakeRisk: "Estuarine salinity intrusion risk",
            boroVulnerability: "High salinity impact on Boro crops",
            sluiceAdvisory: "Manage intake sluices based on tidal salinity",
            recommendedCrops: u.recommendedCrops,
            associatedStationIds: [],
            bounds: u.bounds,
            center: u.center,
            coordinates: u.coordinates,
            riverSalinityPpt: u.riverEc,
            shallowGwSalinityPpt: u.shallowGwEc,
            deepGwSalinityPpt: u.deepGwEc,
            aquiferDepthM: u.aquiferDepthM,
            drinkingSafety: "Deep aquifer extraction recommended",
            hydrogeologySummary: "Khulna delta estuarine plain",
          });
        }
      }
    },
    [onSelectRegion]
  );

  const handleSelectStation = useCallback(
    (s: GisStation | null) => {
      setSelectedStation(s);
      setClickedEmptySpace(null);
      if (s) {
        setSelectedUpazila(null);
        setFlyToBounds([
          [s.latitude - 0.04, s.longitude - 0.04],
          [s.latitude + 0.04, s.longitude + 0.04],
        ]);
      } else {
        setFlyToBounds(null);
      }

      if (onSelectSite) {
        if (!s) {
          onSelectSite(null);
        } else {
          onSelectSite({
            id: s.id,
            name: s.name,
            latitude: s.latitude,
            longitude: s.longitude,
            description: `${s.stationType} on ${s.river}. Mean observed EC: ${s.ecMean.toFixed(2)} dS/m.`,
            river: s.river,
            category: s.id.includes("SWOT") ? "swot" : s.id.includes("p14") ? "intake" : "gauge",
            baselineEc: s.ecMean,
            wsePwd: s.wsePwd,
            distanceKm: s.distanceKm,
          });
        }
      }
    },
    [onSelectSite]
  );

  const handleEmptyMapClick = useCallback((info: ClickedEmptySpaceInfo) => {
    setSelectedUpazila(null);
    setSelectedStation(null);
    setClickedEmptySpace(info);
    if (onSelectRegion) onSelectRegion(null);
    if (onSelectSite) onSelectSite(null);
  }, [onSelectRegion, onSelectSite]);

  const handleClearSelection = useCallback(() => {
    setSelectedUpazila(null);
    setSelectedStation(null);
    setClickedEmptySpace(null);
    setFlyToBounds(null);
    if (onSelectRegion) onSelectRegion(null);
    if (onSelectSite) onSelectSite(null);
  }, [onSelectRegion, onSelectSite]);

  const handleResetExtent = useCallback(() => {
    handleClearSelection();
    setIsNationalView(false);
    setResetTrigger((t) => t + 1);
  }, [handleClearSelection]);

  const handleZoomIn = useCallback(() => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  }, []);

  const handleExportMap = useCallback(() => {
    window.print();
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[480px] bg-[#f8fafc] dark:bg-[#08131f] flex items-center justify-center text-xs text-muted-foreground font-mono">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Offline Khulna GIS...</span>
        </div>
      </div>
    );
  }

  const waterColor = isAcademic ? "#ffffff" : "#050a12";

  return (
    <div className={`w-full h-full relative z-0 min-h-[480px] overflow-hidden select-none border-2 transition-colors ${
      isAcademic ? "border-slate-900 bg-white" : "border-slate-700 bg-[#050a12]"
    }`}>
      {/* 1. GIS CSS STYLES */}
      <style>{`
        .leaflet-container {
          background-color: ${waterColor} !important;
          font-family: inherit;
        }
        .custom-gis-popup .leaflet-popup-content-wrapper {
          background: ${isAcademic ? "rgba(255, 255, 255, 0.98)" : "rgba(8, 19, 31, 0.96)"} !important;
          color: ${isAcademic ? "#0f172a" : "#f1f6f8"} !important;
          border: 1px solid ${isAcademic ? "rgba(0,0,0,0.15)" : "rgba(255, 255, 255, 0.15)"} !important;
          border-radius: 14px !important;
          box-shadow: 0 12px 30px -5px rgba(0,0,0,0.4) !important;
          padding: 0 !important;
        }
        .custom-gis-popup .leaflet-popup-tip {
          background: ${isAcademic ? "rgba(255, 255, 255, 0.98)" : "rgba(8, 19, 31, 0.96)"} !important;
        }
        .custom-gis-popup .leaflet-popup-content {
          margin: 12px !important;
        }
        .leaflet-tooltip {
          background: ${isAcademic ? "rgba(255, 255, 255, 0.96)" : "rgba(8, 19, 31, 0.94)"} !important;
          color: ${isAcademic ? "#0f172a" : "#f8fafc"} !important;
          border: 1px solid ${isAcademic ? "rgba(0,0,0,0.15)" : "rgba(255, 255, 255, 0.18)"} !important;
          border-radius: 8px !important;
          font-size: 11px !important;
        }
        .upazila-center-label, .river-centerline-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* 2. DYNAMIC GEOGRAPHIC GRATICULE TICKS - Rendered inside MapContainer with real Leaflet WGS84 coordinates */}

      {/* Standalone Title Badge (e.g. for comparative triptych view) */}
      {standaloneTitle && (
        <div className="absolute top-2 left-3 z-[500] pointer-events-none">
          <div
            className={`px-3 py-1 rounded-lg text-xs font-serif font-bold border shadow-lg ${
              isAcademic
                ? "bg-white/95 text-slate-900 border-slate-300 shadow-slate-300/40"
                : "bg-[#08131f]/95 text-white border-white/20 backdrop-blur-md shadow-black/60"
            }`}
          >
            {standaloneTitle}
          </div>
        </div>
      )}

      {/* 3. OFFLINE STATUS BADGE */}
      <DataStatus isAcademic={isAcademic} />

      {/* 3b. FLOATING EXTENT & ZOOM DOCK (ALWAYS AVAILABLE WHEN TOOLBAR IS HIDDEN) */}
      {!showToolbar && (
        <div className="absolute top-10 left-3 z-[495] pointer-events-auto flex flex-col gap-1.5 animate-in fade-in duration-300">
          <button
            onClick={handleResetExtent}
            className={`p-2 rounded-xl shadow-xl border flex flex-col items-center gap-0.5 transition-all cursor-pointer group ${
              isAcademic
                ? "bg-white/95 text-slate-800 border-slate-300 hover:border-sky-500 hover:bg-slate-50 shadow-slate-400/20"
                : "bg-[#08131f]/95 text-white border-white/20 hover:border-sky-400 hover:bg-[#0c1b2b] backdrop-blur-xl shadow-black/50"
            }`}
            title="Reset camera to Khulna District extent"
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

          {/* National Bangladesh vs Regional Khulna Extent Switcher */}
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                if (isNationalView) {
                  mapInstanceRef.current.fitBounds(KHULNA_STUDY_BOUNDS, { padding: [30, 30], animate: true });
                  setIsNationalView(false);
                } else {
                  mapInstanceRef.current.fitBounds(BANGLADESH_NATIONAL_BOUNDS, { padding: [25, 25], animate: true });
                  setIsNationalView(true);
                }
              }
            }}
            className={`p-1.5 rounded-xl shadow-xl border flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              isNationalView
                ? "bg-emerald-500 text-black border-emerald-400 font-bold"
                : isAcademic
                ? "bg-white/95 text-slate-800 border-slate-300 hover:border-emerald-500 shadow-slate-400/20"
                : "bg-[#08131f]/95 text-white border-white/20 hover:border-emerald-400 backdrop-blur-xl shadow-black/50"
            }`}
            title={isNationalView ? "Zoom back to Khulna District Study Basin" : "Zoom out to Full Bangladesh National Territory"}
          >
            <span className="text-[9px] font-mono font-bold tracking-tight">
              {isNationalView ? "KHULNA" : "BD MAP"}
            </span>
            <span className="text-[7.5px] font-mono uppercase text-muted-foreground">
              {isNationalView ? "Study Basin" : "National"}
            </span>
          </button>

          <div
            className={`rounded-xl shadow-xl border flex flex-col overflow-hidden ${
              isAcademic
                ? "bg-white/95 border-slate-300 text-slate-800 divide-y divide-slate-200"
                : "bg-[#08131f]/95 border-white/20 text-white divide-y divide-white/10 backdrop-blur-xl"
            }`}
          >
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center text-muted-foreground hover:text-foreground"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center text-muted-foreground hover:text-foreground"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. GIS MAP TOOLBAR (Top controls, search, zoom, layers, theme, export) */}
      {showToolbar && !compactLegend && (
        <MapToolbar
          upazilas={KHULNA_GIS_UPAZILAS}
          selectedUpazilaId={selectedUpazila?.id || null}
          onSelectUpazila={handleSelectUpazila}
          onResetExtent={handleResetExtent}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          showBoundary={showBoundary}
          onToggleBoundary={() => setShowBoundary(!showBoundary)}
          showRaster={internalShowRaster}
          onToggleRaster={() => setUserShowRaster(!internalShowRaster)}
          showContours={internalShowContours}
          onToggleContours={() => setUserShowContours(!internalShowContours)}
          showChoropleth={internalShowChoropleth}
          onToggleChoropleth={() => setUserShowChoropleth(!internalShowChoropleth)}
          showRivers={internalShowRivers}
          onToggleRivers={() => setUserShowRivers(!internalShowRivers)}
          showStations={internalShowStations}
          onToggleStations={() => setUserShowStations(!internalShowStations)}
          showLabels={internalShowLabels}
          onToggleLabels={() => setUserShowLabels(!internalShowLabels)}
          showBangladesh={internalShowBangladesh}
          onToggleBangladesh={() => setUserShowBangladesh(!internalShowBangladesh)}
          activeVariable={activeVariable}
          onSelectVariable={handleSelectVariable}
          isAcademic={isAcademic}
          onToggleBasemap={() => setUserBasemapAcademic(!isAcademic)}
          onExportMap={handleExportMap}
        />
      )}

      {/* 5. SCIENTIFIC PUBLICATION LEGEND WITH QUICK PERIOD TABS */}
      <MapLegend
        activeVariable={activeVariable}
        onSelectVariable={handleSelectVariable}
        isAcademic={isAcademic}
      />

      {/* 6. FEATURE INSPECTOR PANEL (Upazila, Station, or Empty Map Space) */}
      <FeatureInspector
        selectedUpazila={selectedUpazila}
        selectedStation={selectedStation}
        clickedEmptySpace={clickedEmptySpace}
        activeVariable={activeVariable}
        onClearSelection={handleClearSelection}
        onSelectUpazila={handleSelectUpazila}
        isAcademic={isAcademic}
      />

      {/* 7a. CARTOGRAPHIC NORTH ARROW (PUBLICATION STANDARD) */}
      <div className="absolute bottom-16 right-6 z-[490] pointer-events-none flex flex-col items-center select-none drop-shadow-md">
        <span className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
          N
        </span>
        <svg width="22" height="38" viewBox="0 0 24 42" className="mt-0.5">
          {/* Left black wing */}
          <polygon points="12,0 3,32 12,25" fill="#0f172a" stroke="#0f172a" strokeWidth="1" />
          {/* Right white wing */}
          <polygon points="12,0 21,32 12,25" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
        </svg>
      </div>

      {/* 7b. PUBLICATION SEGMENTED MILES SCALE BAR */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[490] pointer-events-none flex flex-col items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 py-1.5 rounded-lg border border-slate-400 dark:border-slate-600 shadow-lg">
        <div className="w-48 flex justify-between text-[11px] font-serif font-bold text-slate-900 dark:text-slate-100 px-0.5">
          <span>0</span>
          <span>5</span>
          <span>10</span>
          <span>20 Miles</span>
        </div>
        <div className="w-48 h-2 relative flex items-center mt-0.5">
          <div className="w-full h-0.5 bg-slate-900 dark:bg-white" />
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white" />
          <div className="absolute left-[25%] top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white" />
          <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white" />
          <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white" />
        </div>
      </div>

      {/* 8. MAIN LEAFLET MAP CONTAINER - FIXED KHULNA REGION CARTOGRAPHY */}
      <MapContainer
        center={KHULNA_STUDY_CENTER}
        zoom={9.5}
        minZoom={7.0}
        maxZoom={12}
        zoomSnap={0.5}
        zoomDelta={0.5}
        maxBounds={[
          [20.30, 87.50],
          [26.80, 93.00],
        ]}
        maxBoundsViscosity={0.7}
        scrollWheelZoom={true}
        touchZoom={true}
        zoomControl={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%", minHeight: "480px" }}
      >
        <LayerPanesInitializer />
        <MapInteractionController
          resetTrigger={resetTrigger}
          flyToBounds={flyToBounds}
          onEmptyMapClick={handleEmptyMapClick}
          mapRef={mapInstanceRef}
        />
        <ScaleControl position="bottomleft" imperial={false} metric={true} />
        <CursorCoordinatesHUD isAcademic={isAcademic} />
        {showGraticule && <DynamicGraticuleHUD isAcademic={isAcademic} />}

        {/* Layer -1: National Bangladesh Background Map (Low Opacity Geographic Context) */}
        <BangladeshBackgroundLayer
          isAcademic={isAcademic}
          visible={internalShowBangladesh}
          opacity={0.22}
        />

        {/* Layer 0: Georeferenced Salinity Kriging Raster Overlay & Contour Isolines */}
        <SalinityRasterLayer
          activeVariable={activeVariable}
          isAcademic={isAcademic}
          visible={internalShowRaster}
          showRaster={internalShowRaster}
          showContours={internalShowContours}
          opacity={rasterOpacity}
          salinityUnit={salinityUnit}
        />

        {/* Layer 1: Verified Khulna District Study Area Boundary (boundary.geojson) */}
        <StudyAreaLayer isAcademic={isAcademic} visible={showBoundary} />

        {/* Layer 2: Upazila Salinity Choropleth (or Administrative Outlines in Raster Mode) */}
        <SalinityChoroplethLayer
          upazilas={KHULNA_GIS_UPAZILAS}
          activeVariable={activeVariable}
          selectedUpazilaId={selectedUpazila?.id || null}
          onSelectUpazila={handleSelectUpazila}
          isAcademic={isAcademic}
          visible={internalShowChoropleth}
          showLabels={internalShowLabels}
        />

        {/* Layer 2b: Coastal Polder Embankments (Polders 30, 31, 32) */}
        <PolderLayer
          polders={COASTAL_POLDERS}
          visible={showPolders}
          onSelectPolder={(polder) => {
            if (onSelectPolder) onSelectPolder(polder);
          }}
          isAcademic={isAcademic}
        />

        {/* Layer 3: Curvilinear Estuarine River Network (rivers.geojson) */}
        <RiverLayer
          rivers={KHULNA_GIS_RIVERS}
          isAcademic={isAcademic}
          visible={internalShowRivers}
          goraiFlowDelta={goraiFlowDelta}
          tidalSurge={tidalSurge}
        />

        {/* Layer 4: Verified In-Situ Telemetry Stations (observation_stations.geojson) */}
        <ObservationLayer
          stations={KHULNA_GIS_STATIONS}
          selectedStationId={selectedStation?.id || null}
          onSelectStation={handleSelectStation}
          isAcademic={isAcademic}
          visible={internalShowStations}
        />
      </MapContainer>
    </div>
  );
}
