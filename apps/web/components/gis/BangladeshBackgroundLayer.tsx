"use client";

import React from "react";
import { Polygon, Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import {
  BANGLADESH_NATIONAL_POLYGONS,
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

      {/* 2. Major National River Axes (Padma, Jamuna, Meghna, Gorai Branch) */}
      {BANGLADESH_MAJOR_RIVERS.map((river) => (
        <Polyline
          key={`bd-river-${river.id}`}
          positions={river.coords}
          pane="bangladeshPane"
          pathOptions={{
            color: riverColor,
            weight: river.id === "gorai-conveyance" ? 2.0 : 1.4,
            opacity: river.id === "gorai-conveyance" ? opacity * 2.2 : opacity * 1.5,
            dashArray: river.id === "gorai-conveyance" ? "4, 4" : "5, 7",
            lineCap: "round",
          }}
          interactive={false}
        />
      ))}

      {/* 3. Subtle Geographic Reference Landmarks (Dhaka, Kushtia, Barisal, Bay of Bengal) */}
      {BANGLADESH_LANDMARKS.map((landmark) => {
        const isCountry = landmark.type === "country";
        const isWater = landmark.type === "waterbody";
        const isGorai = landmark.name.includes("Gorai");

        const textColor = isCountry
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

        const fontSize = isCountry ? "14px" : isWater ? "11px" : isGorai ? "9.5px" : "9px";
        const letterSpacing = isCountry ? "0.25em" : "0.05em";

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
                  gap: 3px;
                  font-family: Georgia, 'Times New Roman', serif;
                  font-style: ${isWater || isCountry ? "italic" : "normal"};
                  font-size: ${fontSize};
                  font-weight: ${isCountry || isGorai ? "700" : "600"};
                  letter-spacing: ${letterSpacing};
                  color: ${textColor};
                  opacity: ${isCountry ? 0.38 : isGorai ? 0.75 : 0.45};
                  white-space: nowrap;
                  text-shadow: ${
                    isAcademic
                      ? "0 0 4px #ffffff, 0 0 8px #ffffff"
                      : "0 0 4px #000000, 0 0 8px #000000"
                  };
                  pointer-events: none;
                  transform: translate(-50%, -50%);
                ">
                  ${
                    !isCountry && !isWater
                      ? `<span style="width: 3.5px; height: 3.5px; border-radius: 9999px; background: currentColor; opacity: 0.6;"></span>`
                      : ""
                  }
                  <span>${landmark.name}</span>
                </div>
              `,
              iconSize: [120, 20],
              iconAnchor: [60, 10],
            })}
            interactive={false}
          />
        );
      })}
    </React.Fragment>
  );
}

export default BangladeshBackgroundLayer;

