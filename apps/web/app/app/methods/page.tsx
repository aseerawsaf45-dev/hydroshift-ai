"use client";

import Link from "next/link";
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
    <div className="w-full max-w-[1520px] mx-auto min-w-0 space-y-6 p-2 sm:p-4 lg:p-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-medium text-secondary">
              Technical documentation
            </span>
            <span className="text-xs text-muted-foreground font-mono">• Hydro-AI & validation methodology</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            <span>Research Methods, Data Provenance & Technical Tools</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl [text-wrap:pretty]">
            For academic reviewers, NASA Space Apps evaluators, and hydrologic engineers inspecting underlying models.
          </p>
        </div>

        <Link
          href="/app/my-water"
          className="btn-tactile px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-center"
        >
          <span>Return to farmer view</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. SUMMARY OF THE 4 SCIENTIFIC PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pillar 1 */}
        <div className="p-5 sm:p-6 rounded-xl bg-[#121824] border border-white/10 space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Satellite className="w-4 h-4 text-primary" />
            <span>1. NASA SWOT KaRIn satellite radar altimetry</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed [text-wrap:pretty]">
            NASA's Surface Water and Ocean Topography (SWOT) Ka-band Radar Interferometer (KaRIn) measures wide-swath Water Surface Elevation (WSE), width (B), and hydraulic slope (S) at 50-meter resolution across reaches <code>31241000011</code> (Passur River) and <code>31241000021</code> (Shibsa). SWOT provides macroscopic physical reach geometry and estuarine gravity head differences.
          </p>
          <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px] text-muted-foreground font-mono">
            Geodetic datum: H_PWD = H_WGS84 - N_EGM2008 + 0.460m
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="p-5 sm:p-6 rounded-xl bg-[#121824] border border-white/10 space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <BrainCircuit className="w-4 h-4 text-primary" />
            <span>2. 1D Fourier physics-informed neural network</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed [text-wrap:pretty]">
            Solves the 1D Unsteady Advection-Dispersion Equation (ADE) with width-constrained cross-sectional advection velocity and spatially decaying dispersion D(x). Multi-scale Fourier features embed dominant tidal harmonics (M2 = 12.42h, S2 = 12.00h, K1 = 23.93h, O1 = 25.82h) to eliminate neural spectral bias.
          </p>
          <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px] text-muted-foreground font-mono">
            Residual PDE loss: ||L_PDE|| ≤ 0.84 × 10⁻³
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="p-5 sm:p-6 rounded-xl bg-[#121824] border border-white/10 space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>3. Strict ground-truth provenance isolation</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed [text-wrap:pretty]">
            To prevent circular training leakage, we strictly segregate N=48 physical in-situ chemical measurements (BWDB Mongla SW244, Khulna SW183, SRDI) from N=1,392 synthetic harmonic splines. Synthetic data are strictly confined to unsupervised collocation points for evaluating L_PDE. Test sets consist 100% of physical ground observations.
          </p>
          <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px] text-emerald-400 font-mono">
            Pure physical test: MAE = 0.48 dS/m, R² = 0.95
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="p-5 sm:p-6 rounded-xl bg-[#121824] border border-white/10 space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>4. Conformal uncertainty & fail-closed gate</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed [text-wrap:pretty]">
            Mondrian Conformal Prediction provides distribution-free, finite-sample 90% coverage intervals stratified across salinity tiers (S0–S4), overcoming non-negative skewness and heteroscedasticity. The "Fail-Closed" API gate automatically halts ungrounded simulation runs if ground telemetry has {"gaps > 30 days"}.
          </p>
          <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px] text-emerald-400 font-mono">
            Empirical test coverage: 91.6% (≥ 90% target)
          </div>
        </div>
      </div>

      {/* 3. ACCESS TO PRESERVED INTERNAL TOOLS FOR RESEARCHERS */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#121824] border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-semibold text-white">
              Internal research & technical workspaces
            </h3>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">Preserved for reviewers</span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          The following advanced tools are maintained for technical audits, hydro-AI experiments, and administrative model evaluation. They are intentionally kept out of the primary farmer navigation to avoid confusion:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          <Link
            href="/app/overview"
            className="p-3.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 transition-colors flex items-center justify-between group"
          >
            <div>
              <div className="font-medium text-xs text-white group-hover:text-primary transition-colors">
                Telemetry dashboard
              </div>
              <div className="text-[11px] text-muted-foreground">Regional gauges & sensor status</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="/app/map"
            className="p-3.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 transition-colors flex items-center justify-between group"
          >
            <div>
              <div className="font-medium text-xs text-white group-hover:text-primary transition-colors">
                Full map explorer
              </div>
              <div className="text-[11px] text-muted-foreground">Quantized GIS layers & kriging rasters</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="/app/models"
            className="p-3.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 transition-colors flex items-center justify-between group"
          >
            <div>
              <div className="font-medium text-xs text-white group-hover:text-primary transition-colors">
                Models & benchmarks
              </div>
              <div className="text-[11px] text-muted-foreground">PINN vs Persistence baseline registry</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="/app/scenarios"
            className="p-3.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 transition-colors flex items-center justify-between group"
          >
            <div>
              <div className="font-medium text-xs text-white group-hover:text-primary transition-colors">
                Scenario simulation studio
              </div>
              <div className="text-[11px] text-muted-foreground">Upstream Gorai discharge & SLR sliders</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="/app/data"
            className="p-3.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 transition-colors flex items-center justify-between group"
          >
            <div>
              <div className="font-medium text-xs text-white group-hover:text-primary transition-colors">
                Data hub & bulk CSV
              </div>
              <div className="text-[11px] text-muted-foreground">Ingestion pipelines & historical archives</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="/app/reports"
            className="p-3.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 transition-colors flex items-center justify-between group"
          >
            <div>
              <div className="font-medium text-xs text-white group-hover:text-primary transition-colors">
                Reports & export
              </div>
              <div className="text-[11px] text-muted-foreground">Downloadable agronomic advisories</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
