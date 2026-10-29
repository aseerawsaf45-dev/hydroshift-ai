"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ForecastChart } from "@/components/ForecastChart";
import { Site, Forecast, CANONICAL_KHULNA_STATIONS, PolderPolygon } from "@/components/map-data";
import {
  Layers,
  MapPin,
  Search,
  Filter,
  ShieldAlert,
  Info,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle2,
  Droplets,
  AlertTriangle,
  GitCompare,
  Clock,
  Compass,
  Satellite,
  Waves,
} from "lucide-react";

const MapWrapper = dynamic(() => import("@/components/MapWrapper"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#05070d] flex items-center justify-center text-muted-foreground text-xs">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs text-muted-foreground">Initializing GIS Delta Cartography...</span>
      </div>
    </div>
  ),
});

// Focused Khulna Regional Hotspot Jump Coordinates
const HOTSPOTS = [
  { name: "Khulna City", siteId: "SW241", coords: [22.808, 89.580] as [number, number], desc: "Urban Water Intake & SW241", risk: "4.5 dS/m" },
  { name: "Batiaghata", siteId: "batiaghata-polder", coords: [22.650, 89.550] as [number, number], desc: "Agricultural Polders (Boro Rice Zone)", risk: "3.9 dS/m" },
  { name: "Mongla Port", siteId: "SW244", coords: [22.464, 89.600] as [number, number], desc: "High Salinity Front & SW244", risk: "7.9 dS/m" },
  { name: "Paikgachha", siteId: "paikgachha-shibsa", coords: [22.580, 89.420] as [number, number], desc: "Western Mangrove Shibsa Belt", risk: "4.2 dS/m" },
];

export default function MapExplorerPage() {
  // Layer & Display States
  const [showSwot, setShowSwot] = useState(true);
  const [showGauges, setShowGauges] = useState(true);
  const [showSalinityFront, setShowSalinityFront] = useState(true);
  const [showIsohalines, setShowIsohalines] = useState(true);
  const [showPolders, setShowPolders] = useState(true);
  const [showThalweg, setShowThalweg] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [basemap, setBasemap] = useState<"satellite" | "dark" | "topo" | "osm">("satellite");
  const [horizon, setHorizon] = useState<"now" | "7d" | "14d">("now");
  const [riskFilter, setRiskFilter] = useState<"all" | "critical" | "warning" | "nominal">("all");
  const [currentMode, setCurrentMode] = useState<"all" | "salinity" | "gauges" | "swot">("all");
  const [selectedBasin, setSelectedBasin] = useState<"all" | "Passur" | "Shibsa" | "Rupsha">("all");
  const [selectedPolder, setSelectedPolder] = useState<PolderPolygon | null>(null);

  // Workbench & Drawer states
  const [activePanel, setActivePanel] = useState<"directory" | "layers" | "guide" | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [compareSite, setCompareSite] = useState<Site | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [showMissionBrief, setShowMissionBrief] = useState(true);

  // Data strictly filtered to Khulna Region (22.20°N to 23.95°N, 89.00°E to 89.95°E)
  const [allSites, setAllSites] = useState<Site[]>(CANONICAL_KHULNA_STATIONS);
  const [allForecasts, setAllForecasts] = useState<Forecast[]>([]);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    Promise.all([
      fetch(`${API_URL}/api/v1/reaches`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API_URL}/api/v1/reaches/forecasts/all`).then(r => r.ok ? r.json() : []).catch(() => [])
    ]).then(([sites, forecasts]) => {
      if (sites && sites.length > 0) {
        const khulnaSites = (sites as Site[]).filter(
          s => s.latitude >= 22.20 && s.latitude <= 23.95 && s.longitude >= 89.00 && s.longitude <= 89.95
        );
        const merged: Site[] = [...CANONICAL_KHULNA_STATIONS];
        for (const s of khulnaSites) {
          if (!merged.some(m => m.id === s.id)) {
            merged.push(s);
          }
        }
        setAllSites(merged);
      }
      if (forecasts && forecasts.length > 0) {
        setAllForecasts(forecasts);
      }
    });
  }, []);

  const forecastMap = useMemo(() => {
    const map: Record<string, Forecast> = {};
    for (const f of allForecasts) {
      if (!map[f.site_id] || f.target_variable.includes("Salinity")) {
        map[f.site_id] = f;
      }
    }
    return map;
  }, [allForecasts]);

  const criticalCount = useMemo(() => {
    return allSites.filter(s => {
      const f = forecastMap[s.id];
      const val = f?.value ?? (s as any).baselineEc ?? 3.5;
      return val >= 4.0;
    }).length;
  }, [allSites, forecastMap]);

  const warningCount = useMemo(() => {
    return allSites.filter(s => {
      const f = forecastMap[s.id];
      const val = f?.value ?? (s as any).baselineEc ?? 3.5;
      return val >= 2.5 && val < 4.0;
    }).length;
  }, [allSites, forecastMap]);

  const selectedForecast = useMemo(() => {
    if (!selectedSite) return null;
    return forecastMap[selectedSite.id] || null;
  }, [selectedSite, forecastMap]);

  const compareForecast = useMemo(() => {
    if (!compareSite) return null;
    return forecastMap[compareSite.id] || null;
  }, [compareSite, forecastMap]);

  // Filtered station directory by search, risk, and river basin
  const filteredDirectory = useMemo(() => {
    return allSites.filter(site => {
      // Basin filter
      if (selectedBasin !== "all") {
        const text = `${site.name} ${site.description} ${site.id} ${(site as any).river || ""}`.toLowerCase();
        if (!text.includes(selectedBasin.toLowerCase())) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!site.name.toLowerCase().includes(q) && !site.id.toLowerCase().includes(q) && !site.description.toLowerCase().includes(q)) {
          return false;
        }
      }

      // Risk filter
      const forecast = forecastMap[site.id];
      const val = forecast?.value ?? (site as any).baselineEc ?? 3.5;
      if (riskFilter === "critical" && val < 4.0) return false;
      if (riskFilter === "warning" && (val < 2.5 || val >= 4.0)) return false;
      if (riskFilter === "nominal" && val >= 2.5) return false;
      return true;
    });
  }, [allSites, searchQuery, riskFilter, selectedBasin, forecastMap]);

  // Mode Preset Quick Switcher
  const handleModePreset = (mode: "all" | "salinity" | "gauges" | "swot") => {
    setCurrentMode(mode);
    if (mode === "all") {
      setShowSwot(true);
      setShowGauges(true);
      setShowSalinityFront(true);
      setShowIsohalines(true);
      setRiskFilter("all");
    } else if (mode === "salinity") {
      setShowSwot(true);
      setShowGauges(true);
      setShowSalinityFront(true);
      setShowIsohalines(true);
      setRiskFilter("critical");
    } else if (mode === "gauges") {
      setShowSwot(false);
      setShowGauges(true);
      setShowSalinityFront(false);
      setShowIsohalines(false);
      setRiskFilter("all");
    } else if (mode === "swot") {
      setShowSwot(true);
      setShowGauges(false);
      setShowSalinityFront(true);
      setShowIsohalines(false);
      setRiskFilter("all");
    }
  };

  const handleSelectSite = (site: Site | null) => {
    if (isComparing) {
      if (!selectedSite) {
        setSelectedSite(site);
      } else {
        setCompareSite(site);
      }
    } else {
      setSelectedSite(site);
      if (site) {
        setFlyToCoords([site.latitude, site.longitude]);
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          setActivePanel(null);
        }
      }
    }
  };

  const handleSelectCorridor = (corridor: string) => {
    if (corridor === "Passur") {
      setSelectedBasin("Passur");
      setFlyToCoords([22.464, 89.600]);
    } else if (corridor === "Rupsha") {
      setSelectedBasin("Rupsha");
      setFlyToCoords([22.808, 89.580]);
    } else if (corridor === "Shibsa") {
      setSelectedBasin("Shibsa");
      setFlyToCoords([22.550, 89.450]);
    }
  };

  return (
    <div className="flex flex-col space-y-2.5 h-[calc(100dvh-4.25rem)] select-none">
      
      {/* 1. TOP INTELLIGENT CONTROL DOCK */}
      <div className="bg-[#08131f]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 sm:p-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shadow-xl shrink-0">
        
        {/* Left: Mode Quick Selectors & Hotspot Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 shrink-0">
            <button
              onClick={() => handleModePreset("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentMode === "all" ? "bg-primary text-black font-bold shadow-md shadow-primary/20" : "text-muted-foreground hover:text-white"
              }`}
            >
              All Layers
            </button>
            <button
              onClick={() => handleModePreset("salinity")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                currentMode === "salinity" ? "bg-rose-500/25 text-rose-300 font-bold border border-rose-500/40" : "text-muted-foreground hover:text-white"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              Salinity Hazard
            </button>
            <button
              onClick={() => handleModePreset("gauges")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentMode === "gauges" ? "bg-primary text-black font-bold shadow-md shadow-primary/20" : "text-muted-foreground hover:text-white"
              }`}
            >
              River Gauges
            </button>
            <button
              onClick={() => handleModePreset("swot")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentMode === "swot" ? "bg-primary text-black font-bold shadow-md shadow-primary/20" : "text-muted-foreground hover:text-white"
              }`}
            >
              SWOT Passes
            </button>
          </div>

          <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block shrink-0" />

          {/* Quick Jump Hotspot Pills */}
          <div className="flex items-center gap-1 shrink-0">
            {HOTSPOTS.map((hotspot) => (
              <button
                key={hotspot.name}
                onClick={() => {
                  setFlyToCoords(hotspot.coords);
                  const found = allSites.find(
                    (s) =>
                      s.id === hotspot.siteId ||
                      s.name.toLowerCase().includes(hotspot.name.toLowerCase())
                  );
                  if (found) handleSelectSite(found);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-medium text-muted-foreground hover:text-white transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                title={hotspot.desc}
              >
                <MapPin className="w-3 h-3 text-primary" />
                <span>{hotspot.name}</span>
                <span className="text-[9px] font-mono opacity-60">({hotspot.risk})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Workspace Toggle Buttons & Direct Basemap Switch */}
        <div className="flex items-center gap-2 justify-end shrink-0">
          
          {/* Quick Basemap Switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => setBasemap("satellite")}
              className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-semibold transition-all ${
                basemap === "satellite" ? "bg-primary text-black font-bold shadow" : "text-muted-foreground hover:text-white"
              }`}
            >
              SATELLITE
            </button>
            <button
              onClick={() => setBasemap("dark")}
              className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-semibold transition-all ${
                basemap === "dark" ? "bg-primary text-black font-bold shadow" : "text-muted-foreground hover:text-white"
              }`}
            >
              DARK GIS
            </button>
            <button
              onClick={() => setBasemap("topo")}
              className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-semibold transition-all ${
                basemap === "topo" ? "bg-primary text-black font-bold shadow" : "text-muted-foreground hover:text-white"
              }`}
            >
              TOPO
            </button>
            <button
              onClick={() => setBasemap("osm")}
              className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-semibold transition-all ${
                basemap === "osm" ? "bg-primary text-black font-bold shadow" : "text-muted-foreground hover:text-white"
              }`}
            >
              STREET
            </button>
          </div>

          {/* Station Directory Button */}
          <button
            onClick={() => setActivePanel(activePanel === "directory" ? null : "directory")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              activePanel === "directory"
                ? "bg-primary text-black font-bold border-primary shadow-lg shadow-primary/20"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Directory</span>
            <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-mono font-bold">
              {allSites.length || 20}
            </span>
          </button>

          {/* Layers & Style Button */}
          <button
            onClick={() => setActivePanel(activePanel === "layers" ? null : "layers")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              activePanel === "layers"
                ? "bg-primary text-black font-bold border-primary shadow-lg shadow-primary/20"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layers</span>
          </button>

          {/* Legend Button */}
          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`p-2 rounded-xl text-xs border transition-colors ${
              showLegend ? "bg-white/20 text-white border-white/30" : "bg-white/5 text-muted-foreground hover:text-white border-white/10"
            }`}
            title="Toggle Map Symbology Legend"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 2. MAIN MAP CANVAS CONTAINER */}
      <div className="flex-1 rounded-3xl overflow-hidden border border-white/10 relative flex flex-col min-h-0 shadow-2xl bg-[#05070d]">
        
        {/* TOP FLOATING MISSION HUD (CLARITY ACCELERATOR) */}
        {showMissionBrief && (
          <div className="absolute top-3 inset-x-3 md:inset-x-auto md:left-4 md:right-4 z-20 pointer-events-none flex justify-center animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-full max-w-4xl p-2.5 rounded-2xl bg-[#08131f]/95 backdrop-blur-xl border border-white/15 shadow-2xl pointer-events-auto flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 min-w-0">
                  <span className="font-mono text-[10px] uppercase font-bold text-rose-400 shrink-0">
                    Active Marine Intrusion Front
                  </span>
                  <span className="text-white/80 text-[11px] truncate">
                    Passur River salinity is 7.9 dS/m at Mongla (SW244), breaching the 4.0 dS/m Boro Rice safety threshold.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    setFlyToCoords([22.464, 89.600]);
                    const found = allSites.find((s) => s.id === "SW244");
                    if (found) handleSelectSite(found);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                >
                  Focus Breach
                </button>
                <button
                  onClick={() => setShowMissionBrief(false)}
                  className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-muted-foreground hover:text-white flex items-center justify-center transition-colors"
                  title="Dismiss Brief"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM FLOATING HORIZON SCRUBBER */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex justify-center">
          <div className="bg-[#08131f]/95 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-2xl shadow-2xl pointer-events-auto flex items-center gap-2 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" />
              <span className="hidden sm:inline">Lead Horizon:</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setHorizon("now")}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  horizon === "now" ? "bg-primary text-black font-bold shadow" : "text-muted-foreground hover:text-white"
                }`}
              >
                Now
              </button>
              <button
                onClick={() => setHorizon("7d")}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  horizon === "7d" ? "bg-amber-500 text-black font-bold shadow" : "text-muted-foreground hover:text-white"
                }`}
              >
                +7 Days (PINN)
              </button>
              <button
                onClick={() => setHorizon("14d")}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  horizon === "14d" ? "bg-rose-500 text-white font-bold shadow" : "text-muted-foreground hover:text-white"
                }`}
              >
                +14 Days (Peak)
              </button>
            </div>
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <MapWrapper
          selectedSiteId={selectedSite?.id || null}
          onSelectSite={handleSelectSite}
          showSwot={showSwot}
          showGauges={showGauges}
          showSalinityFront={showSalinityFront}
          showIsohalines={showIsohalines}
          showPolders={showPolders}
          showThalweg={showThalweg}
          showLabels={showLabels}
          basemap={basemap}
          horizon={horizon}
          searchQuery={searchQuery}
          riskFilter={riskFilter}
          flyToCoords={flyToCoords}
          onSelectCorridor={handleSelectCorridor}
          onSelectPolder={(polder) => setSelectedPolder(polder)}
        />

        {/* 3. STUDIO WORKBENCH (DRAWER / BOTTOM SHEET) */}
        {activePanel && (
          <div className="absolute inset-x-2 bottom-2 md:bottom-3 md:top-3 md:left-3 md:right-auto z-30 max-h-[75vh] md:max-h-none md:h-auto md:w-96 flex flex-col animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-left-4 duration-300">
            <div className="h-full bg-[#08131f]/95 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl flex flex-col overflow-hidden rounded-2xl">
              
              {/* Drawer Tab Headers */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                  <button
                    onClick={() => setActivePanel("directory")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      activePanel === "directory" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    Directory ({filteredDirectory.length})
                  </button>
                  <button
                    onClick={() => setActivePanel("layers")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      activePanel === "layers" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    Layers
                  </button>
                  <button
                    onClick={() => setActivePanel("guide")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      activePanel === "guide" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    Hydro Guide
                  </button>
                </div>

                <button
                  onClick={() => setActivePanel(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* PANEL 1: STATIONS DIRECTORY */}
              {activePanel === "directory" && (
                <div className="flex-1 flex flex-col min-h-0 pt-3 space-y-3">
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search reach, river or station..."
                      className="w-full h-8 pl-8 pr-7 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
                    />
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-2 text-xs text-muted-foreground hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* River Basin Filter Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                    <button
                      onClick={() => setSelectedBasin("all")}
                      className={`px-2 py-1 rounded-lg shrink-0 font-medium transition-all ${
                        selectedBasin === "all" ? "bg-white/20 text-white font-bold" : "bg-white/5 text-muted-foreground hover:text-white"
                      }`}
                    >
                      All Khulna
                    </button>
                    <button
                      onClick={() => setSelectedBasin("Rupsha")}
                      className={`px-2 py-1 rounded-lg shrink-0 font-medium transition-all ${
                        selectedBasin === "Rupsha" ? "bg-primary text-black font-bold shadow" : "bg-white/5 text-muted-foreground hover:text-white"
                      }`}
                    >
                      Rupsha River
                    </button>
                    <button
                      onClick={() => setSelectedBasin("Passur")}
                      className={`px-2 py-1 rounded-lg shrink-0 font-medium transition-all ${
                        selectedBasin === "Passur" ? "bg-rose-500/25 text-rose-300 font-bold border border-rose-500/40" : "bg-white/5 text-muted-foreground hover:text-white"
                      }`}
                    >
                      Passur River
                    </button>
                    <button
                      onClick={() => setSelectedBasin("Shibsa")}
                      className={`px-2 py-1 rounded-lg shrink-0 font-medium transition-all ${
                        selectedBasin === "Shibsa" ? "bg-sky-500/25 text-sky-300 font-bold border border-sky-500/40" : "bg-white/5 text-muted-foreground hover:text-white"
                      }`}
                    >
                      Shibsa Estuary
                    </button>
                  </div>

                  {/* Risk Filter Chips */}
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    <button
                      onClick={() => setRiskFilter("all")}
                      className={`py-1 rounded-lg font-medium text-center transition-all ${
                        riskFilter === "all" ? "bg-white/20 text-white font-bold" : "bg-white/5 text-muted-foreground hover:text-white"
                      }`}
                    >
                      All ({allSites.length})
                    </button>
                    <button
                      onClick={() => setRiskFilter("critical")}
                      className={`py-1 rounded-lg font-medium text-center transition-all ${
                        riskFilter === "critical" ? "bg-rose-500/25 text-rose-300 font-bold border border-rose-500/40" : "bg-white/5 text-rose-400 hover:bg-rose-500/10"
                      }`}
                    >
                      &gt;4.0 ({criticalCount})
                    </button>
                    <button
                      onClick={() => setRiskFilter("warning")}
                      className={`py-1 rounded-lg font-medium text-center transition-all ${
                        riskFilter === "warning" ? "bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40" : "bg-white/5 text-amber-400 hover:bg-amber-500/10"
                      }`}
                    >
                      Elevated ({warningCount})
                    </button>
                    <button
                      onClick={() => setRiskFilter("nominal")}
                      className={`py-1 rounded-lg font-medium text-center transition-all ${
                        riskFilter === "nominal" ? "bg-sky-500/25 text-sky-300 font-bold border border-sky-500/40" : "bg-white/5 text-sky-400 hover:bg-sky-500/10"
                      }`}
                    >
                      Nominal
                    </button>
                  </div>

                  {/* Station List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {filteredDirectory.map((site) => {
                      const isSwot = site.id.startsWith("3124") || site.id.toLowerCase().includes("swot");
                      const forecast = forecastMap[site.id];
                      const isSelected = selectedSite?.id === site.id;
                      const val = forecast?.value ?? (site as any).baselineEc ?? 3.5;
                      const isCrit = val >= 4.0;
                      const isWarn = val >= 2.5 && val < 4.0;

                      return (
                        <div
                          key={site.id}
                          onClick={() => handleSelectSite(site)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col space-y-1.5 ${
                            isSelected
                              ? "bg-primary/20 border-primary shadow-lg shadow-primary/10"
                              : "bg-white/5 hover:bg-white/10 border-white/5"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-white truncate max-w-[190px]">
                              {site.name}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                              isCrit ? "bg-rose-500/25 text-rose-300 border border-rose-500/30" : isWarn ? "bg-amber-500/25 text-amber-300 border border-amber-500/30" : "bg-emerald-500/25 text-emerald-300 border border-emerald-500/30"
                            }`}>
                              {val.toFixed(1)} dS/m
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="font-mono text-muted-foreground">{site.id}</span>
                            <span>{site.latitude.toFixed(2)}°N, {site.longitude.toFixed(2)}°E</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PANEL 2: LAYERS & BASEMAP */}
              {activePanel === "layers" && (
                <div className="flex-1 overflow-y-auto pt-3 space-y-4 pr-1 scrollbar-thin">
                  
                  {/* Basemaps */}
                  <div className="flex flex-col space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">GIS Basemap Provider</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setBasemap("satellite")}
                        className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          basemap === "satellite" ? "border-primary bg-primary/15 text-white font-bold" : "border-white/10 bg-white/5 text-muted-foreground hover:text-white"
                        }`}
                      >
                        <Satellite className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <div className="text-[11px] font-bold text-white">Satellite Hybrid</div>
                          <div className="text-[9px] text-muted-foreground">NASA / Esri High-Res</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setBasemap("dark")}
                        className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          basemap === "dark" ? "border-primary bg-primary/15 text-white font-bold" : "border-white/10 bg-white/5 text-muted-foreground hover:text-white"
                        }`}
                      >
                        <Layers className="w-4 h-4 text-sky-400 shrink-0" />
                        <div>
                          <div className="text-[11px] font-bold text-white">Dark GIS</div>
                          <div className="text-[9px] text-muted-foreground">CartoDB Dark Matter</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setBasemap("topo")}
                        className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          basemap === "topo" ? "border-primary bg-primary/15 text-white font-bold" : "border-white/10 bg-white/5 text-muted-foreground hover:text-white"
                        }`}
                      >
                        <Waves className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-[11px] font-bold text-white">Hydro Topo</div>
                          <div className="text-[9px] text-muted-foreground">USGS Elevation Contours</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setBasemap("osm")}
                        className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          basemap === "osm" ? "border-primary bg-primary/15 text-white font-bold" : "border-white/10 bg-white/5 text-muted-foreground hover:text-white"
                        }`}
                      >
                        <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="text-[11px] font-bold text-white">Street Cadastre</div>
                          <div className="text-[9px] text-muted-foreground">OpenStreetMap Grid</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Spatial Layers */}
                  <div className="flex flex-col space-y-2 border-t border-white/10 pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">GIS Vector Overlays</span>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="flex items-center gap-2 text-xs font-medium text-white">
                        <span className="w-2.5 h-2.5 rounded bg-amber-400" />
                        Coastal Polders (30, 31, 32)
                      </span>
                      <input
                        type="checkbox"
                        checked={showPolders}
                        onChange={(e) => setShowPolders(e.target.checked)}
                        className="accent-primary cursor-pointer w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="flex items-center gap-2 text-xs font-medium text-white">
                        <span className="w-2.5 h-2.5 rounded bg-sky-400" />
                        Passur Thalweg Centerline
                      </span>
                      <input
                        type="checkbox"
                        checked={showThalweg}
                        onChange={(e) => setShowThalweg(e.target.checked)}
                        className="accent-primary cursor-pointer w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="flex items-center gap-2 text-xs font-medium text-white">
                        <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
                        NASA SWOT Radar Passes
                      </span>
                      <input
                        type="checkbox"
                        checked={showSwot}
                        onChange={(e) => setShowSwot(e.target.checked)}
                        className="accent-primary cursor-pointer w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="flex items-center gap-2 text-xs font-medium text-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                        BWDB River Stage Gauges
                      </span>
                      <input
                        type="checkbox"
                        checked={showGauges}
                        onChange={(e) => setShowGauges(e.target.checked)}
                        className="accent-primary cursor-pointer w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="flex items-center gap-2 text-xs font-medium text-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        Salinity Intrusion Corridor
                      </span>
                      <input
                        type="checkbox"
                        checked={showSalinityFront}
                        onChange={(e) => setShowSalinityFront(e.target.checked)}
                        className="accent-primary cursor-pointer w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="flex items-center gap-2 text-xs font-medium text-white">
                        <span className="w-2.5 h-2.5 rounded-full border border-dashed border-amber-400" />
                        4.0 dS/m Hazard Isohaline
                      </span>
                      <input
                        type="checkbox"
                        checked={showIsohalines}
                        onChange={(e) => setShowIsohalines(e.target.checked)}
                        className="accent-primary cursor-pointer w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="flex items-center gap-2 text-xs font-medium text-white">
                        <span className="w-2.5 h-2.5 rounded bg-white text-[9px] text-black font-bold flex items-center justify-center">12</span>
                        Station Value Callouts
                      </span>
                      <input
                        type="checkbox"
                        checked={showLabels}
                        onChange={(e) => setShowLabels(e.target.checked)}
                        className="accent-primary cursor-pointer w-4 h-4"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* PANEL 3: HYDRO GUIDE */}
              {activePanel === "guide" && (
                <div className="flex-1 overflow-y-auto pt-3 space-y-3 text-xs text-muted-foreground pr-1 scrollbar-thin">
                  <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-white">
                    <span className="font-bold text-xs text-primary block mb-1">Khulna Delta Problem Statement</span>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      During dry months (January - May), upstream Gorai discharge drops by 40-70%, allowing marine tidal salinity from the Bay of Bengal to penetrate 80km inland through Passur and Shibsa rivers.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <span className="font-bold text-white text-xs block">Key Salinity Thresholds:</span>
                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 text-[11px]">
                      <span className="font-bold text-sky-400 font-mono">1.0 dS/m</span>
                      <span>Drinking water safety limit for municipal water supply.</span>
                    </div>
                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 text-[11px]">
                      <span className="font-bold text-amber-400 font-mono">4.0 dS/m</span>
                      <span>Boro rice agricultural crop damage threshold. Sluice closure advised.</span>
                    </div>
                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 text-[11px]">
                      <span className="font-bold text-rose-400 font-mono">8.0 dS/m</span>
                      <span>Extreme hypersaline boundary; disrupts all freshwater ecosystems.</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* 4. STATION INSPECTOR DRAWER / COMPARISON MODE */}
        {selectedSite && (
          <div className="absolute inset-x-2 bottom-2 md:bottom-3 md:top-3 md:right-3 md:left-auto z-30 max-h-[80vh] md:max-h-none md:h-auto md:w-96 flex flex-col animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-4 duration-300">
            <div className="h-full bg-[#08131f]/95 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl flex flex-col justify-between overflow-y-auto rounded-2xl scrollbar-thin">
              
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-white/10 pb-3">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">{selectedSite.id}</span>
                      <Badge variant="outline" className={
                        selectedSite.id.startsWith("3124") || selectedSite.id.toLowerCase().includes("swot")
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]"
                          : "bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px]"
                      }>
                        {selectedSite.id.startsWith("3124") ? "NASA SWOT Reach" : "BWDB Tidal Stage"}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-white leading-tight">{selectedSite.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsComparing(!isComparing)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        isComparing ? "bg-primary text-black border-primary" : "bg-white/5 text-muted-foreground hover:text-white border-white/10"
                      }`}
                      title="Toggle Reach Comparison Mode"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setSelectedSite(null); setCompareSite(null); setIsComparing(false); }}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-muted-foreground hover:text-white transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metric Badges */}
                {(() => {
                  const siteEc = selectedForecast?.value ?? (selectedSite as any).baselineEc ?? 3.5;
                  const isCrit = siteEc >= 4.0;
                  const isWarn = siteEc >= 2.5 && siteEc < 4.0;
                  const isIntake = selectedSite.category === "intake" || selectedSite.id.includes("p14");

                  return (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase font-medium">Modeled Salinity</span>
                          <span className={`text-xl font-bold font-mono mt-0.5 ${
                            isCrit ? "text-rose-400" : isWarn ? "text-amber-400" : "text-emerald-400"
                          }`}>
                            {siteEc.toFixed(1)} dS/m
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            {isCrit ? "Critical Hazard (>4.0)" : isWarn ? "Elevated Alert" : "Safe Nominal"}
                          </span>
                        </div>

                        <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase font-medium">Coordinates</span>
                          <span className="font-mono text-white font-semibold mt-1 text-xs">
                            {selectedSite.latitude.toFixed(3)}°N
                          </span>
                          <span className="font-mono text-muted-foreground text-[10px]">
                            {selectedSite.longitude.toFixed(3)}°E
                          </span>
                        </div>
                      </div>

                      {/* Hydrological Impact Advisory */}
                      <div className={`p-2.5 rounded-xl border text-[11px] leading-relaxed ${
                        isCrit 
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-300" 
                          : isWarn
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          : "bg-sky-500/10 border-sky-500/30 text-sky-300"
                      }`}>
                        {isIntake ? (
                          <div>
                            <span className="font-bold block text-pink-400 mb-0.5">Khulna WASA Drinking Water Advisory</span>
                            Raw water intake at Madhukhali/P-14 currently registers {siteEc.toFixed(1)} dS/m (potable limit 1.5 dS/m). Chlorination and intake gate operations must sync with low-tide windows.
                          </div>
                        ) : isCrit ? (
                          <div>
                            <span className="font-bold block text-rose-400 mb-0.5">Boro Rice Crop Hazard Alert</span>
                            Salinity ({siteEc.toFixed(1)} dS/m) exceeds the 4.0 dS/m threshold. Direct canal irrigation will cause grain sterilization. Preemptive sluice gate closure recommended during high-tide peak.
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold block text-sky-400 mb-0.5">Freshwater Buffer Active</span>
                            Salinity ({siteEc.toFixed(1)} dS/m) remains within safe agricultural thresholds. Upstream Gorai discharge maintains effective dilution.
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}

                {/* Timeseries Forecast Chart */}
                <div className="flex flex-col space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">Observed vs PINN Forecast</span>
                    <span className="text-[10px] font-mono text-emerald-400">Validated Telemetry</span>
                  </div>
                  <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                    <ForecastChart reachId={selectedSite.id} showBadge={false} />
                  </div>
                </div>

                {/* Comparison Card (if comparing) */}
                {isComparing && compareSite && (
                  <div className="p-3 rounded-2xl bg-white/5 border border-primary/30 flex flex-col space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">Comparing with {compareSite.name}</span>
                      <span className="text-[10px] font-mono text-primary">
                        {compareForecast ? `${compareForecast.value.toFixed(1)} ${compareForecast.unit}` : ""}
                      </span>
                    </div>
                    <div className="w-full h-28 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                      <ForecastChart reachId={compareSite.id} showBadge={false} />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/10 mt-3 shrink-0">
                <Link
                  href={`/app/reaches/${selectedSite.id}`}
                  className="flex-1 py-2 rounded-xl bg-primary text-black font-bold text-xs text-center hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
                >
                  <span>Full Reach Audit</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/app/scenarios"
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium transition-colors"
                >
                  Simulate Shock
                </Link>
              </div>

            </div>
          </div>
        )}

        {/* 5. POLDER CADASTRE INSPECTOR DRAWER */}
        {selectedPolder && !selectedSite && (
          <div className="absolute inset-x-2 bottom-2 md:bottom-3 md:top-3 md:right-3 md:left-auto z-30 max-h-[80vh] md:max-h-none md:h-auto md:w-96 flex flex-col animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-4 duration-300">
            <div className="h-full bg-[#08131f]/95 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl flex flex-col justify-between overflow-y-auto rounded-2xl scrollbar-thin">
              <div className="space-y-3">
                <div className="flex items-start justify-between border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400">
                        BWDB Coastal Polder Cadastre
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base leading-snug">{selectedPolder.name}</h3>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Upazila: {selectedPolder.upazila} &bull; Embankment: {selectedPolder.embankmentKm} km
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedPolder(null)}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-muted-foreground hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-muted-foreground block font-mono">Protected Area</span>
                    <span className="text-base font-bold text-white font-mono">{selectedPolder.areaKm2} km²</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-muted-foreground block font-mono">Polder Elevation</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">+{selectedPolder.elevationM}m PWD</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <span className="font-bold text-amber-300 block mb-1">Polder Risk & Sluice Advisory:</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {selectedPolder.salinityRisk}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">NASA SWOT Coupled Drainage:</span>
                  <p className="text-[11px] text-white/80">
                    Sluice flap-gate gravity flushing is dynamically controlled by SWOT river water surface elevation (WSE) vs interior canal stage.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                <Link
                  href="/app/crop-rotation"
                  className="flex-1 py-2 px-3 rounded-xl bg-primary text-black font-bold text-xs text-center hover:opacity-90 transition-opacity"
                >
                  Run Crop Decision Support
                </Link>
                <Link
                  href="/app/reaches/31241000011"
                  className="py-2 px-3 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-colors"
                >
                  Flap-Gate Hydraulics
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 6. MINIMALIST LEGEND OVERLAY */}
        {showLegend && (
          <div className="absolute bottom-3 right-3 z-20 bg-[#08131f]/95 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/15 text-xs flex flex-col space-y-2 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Map Symbology</span>
              <button onClick={() => setShowLegend(false)} className="text-muted-foreground hover:text-white text-xs">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-amber-400 border border-amber-300" />
                <span className="text-white">NASA SWOT Reach</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-400 border border-sky-300" />
                <span className="text-white">BWDB River Gauge</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 rounded bg-rose-500" />
                <span className="text-white">Marine Ingress (&gt;8 dS/m)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 rounded bg-amber-500 border-dashed" />
                <span className="text-white">Estuary Front (4-8 dS/m)</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
