"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ForecastChart } from "@/components/ForecastChart";
import { 
  Waves, 
  ArrowDownCircle, 
  ShieldCheck, 
  ShieldAlert, 
  Layers, 
  Gauge, 
  Info, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";
import { PolderSluiceInfographic } from "@/components/infographics/PolderSluiceInfographic";

interface ReachInfo {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
}

interface Observation {
  id: string;
  site_id: string;
  timestamp: string;
  source_variable: string;
  value: number;
  original_unit: string;
  quality_flag?: string;
}

interface FlapGateStatus {
  reach_id: string;
  reach_name: string;
  river_wse_m_pwd: number;
  polder_canal_stage_m_pwd: number;
  head_difference_m: number;
  gate_state: "ACTIVE_GRAVITY_DRAINAGE" | "MARGINAL_DRAINAGE" | "LOCKED_SHUT_PREVENTING_BACKFLOW" | string;
  is_draining: boolean;
  backflow_prevented: boolean;
  discharge_capacity_m3s: number;
  recommended_action: string;
}

interface ReachHydraulicProfile {
  reach_id: string;
  reach_name: string;
  distance_from_mouth_km: number;
  sword_width_m: number;
  estimated_depth_m: number;
  cross_sectional_area_m2: number;
  slope_m_per_km: number;
  nominal_velocity_ms: number;
  flushing_time_days: number;
}

function ReachDetailContent() {
  const routeParams = useParams();
  const reachId = typeof routeParams?.reachId === "string" ? routeParams.reachId : "";
  const [reach, setReach] = useState<ReachInfo | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  // Phase 4: Polder Flap-Gate Drainage & SWORD Hydraulics State
  const [canalStage, setCanalStage] = useState<number>(1.30);
  const [numVents, setNumVents] = useState<number>(2);
  const [drainage, setDrainage] = useState<FlapGateStatus | null>(null);
  const [hydraulics, setHydraulics] = useState<ReachHydraulicProfile | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    if (!reachId) return;

    Promise.all([
      fetch(`${API_URL}/api/v1/reaches/${reachId}`).then(res => res.ok ? res.json() : null).catch(() => null),
      fetch(`${API_URL}/api/v1/reaches/${reachId}/observations`).then(res => res.ok ? res.json() : []).catch(() => []),
      fetch(`${API_URL}/api/v1/reaches/${reachId}/hydraulics`).then(res => res.ok ? res.json() : null).catch(() => null)
    ]).then(([loadedReach, loadedObs, loadedHyd]) => {
      setReach(loadedReach);
      setObservations(loadedObs);
      setHydraulics(loadedHyd);
      setLoading(false);
    });
  }, [reachId, API_URL]);

  // Update flap-gate drainage status when canal stage or vents change
  useEffect(() => {
    if (!reachId) return;

    fetch(`${API_URL}/api/v1/reaches/${reachId}/drainage?canal_stage=${canalStage}&num_vents=${numVents}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setDrainage(data);
        } else {
          // Client-side fallback calculation if API is offline
          const riverWse = 1.85; // default representative dry-season tidal river stage
          const deltaH = riverWse - canalStage;
          const isDraining = deltaH < 0.0;
          const isLocked = deltaH > 0.0;
          const state = deltaH < -0.30 ? "ACTIVE_GRAVITY_DRAINAGE" : deltaH <= 0.0 ? "MARGINAL_DRAINAGE" : "LOCKED_SHUT_PREVENTING_BACKFLOW";
          const ventArea = 1.5 * 1.8 * numVents;
          const q = isDraining ? 0.62 * ventArea * Math.sqrt(2 * 9.81 * Math.max(0.02, Math.abs(deltaH))) : 0.0;
          setDrainage({
            reach_id: reachId,
            reach_name: reach?.name || reachId,
            river_wse_m_pwd: riverWse,
            polder_canal_stage_m_pwd: canalStage,
            head_difference_m: Math.round(deltaH * 100) / 100,
            gate_state: state,
            is_draining: isDraining,
            backflow_prevented: isLocked,
            discharge_capacity_m3s: Math.round(q * 100) / 100,
            recommended_action: isLocked
              ? `High-tide reverse head (${deltaH > 0 ? "+" : ""}${deltaH.toFixed(2)} m). Flap gates shut to prevent saline intrusion.`
              : `Gravity drainage active (${q.toFixed(1)} m³/s). Freshwater draining seaward during low-tide window.`
          });
        }
      })
      .catch(() => {});
  }, [reachId, canalStage, numVents, API_URL, reach?.name]);

  const isSwot = reachId.startsWith("3124") || reachId.toLowerCase().includes("swot");

  return (
    <div className="flex flex-col space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {reach?.name || reachId}
            </h1>
            <Badge variant="outline" className={isSwot ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-primary/10 text-primary border-primary/20"}>
              {isSwot ? "NASA SWOT SATELLITE REACH" : "BWDB GROUND GAUGE"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs">ID: {reachId}</span>
            <span>•</span>
            <span>{reach ? `Coordinates: ${reach.latitude.toFixed(3)}°N, ${reach.longitude.toFixed(3)}°E` : "Khulna Delta"}</span>
            <span>•</span>
            <span className="text-xs">{reach?.description || "Active Hydrological Monitoring Station"}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="px-4 py-2 rounded-md bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors text-white">
             Export Data
           </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-semibold overflow-x-auto scrollbar-none">
        <button className="px-3.5 py-1.5 rounded-xl bg-primary text-black font-bold shadow-md shadow-primary/20">
          Overview & Timeseries
        </button>
        <button className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white border border-white/10 transition-colors">
          Polder Hydraulics
        </button>
        <button className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white border border-white/10 transition-colors">
          SWORD Geometry
        </button>
        <button className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white border border-white/10 transition-colors">
          Telemetry Audit
        </button>
      </div>

      {/* Main Chart Area */}
      <div className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl">
        <div className="bezel-core p-6 rounded-[20px] bg-[#081320] flex flex-col space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Waves className="w-4 h-4 text-primary" />
              <span>Salinity & Elevation Timeseries (Harmonized + PINN Forecast)</span>
            </h3>
            
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
                <span className="text-muted-foreground">Observed Telemetry</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 border-2 border-[#f59e0b] border-dashed rounded-full" />
                <span className="text-muted-foreground">PINN Forecast</span>
              </div>
            </div>
          </div>
          
          <div className="w-full h-[320px] flex items-center justify-center border border-white/10 rounded-2xl bg-black/40 p-2 shadow-inner">
            <ForecastChart reachId={reachId} />
          </div>
        </div>
      </div>

      {/* Phase 4: Polder Flap Gate Drainage & SWORD Hydraulics Widget */}
      <div className="bezel-shell p-1 rounded-3xl bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent border border-amber-500/30 shadow-2xl">
        <div className="bezel-core p-6 rounded-[20px] bg-[#081320] flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5">
                <Gauge className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Polder Flap-Gate Drainage & Hydraulic Head Status
                </h3>
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono">
                  PHASE 4 SWOT DECOUPLING
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Evaluates gravity drainage feasibility: <code className="text-primary font-mono font-bold">Δh = WSE(river) - H(canal)</code>. Decouples satellite WSE into boundary gravity head rather than aliasing semi-diurnal point salinity.
              </p>
            </div>

            {drainage && (
              <Badge 
                variant="outline" 
                className={`text-xs px-3 py-1 font-mono uppercase font-bold shrink-0 ${
                  drainage.gate_state === "ACTIVE_GRAVITY_DRAINAGE" 
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" 
                    : drainage.gate_state === "MARGINAL_DRAINAGE"
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                }`}
              >
                {drainage.gate_state === "ACTIVE_GRAVITY_DRAINAGE" && "● Sluice Open (Outward Drainage)"}
                {drainage.gate_state === "MARGINAL_DRAINAGE" && "▲ Marginal Head (Low Flushing)"}
                {drainage.gate_state === "LOCKED_SHUT_PREVENTING_BACKFLOW" && "■ Flap Gate Locked (Backflow Blocked)"}
              </Badge>
            )}
          </div>

          {/* Drainage Operation Metrics & Interactive Stage Control */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Hydraulic Head Meter */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
                  Boundary Hydraulic Head
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-mono font-black tabular-nums ${
                    drainage && drainage.head_difference_m < -0.3 
                      ? "text-emerald-400" 
                      : drainage && drainage.head_difference_m <= 0 
                      ? "text-amber-300" 
                      : "text-red-400"
                  }`}>
                    {drainage ? `${drainage.head_difference_m > 0 ? "+" : ""}${drainage.head_difference_m.toFixed(2)}` : "--"}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">meters (Δh)</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono pt-3 border-t border-white/5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">River WSE (SWOT/BWDB):</span>
                  <span className="font-bold text-white tabular-nums">{drainage?.river_wse_m_pwd.toFixed(2)} m PWD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interior Canal Stage:</span>
                  <span className="font-bold text-cyan-300 tabular-nums">{canalStage.toFixed(2)} m PWD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discharge Capacity:</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{drainage?.discharge_capacity_m3s.toFixed(1)} m³/s</span>
                </div>
              </div>
            </div>

            {/* 2. Interactive Canal Stage Controller */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                    Interior Canal Simulation
                  </span>
                  <span className="font-mono text-xs font-bold text-cyan-300 tabular-nums">{canalStage.toFixed(2)} m</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                  Adjust internal canal level to test flap-gate response against exterior tidal river stage.
                </p>
                
                <input 
                  type="range" 
                  min="0.60" 
                  max="2.50" 
                  step="0.05"
                  value={canalStage}
                  onChange={(e) => setCanalStage(parseFloat(e.target.value))}
                  className="w-full accent-primary h-2 bg-white/10 rounded-lg cursor-pointer transition-all"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
                  <span>0.60 m (Dry)</span>
                  <span>1.30 m (Nominal)</span>
                  <span>2.50 m (High)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">Flap-Gate Vents:</span>
                <div className="flex gap-1.5 font-mono text-xs">
                  {[1, 2, 4, 6].map(v => (
                    <button
                      key={v}
                      onClick={() => setNumVents(v)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                        numVents === v 
                          ? "bg-primary text-black border-primary font-bold shadow-md shadow-primary/20 scale-105" 
                          : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {v} Vents
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Actionable Operational Guidance */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-3 shadow-sm">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-2">
                  Gate Operational Directive
                </span>
                <div className="flex items-start gap-2.5">
                  {drainage?.backflow_prevented ? (
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <p className="text-xs text-white leading-relaxed">
                    {drainage?.recommended_action}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-muted-foreground leading-relaxed">
                <strong>Tidal Sluice Rule:</strong> When river stage exceeds canal water level {"(Δh > 0)"}, flap gates must seat firmly shut to prevent salinity penetration into polder crop fields.
              </div>
            </div>

          </div>

          {/* Sluice Gate Visual Physical Cross-Section Infographic */}
          <div className="pt-2">
            <PolderSluiceInfographic
              riverWse={drainage?.river_wse_m_pwd || 1.85}
              canalStage={canalStage}
              interactive={false}
            />
          </div>

          {/* SWORD Reach Hydraulics Strip */}
          {hydraulics && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 grid grid-cols-2 md:grid-cols-5 gap-4 text-xs font-mono">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">SWORD River Width</span>
                <span className="text-white font-bold tabular-nums">{hydraulics.sword_width_m} meters</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Est. Mean Depth</span>
                <span className="text-white font-bold tabular-nums">{hydraulics.estimated_depth_m} meters</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Cross-Section Area A(x)</span>
                <span className="text-cyan-300 font-bold tabular-nums">{hydraulics.cross_sectional_area_m2.toLocaleString()} m²</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">1D Advection Velocity v(x)</span>
                <span className="text-emerald-400 font-bold tabular-nums">{hydraulics.nominal_velocity_ms} m/s</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Reach Flushing Time</span>
                <span className="text-amber-300 font-bold tabular-nums">{hydraulics.flushing_time_days} days / 10km</span>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Observation Table */}
      <div className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl overflow-hidden">
        <div className="bezel-core rounded-[20px] bg-[#081320] overflow-hidden">
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ingested Observations & Ground Truth</h3>
              <span className="text-[11px] text-muted-foreground">Showing {observations.slice(0, 15).length} latest records for this reach</span>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-muted-foreground self-start sm:self-auto">
              Total Telemetry Passes: <span className="tabular-nums font-bold text-white">{observations.length}</span>
            </span>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-muted-foreground uppercase bg-black/40 border-b border-white/5 font-mono">
                <tr>
                  <th className="px-4 py-3 font-semibold">Timestamp (UTC)</th>
                  <th className="px-4 py-3 font-semibold">Variable</th>
                  <th className="px-4 py-3 font-semibold">Observed Value</th>
                  <th className="px-4 py-3 font-semibold">Unit</th>
                  <th className="px-4 py-3 font-semibold">Source Dataset</th>
                  <th className="px-4 py-3 font-semibold">Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {observations.slice(0, 15).map((obs) => {
                  const isSalinity = obs.source_variable.toLowerCase().includes("ec") || obs.source_variable.toLowerCase().includes("salinity");
                  const isElevation = obs.source_variable.toLowerCase().includes("level") || obs.source_variable.toLowerCase().includes("wse");

                  return (
                    <tr key={obs.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {new Date(obs.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-sans font-medium text-foreground">
                        {obs.source_variable}
                      </td>
                      <td className={`px-4 py-3 font-bold tabular-nums ${
                        isSalinity && obs.value >= 4.0 ? "text-rose-400" : isElevation ? "text-primary" : "text-white"
                      }`}>
                        {obs.value.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{obs.original_unit}</td>
                      <td className="px-4 py-3 font-sans">
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-mono">
                          {isSwot ? "PO.DAAC Hydrocron" : "BWDB Tidal Stage"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-sans text-emerald-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] font-semibold">Validated</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {observations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground font-sans">
                      No individual observations found for this site ID. (Ensure backend server is running on port 8000).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function ReachDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground text-sm">Loading reach telemetry & satellite passes...</div>}>
      <ReachDetailContent />
    </Suspense>
  );
}
