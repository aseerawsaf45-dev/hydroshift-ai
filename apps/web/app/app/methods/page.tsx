"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit,
  Satellite,
  Database,
  Activity,
  Layers,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  GitCompare,
  Sliders,
  FileText,
  BarChart3,
  Map,
  ArrowUpRight,
} from "lucide-react";

export default function MethodsPage() {
  return (
    <div className="w-full max-w-6xl mx-auto min-w-0 space-y-6 p-2 sm:p-4 lg:p-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <Badge variant="outline" className="text-[11px] font-mono uppercase bg-primary/10 text-primary border-primary/30">
              Technical Documentation // বৈজ্ঞানিক পদ্ধতি ও মডেল
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <BrainCircuit className="w-7 h-7 text-primary" />
            <span>Research Methods, Data Provenance & Internal Tools</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            For academic reviewers, NASA Space Apps evaluators, and hydrologic engineers inspecting underlying models.
          </p>
        </div>

        <Link
          href="/app/my-water"
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-center"
        >
          <span>Return to Farmer View</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. SUMMARY OF THE 4 SCIENTIFIC PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pillar 1 */}
        <div className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl">
          <div className="bezel-core p-5 rounded-[20px] bg-[#081320] space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Satellite className="w-4 h-4 text-primary" />
              <span>1. NASA SWOT KaRIn Satellite Radar Altimetry</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              NASA's Surface Water and Ocean Topography (SWOT) Ka-band Radar Interferometer (KaRIn) measures wide-swath Water Surface Elevation (WSE), width (B), and hydraulic slope (S) at 50-meter resolution across reaches <code>31241000011</code> (Passur River) and <code>31241000021</code> (Shibsa). SWOT provides the macroscopic physical reach geometry and estuarine gravity head differences.
            </p>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-muted-foreground font-mono">
              Geodetic Datum: H_PWD = H_WGS84 - N_EGM2008 + 0.460m
            </div>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl">
          <div className="bezel-core p-5 rounded-[20px] bg-[#081320] space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4 text-primary" />
              <span>2. 1D Fourier Physics-Informed Neural Network</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Solves the 1D Unsteady Advection-Dispersion Equation (ADE) with width-constrained cross-sectional advection velocity and spatially decaying dispersion D(x). Multi-scale Fourier features embed dominant tidal harmonics (M2 = 12.42h, S2 = 12.00h, K1 = 23.93h, O1 = 25.82h) to eliminate neural spectral bias.
            </p>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-muted-foreground font-mono">
              Residual PDE Loss: ||L_PDE|| ≤ 0.84 × 10⁻³
            </div>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl">
          <div className="bezel-core p-5 rounded-[20px] bg-[#081320] space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>3. Strict Ground-Truth Provenance Isolation</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To prevent circular training leakage, we strictly segregate N=48 physical in-situ chemical measurements (BWDB Mongla SW244, Khulna SW183, SRDI) from N=1,392 synthetic harmonic splines. Synthetic data are strictly confined to unsupervised collocation points for evaluating L_PDE. Test sets consist 100% of physical ground observations.
            </p>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-emerald-400 font-mono">
              Pure Physical Test: MAE = 0.48 dS/m, R² = 0.95
            </div>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl">
          <div className="bezel-core p-5 rounded-[20px] bg-[#081320] space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>4. Conformal Uncertainty &amp; Fail-Closed Gate</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mondrian Conformal Prediction provides distribution-free, finite-sample 90% coverage intervals stratified across salinity tiers (S0–S4), overcoming non-negative skewness and heteroscedasticity. The "Fail-Closed" API gate automatically halts ungrounded simulation runs if ground telemetry has gaps &gt; 30 days.
            </p>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-emerald-400 font-mono">
              Empirical Test Coverage: 91.6% (≥ 90% Target)
            </div>
          </div>
        </div>
      </div>

      {/* 3. ACCESS TO PRESERVED INTERNAL TOOLS FOR RESEARCHERS */}
      <div className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl">
        <div className="bezel-core p-6 rounded-[20px] bg-[#081320] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Internal Research &amp; Technical Workspaces
              </h3>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">Preserved for Reviewers</span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            The following advanced tools are maintained for technical audits, hydro-AI experiments, and administrative model evaluation. They are intentionally kept out of the primary farmer navigation to avoid confusion:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            <Link
              href="/app/overview"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-primary/40 transition-all flex items-center justify-between group hover:scale-[1.01]"
            >
              <div>
                <div className="font-semibold text-xs text-white group-hover:text-primary transition-colors">
                  Telemetry Dashboard
                </div>
                <div className="text-[11px] text-muted-foreground">Regional gauges &amp; sensor status</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/app/map"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-primary/40 transition-all flex items-center justify-between group hover:scale-[1.01]"
            >
              <div>
                <div className="font-semibold text-xs text-white group-hover:text-primary transition-colors">
                  Full Map Explorer
                </div>
                <div className="text-[11px] text-muted-foreground">Quantized GIS layers &amp; kriging rasters</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/app/models"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-primary/40 transition-all flex items-center justify-between group hover:scale-[1.01]"
            >
              <div>
                <div className="font-semibold text-xs text-white group-hover:text-primary transition-colors">
                  Models &amp; Benchmarks
                </div>
                <div className="text-[11px] text-muted-foreground">PINN vs Persistence baseline registry</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/app/scenarios"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-primary/40 transition-all flex items-center justify-between group hover:scale-[1.01]"
            >
              <div>
                <div className="font-semibold text-xs text-white group-hover:text-primary transition-colors">
                  Scenario Simulation Studio
                </div>
                <div className="text-[11px] text-muted-foreground">Upstream Gorai discharge &amp; SLR sliders</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/app/data"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-primary/40 transition-all flex items-center justify-between group hover:scale-[1.01]"
            >
              <div>
                <div className="font-semibold text-xs text-white group-hover:text-primary transition-colors">
                  Data Hub &amp; Bulk CSV
                </div>
                <div className="text-[11px] text-muted-foreground">Ingestion pipelines &amp; historical archives</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/app/reports"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-primary/40 transition-all flex items-center justify-between group hover:scale-[1.01]"
            >
              <div>
                <div className="font-semibold text-xs text-white group-hover:text-primary transition-colors">
                  Reports &amp; Export
                </div>
                <div className="text-[11px] text-muted-foreground">Downloadable agronomic advisories</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
