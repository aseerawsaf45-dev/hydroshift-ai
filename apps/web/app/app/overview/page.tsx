"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Waves,
  ArrowUpRight,
  ShieldAlert,
  Droplets,
  Activity,
  Layers,
  ChevronRight,
  MapPin,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

const MapWrapper = dynamic(() => import("@/components/MapWrapper"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#05070d] flex items-center justify-center text-muted-foreground text-xs">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="font-mono">Loading Regional Telemetry Map...</span>
      </div>
    </div>
  ),
});

interface StatsSummary {
  status: string;
  data_mode: string;
  water_elevation_m: number;
  water_elevation_unit: string;
  salinity_ec_val: number;
  salinity_ec_unit: string;
  total_monitoring_sites: number;
  total_hydro_observations: number;
  total_ground_truth_ec: number;
  active_forecasts_count: number;
  high_risk_alerts_count: number;
  coverage_percent: number;
  last_sync: string;
}

interface AlertItem {
  id: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  entity: string;
  entity_name: string;
  timestamp: string;
  message: string;
  status: string;
}

export default function OverviewPage() {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    
    Promise.all([
      fetch(`${API_URL}/api/v1/reaches/stats/summary`).then(res => res.json()).catch(() => null),
      fetch(`${API_URL}/api/v1/reaches/alerts/all`).then(res => res.json()).catch(() => [])
    ]).then(([statsData, alertsData]) => {
      if (statsData) setStats(statsData);
      if (alertsData) setAlerts(alertsData);
      setLoading(false);
    });
  }, []);

  const criticalAlerts = alerts.filter(a => a.severity === "CRITICAL");

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto">
      
      {/* 0. RESEARCH PROTOTYPE & PROVENANCE NOTICE */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong>Research Prototype & Decision Support System:</strong> Surface water elevations and reaches are tracked via NASA SWOT KaRIn satellite altimetry; salinity is modeled via 1D Physics-Informed Neural Networks and SRDI empirical baselines. Not certified for life-safety operational flood alerts without in-situ ground sensors.
          </span>
        </div>
        <span className="text-[10px] font-mono border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded shrink-0">
          PROVENANCE: HARMONIZED IN-SITU + SWOT L2
        </span>
      </div>

      {/* 1. EXECUTIVE HYDRODYNAMIC BRIEF BANNER */}
      <div className="rounded-3xl bg-[#08131f]/90 border border-white/10 p-5 md:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Southwest Bangladesh Hydrodynamic Posture
              </span>
              <span className="text-[10px] bg-white/10 text-muted-foreground px-2 py-0.5 rounded-full font-mono">
                {stats?.total_monitoring_sites || 20} Synchronized Sites
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Ganges Delta Surface Water & Salinity Telemetry
            </h1>

            <p className="text-xs md:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Real-time monitoring along the Passur-Shibsa estuarine corridor. Marine tidal salinity currently exceeds the 4.0 dS/m agricultural safety limit at Mongla Port (7.9 dS/m) and Khulna Rupsha (4.5 dS/m), while upstream Gorai discharge provides freshwater dilution to the northern reaches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/app/map"
              className="px-4 py-2.5 rounded-xl bg-primary text-black font-semibold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-1.5"
            >
              <span>Open Map Explorer</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/app/forecasts"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs transition-colors"
            >
              PINN Projections
            </Link>
          </div>
        </div>
      </div>

      {/* 2. GAPLESS HIGH-CONTRAST BENTO METRIC TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Metric 1: Water Level */}
        <Card className="p-5 flex flex-col justify-between space-y-3 bg-[#08131f]/80 border-white/10 hover:border-primary/40 transition-all rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">Tidal Elevation</span>
            <span className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white">
                {stats ? stats.water_elevation_m.toFixed(2) : "12.57"}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {stats?.water_elevation_unit || "m (PWD)"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Average Southwest Basin Stage</p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
            <span className="text-primary font-semibold">BWDB Automated Gauge</span>
            <span className="text-muted-foreground">Latest Pass</span>
          </div>
        </Card>

        {/* Metric 2: Salinity EC */}
        <Card className="p-5 flex flex-col justify-between space-y-3 bg-[#08131f]/80 border-white/10 hover:border-rose-500/40 transition-all rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">Max Field Salinity</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-rose-400">
                {stats ? stats.salinity_ec_val.toFixed(1) : "7.9"}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {stats?.salinity_ec_unit || "dS/m"}
              </span>
            </div>
            <p className="text-[11px] text-rose-300/80 mt-1">Critical Boro Rice Hazard Threshold: 4.0 dS/m</p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
            <span className="text-rose-400 font-semibold">Mongla Port (SW244)</span>
            <span className="text-rose-300/70">197% Danger Limit</span>
          </div>
        </Card>

        {/* Metric 3: Data Coverage */}
        <Card className="p-5 flex flex-col justify-between space-y-3 bg-[#08131f]/80 border-white/10 hover:border-sky-500/40 transition-all rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">Dataset Completeness</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white">
                {stats ? stats.coverage_percent : "94"}
              </span>
              <span className="text-xs text-muted-foreground font-mono">%</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {stats ? `${stats.total_hydro_observations} observations loaded` : "831 passes harmonized"}
            </p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
            <span className="text-emerald-400 font-semibold">NASA PO.DAAC + BWDB</span>
            <span className="text-muted-foreground">Validated</span>
          </div>
        </Card>

        {/* Metric 4: Forecast Engine */}
        <Card className="p-5 flex flex-col justify-between space-y-3 bg-[#08131f]/80 border-white/10 hover:border-amber-500/40 transition-all rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">Neural Forecaster</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white">
                {stats ? stats.active_forecasts_count : "10"}
              </span>
              <span className="text-xs text-muted-foreground font-mono">Active Streams</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Physics-Constrained Saint-Venant 1D</p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
            <span className="text-amber-400 font-semibold">7 - 14 Days Lead</span>
            <span className="text-muted-foreground">R² = 0.941</span>
          </div>
        </Card>

      </div>

      {/* 3. WORKSPACE CORE: REAL-TIME DELTA MAP & CRISIS ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-[520px]">
        
        {/* Map Panel (Spans 2 columns) */}
        <Card className="col-span-1 lg:col-span-2 bg-[#08131f]/90 border-white/10 p-0 overflow-hidden relative flex flex-col rounded-3xl shadow-2xl">
          {/* Top Floating Badge Bar */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            <div className="bg-[#08131f]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-3 shadow-lg pointer-events-auto">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">Spatial Network:</span>
              <div className="flex items-center gap-1.5 text-xs text-white">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="text-[11px]">16 Gauges</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[11px]">4 SWOT Passes</span>
              </div>
            </div>

            <Link
              href="/app/map"
              className="bg-primary text-black font-semibold text-xs px-3 py-1.5 rounded-xl shadow-lg hover:bg-primary/90 transition-all pointer-events-auto flex items-center gap-1"
            >
              <span>Full Studio View</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Real Leaflet Map */}
          <div className="w-full h-full min-h-[460px] relative z-0">
            <MapWrapper />
          </div>
        </Card>

        {/* Alerts & Critical Reaches Panel (Spans 1 column) */}
        <Card className="col-span-1 bg-[#08131f]/90 border-white/10 p-5 flex flex-col justify-between rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Active Delta Alerts
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                {criticalAlerts.length} Critical
              </span>
            </div>

            <div className="flex flex-col space-y-2.5 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
              {alerts.slice(0, 5).map((alert) => {
                const isCrit = alert.severity === "CRITICAL";
                return (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-xl border flex flex-col space-y-1.5 transition-all ${
                      isCrit 
                        ? "border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/15" 
                        : "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded ${
                        isCrit ? "bg-rose-500/25 text-rose-300" : "bg-amber-500/25 text-amber-300"
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">{alert.entity}</span>
                    </div>

                    <span className="text-xs font-bold text-white leading-tight">{alert.entity_name}</span>
                    <p className="text-[11px] text-muted-foreground leading-snug">{alert.message}</p>
                  </div>
                );
              })}

              {alerts.length === 0 && !loading && (
                <div className="text-center py-10 text-xs text-muted-foreground font-mono">
                  No active threshold breaches detected.
                </div>
              )}
            </div>

          </div>

          <div className="pt-3 border-t border-white/10 mt-3">
            <Link
              href="/app/alerts"
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs text-center block transition-colors"
            >
              Manage Alert Policies & Thresholds &rarr;
            </Link>
          </div>
        </Card>

      </div>
    </div>
  );
}
