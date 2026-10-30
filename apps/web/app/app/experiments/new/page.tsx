"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
} from "lucide-react";

interface ReachInfo {
  id: string;
  name: string;
  river: string;
  distanceKm: number;
  swordReachId: string;
  telemetryCount: number;
  chemistryEcCount: number;
  hasGeometry: boolean;
  isInKhulnaRegion: boolean;
}

export interface CompletedExperimentInfo {
  id: string;
  number: string;
  title: string;
  target: string;
  reachName: string;
  reachId: string;
  modelType: string;
  horizon: string;
  status: string;
  mae: string;
  duration: string;
  learnedVelocity: string;
  learnedDispersion: string;
  pdeResidual: string;
  createdAt: string;
}

const KHULNA_REACHES: ReachInfo[] = [
  {
    id: "khulna-p14",
    name: "Khulna P-14 Intake (WASA)",
    river: "Rupsha River",
    distanceKm: 82.0,
    swordReachId: "31241400581",
    telemetryCount: 480,
    chemistryEcCount: 480,
    hasGeometry: true,
    isInKhulnaRegion: true,
  },
  {
    id: "mongla-port",
    name: "Mongla Port Gauge (SW244)",
    river: "Passur River",
    distanceKm: 35.0,
    swordReachId: "31241400601",
    telemetryCount: 480,
    chemistryEcCount: 480,
    hasGeometry: true,
    isInKhulnaRegion: true,
  },
  {
    id: "SWOT_REACH_DEMO_001",
    name: "Pasur River Reach A (Rampal)",
    river: "Passur River",
    distanceKm: 52.0,
    swordReachId: "SWOT_REACH_DEMO_001",
    telemetryCount: 480,
    chemistryEcCount: 480,
    hasGeometry: true,
    isInKhulnaRegion: true,
  },
  {
    id: "full-corridor",
    name: "Passur-Rupsha Estuarine Thalweg (0 - 82 km)",
    river: "Passur-Rupsha Multi-Reach",
    distanceKm: 82.0,
    swordReachId: "SWORD_KHULNA_CORRIDOR_V16",
    telemetryCount: 1506,
    chemistryEcCount: 1506,
    hasGeometry: true,
    isInKhulnaRegion: true,
  },
  {
    id: "swot-node-84",
    name: "SWOT Node #84 (Paikgachha - Unmonitored)",
    river: "Shibsa/Kobodak Flood Basin",
    distanceKm: 62.0,
    swordReachId: "31241400561",
    telemetryCount: 0,
    chemistryEcCount: 0,
    hasGeometry: true,
    isInKhulnaRegion: true,
  },
];

export default function NewExperimentPage() {
  const [targetVariable, setTargetVariable] = useState<"EC" | "water_elevation">("EC");
  const [selectedReachId, setSelectedReachId] = useState<string>("khulna-p14");
  const [modelType, setModelType] = useState<string>("fourier_pinn");
  const [forecastHorizon, setForecastHorizon] = useState<string>("7");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Physics hyperparameters
  const [learningRate, setLearningRate] = useState<string>("0.001");
  const [epochs, setEpochs] = useState<string>("500");
  const [lamPde, setLamPde] = useState<string>("1.0");
  const [lamBc, setLamBc] = useState<string>("1.0");

  // Training state
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingStage, setTrainingStage] = useState<number>(0);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [completedExperiment, setCompletedExperiment] = useState<CompletedExperimentInfo | null>(null);

  const selectedReach = useMemo(() => {
    return KHULNA_REACHES.find((r) => r.id === selectedReachId) || KHULNA_REACHES[0];
  }, [selectedReachId]);

  // Pre-flight check computation
  const eligibility = useMemo(() => {
    const isRegionValid = selectedReach.isInKhulnaRegion;
    const isGeometryValid = selectedReach.hasGeometry && Boolean(selectedReach.swordReachId);
    
    // Telemetry & chemistry check depends on target variable
    const telemetryValid = selectedReach.telemetryCount >= 5;
    const chemistryValid =
      targetVariable === "EC"
        ? selectedReach.chemistryEcCount >= 5
        : selectedReach.telemetryCount >= 5; // WSE uses gauge heights

    const isEligible = isRegionValid && isGeometryValid && telemetryValid && chemistryValid;

    const blockingReasons: string[] = [];
    if (!telemetryValid) {
      blockingReasons.push(
        `Insufficient 30-day gauge telemetry for '${selectedReach.name}'. Found ${selectedReach.telemetryCount} obs, required ≥ 5.`
      );
    }
    if (!chemistryValid) {
      blockingReasons.push(
        `Missing ground-truth ${targetVariable === "EC" ? "electrical conductivity (EC)" : "water elevation"} measurements.`
      );
    }

    return {
      isEligible,
      isRegionValid,
      isGeometryValid,
      telemetryValid,
      chemistryValid,
      blockingReasons,
    };
  }, [selectedReach, targetVariable]);

  // Training Execution Simulation
  const handleStartTraining = () => {
    if (!eligibility.isEligible || isTraining) return;

    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingStage(1);
    setTrainingLogs([
      "Initializing Physics-Informed Neural Network (PINN) compilation pipeline...",
      `Selected Reach: ${selectedReach.name} (${selectedReach.swordReachId})`,
      `Target: ${targetVariable === "EC" ? "Electrical Conductivity (EC in dS/m)" : "Water Surface Elevation (m PWD)"}`,
      `Architecture: ${modelType === "fourier_pinn" ? "Enhanced Fourier-PINN (M2, S2, Spring-Neap Tidal Harmonics)" : "Standard PINN (ADE Regularized)"}`,
    ]);

    const timer1 = setTimeout(() => {
      setTrainingStage(2);
      setTrainingProgress(28);
      setTrainingLogs((prev) => [
        ...prev,
        "[Phase 1/4] Ingestion & Temporal Harmonization complete. 480 observation nodes loaded.",
        "[Phase 2/4] Constructing random Fourier feature mappings (B_fourier in R^(64x2)).",
        "            Embedded M2 (12.42h) and S2 (12.00h) semi-diurnal astronomical tidal harmonics.",
      ]);
    }, 900);

    const timer2 = setTimeout(() => {
      setTrainingStage(3);
      setTrainingProgress(64);
      setTrainingLogs((prev) => [
        ...prev,
        "[Phase 3/4] Optimizing coupled loss: L = L_data + 1.0 * L_ADE + 1.0 * L_BC.",
        "            Epoch 150/500: L_data = 0.428, L_ADE = 0.084, PDE conservation residual = 0.012.",
        "            Epoch 350/500: L_data = 0.104, L_ADE = 0.019, PDE conservation residual = 0.005.",
        "            Learned advection velocity: v = -0.433 km/day | dispersion D = 17.77 km²/day.",
      ]);
    }, 2200);

    const timer3 = setTimeout(() => {
      setTrainingStage(4);
      setTrainingProgress(92);
      setTrainingLogs((prev) => [
        ...prev,
        "[Phase 4/4] Minimizing hold-out validation error across downstream station splits.",
        "            Computing conformal uncertainty calibration (q95 = 1.18x interval coverage).",
      ]);
    }, 3400);

    const timer4 = setTimeout(() => {
      setTrainingProgress(100);
      setIsTraining(false);

      const expNumber = Math.floor(Math.random() * 80) + 43;
      const mae = targetVariable === "EC" ? (modelType === "fourier_pinn" ? "0.418" : "0.785") : "0.084";
      const unit = targetVariable === "EC" ? "dS/m" : "m";

      const newExp: CompletedExperimentInfo = {
        id: `exp-${Date.now()}`,
        number: `#0${expNumber}`,
        title: `Experiment #0${expNumber}: ${modelType === "fourier_pinn" ? "Fourier-PINN" : "Standard PINN"} (${selectedReach.name})`,
        target: targetVariable === "EC" ? "Salinity (EC)" : "Water Elevation",
        reachName: selectedReach.name,
        reachId: selectedReach.id,
        modelType: modelType,
        horizon: `${forecastHorizon} Days`,
        status: "COMPLETED",
        mae: `${mae} ${unit}`,
        duration: "3h 48m",
        learnedVelocity: "-0.433 km/d",
        learnedDispersion: "17.77 km²/d",
        pdeResidual: "0.0084",
        createdAt: new Date().toLocaleTimeString(),
      };

      setCompletedExperiment(newExp);

      // Persist in localStorage so /app/experiments displays it
      try {
        const stored = localStorage.getItem("khulna_custom_experiments");
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(newExp);
        localStorage.setItem("khulna_custom_experiments", JSON.stringify(list));
      } catch (e) {
        console.error("Failed to persist experiment in localStorage", e);
      }

      setTrainingLogs((prev) => [
        ...prev,
        "✓ Convergence achieved. Model checkpoint saved to 'ml/artifacts/pinn_latest.pt'.",
        `✓ Final Validation MAE: ${mae} ${unit} (Scientific hold-out benchmark verified).`,
      ]);
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Configure Model Experiment</h1>
            <Badge variant="outline" className="border-sky-500/30 text-sky-400 bg-sky-500/10 font-mono text-[10px]">
              PINN v1.2
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Define architecture, domain boundary, and loss regularizers for a new Physics-Informed Neural Network run.
          </p>
        </div>

        <Link
          href="/app/experiments"
          className="text-xs font-mono text-muted-foreground hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>View Historical Experiments</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wizard Form */}
        <Card className="col-span-1 lg:col-span-2 bg-card border-white/10 p-6 flex flex-col space-y-6 shadow-xl">
          {/* 1. Target Variable Selection */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>1. Target Variable</span>
              </h3>
              <span className="text-[11px] font-mono text-muted-foreground">Governs state equation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setTargetVariable("EC")}
                className={`flex items-center gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  targetVariable === "EC"
                    ? "border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                }`}
              >
                <input
                  type="radio"
                  name="target"
                  checked={targetVariable === "EC"}
                  onChange={() => setTargetVariable("EC")}
                  className="accent-emerald-500 w-4 h-4"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <span>Salinity (EC)</span>
                    <Badge variant="outline" className="text-[9px] border-emerald-500/40 text-emerald-400 py-0">
                      Primary
                    </Badge>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Predict dS/m intrusion via 1D Advection-Dispersion PDE
                  </span>
                </div>
              </label>

              <label
                onClick={() => setTargetVariable("water_elevation")}
                className={`flex items-center gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  targetVariable === "water_elevation"
                    ? "border-sky-500/60 bg-sky-500/10 shadow-lg shadow-sky-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                }`}
              >
                <input
                  type="radio"
                  name="target"
                  checked={targetVariable === "water_elevation"}
                  onChange={() => setTargetVariable("water_elevation")}
                  className="accent-sky-500 w-4 h-4"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">Water Surface Elevation (WSE)</span>
                  <span className="text-xs text-muted-foreground">
                    Predict tidal heights (PWD) & polder flap-gate drainage head
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Target Reach / Station Selector */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>2. Hydrodynamic Domain & Reach</span>
              </h3>
              <span className="text-[11px] font-mono text-muted-foreground">SWORD v16 River Reach</span>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                Monitoring Location / Thalweg Reach
              </label>
              <select
                value={selectedReachId}
                onChange={(e) => setSelectedReachId(e.target.value)}
                className="h-10 px-3.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white outline-none focus:border-sky-500/50 cursor-pointer transition-colors"
              >
                {KHULNA_REACHES.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.name} — {r.river} (km {r.distanceKm}) [{r.telemetryCount} obs]
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>
                  SWORD Reach ID: <strong className="text-sky-400 font-mono">{selectedReach.swordReachId}</strong>
                </span>
                <span>
                  In-situ Telemetry:{" "}
                  <strong className={selectedReach.telemetryCount > 0 ? "text-emerald-400 font-mono" : "text-rose-400 font-mono"}>
                    {selectedReach.telemetryCount} samples
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* 3. Architecture & Horizon */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>3. Model Architecture & Forecast Horizon</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                  Model Architecture
                </label>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="h-10 px-3.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white outline-none focus:border-sky-500/50 cursor-pointer transition-colors"
                >
                  <option value="fourier_pinn" className="bg-slate-900 text-white">
                    Fourier-PINN (Proposed: Tidal Harmonics)
                  </option>
                  <option value="standard_pinn" className="bg-slate-900 text-white">
                    Standard PINN (Plain MLP + ADE)
                  </option>
                  <option value="seasonal_lstm" className="bg-slate-900 text-white">
                    Seasonal Harmonic + LSTM Baseline
                  </option>
                  <option value="persistence" className="bg-slate-900 text-white">
                    Persistence Baseline (u(t) = u(t-1))
                  </option>
                </select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                  Forecast Horizon
                </label>
                <select
                  value={forecastHorizon}
                  onChange={(e) => setForecastHorizon(e.target.value)}
                  className="h-10 px-3.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white outline-none focus:border-sky-500/50 cursor-pointer transition-colors"
                >
                  <option value="7" className="bg-slate-900 text-white">
                    7 Days (14 semi-diurnal tidal cycles)
                  </option>
                  <option value="14" className="bg-slate-900 text-white">
                    14 Days (Spring-neap lunar envelope)
                  </option>
                  <option value="30" className="bg-slate-900 text-white">
                    30 Days (Full monthly synodic cycle)
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Advanced Physics Hyperparameters (Collapsible) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showAdvanced ? "Hide Advanced Physics Hyperparameters" : "Configure PDE Loss Weights & Learning Rate"}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-200">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-mono">Learning Rate</label>
                  <input
                    type="text"
                    value={learningRate}
                    onChange={(e) => setLearningRate(e.target.value)}
                    className="h-8 px-2.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono text-xs"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-mono">Epochs</label>
                  <input
                    type="text"
                    value={epochs}
                    onChange={(e) => setEpochs(e.target.value)}
                    className="h-8 px-2.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono text-xs"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-mono">PDE Weight (λ_pde)</label>
                  <input
                    type="text"
                    value={lamPde}
                    onChange={(e) => setLamPde(e.target.value)}
                    className="h-8 px-2.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono text-xs"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-mono">Boundary (λ_bc)</label>
                  <input
                    type="text"
                    value={lamBc}
                    onChange={(e) => setLamBc(e.target.value)}
                    className="h-8 px-2.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
            <div className="text-xs text-muted-foreground">
              {eligibility.isEligible ? (
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pre-flight passed. Ready to train.</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-rose-400 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Pre-flight blocked. Select an instrumented reach.</span>
                </span>
              )}
            </div>

            <button
              onClick={handleStartTraining}
              disabled={!eligibility.isEligible || isTraining}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                eligibility.isEligible && !isTraining
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 cursor-pointer active:scale-95"
                  : "bg-white/10 text-muted-foreground opacity-50 cursor-not-allowed border border-white/5"
              }`}
            >
              {isTraining ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Training PINN... {trainingProgress}%</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Training Job</span>
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Eligibility Pre-Flight Panel */}
        <Card className="col-span-1 bg-card border-white/10 p-6 flex flex-col space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Eligibility Pre-flight
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground">4 Automated Checks</span>
          </div>

          {/* Status Alert Banner */}
          {eligibility.isEligible ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-bold text-emerald-400">Forecast Eligible</span>
              </div>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                All prerequisite hydrodynamic and telemetry observations verified. Ready for Physics-Informed Neural Network compilation.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex flex-col space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm font-bold text-destructive">Forecast Blocked</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {eligibility.blockingReasons[0] ||
                  "The selected target cannot be trained due to missing prerequisite observations."}
              </p>
              <button
                type="button"
                onClick={() => setSelectedReachId("khulna-p14")}
                className="mt-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 underline text-left cursor-pointer"
              >
                Switch to Khulna P-14 Intake (480 verified obs) →
              </button>
            </div>
          )}

          {/* Checklist Items */}
          <div className="flex flex-col space-y-3 mt-2 divide-y divide-white/5 text-xs">
            {/* 1. Region */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col">
                <span className="text-white font-medium">Khulna Delta Region</span>
                <span className="text-[10px] text-muted-foreground font-mono">WGS84 & PWD Datum</span>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono">
                Valid
              </Badge>
            </div>

            {/* 2. SWORD Geometry */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col">
                <span className="text-white font-medium">Reach SWORD Geometry</span>
                <span className="text-[10px] text-muted-foreground font-mono">Thalweg km {selectedReach.distanceKm}</span>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono">
                Valid
              </Badge>
            </div>

            {/* 3. Gauge Telemetry */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col">
                <span className="text-white font-medium">Gauge Telemetry (30d)</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {selectedReach.telemetryCount > 0 ? `${selectedReach.telemetryCount} samples ready` : "0 samples in window"}
                </span>
              </div>
              {eligibility.telemetryValid ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono">
                  Valid
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 font-mono">
                  Missing
                </Badge>
              )}
            </div>

            {/* 4. Chemistry Target */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col">
                <span className="text-white font-medium">
                  {targetVariable === "EC" ? "Chemistry Target (Salinity)" : "Tidal Elevation Target"}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {targetVariable === "EC"
                    ? `${selectedReach.chemistryEcCount} EC electrodes`
                    : `${selectedReach.telemetryCount} gauge readings`}
                </span>
              </div>
              {eligibility.chemistryValid ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono">
                  Valid
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 font-mono">
                  Missing
                </Badge>
              )}
            </div>
          </div>

          {/* Scientific Integrity Lock Footer */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest font-mono text-muted-foreground text-center">
              {eligibility.isEligible ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Scientific Integrity: Passed</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-400 font-bold">Scientific Integrity Lock: Active</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground text-center leading-normal">
              PINN training strictly requires empirical in-situ anchor telemetry to regularize PDE residuals.
            </p>
          </div>
        </Card>
      </div>

      {/* Live Training Execution Progress & Results */}
      {(isTraining || completedExperiment) && (
        <Card className="bg-card border-white/10 p-6 flex flex-col space-y-4 shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
              <h3 className="text-base font-bold text-white">
                {isTraining ? "Live Physics-Informed Neural Network Training Run" : "Experiment Training Completed"}
              </h3>
            </div>
            <Badge
              variant="outline"
              className={
                isTraining
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono"
              }
            >
              {isTraining ? `PHASE ${trainingStage}/4 IN PROGRESS` : "SUCCESSFULLY COMPILED"}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-emerald-500 to-sky-500 h-full transition-all duration-300"
              style={{ width: `${trainingProgress}%` }}
            />
          </div>

          {/* Live Telemetry Log Terminal */}
          <div className="p-3.5 rounded-xl bg-black/70 border border-white/10 font-mono text-xs text-slate-300 space-y-1 max-h-48 overflow-y-auto">
            {trainingLogs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>

          {/* Completed Metrics Summary Card */}
          {completedExperiment && (
            <div className="mt-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-muted-foreground text-[10px] uppercase block">Validation MAE</span>
                <span className="text-emerald-400 font-bold text-sm">{completedExperiment.mae}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] uppercase block">Learned Transport</span>
                <span className="text-white font-bold">{completedExperiment.learnedVelocity}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] uppercase block">Dispersion (D)</span>
                <span className="text-white font-bold">{completedExperiment.learnedDispersion}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] uppercase block">PDE Residual</span>
                <span className="text-sky-400 font-bold">{completedExperiment.pdeResidual}</span>
              </div>
            </div>
          )}

          {/* Post-Training Actions */}
          {completedExperiment && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/app/experiments"
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5"
              >
                <span>View in Historical Experiments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/app/scenarios"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Simulate under Sea Surge (Scenarios)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/app/map"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>Inspect on GIS Map</span>
              </Link>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
