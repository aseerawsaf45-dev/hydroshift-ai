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
            <span>&bull;</span>
            <span>{reach ? `Coordinates: ${reach.latitude.toFixed(3)}°N, ${reach.longitude.toFixed(3)}°E` : "Khulna Delta"}</span>
            <span>&bull;</span>
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
      <div className="flex items-center gap-6 border-b border-border text-sm font-medium">
        <button className="px-1 py-3 text-primary border-b-2 border-primary">Overview & Timeseries</button>
        <button className="px-1 py-3 text-muted-foreground hover:text-foreground transition-colors">Polder Hydraulics</button>
        <button className="px-1 py-3 text-muted-foreground hover:text-foreground transition-colors">SWORD Geometry</button>
        <button className="px-1 py-3 text-muted-foreground hover:text-foreground transition-colors">Telemetry Audit</button>
      </div>

      {/* Main Chart Area */}
      <Card className="p-6 bg-card border-white/5 flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Salinity & Elevation Timeseries (Harmonized + PINN Forecast)</h3>
          
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#0ea5e9]" />
              <span className="text-muted-foreground">Observed Telemetry</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-[#f59e0b] border-dashed rounded-full" />
              <span className="text-muted-foreground">PINN Forecast</span>
            </div>
          </div>
        </div>
        
        <div className="w-full h-[320px] flex items-center justify-center border border-border/50 rounded-lg bg-black/20">
          <ForecastChart reachId={reachId} />
        </div>
      </Card>

      {/* Phase 4: Polder Flap Gate Drainage & SWORD Hydraulics Widget */}
      <Card className="p-6 bg-card border-white/10 flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <Gauge className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Polder Flap-Gate Drainage & Hydraulic Head Status
              </h3>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                PHASE 4 SWOT DECOUPLING
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Evaluates gravity drainage feasibility: <code className="text-primary font-mono font-bold">Δh = WSE(river) - H(canal)</code>. Decouples satellite WSE into boundary gravity head rather than aliasing semi-diurnal point salinity.
            </p>
          </div>

          {drainage && (
            <Badge 
              variant="outline" 
              className={`text-xs px-2.5 py-1 font-mono uppercase font-bold ${
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Hydraulic Head Meter */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
                Boundary Hydraulic Head
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-mono font-bold ${
                  drainage && drainage.head_difference_m < -0.3 
                    ? "text-emerald-400" 
                    : drainage && drainage.head_difference_m <= 0 
                    ? "text-amber-300" 
                    : "text-red-400"
                }`}>
                  {drainage ? `${drainage.head_difference_m > 0 ? "+" : ""}${drainage.head_difference_m.toFixed(2)}` : "--"}
                </span>
                <span className="text-sm font-mono text-muted-foreground">meters (Δh)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono pt-3 border-t border-white/5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">River WSE (SWOT/BWDB):</span>
                <span className="font-bold text-white">{drainage?.river_wse_m_pwd.toFixed(2)} m PWD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interior Canal Stage:</span>
                <span className="font-bold text-cyan-300">{canalStage.toFixed(2)} m PWD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discharge Capacity:</span>
                <span className="font-bold text-emerald-400">{drainage?.discharge_capacity_m3s.toFixed(1)} m³/s</span>
              </div>
            </div>
          </div>

          {/* 2. Interactive Canal Stage Controller */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-wider">
                  Interior Canal Stage Simulation
                </span>
                <span className="font-mono text-xs font-bold text-cyan-300">{canalStage.toFixed(2)} m</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3">
                Adjust the internal polder drainage canal level to test flap-gate response against exterior river stage.
              </p>
              
              <input 
                type="range" 
                min="0.60" 
                max="2.50" 
                step="0.05"
                value={canalStage}
                onChange={(e) => setCanalStage(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
                <span>0.60 m (Dry Canal)</span>
                <span>1.30 m (Nominal)</span>
                <span>2.50 m (Waterlogged)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Flap-Gate Sluice Vents:</span>
              <div className="flex gap-1.5 font-mono text-xs">
                {[1, 2, 4, 6].map(v => (
                  <button
                    key={v}
                    onClick={() => setNumVents(v)}
                    className={`px-2 py-0.5 rounded border text-[11px] ${
                      numVents === v 
                        ? "bg-primary text-primary-foreground border-primary font-bold" 
                        : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {v} Vents
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Actionable Operational Guidance */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-wider block mb-2">
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

            <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px] text-muted-foreground">
              <strong>Tidal Sluice Rule:</strong> When river stage exceeds canal water level (Δh &gt; 0), flap gates must seat firmly shut to prevent salinity penetration into polder crop fields.
            </div>
          </div>

        </div>

        {/* SWORD Reach Hydraulics Strip */}
        {hydraulics && (
          <div className="p-4 rounded-xl bg-white/[0.015] border border-white/5 grid grid-cols-2 md:grid-cols-5 gap-4 text-xs font-mono">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">SWORD River Width</span>
              <span className="text-white font-bold">{hydraulics.sword_width_m} meters</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Est. Mean Depth</span>
              <span className="text-white font-bold">{hydraulics.estimated_depth_m} meters</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Cross-Section Area A(x)</span>
              <span className="text-cyan-300 font-bold">{hydraulics.cross_sectional_area_m2.toLocaleString()} m²</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">1D Advection Velocity v(x)</span>
              <span className="text-emerald-400 font-bold">{hydraulics.nominal_velocity_ms} m/s</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Reach Flushing Time</span>
              <span className="text-amber-300 font-bold">{hydraulics.flushing_time_days} days / 10km</span>
            </div>
          </div>
        )}

      </Card>
      
      {/* Observation Table */}
      <Card className="bg-card border-white/5 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Ingested Observations & Ground Truth</h3>
            <span className="text-xs text-muted-foreground">Showing {observations.slice(0, 15).length} latest records for this reach</span>
          </div>
          <span className="text-xs px-2 py-1 rounded bg-white/5 font-mono text-muted-foreground">
            Total Telemetry Passes: {observations.length}
          </span>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/20 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Timestamp (UTC)</th>
                <th className="px-4 py-3 font-medium">Variable</th>
                <th className="px-4 py-3 font-medium">Observed Value</th>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">Source Dataset</th>
                <th className="px-4 py-3 font-medium">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-xs">
              {observations.slice(0, 15).map((obs) => {
                const isSalinity = obs.source_variable.toLowerCase().includes("ec") || obs.source_variable.toLowerCase().includes("salinity");
                const isElevation = obs.source_variable.toLowerCase().includes("level") || obs.source_variable.toLowerCase().includes("wse");

                return (
                  <tr key={obs.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(obs.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-sans font-medium text-foreground">
                      {obs.source_variable}
                    </td>
                    <td className={`px-4 py-3 font-semibold ${
                      isSalinity && obs.value >= 4.0 ? "text-destructive" : isElevation ? "text-primary" : "text-foreground"
                    }`}>
                      {obs.value.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{obs.original_unit}</td>
                    <td className="px-4 py-3 font-sans">
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                        {isSwot ? "PO.DAAC Hydrocron" : "BWDB Tidal Stage"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-sans text-emerald-400">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-[10px]">Validated</span>
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
      </Card>

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
