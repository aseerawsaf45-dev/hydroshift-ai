"use client";

import React from "react";
import { Polygon, Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import {
  BANGLADESH_NATIONAL_POLYGONS,
  SUNDARBANS_MANGROVE_POLYGON,
  BANGLADESH_LANDMARKS,
  BANGLADESH_MAJOR_RIVERS,
} from "../gis-bangladesh-data";

interface BangladeshBackgroundLayerProps {
  isAcademic?: boolean;
  visible?: boolean;
  opacity?: number;
}

export function BangladeshBackgroundLayer({
  isAcademic = true,
  visible = true,
  opacity = 0.22,
}: BangladeshBackgroundLayerProps) {
  if (!visible) return null;

  const fillColor = isAcademic ? "#cbd5e1" : "#1e293b";
  const strokeColor = isAcademic ? "#94a3b8" : "#475569";
  const riverColor = isAcademic ? "#93c5fd" : "#0284c7";

  const mangroveFill = isAcademic ? "#a7f3d0" : "#064e3b";
  const mangroveStroke = isAcademic ? "#059669" : "#10b981";

  return (
    <React.Fragment>
      {/* 1. National Bangladesh Landmass Polygons (Lowest Pane) */}
      {BANGLADESH_NATIONAL_POLYGONS.map((rings, idx) => (
        <Polygon
          key={`bd-poly-${idx}`}
          positions={rings}
          pane="bangladeshPane"
          pathOptions={{
            fillColor: fillColor,
            fillOpacity: opacity * 0.75,
            color: strokeColor,
            weight: 1.2,
            opacity: opacity * 1.8,
            dashArray: "3, 4",
            lineCap: "round",
            lineJoin: "round",
          }}
          interactive={false}
        />
      ))}

      {/* 1.5 Sundarbans Coastal Mangrove Biosphere Buffer (Connecting Khulna to Bay of Bengal) */}
      <Polygon
        positions={SUNDARBANS_MANGROVE_POLYGON}
        pane="bangladeshPane"
        pathOptions={{
          fillColor: mangroveFill,
          fillOpacity: opacity * 0.85,
          color: mangroveStroke,
          weight: 1.4,
          opacity: opacity * 2.0,
          dashArray: "4, 4",
          lineCap: "round",
          lineJoin: "round",
        }}
        interactive={false}
      />

      {/* 2. Major National River Axes & Estuarine Tidal Marine Corridors */}
      {BANGLADESH_MAJOR_RIVERS.map((river) => {
        const isMarineCorridor = river.id.includes("corridor");
        const isGorai = river.id === "gorai-conveyance";
        return (
          <Polyline
            key={`bd-river-${river.id}`}
            positions={river.coords}
            pane="bangladeshPane"
            pathOptions={{
              color: isMarineCorridor ? (isAcademic ? "#0284c7" : "#38bdf8") : riverColor,
              weight: isMarineCorridor ? 2.5 : isGorai ? 2.0 : 1.4,
              opacity: isMarineCorridor ? opacity * 2.8 : isGorai ? opacity * 2.2 : opacity * 1.5,
              dashArray: isMarineCorridor ? undefined : isGorai ? "4, 4" : "5, 7",
              lineCap: "round",
            }}
            interactive={false}
          />
        );
      })}

      {/* 3. Subtle Geographic Reference Landmarks */}
      {BANGLADESH_LANDMARKS.map((landmark) => {
        const isCountry = landmark.type === "country";
        const isWater = landmark.type === "waterbody";
        const isKhulnaFocus = landmark.name.includes("Khulna (Study Focus)");
        const isMongla = landmark.name.includes("Mongla Port");
        const isGorai = landmark.name.includes("Gorai");

        const textColor = isKhulnaFocus
          ? "#10b981"
          : isMongla
          ? "#38bdf8"
          : isCountry
          ? isAcademic
            ? "#64748b"
            : "#94a3b8"
          : isWater
          ? isAcademic
            ? "#0284c7"
            : "#38bdf8"
          : isGorai
          ? isAcademic
            ? "#0369a1"
            : "#7dd3fc"
          : isAcademic
          ? "#475569"
          : "#94a3b8";

        const fontSize = isCountry ? "14px" : isKhulnaFocus ? "11px" : isWater ? "11px" : isGorai ? "9.5px" : "9px";
        const letterSpacing = isCountry ? "0.25em" : isKhulnaFocus ? "0.08em" : "0.05em";

        return (
          <Marker
            key={`bd-landmark-${landmark.name}`}
            position={landmark.coords}
            pane="bangladeshPane"
            icon={L.divIcon({
              className: "bangladesh-bg-landmark",
              html: `
                <div style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 3px;
                  font-family: Georgia, 'Times New Roman', serif;
                  font-style: ${isWater || isCountry ? "italic" : "normal"};
                  font-size: ${fontSize};
                  font-weight: ${isCountry || isGorai || isKhulnaFocus ? "700" : "600"};
                  letter-spacing: ${letterSpacing};
                  color: ${textColor};
                  opacity: ${isCountry ? 0.38 : isKhulnaFocus ? 0.95 : isMongla ? 0.85 : isGorai ? 0.75 : 0.45};
                  white-space: nowrap;
                  text-shadow: ${
                    isAcademic
                      ? "0 0 4px #ffffff, 0 0 8px #ffffff"
                      : "0 0 4px #000000, 0 0 8px #000000"
                  };
                  pointer-events: none;
                  ${isKhulnaFocus ? "background: rgba(16, 185, 129, 0.12); padding: 2px 6px; border-radius: 9999px; border: 1px solid rgba(16, 185, 129, 0.4);" : ""}
                ">
                  ${
                    !isCountry && !isWater && !isKhulnaFocus
                      ? `<span style="width: 3.5px; height: 3.5px; border-radius: 9999px; background: currentColor; opacity: 0.6;"></span>`
                      : ""
                  }
                  ${
                    isKhulnaFocus
                      ? `<span style="width: 6px; height: 6px; border-radius: 9999px; background: #10b981; box-shadow: 0 0 6px #10b981;"></span>`
                      : ""
                  }
                  <span>${landmark.name}</span>
                </div>
              `,
              iconSize: [140, 24],
              iconAnchor: [70, 12],
            })}
            interactive={false}
          />
        );
      })}
    </React.Fragment>
  );
}

export default BangladeshBackgroundLayer;

