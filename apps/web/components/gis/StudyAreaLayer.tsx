"use client";

import { Polygon } from "react-leaflet";
import { KHULNA_STUDY_BOUNDARY_COORDS } from "../gis-khulna-data";

interface StudyAreaLayerProps {
  isAcademic?: boolean;
  visible?: boolean;
}

export function StudyAreaLayer({ isAcademic = true, visible = false }: StudyAreaLayerProps) {
  if (!visible) return null;

  return (
    <Polygon
      positions={KHULNA_STUDY_BOUNDARY_COORDS}
      pane="boundaryPane"
      pathOptions={{
        color: isAcademic ? "rgba(15, 23, 42, 0.4)" : "rgba(56, 189, 248, 0.5)",
        weight: 1.5,
        fillColor: "transparent",
        fillOpacity: 0.0,
        lineCap: "round",
        lineJoin: "round",
      }}
      interactive={false}
    />
  );
}
