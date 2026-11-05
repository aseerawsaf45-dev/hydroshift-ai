import Link from "next/link";
import {
  Waves,
  ArrowUpRight,
  Radio,
  Satellite,
  Activity,
  ShieldAlert,
  ChevronRight,
  Database,
  Cpu,
  Droplets,
  Layers,
  MapPin,
  Sliders,
} from "lucide-react";
import { LandingSimulationTeaser } from "@/components/gis/LandingSimulationTeaser";

export default function Home() {
  return (
    <main className="min-h-[100dvh] w-full bg-[#05070d] text-foreground overflow-x-hidden selection:bg-primary selection:text-black">
      {/* 1. FLOATING GLASS PILL NAVIGATION */}
      <header className="fixed top-5 inset-x-0 z-50 flex justify-center px-4">
        <nav className="w-full max-w-5xl h-14 rounded-full glass-panel-elevated border border-white/15 px-5 flex items-center justify-between shadow-2xl">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group btn-tactile">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/30 to-sky-400/20 border border-primary/40 flex items-center justify-center text-primary transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(87,214,208,0.5)]">
              <Waves className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-xs uppercase text-white font-mono">HydroShift</span>
                <span className="px-1 py-0.2 rounded bg-primary/20 text-primary font-bold text-[8px] font-mono border border-primary/30">AI</span>
              </div>
              <span className="text-[9px] text-muted-foreground font-mono">Delta Hydrology Platform</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
            <Link href="#architecture" className="hover:text-white transition-colors">
              Radar Architecture
            </Link>
            <Link href="#bento" className="hover:text-white transition-colors">
              Data Pipeline
            </Link>
            <Link href="#impact" className="hover:text-white transition-colors">
              Delta Hazard
            </Link>
            <Link href="/app/scenarios" className="hover:text-primary transition-colors flex items-center gap-1 font-mono text-[11px] text-primary/90">
              <Sliders className="w-3 h-3" />
              <span>Simulation Studio</span>
            </Link>
            <Link href="/app/forecasts" className="hover:text-white transition-colors">
              PINN Forecaster
            </Link>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Orbit SW241-244</span>
            </div>
            
            <Link
              href="/app/map"
              className="px-4 py-2 rounded-full bg-primary text-black font-semibold text-xs transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 flex items-center gap-1.5"
            >
              <span>Launch Studio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* 2. ATTENTION (HERO): CINEMATIC WIDE 2-LINE HEADLINE */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-36 px-4 flex flex-col items-center text-center">
        {/* Subtle Ambient Radial Wash */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[350px] bg-sky-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />

        {/* Status Chip */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground backdrop-blur-xl mb-8 shadow-inner shadow-white/5 hover:border-primary/40 transition-colors">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="font-mono text-white text-[11px] tracking-wide font-medium">NASA PO.DAAC & BWDB Synchronized // 60/60 VERIFIED</span>
        </div>

        {/* 2-Line Iron Rule H1 */}
        <h1 className="w-full max-w-5xl text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] text-balance">
          Surface Water Elevation and Salinity Intelligence for the{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-200 to-sky-400 drop-shadow-[0_0_35px_rgba(87,214,208,0.3)]">
            Khulna Delta
          </span>
          .
        </h1>

        {/* Subtitle */}
        <p className="mt-8 text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed font-normal text-pretty">
          Harmonizing NASA SWOT wide-swath Ka-band radar interferometry with BWDB tidal stage telemetry and physics-informed neural networks to forecast saltwater intrusion across the Lower Ganges Delta.
        </p>

        {/* High-Contrast CTAs with Tactile Feel */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/app/map"
            className="btn-tactile px-7 py-3.5 rounded-full bg-gradient-to-r from-primary to-cyan-400 text-black font-bold text-sm shadow-xl shadow-primary/25 hover:shadow-primary/40 flex items-center gap-2 border border-primary/50"
          >
            <span>Explore Spatial Studio</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>

          <Link
            href="/app/overview"
            className="btn-tactile px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold text-sm backdrop-blur-xl flex items-center gap-2 shadow-lg"
          >
            <span>Telemetry Dashboard</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>

        {/* Real-time Delta Metrics Pill Bar */}
        <div className="mt-16 w-full max-w-4xl p-1.5 rounded-2xl glass-panel-elevated border border-white/15 shadow-2xl spotlight-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left p-2">
            <div className="flex flex-col p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-primary/30 transition-all">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-muted-foreground">Monitoring Sites</span>
              <span className="text-2xl font-bold font-mono text-white mt-0.5 tracking-tight">20 Reaches</span>
              <span className="text-[10px] text-emerald-400 font-mono mt-0.5">16 BWDB + 4 SWOT</span>
            </div>
            <div className="flex flex-col p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-primary/30 transition-all">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-muted-foreground">Observed Passes</span>
              <span className="text-2xl font-bold font-mono text-white mt-0.5 tracking-tight">831 Passes</span>
              <span className="text-[10px] text-primary font-mono mt-0.5">Harmonized Hydrocron</span>
            </div>
            <div className="flex flex-col p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-rose-500/30 transition-all">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-muted-foreground">Critical Salinity</span>
              <span className="text-2xl font-bold font-mono text-rose-400 mt-0.5 tracking-tight">7.9 dS/m</span>
              <span className="text-[10px] text-rose-300/80 font-mono mt-0.5">Mongla Port SW244</span>
            </div>
            <div className="flex flex-col p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-sky-500/30 transition-all">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-muted-foreground">PINN Forecast</span>
              <span className="text-2xl font-bold font-mono text-sky-400 mt-0.5 tracking-tight">7 - 14 Days</span>
              <span className="text-[10px] text-sky-300/80 font-mono mt-0.5">Saint-Venant Loss Engine</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUSTED MARQUEE: SPACE & HYDROLOGICAL INSTITUTIONS */}
      <section className="py-12 border-y border-white/10 bg-black/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-6">
            Data Architecture Backed by Global Hydrology & Earth Observation Sources
          </span>
          <div className="w-full flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-80">
            <span className="font-mono text-sm tracking-wider font-semibold text-white/90">NASA PO.DAAC</span>
            <span className="font-mono text-sm tracking-wider font-semibold text-white/90">BWDB BANGLADESH</span>
            <span className="font-mono text-sm tracking-wider font-semibold text-white/90">CNES FRANCE</span>
            <span className="font-mono text-sm tracking-wider font-semibold text-white/90">COPERNICUS MARINE</span>
            <span className="font-mono text-sm tracking-wider font-semibold text-white/90">CEGIS DHAKA</span>
          </div>
        </div>
      </section>

      {/* 4. INTEREST: THE GAPLESS BENTO GRID (grid-flow-dense, zero dead cells) */}
      <section id="bento" className="py-24 md:py-36 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-primary mb-3">System Architecture</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight text-balance">
            Engineered to Solve the Ganges Delta Salinity Crisis.
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl text-balance">
            During low-discharge dry months, upstream Gorai freshwater drops drastically, allowing seawater to penetrate 80km inland through Passur and Shibsa corridors.
          </p>
        </div>

        {/* 4-Card Gapless Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 grid-flow-dense">
          
          {/* Card 1: SWOT Ka-Band Radar (Spans 2 columns) */}
          <div className="md:col-span-2 p-8 rounded-3xl glass-panel spotlight-card relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/20 transition-all" />
            
            <div>
              <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mb-6">
                <Satellite className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold">NASA SWOT Satellite Telemetry</span>
              <h3 className="text-2xl font-bold text-white mt-1">120km Wide-Swath Radar Interferometry</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2.5 max-w-lg">
                KaRIn (Ka-band Radar Interferometer) measures water surface elevations at sub-centimeter vertical accuracy, resolving complex braided estuaries, polder canals, and river slopes that traditional altimeters miss.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-3 text-left">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-mono">Orbit Frequency</span>
                <p className="text-sm font-bold text-white font-mono mt-0.5">21-Day Repeat</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-mono">Spatial Reach</span>
                <p className="text-sm font-bold text-white font-mono mt-0.5">SW241 - SW244</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-mono">Accuracy</span>
                <p className="text-sm font-bold text-white font-mono mt-0.5">&plusmn;1.2 cm</p>
              </div>
            </div>
          </div>

          {/* Card 2: BWDB Automated Stage Gages (Spans 1 column) */}
          <div className="p-8 rounded-3xl glass-panel spotlight-card relative overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-6">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold">In-Situ Ground Truth</span>
              <h3 className="text-xl font-bold text-white mt-1">16 BWDB Tidal Gauges</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2.5">
                Continuous automated river stage measurements harmonized from Talbaria, Kamarkhali, Mongla, and Khulna Rupsha monitoring stations.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Daily Observations</span>
              <span className="text-sky-400 font-bold">100% Real Time</span>
            </div>
          </div>

          {/* Card 3: PINN Physics Engine (Spans 1 column) */}
          <div className="p-8 rounded-3xl glass-panel spotlight-card relative overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">Machine Intelligence</span>
              <h3 className="text-xl font-bold text-white mt-1">PINN Hydro-Forecaster</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2.5">
                Saint-Venant 1D shallow water momentum loss and advection-dispersion physics constraints prevent non-physical AI hallucinations during extreme dry seasons.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Lead Time Horizon</span>
              <span className="text-amber-400 font-bold">7 to 14 Days</span>
            </div>
          </div>

          {/* Card 4: Crop Protection Hazard (Spans 2 columns) */}
          <div className="md:col-span-2 p-8 rounded-3xl glass-panel spotlight-card relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-rose-500/20 transition-all" />

            <div>
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold">Agricultural Protection</span>
              <h3 className="text-2xl font-bold text-white mt-1">4.0 dS/m Boro Rice Salinity Boundary</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2.5 max-w-lg">
                Over 1.8 million farming hectares in Khulna, Bagerhat, and Satkhira depend on surface canal water. When river salinity crosses 4.0 dS/m, grain yields collapse by over 60%. Our early warning triggers preemptive intake closures.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">
                  7 Breaches Active
                </span>
                <span className="text-xs text-muted-foreground font-mono">Mongla &bull; Rupsha &bull; Shibsa Corridor</span>
              </div>
              <Link
                href="/app/alerts"
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <span>Audit Breach Telemetry</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 5. DESIRE: ESTUARY HYDRODYNAMIC NARRATIVE */}
      <section id="impact" className="py-24 md:py-36 border-t border-white/10 bg-black/20 px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="flex-1 space-y-6 text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-primary">The Delta Dynamics</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Tidal Seawater vs. Upstream Dilution Flushes.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The southwest delta is the active estuarine frontier of the Ganges (Padma) Delta plain. It forms an intricate hydrodynamic battlefield between the high-saline marine tidal pulse pushing inland from the Bay of Bengal through the Passur canyon, and freshwater flushes descending through the Bhairab, Rupsha, and Gorai-Madhumati distributary corridors.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-4 rounded-2xl glass-panel">
                <MapPin className="w-4 h-4 text-rose-400 mt-1 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white">Passur Marine Corridor</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Primary estuarine conduit carrying up to 18.2 dS/m salinity past Mongla Port toward Khulna municipal water intakes.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl glass-panel">
                <Droplets className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white">Bhairab-Rupsha Tidal Fluvial Axis</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Key Ganges delta river confluence that provides Khulna metropolitan drainage and conveys seasonal freshwater recharge to suppress intrusion.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl glass-panel">
                <Droplets className="w-4 h-4 text-sky-400 mt-1 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white">Gorai Freshwater Buffer</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Primary upstream Ganges distributary providing natural transboundary dilution to hold the salinity wedge below agricultural thresholds.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl">
            <LandingSimulationTeaser />
          </div>

        </div>
      </section>

      {/* 6. ACTION: MASSIVE HIGH-CONTRAST FINAL CTA */}
      <section className="py-24 md:py-36 px-4 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(87,214,208,0.1)_0%,rgba(5,7,13,0)_70%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Launch Intelligence Studio</span>
          <h2 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-tight text-balance">
            Start Exploring Southwest Delta Hydrology Now.
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto text-balance">
            Navigate all 20 synchronized reaches, inspect validated telemetry curves, toggle satellite basemaps, and test forward projections.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/app/map"
              className="px-8 py-4 rounded-full bg-primary text-black font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 flex items-center gap-2"
            >
              <span>Open Map Explorer</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/app/overview"
              className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-colors"
            >
              <span>View Regional Overview</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CLEAN EDITORIAL FOOTER */}
      <footer className="py-12 border-t border-white/10 bg-[#03060c] px-4 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Waves className="w-4 h-4 text-primary" />
            <span className="font-mono text-white uppercase font-bold tracking-tight">HydroShift AI</span>
            <span className="text-muted-foreground/50">&bull;</span>
            <span>NASA SWOT & BWDB Hydrological Intelligence</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/app/map" className="hover:text-white transition-colors">Map Explorer</Link>
            <Link href="/app/forecasts" className="hover:text-white transition-colors">Forecasts</Link>
            <Link href="/app/scenarios" className="hover:text-white transition-colors">Scenarios</Link>
            <Link href="/app/alerts" className="hover:text-white transition-colors">Delta Alerts</Link>
            <Link href="/app/reports" className="hover:text-white transition-colors">Audit Reports</Link>
          </div>

          <span className="font-mono text-[10px] text-muted-foreground/60">
            Open-Source Hydro-AI &copy; 2026
          </span>
        </div>
      </footer>
    </main>
  );
}
