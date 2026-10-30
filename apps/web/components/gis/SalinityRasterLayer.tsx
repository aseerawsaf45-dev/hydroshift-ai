"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

// Domain-specific contour color mapping matching 5-tier Risk publication colormap
const DOMAIN_CONTOUR_COLORS: Record<string, Record<number, string>> = {
  risk: {
    1.0:  "#006837", // Very Low (Dark Green)
    2.0:  "#78c679", // Low (Light Green)
    4.0:  "#ffff00", // Moderate (Yellow)
    8.0:  "#fe9929", // High (Orange)
    12.0: "#e31a1c", // Very High (Crimson)
  },
  river: {
    0.5:  "#006837",
    1.2:  "#78c679",
    2.0:  "#ffff00",
    4.0:  "#fe9929",
    8.0:  "#e31a1c",
    12.0: "#991b1b",
  },
  shallow_gw: {
    1.0:  "#006837",
    2.0:  "#78c679",
    4.0:  "#ffff00",
    7.0:  "#fe9929",
    10.0: "#e31a1c",
    14.0: "#991b1b",
  },
  deep_gw: {
    0.8:  "#006837",
    1.5:  "#78c679",
    2.0:  "#ffff00",
    3.0:  "#fe9929",
    4.0:  "#e31a1c",
    5.0:  "#991b1b",
  },
};

export function getContourColor(domain: string, val: number): string {
  const domMap = DOMAIN_CONTOUR_COLORS[domain];
  if (domMap && domMap[val]) return domMap[val];
  // 5-Tier Risk thresholds fallback
  if (val < 2.0) return "#006837";
  if (val < 4.0) return "#78c679";
  if (val < 8.0) return "#ffff00";
  if (val < 12.0) return "#fe9929";
  return "#e31a1c";
}

export function getContourWeight(val: number): number {
  if (val >= 8.0) return 2.8;
  if (val >= 2.0) return 2.2;
  return 1.6;
}

// Authoritative Khulna District boundary bounds matching raster_metadata.json
export const CANONICAL_RASTER_BOUNDS: [[number, number], [number, number]] = [
  [22.18, 89.22],
  [23.08, 89.74],
];

export const VALID_RASTER_DOMAINS = ["river", "shallow_gw", "deep_gw", "risk"] as const;
export type RasterDomain = (typeof VALID_RASTER_DOMAINS)[number];

export interface DomainMetadata {
  raster: string;
  contours: string;
  min_val: number;
  max_val: number;
  contour_levels: number[];
}

export interface RasterMetadata {
  bounds: [[number, number], [number, number]];
  width: number;
  height: number;
  domains: Record<string, DomainMetadata>;
}

export interface SalinityRasterLayerProps {
  /** Active domain variable: "river" | "shallow_gw" | "deep_gw" (or seasonal period) */
  activeVariable: string;
  isAcademic?: boolean;
  visible?: boolean;
  showRaster?: boolean;
  showContours?: boolean;
  opacity?: number;
  salinityUnit?: "ppt" | "dS/m";
  onStatusChange?: (status: {
    loading: boolean;
    error: string | null;
    domain: string | null;
    contoursCount: number;
  }) => void;
}

/**
 * Validates bounding box coordinate order and geographic sanity:
 * Must be [[south, west], [north, east]] with south < north and west < east.
 */
function validateBounds(
  bounds: unknown
): [[number, number], [number, number]] | null {
  if (!Array.isArray(bounds) || bounds.length !== 2) return null;
  const [sw, ne] = bounds;
  if (!Array.isArray(sw) || sw.length !== 2) return null;
  if (!Array.isArray(ne) || ne.length !== 2) return null;

  const [south, west] = sw;
  const [north, east] = ne;

  if (
    typeof south !== "number" ||
    typeof west !== "number" ||
    typeof north !== "number" ||
    typeof east !== "number"
  ) {
    return null;
  }

  // WGS 84 coordinate validity check
  if (south >= north || west >= east) return null;
  if (south < -90 || north > 90 || west < -180 || east > 180) return null;

  return [
    [south, west],
    [north, east],
  ];
}

/**
 * Renders verified local salinity raster and GeoJSON contours for
 * River Water, Shallow Groundwater, and Deep Groundwater domains.
 *
 * Requirements:
 * - 100% offline local asset paths (/gis/...)
 * - Strict Leaflet z-index layer pane hierarchy
 * - Stale layers cleanly removed on variable change or unmount
 * - Documented isohaline levels displayed on contour click
 * - Non-fabrication of arbitrary raster values
 */
export function SalinityRasterLayer({
  activeVariable,
  isAcademic = true,
  visible = true,
  showRaster = true,
  showContours = true,
  opacity,
  salinityUnit = "dS/m",
  onStatusChange,
}: SalinityRasterLayerProps) {
  const map = useMap();
  const [, startTransition] = useTransition();

  const [metadata, setMetadata] = useState<RasterMetadata | null>(null);
  const [contourData, setContourData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const imageOverlayRef = useRef<L.ImageOverlay | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const isRasterMode = (VALID_RASTER_DOMAINS as readonly string[]).includes(
    activeVariable
  );

  // 1. Fetch and validate raster metadata once
  useEffect(() => {
    let cancelled = false;

    fetch("/gis/raster_metadata.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} loading raster_metadata.json`);
        return res.json() as Promise<RasterMetadata>;
      })
      .then((data) => {
        if (cancelled) return;
        const validBounds = validateBounds(data.bounds);
        if (!validBounds) {
          throw new Error("Invalid raster bounds in raster_metadata.json");
        }
        startTransition(() => {
          setMetadata(data);
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("[SalinityRasterLayer] Using canonical fallback metadata:", err);
        startTransition(() => {
          setMetadata({
            bounds: CANONICAL_RASTER_BOUNDS,
            width: 1000,
            height: 1200,
            domains: {
              river: {
                raster: "/gis/salinity_river.png",
                contours: "/gis/contours_river.json",
                min_val: 0.05,
                max_val: 18.2,
                contour_levels: [0.11, 0.16, 0.38, 1.2, 4.45, 8.0, 12.0],
              },
              shallow_gw: {
                raster: "/gis/salinity_shallow_gw.png",
                contours: "/gis/contours_shallow_gw.json",
                min_val: 0.05,
                max_val: 15.2,
                contour_levels: [0.5, 1.0, 2.0, 5.0, 8.0, 10.0, 14.0],
              },
              deep_gw: {
                raster: "/gis/salinity_deep_gw.png",
                contours: "/gis/contours_deep_gw.json",
                min_val: 0.35,
                max_val: 6.5,
                contour_levels: [0.8, 1.5, 2.0, 2.6, 3.0, 4.0, 5.0],
              },
            },
          });
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Fetch contour GeoJSON whenever active variable changes
  useEffect(() => {
    if (!visible || !isRasterMode) {
      return;
    }

    const domainKey = activeVariable;
    const contourUrl =
      metadata?.domains[domainKey]?.contours || `/gis/contours_${domainKey}.json`;

    let cancelled = false;

    // Report loading state
    startTransition(() => {
      setLoading(true);
      setErrorMessage(null);
    });

    fetch(contourUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} loading ${contourUrl}`);
        }
        return res.json() as Promise<GeoJSON.FeatureCollection>;
      })
      .then((data) => {
        if (cancelled) return;
        if (!data || data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
          throw new Error(`Invalid GeoJSON structure in ${contourUrl}`);
        }
        startTransition(() => {
          setContourData(data);
          setLoading(false);
          setErrorMessage(null);
        });
        if (onStatusChange) {
          onStatusChange({
            loading: false,
            error: null,
            domain: domainKey,
            contoursCount: data.features.length,
          });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        startTransition(() => {
          setLoading(false);
          setErrorMessage(msg);
        });
        if (onStatusChange) {
          onStatusChange({
            loading: false,
            error: msg,
            domain: domainKey,
            contoursCount: 0,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [visible, isRasterMode, activeVariable, metadata, onStatusChange]);

  // 3. Raster ImageOverlay lifecycle
  useEffect(() => {
    if (!map) return;

    // Always clean up existing raster overlay before attaching new one
    if (imageOverlayRef.current) {
      map.removeLayer(imageOverlayRef.current);
      imageOverlayRef.current = null;
    }

    if (!visible || !isRasterMode || !showRaster) {
      return;
    }

    // Ensure rasterPane exists with proper z-index (220: under boundaryPane 250 & adminPane 300)
    let pane = map.getPane("rasterPane");
    if (!pane) {
      pane = map.createPane("rasterPane");
      pane.style.zIndex = "220";
      pane.style.pointerEvents = "none";
    }

    const domainKey = activeVariable;
    const rasterUrl =
      metadata?.domains[domainKey]?.raster || `/gis/salinity_${domainKey}.png`;
    const bounds = metadata?.bounds || CANONICAL_RASTER_BOUNDS;

    const effectiveOpacity =
      typeof opacity === "number"
        ? opacity
        : isAcademic
        ? 0.58
        : 0.68;

    const overlay = L.imageOverlay(rasterUrl, bounds, {
      opacity: effectiveOpacity,
      pane: "rasterPane",
      interactive: false,
      crossOrigin: "anonymous",
      attribution: "BWDB / SRDI Kriging Salinity Surface · WGS 84 (EPSG:4326)",
    });

    overlay.on("error", () => {
      const err = `Failed to load raster image: ${rasterUrl}`;
      console.error(`[SalinityRasterLayer] ${err}`);
      startTransition(() => {
        setErrorMessage(err);
      });
    });

    overlay.addTo(map);
    imageOverlayRef.current = overlay;

    return () => {
      if (imageOverlayRef.current) {
        map.removeLayer(imageOverlayRef.current);
        imageOverlayRef.current = null;
      }
    };
  }, [map, visible, isRasterMode, showRaster, activeVariable, metadata, isAcademic, opacity]);

  // 4. Update raster opacity if changed without full re-add
  useEffect(() => {
    if (imageOverlayRef.current) {
      const effectiveOpacity =
        typeof opacity === "number"
          ? opacity
          : isAcademic
          ? 0.58
          : 0.68;
      imageOverlayRef.current.setOpacity(effectiveOpacity);
    }
  }, [opacity, isAcademic]);

  // 5. Contour GeoJSON layer lifecycle
  useEffect(() => {
    if (!map) return;

    // Always clean up existing contour layer before re-rendering
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }

    if (!visible || !isRasterMode || !showContours || !contourData) {
      return;
    }

    // Ensure contoursPane exists with z-index 380 (above adminPane 300, below riversPane 420)
    let pane = map.getPane("contoursPane");
    if (!pane) {
      pane = map.createPane("contoursPane");
      pane.style.zIndex = "380";
    }

    const domainKey = activeVariable;
    const domainTitle =
      domainKey === "river"
        ? "River Surface Water"
        : domainKey === "shallow_gw"
        ? "Shallow Groundwater (15-35m)"
        : "Deep Pleistocene Groundwater";

    const layer = L.geoJSON(contourData as GeoJSON.GeoJsonObject, {
      pane: "contoursPane",
      style: (feature) => {
        if (!feature?.properties) return {};
        const val = Number(feature.properties.value ?? 0);
        const color = getContourColor(domainKey, val);
        const weight = getContourWeight(val);
        return {
          color,
          weight,
          opacity: isAcademic ? 0.92 : 0.96,
          lineCap: "round" as const,
          lineJoin: "round" as const,
        };
      },
      onEachFeature: (feature, lyr) => {
        if (!feature?.properties) return;
        const val = feature.properties.value as number;
        const dom = (feature.properties.domain as string) || domainKey;
        const color = getContourColor(domainKey, val);

        const pptVal = (val * 0.64).toFixed(2);
        const ecDisplay = `${val.toFixed(2)} dS/m EC`;
        const pptDisplay = `${pptVal} ppt`;
        const primaryLabel = salinityUnit === "ppt" ? `${pptDisplay} (${ecDisplay})` : `${ecDisplay} (≈ ${pptDisplay})`;

        // Sticky Tooltip on hover
        lyr.bindTooltip(
          `<div style="font-family: inherit; font-size: 11px; font-weight: bold; color: ${color};">
            ${primaryLabel}
            <div style="font-size: 9px; font-weight: 500; color: #64748b; font-family: monospace;">
              ${dom} isohaline &bull; Kriging RBF
            </div>
          </div>`,
          { sticky: true }
        );

        // Click Popup with verified documented isohaline attributes
        lyr.bindPopup(
          `<div style="font-family: inherit; min-width: 220px; padding: 4px; font-size: 12px;">
            <div style="font-family: monospace; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #0284c7; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
              Isohaline Contour Line
            </div>
            <div style="font-size: 15px; font-weight: 800; color: ${color}; margin-bottom: 2px;">
              ${ecDisplay}
            </div>
            <div style="font-size: 11px; font-family: monospace; color: #0284c7; margin-bottom: 6px;">
              Practical Salinity: ${pptDisplay} (1 dS/m ≈ 0.64 ppt)
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
              Hydrologic Domain: <strong>${domainTitle}</strong>
            </div>
            <div style="background: #f1f5f9; padding: 6px; border-radius: 6px; font-size: 10px; font-family: monospace; color: #334155; line-height: 1.4;">
              Method: 2D RBF Kriging Interpolation<br/>
              Extent: Regional Estuary (21.65°N - 23.18°N)<br/>
              Datum: WGS 84 (EPSG:4326)
            </div>
          </div>`,
          { className: "custom-gis-popup" }
        );
      },
    });

    layer.addTo(map);
    geoJsonLayerRef.current = layer;

    return () => {
      if (geoJsonLayerRef.current) {
        map.removeLayer(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }
    };
  }, [map, visible, isRasterMode, showContours, contourData, activeVariable, isAcademic, salinityUnit]);

  // Clean up all layers if this component completely unmounts
  useEffect(() => {
    return () => {
      if (imageOverlayRef.current && map) {
        map.removeLayer(imageOverlayRef.current);
        imageOverlayRef.current = null;
      }
      if (geoJsonLayerRef.current && map) {
        map.removeLayer(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }
    };
  }, [map]);

  // Visible loading or error badge rendered in MapContainer
  if (!isRasterMode) return null;

  return (
    <>
      {loading && (
        <div className="leaflet-top leaflet-left pointer-events-none mt-20 ml-28 z-[600]">
          <div className="pointer-events-auto px-2.5 py-1.5 rounded-lg bg-sky-950/85 backdrop-blur text-white text-[11px] font-mono shadow-xl border border-sky-400/30 flex items-center gap-2">
            <span className="w-2.5 h-2.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>Loading {activeVariable} salinity raster &amp; contours...</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="leaflet-top leaflet-left pointer-events-none mt-20 ml-28 z-[600]">
          <div className="pointer-events-auto px-3 py-1.5 rounded-lg bg-rose-600/95 text-white text-[11px] font-mono shadow-xl border border-rose-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>Asset Load Error: {errorMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default SalinityRasterLayer;
