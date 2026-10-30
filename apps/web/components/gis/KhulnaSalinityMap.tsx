"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, useMap, useMapEvents, ScaleControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  KHULNA_STUDY_BOUNDS,
  KHULNA_STUDY_CENTER,
  KHULNA_GIS_UPAZILAS,
  KHULNA_GIS_RIVERS,
  KHULNA_GIS_STATIONS,
  GisUpazila,
  GisStation,
  isInsideKhulnaStudyArea,
  findUpazilaAtCoordinates,
  findNearestGisStation,
} from "../gis-khulna-data";
import { StudyAreaLayer } from "./StudyAreaLayer";
import { SalinityChoroplethLayer } from "./SalinityChoroplethLayer";
import { SalinityRasterLayer } from "./SalinityRasterLayer";
import { RiverLayer } from "./RiverLayer";
import { ObservationLayer } from "./ObservationLayer";
import { MapLegend } from "./MapLegend";
import { FeatureInspector, ClickedEmptySpaceInfo } from "./FeatureInspector";
import { MapToolbar } from "./MapToolbar";
import { DataStatus } from "./DataStatus";

// Custom Leaflet Layer Panes for Strict Z-Index Separation
function LayerPanesInitializer() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const panes = [
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

// Controller for programmatic Camera actions (FitBounds, Zoom, Pan)
interface MapControllerProps {
  resetTrigger: number;
  flyToBounds: [[number, number], [number, number]] | null;
  onEmptyMapClick: (info: ClickedEmptySpaceInfo) => void;
}

function MapInteractionController({
  resetTrigger,
  flyToBounds,
  onEmptyMapClick,
}: MapControllerProps) {
  const map = useMap();

  // Reset extent on trigger
  useEffect(() => {
    if (resetTrigger > 0) {
      map.fitBounds(KHULNA_STUDY_BOUNDS, {
        padding: [30, 30],
        maxZoom: 11,
        animate: true,
      });
    }
  }, [resetTrigger, map]);

  // Fly to feature bounds when selected
  useEffect(() => {
    if (flyToBounds) {
      map.fitBounds(flyToBounds, {
        padding: [45, 45],
        maxZoom: 12,
        animate: true,
      });
    }
  }, [flyToBounds, map]);

  // Click on empty map space handler
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

export interface KhulnaSalinityMapProps {
  initialVariable?: string; // "period1" | "period2" | "period3" | "river" | "shallow_gw" | "deep_gw"
  initialUpazilaId?: string | null;
  initialStationId?: string | null;
  onSelectUpazilaCallback?: (u: GisUpazila | null) => void;
  onSelectStationCallback?: (s: GisStation | null) => void;
  isAcademicTheme?: boolean;
}

export function KhulnaSalinityMap({
  initialVariable = "period3",
  initialUpazilaId = null,
  initialStationId = null,
  onSelectUpazilaCallback,
  onSelectStationCallback,
  isAcademicTheme = true,
}: KhulnaSalinityMapProps) {
  const [mounted, setMounted] = useState(false);
  const [activeVariable, setActiveVariable] = useState(initialVariable);
  const [selectedUpazila, setSelectedUpazila] = useState<GisUpazila | null>(null);
  const [selectedStation, setSelectedStation] = useState<GisStation | null>(null);
  const [clickedEmptySpace, setClickedEmptySpace] = useState<ClickedEmptySpaceInfo | null>(null);
  const [flyToBounds, setFlyToBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Layer Visibility
  const [showBoundary, setShowBoundary] = useState(true);
  const [showChoropleth, setShowChoropleth] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [isAcademic, setIsAcademic] = useState(isAcademicTheme);

  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize selected upazila or station from props if provided
  useEffect(() => {
    if (initialUpazilaId) {
      const found = KHULNA_GIS_UPAZILAS.find((u) => u.id === initialUpazilaId);
      if (found) {
        setSelectedUpazila(found);
        setFlyToBounds(found.bounds);
      }
    }
  }, [initialUpazilaId]);

  useEffect(() => {
    if (initialStationId) {
      const found = KHULNA_GIS_STATIONS.find((s) => s.id === initialStationId);
      if (found) {
        setSelectedStation(found);
        setFlyToBounds([
          [found.latitude - 0.04, found.longitude - 0.04],
          [found.latitude + 0.04, found.longitude + 0.04],
        ]);
      }
    }
  }, [initialStationId]);

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
      if (onSelectUpazilaCallback) onSelectUpazilaCallback(u);
    },
    [onSelectUpazilaCallback]
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
      if (onSelectStationCallback) onSelectStationCallback(s);
    },
    [onSelectStationCallback]
  );

  const handleEmptyMapClick = useCallback((info: ClickedEmptySpaceInfo) => {
    setSelectedUpazila(null);
    setSelectedStation(null);
    setClickedEmptySpace(info);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedUpazila(null);
    setSelectedStation(null);
    setClickedEmptySpace(null);
    setFlyToBounds(null);
    if (onSelectUpazilaCallback) onSelectUpazilaCallback(null);
    if (onSelectStationCallback) onSelectStationCallback(null);
  }, [onSelectUpazilaCallback, onSelectStationCallback]);

  const handleResetExtent = useCallback(() => {
    handleClearSelection();
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
      <div className="w-full h-full min-h-[500px] bg-[#f8fafc] dark:bg-[#08131f] flex items-center justify-center text-xs text-muted-foreground font-mono">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Offline Khulna GIS...</span>
        </div>
      </div>
    );
  }

  const canvasBg = isAcademic ? "#f8fafc" : "#08131f";
  const waterColor = isAcademic ? "#e0f2fe" : "#040b14";

  return (
    <div className="w-full h-full relative z-0 min-h-[520px] overflow-hidden select-none">
      {/* Map CSS Customizations */}
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

      {/* Calibrated Geographic Graticule Ticks */}
      <div
        className={`absolute top-0 left-0 right-0 z-[490] pointer-events-none flex justify-between px-16 py-0.5 text-[9px] font-mono font-bold tracking-tight border-b ${
          isAcademic
            ? "bg-white/90 text-slate-800 border-slate-300"
            : "bg-black/60 text-zinc-300 border-white/10"
        }`}
      >
        <span>89.20°E</span>
        <span>89.35°E</span>
        <span>89.50°E</span>
        <span>89.65°E</span>
        <span>89.75°E</span>
      </div>

      <div
        className={`absolute top-8 bottom-16 left-0 z-[490] pointer-events-none flex flex-col justify-between py-6 px-1 text-[9px] font-mono font-bold tracking-tight border-r ${
          isAcademic
            ? "bg-white/80 text-slate-800 border-slate-300"
            : "bg-black/40 text-zinc-300 border-white/10"
        }`}
      >
        <span>23.05°N</span>
        <span>22.85°N</span>
        <span>22.65°N</span>
        <span>22.45°N</span>
        <span>22.20°N</span>
      </div>

      {/* Offline Status Badge */}
      <DataStatus isAcademic={isAcademic} />

      {/* GIS Map Toolbar */}
      <MapToolbar
        upazilas={KHULNA_GIS_UPAZILAS}
        selectedUpazilaId={selectedUpazila?.id || null}
        onSelectUpazila={handleSelectUpazila}
        onResetExtent={handleResetExtent}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        showBoundary={showBoundary}
        onToggleBoundary={() => setShowBoundary(!showBoundary)}
        showChoropleth={showChoropleth}
        onToggleChoropleth={() => setShowChoropleth(!showChoropleth)}
        showRivers={showRivers}
        onToggleRivers={() => setShowRivers(!showRivers)}
        showStations={showStations}
        onToggleStations={() => setShowStations(!showStations)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
        activeVariable={activeVariable}
        onSelectVariable={setActiveVariable}
        isAcademic={isAcademic}
        onToggleBasemap={() => setIsAcademic(!isAcademic)}
        onExportMap={handleExportMap}
      />

      {/* Scientific Legend with Quick Period Tabs */}
      <MapLegend
        activeVariable={activeVariable}
        onSelectVariable={setActiveVariable}
        isAcademic={isAcademic}
      />

      {/* Feature Inspector Panel (Upazila, Station, or Empty Map Space) */}
      <FeatureInspector
        selectedUpazila={selectedUpazila}
        selectedStation={selectedStation}
        clickedEmptySpace={clickedEmptySpace}
        activeVariable={activeVariable}
        onClearSelection={handleClearSelection}
        onSelectUpazila={handleSelectUpazila}
        isAcademic={isAcademic}
      />

      {/* Main Map Container */}
      <MapContainer
        center={KHULNA_STUDY_CENTER}
        zoom={10}
        minZoom={8}
        maxZoom={15}
        maxBounds={[
          [21.60, 88.80],
          [23.50, 90.10],
        ]}
        maxBoundsViscosity={0.9}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", minHeight: "520px" }}
        ref={(map) => {
          if (map) mapInstanceRef.current = map;
        }}
      >
        <LayerPanesInitializer />
        <MapInteractionController
          resetTrigger={resetTrigger}
          flyToBounds={flyToBounds}
          onEmptyMapClick={handleEmptyMapClick}
        />
        <ScaleControl position="bottomleft" imperial={false} metric={true} />

        {/* 0. High-Resolution Salinity Kriging Raster & Contours */}
        <SalinityRasterLayer
          activeVariable={activeVariable}
          isAcademic={isAcademic}
          visible={true}
          showRaster={true}
          showContours={true}
        />

        {/* 1. Verified Study Area Boundary Layer */}
        <StudyAreaLayer isAcademic={isAcademic} visible={showBoundary} />

        {/* 2. Upazila Salinity Choropleth Layer */}
        <SalinityChoroplethLayer
          upazilas={KHULNA_GIS_UPAZILAS}
          activeVariable={activeVariable}
          selectedUpazilaId={selectedUpazila?.id || null}
          onSelectUpazila={handleSelectUpazila}
          isAcademic={isAcademic}
          visible={showChoropleth}
          showLabels={showLabels}
        />

        {/* 3. Curvilinear River Network Layer */}
        <RiverLayer
          rivers={KHULNA_GIS_RIVERS}
          isAcademic={isAcademic}
          visible={showRivers}
        />

        {/* 4. In-Situ Observation Stations Layer */}
        <ObservationLayer
          stations={KHULNA_GIS_STATIONS}
          selectedStationId={selectedStation?.id || null}
          onSelectStation={handleSelectStation}
          isAcademic={isAcademic}
          visible={showStations}
        />
      </MapContainer>
    </div>
  );
}

export default KhulnaSalinityMap;
