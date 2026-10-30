"use client";

import {
  X,
  MapPin,
  Radio,
  Satellite,
  Droplets,
  Layers,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  Crosshair,
  ExternalLink,
} from "lucide-react";
import {
  GisUpazila,
  GisStation,
  getUpazilaSalinity,
  getSalinityClassForEc,
} from "../gis-khulna-data";

export interface ClickedEmptySpaceInfo {
  lat: number;
  lon: number;
  insideBoundary: boolean;
  parentUpazila: GisUpazila | null;
  nearestStation: { station: GisStation; distanceKm: number } | null;
}

interface FeatureInspectorProps {
  selectedUpazila: GisUpazila | null;
  selectedStation: GisStation | null;
  clickedEmptySpace: ClickedEmptySpaceInfo | null;
  activeVariable: string;
  onClearSelection: () => void;
  onSelectUpazila: (u: GisUpazila) => void;
  isAcademic?: boolean;
}

export function FeatureInspector({
  selectedUpazila,
  selectedStation,
  clickedEmptySpace,
  activeVariable,
  onClearSelection,
  onSelectUpazila,
  isAcademic = true,
}: FeatureInspectorProps) {
  // If nothing selected or clicked, return null
  if (!selectedUpazila && !selectedStation && !clickedEmptySpace) {
    return null;
  }

  return (
    <div className="absolute top-16 right-3 bottom-12 z-[550] w-80 sm:w-96 max-w-[calc(100vw-24px)] pointer-events-auto flex flex-col animate-in slide-in-from-right duration-300">
      <div
        className={`flex-1 overflow-y-auto p-4 rounded-2xl shadow-2xl border flex flex-col space-y-4 ${
          isAcademic
            ? "bg-white/98 text-slate-900 border-slate-300 shadow-slate-500/20"
            : "bg-[#08131f]/95 text-white border-white/20 backdrop-blur-xl"
        }`}
      >
        {/* Top Header with Close Button */}
        <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider font-bold text-muted-foreground">
              {selectedUpazila
                ? "Upazila GIS Dossier"
                : selectedStation
                ? "In-Situ Sensor Telemetry"
                : "Coordinate Inspector"}
            </span>
          </div>

          <button
            onClick={onClearSelection}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* CASE 1: UPAZILA SELECTED                                    */}
        {/* ----------------------------------------------------------- */}
        {selectedUpazila && (
          <div className="flex flex-col space-y-3.5">
            <div>
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white leading-tight">
                  {selectedUpazila.name}
                </h3>
                <span className="text-xs text-muted-foreground font-sans">
                  {selectedUpazila.bengaliName}
                </span>
              </div>
              <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2 mt-0.5">
                <span>ID: {selectedUpazila.id}</span>
                <span>&bull;</span>
                <span>{selectedUpazila.areaKm2} km²</span>
                <span>&bull;</span>
                <span>{selectedUpazila.district} District</span>
              </div>
            </div>

            {/* Main Salinity KPI Box */}
            {(() => {
              const currentEc = getUpazilaSalinity(selectedUpazila, activeVariable);
              const classInfo = getSalinityClassForEc(currentEc);

              return (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground font-semibold">
                      Measured EC ({activeVariable}):
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-mono font-bold text-white shadow-sm"
                      style={{ backgroundColor: classInfo.color }}
                    >
                      {currentEc.toFixed(2)} dS/m
                    </span>
                  </div>

                  <div className="text-xs font-serif font-medium text-slate-800 dark:text-zinc-200">
                    <strong>Classification:</strong> {classInfo.label}
                  </div>

                  <div className="text-[11px] text-muted-foreground leading-snug">
                    {classInfo.impact}
                  </div>
                </div>
              );
            })()}

            {/* Multi-Period Seasonal Evolution Comparison */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                Seasonal Soil Salinity Dynamics
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="text-[10px] text-muted-foreground font-mono">Nov (P1)</div>
                  <div className="font-mono font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
                    {selectedUpazila.period1Ec.toFixed(1)} dS/m
                  </div>
                  <div className="text-[9px] text-muted-foreground">Flushing</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="text-[10px] text-muted-foreground font-mono">Feb (P2)</div>
                  <div className="font-mono font-bold mt-0.5 text-amber-600 dark:text-amber-400">
                    {selectedUpazila.period2Ec.toFixed(1)} dS/m
                  </div>
                  <div className="text-[9px] text-muted-foreground">Mid-Dry</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="text-[10px] text-muted-foreground font-mono">Apr (P3)</div>
                  <div className="font-mono font-bold mt-0.5 text-rose-600 dark:text-rose-400">
                    {selectedUpazila.period3Ec.toFixed(1)} dS/m
                  </div>
                  <div className="text-[9px] text-muted-foreground">Peak Surge</div>
                </div>
              </div>
            </div>

            {/* Summary Statistics across all 3 periods */}
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono space-y-1">
              <div className="text-[10px] uppercase font-bold text-muted-foreground">
                Calculated Empirical Statistics
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Minimum Observed EC:</span>
                <strong className="text-foreground">{selectedUpazila.period1Ec.toFixed(2)} dS/m</strong>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Annual Mean EC:</span>
                <strong className="text-foreground">
                  {((selectedUpazila.period1Ec + selectedUpazila.period2Ec + selectedUpazila.period3Ec) / 3).toFixed(2)} dS/m
                </strong>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Peak Dry Season Maximum:</span>
                <strong className="text-foreground">{selectedUpazila.period3Ec.toFixed(2)} dS/m</strong>
              </div>
            </div>

            {/* Multi-Depth Hydrologic & Aquifer Profile */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                Hydrological Multi-Depth Profile
              </span>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs space-y-1.5 font-sans">
                <div className="flex justify-between font-mono">
                  <span className="text-muted-foreground">Surface River Water:</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    {selectedUpazila.riverEc.toFixed(1)} dS/m
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-muted-foreground">Shallow Groundwater (15-35m):</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {selectedUpazila.shallowGwEc.toFixed(1)} dS/m
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-muted-foreground">Deep Pleistocene Aquifer:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {selectedUpazila.deepGwEc.toFixed(1)} dS/m
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono pt-1 border-t border-slate-200 dark:border-white/10">
                  Aquifer Wellfields: {selectedUpazila.aquiferDepthM}
                </div>
              </div>
            </div>

            {/* Agricultural Decision Support & Recommended Crops */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                Crop &amp; Irrigation Recommendations
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1.5">
                <div className="font-serif font-bold text-emerald-800 dark:text-emerald-300">
                  Salt-Tolerant Cropping Protocol:
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedUpazila.recommendedCrops.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-white/10 text-[10px] font-mono font-bold text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-white/10"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Geographic Metadata & Centroid */}
            <div className="text-[10px] font-mono text-muted-foreground pt-2 border-t border-slate-200 dark:border-white/10 flex flex-col space-y-0.5">
              <div>Representative Centroid: {selectedUpazila.center[0].toFixed(4)}°N, {selectedUpazila.center[1].toFixed(4)}°E</div>
              <div>Data Provenance: SRDI Soil Salinity Survey &bull; WGS 84</div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* CASE 2: OBSERVATION STATION SELECTED                         */}
        {/* ----------------------------------------------------------- */}
        {selectedStation && (
          <div className="flex flex-col space-y-3.5">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white leading-tight">
                {selectedStation.name}
              </h3>
              <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2 mt-0.5">
                <span>ID: {selectedStation.id}</span>
                <span>&bull;</span>
                <span>{selectedStation.river}</span>
                <span>&bull;</span>
                <span>{selectedStation.agency}</span>
              </div>
            </div>

            {/* Measured EC Card */}
            {(() => {
              const classInfo = getSalinityClassForEc(selectedStation.ecMean);
              return (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground font-semibold">
                      Recorded Mean EC:
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-mono font-bold text-white shadow-sm"
                      style={{ backgroundColor: classInfo.color }}
                    >
                      {selectedStation.ecMean.toFixed(2)} dS/m
                    </span>
                  </div>

                  <div className="text-xs font-serif font-medium text-slate-800 dark:text-zinc-200">
                    <strong>Salinity Tier:</strong> {classInfo.label}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1 font-mono">
                    <div className="p-1.5 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <span className="text-[9px] text-muted-foreground block">Minimum EC</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {selectedStation.ecMin.toFixed(2)} dS/m
                      </strong>
                    </div>
                    <div className="p-1.5 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <span className="text-[9px] text-muted-foreground block">Maximum EC</span>
                      <strong className="text-rose-600 dark:text-rose-400">
                        {selectedStation.ecMax.toFixed(2)} dS/m
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Telemetry Observations Details */}
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-muted-foreground">
                In-Situ Telemetry Archive
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Sample Count:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {selectedStation.obsCount} verified readings
                </strong>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Water Surface Elevation:</span>
                <strong className="text-foreground">{selectedStation.wsePwd.toFixed(2)} m PWD</strong>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Danger Level (DL):</span>
                <strong className="text-foreground">{selectedStation.dangerLevel.toFixed(2)} m PWD</strong>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Distance to Bay of Bengal:</span>
                <strong className="text-foreground">{selectedStation.distanceKm} km</strong>
              </div>
              <div className="flex justify-between text-muted-foreground pt-1 border-t border-slate-200 dark:border-white/10 text-[10px]">
                <span>Observation Period:</span>
                <span>{selectedStation.firstObs.slice(0, 10)} to {selectedStation.lastObs.slice(0, 10)}</span>
              </div>
            </div>

            {/* Coordinates & Agency */}
            <div className="text-[10px] font-mono text-muted-foreground pt-2 border-t border-slate-200 dark:border-white/10 flex flex-col space-y-0.5">
              <div>Coordinates: {selectedStation.latitude.toFixed(4)}°N, {selectedStation.longitude.toFixed(4)}°E</div>
              <div>Source: {selectedStation.dataSource} &bull; WGS 84</div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* CASE 3: EMPTY MAP SPACE CLICKED (COORDINATE INSPECTOR)       */}
        {/* ----------------------------------------------------------- */}
        {clickedEmptySpace && !selectedUpazila && !selectedStation && (
          <div className="flex flex-col space-y-3.5">
            <div>
              <div className="flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-sky-500" />
                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white leading-tight">
                  Point Coordinate Inspector
                </h3>
              </div>
              <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                Geographic coordinates clicked by user
              </div>
            </div>

            {/* Coordinates Card */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Latitude:</span>
                <strong className="text-sky-600 dark:text-sky-400 font-bold text-sm">
                  {clickedEmptySpace.lat.toFixed(5)}°N
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Longitude:</span>
                <strong className="text-sky-600 dark:text-sky-400 font-bold text-sm">
                  {clickedEmptySpace.lon.toFixed(5)}°E
                </strong>
              </div>

              {/* Boundary Verification Pill */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-sans">Study Area Boundary:</span>
                {clickedEmptySpace.insideBoundary ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Within Khulna District</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Outside Study Boundary</span>
                  </span>
                )}
              </div>
            </div>

            {/* Scientific Rigor: Strict Non-Fabrication Disclosure */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs space-y-2 font-sans">
              <div className="font-serif font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-sky-500" />
                <span>
                  {["river", "shallow_gw", "deep_gw"].includes(activeVariable)
                    ? "Continuous Salinity Surface (Visual Overlay)"
                    : "Measurement Field Status"}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed">
                {["river", "shallow_gw", "deep_gw"].includes(activeVariable) ? (
                  <>
                    Georeferenced RBF kriging surface (WGS 84 / EPSG:4326). Unmonitored coordinates are not assigned fabricated numerical readings. Click any <strong>contour isoline</strong> to view certified salinity levels, or click an Upazila polygon / monitoring station for certified data.
                  </>
                ) : (
                  <>
                    No direct in-situ sensor at this arbitrary coordinate (Unmeasured). As per scientific GIS rigor, salinity values are not fabricated. Click an Upazila polygon or a monitoring station to view certified measurements.
                  </>
                )}
              </div>
            </div>

            {/* Parent Upazila Quick Shortcut if inside one */}
            {clickedEmptySpace.parentUpazila && (
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 text-xs space-y-1.5 font-sans">
                <div className="text-[11px] text-muted-foreground font-mono">Enclosing Administrative Area:</div>
                <div className="flex items-center justify-between">
                  <strong className="font-serif text-slate-900 dark:text-white">
                    {clickedEmptySpace.parentUpazila.name}
                  </strong>
                  <button
                    onClick={() => onSelectUpazila(clickedEmptySpace.parentUpazila!)}
                    className="px-2 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Inspect Upazila</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Nearest Observation Station */}
            {clickedEmptySpace.nearestStation && (
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs space-y-1 font-mono">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">
                  Nearest Verified Gauge:
                </div>
                <div className="font-sans font-bold text-slate-800 dark:text-zinc-200">
                  {clickedEmptySpace.nearestStation.station.name}
                </div>
                <div className="text-[10px] text-muted-foreground flex justify-between">
                  <span>Proximity:</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    {clickedEmptySpace.nearestStation.distanceKm} km away
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
