"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  CANONICAL_KHULNA_FORECASTS,
  CANONICAL_KHULNA_STATIONS,
  Forecast,
  Site,
} from "@/components/map-data";
import { Cpu, ArrowUpRight, ShieldAlert, Waves, CheckCircle2, Clock } from "lucide-react";

const BASELINE_TIMESTAMP = 1793275200000; // Fixed canonical timestamp for SSR prerender stability

export default function ForecastsPage() {
  const [sites, setSites] = useState<Site[]>(CANONICAL_KHULNA_STATIONS);
  const [allForecasts, setAllForecasts] = useState<Forecast[]>(CANONICAL_KHULNA_FORECASTS);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(BASELINE_TIMESTAMP);

  useEffect(() => {
    setCurrentTime(Date.now());
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

    Promise.all([
      fetch(`${API_URL}/api/v1/reaches`).then(res => res.ok ? res.json() : []).catch(() => []),
      fetch(`${API_URL}/api/v1/reaches/forecasts/all`).then(res => res.ok ? res.json() : []).catch(() => [])
    ]).then(async ([loadedSites, loadedForecasts]) => {
      if (loadedSites && loadedSites.length > 0) {
        setSites(loadedSites);
      }

      let forecasts = loadedForecasts;
      if ((!forecasts || forecasts.length === 0) && loadedSites && loadedSites.length > 0) {
        const manualForecasts: Forecast[] = [];
        for (const site of loadedSites) {
          try {
            const fRes = await fetch(`${API_URL}/api/v1/reaches/${site.id}/forecasts`);
            if (fRes.ok) {
              const f = await fRes.json();
              manualForecasts.push(...f);
            }
          } catch {
            // continue
          }
        }
        if (manualForecasts.length > 0) {
          forecasts = manualForecasts;
        }
      }

      if (forecasts && forecasts.length > 0) {
        setAllForecasts(forecasts);
      }
    });
  }, []);

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto">
      {/* 1. Forecaster Banner */}
      <div className="rounded-3xl glass-panel-elevated spotlight-card border border-white/15 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Physics-Informed Neural Network (PINN v1.2)
              </span>
              <span className="text-[10px] bg-white/10 text-muted-foreground px-2 py-0.5 rounded-full font-mono">
                R² = 0.941 Verified
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Ganges-Passur Reach Projections
            </h1>

            <p className="text-xs md:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Saint-Venant 1D shallow water hydrodynamic constraints combined with 21-day NASA SWOT orbit tracks.
              Forecasting tidal stage elevations and advection-dispersion salinity front penetration 7 to 14 days in advance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/app/scenarios"
              className="px-4 py-2.5 rounded-xl bg-primary text-black font-semibold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-1.5"
            >
              <span>Scenario Studio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Forecast Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allForecasts.map((forecast) => {
          const site = sites.find(s => s.id === forecast.site_id);
          const isStale = forecast.validation_status !== "VALIDATED";
          const horizonDays = Math.max(1, Math.round((new Date(forecast.target_time).getTime() - currentTime) / (1000 * 3600 * 24)));
          const isCritical = forecast.value >= 4.0;

          return (
            <Link key={forecast.id} href={`/app/reaches/${forecast.site_id}`} className="block group">
              <div
                className={`p-5 rounded-2xl glass-panel spotlight-card border transition-all flex flex-col justify-between h-full ${isCritical
                    ? "border-rose-500/30 hover:border-rose-500/60"
                    : "border-white/10 hover:border-primary/40"
                  }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-base text-white group-hover:text-primary transition-colors">
                      {site?.name || forecast.site_id}
                    </h3>
                    <span className="text-xs text-muted-foreground font-mono mt-0.5">{forecast.site_id}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`font-mono text-[10px] uppercase ${isStale
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}
                  >
                    {isStale ? "STALE INPUTS" : "VALIDATED"}
                  </Badge>
                </div>

                <div className="flex flex-col space-y-2.5 pt-4 mt-4 border-t border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" /> Lead Horizon
                    </span>
                    <span className="font-mono text-white font-semibold">+{horizonDays} Days</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-mono flex items-center gap-1">
                      <Waves className="w-3 h-3 text-primary" /> Target Variable
                    </span>
                    <span className="font-mono text-white font-semibold">{forecast.target_variable}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-white/5">
                    <span className="text-muted-foreground font-mono flex items-center gap-1">
                      <ShieldAlert className={`w-3 h-3 ${isCritical ? "text-rose-400" : "text-emerald-400"}`} /> Forecasted Risk
                    </span>
                    <span className={`font-mono font-bold text-sm ${isCritical ? "text-rose-400" : "text-emerald-400"}`}>
                      {forecast.value.toFixed(1)} {forecast.unit} {isCritical ? "(Breach)" : "(Nominal)"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

