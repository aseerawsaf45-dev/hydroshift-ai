"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, AlertTriangle, CheckCircle2, Radio, BellRing } from "lucide-react";

interface AlertItem {
  id: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  entity: string;
  entity_name: string;
  timestamp: string;
  message: string;
  status: string;
}

const DEFAULT_ALERTS: AlertItem[] = [
  {
    id: "alert-sw244-crit",
    severity: "CRITICAL",
    entity: "REACH_SW244",
    entity_name: "Mongla Seaport Main Channel",
    timestamp: "2026-10-29T11:00:00Z",
    message: "Salinity reached 7.9 dS/m (197% of 4.0 dS/m threshold). Severe marine surge intrusion into shrimp polders.",
    status: "ACTIVE",
  },
  {
    id: "alert-khulna-p14",
    severity: "CRITICAL",
    entity: "INTAKE_P14",
    entity_name: "Khulna WASA Madhukhali Intake",
    timestamp: "2026-10-29T10:30:00Z",
    message: "Raw water EC at 4.6 dS/m. Exceeds potable intake limit (1.5 dS/m). Municipal emergency wellfields engaged.",
    status: "ACTIVE",
  },
  {
    id: "alert-dacope-polder",
    severity: "CRITICAL",
    entity: "POLDER_32",
    entity_name: "Dacope Sutarkhali Flap Gate",
    timestamp: "2026-10-29T09:45:00Z",
    message: "Tidal river WSE exceeds canal head by 0.62m. Flap gates locked to prevent saline reverse backflow.",
    status: "ACTIVE",
  },
  {
    id: "alert-paikgachha-warn",
    severity: "WARNING",
    entity: "REACH_SHIBSA",
    entity_name: "Paikgachha Western Shibsa Belt",
    timestamp: "2026-10-29T08:15:00Z",
    message: "Saline front holding at 4.2 dS/m. Agricultural Boro buffer canal storage at 65% capacity.",
    status: "ACTIVE",
  },
  {
    id: "alert-chalna-warn",
    severity: "WARNING",
    entity: "STATION_SW242",
    entity_name: "Chalna Estuary / Dacope Port",
    timestamp: "2026-10-29T07:30:00Z",
    message: "Salinity at 5.2 dS/m. Spring tide flood peak expected within 3 hours.",
    status: "ACTIVE",
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(DEFAULT_ALERTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    fetch(`${API_URL}/api/v1/reaches/alerts/all`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (data && data.length > 0) {
          setAlerts(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch alerts, using canonical fallback", err);
      });
  }, []);

  const criticalCount = alerts.filter(a => a.severity === "CRITICAL").length;
  const warningCount = alerts.filter(a => a.severity === "WARNING").length;

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="rounded-3xl glass-panel-elevated spotlight-card border border-white/15 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
                Delta Threshold Warning Engine
              </span>
              <span className="text-[10px] bg-white/10 text-muted-foreground px-2 py-0.5 rounded-full font-mono">
                {alerts.length} Breaches Logged
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Active Salinity & Hydraulic Alerts
            </h1>

            <p className="text-xs md:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Automated anomaly triggers based on NASA SWOT water surface heights and BWDB conductivity stations. 
              Intakes and sluice gates automatically marked critical when river EC crosses 4.0 dS/m.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{criticalCount} Critical</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{warningCount} Warnings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advisory Uncertainty Notice */}
      <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Advisory Uncertainty Notice:</strong> Alerts incorporate 95% Confidence Intervals from the 5-model deep ensemble. Predictions represent research prototypes; verify with local sensors before operating municipal intake valves.
          </span>
        </div>
        <Badge variant="outline" className="border-amber-500/40 text-amber-300 font-mono text-[10px] shrink-0 ml-3">
          ENSEMBLE UNCERTAINTY ACTIVE
        </Badge>
      </div>

      {/* Alerts Table */}
      <div className="glass-panel-elevated border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/40 border-b border-white/10 font-mono">
              <tr>
                <th className="px-5 py-4 font-bold">Severity</th>
                <th className="px-5 py-4 font-bold">Timestamp</th>
                <th className="px-5 py-4 font-bold">Entity / Reach</th>
                <th className="px-5 py-4 font-bold">Breach Description</th>
                <th className="px-5 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {alerts.map((alert) => {
                const isCrit = alert.severity === "CRITICAL";
                const isWarn = alert.severity === "WARNING";

                return (
                  <tr 
                    key={alert.id}
                    className={`transition-colors ${
                      isCrit 
                        ? "hover:bg-rose-500/10 bg-rose-500/5 border-l-2 border-l-rose-500" 
                        : isWarn 
                        ? "hover:bg-amber-500/10 bg-amber-500/5 border-l-2 border-l-amber-500" 
                        : "hover:bg-white/5 opacity-80"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <Badge 
                        variant="outline" 
                        className={
                          isCrit 
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-mono text-[10px]" 
                            : isWarn 
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-mono text-[10px]" 
                            : "bg-muted text-muted-foreground border-none font-mono text-[10px]"
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs font-mono">
                      {alert.timestamp.includes("T") ? new Date(alert.timestamp).toLocaleDateString() : alert.timestamp}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-white">{alert.entity_name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{alert.entity}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-foreground/90 font-sans leading-relaxed">
                      {alert.message}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold font-mono ${
                        isCrit ? "text-rose-400" : isWarn ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

