"use client";

import { useState, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Sliders,
  Droplets,
  Waves,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Activity,
  RotateCcw,
  Compass,
  ArrowUpRight,
  AlertTriangle,
  Play,
  Layers,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface ReachResult {
  reach_id: string;
  name: string;
  distance_km: number;
  baseline_ec: number;
  simulated_ec: number;
  delta_ec: number;
  hazard_level: string;
  crop_advisory: string;
  intake_safe: boolean;
}

interface ProfilePoint {
  distance_km: number;
  location_name: string;
  baseline_ec: number;
  simulated_ec: number;
}

interface HydrographPoint {
  day: number;
  date_str: string;
  baseline_ec: number;
  simulated_ec: number;
  tidal_surge_m: number;
}

interface SimulationData {
  scenario_name: string;
  salinity_intrusion_distance_km: number;
  baseline_intrusion_distance_km: number;
  delta_intrusion_km: number;
  critical_reaches_count: number;
  agricultural_hectares_threatened: number;
  wasa_intake_threatened: boolean;
  reaches: ReachResult[];
  longitudinal_profile: ProfilePoint[];
  hydrograph_14d: HydrographPoint[];
  executive_summary: string;
}

interface SimulationParams {
  scenarioName: string;
  dischargeChange: number;
  tidalSurge: number;
  dispersionMult: number;
  sluiceClosed: boolean;
  seaTempDelta: number;
}

// Preset Extreme Scenarios for 1-Click Stress Testing
const SCENARIO_PRESETS = [
  {
    id: "drought",
    name: "Severe Drought Shock",
    desc: "-55% Gorai Upstream Freshwater Discharge",
    discharge: -55,
    surge: 0.2,
    dispersion: 1.0,
    sluice: false,
    temp: 1.5,
    tag: "High Hazard",
    color: "border-amber-500/40 text-amber-300",
  },
  {
    id: "cyclone",
    name: "Cyclone Storm Surge",
    desc: "+1.4m Bay of Bengal Spring Tide Ingress",
    discharge: -20,
    surge: 1.4,
    dispersion: 1.4,
    sluice: false,
    temp: 1.0,
    tag: "Acute Intrusion",
    color: "border-rose-500/40 text-rose-300",
  },
  {
    id: "compound",
    name: "Compound Disaster",
    desc: "Severe Drought (-60%) + Cyclone Remal Surge (+1.8m)",
    discharge: -60,
    surge: 1.8,
    dispersion: 1.5,
    sluice: false,
    temp: 2.5,
    tag: "Catastrophic",
    color: "border-red-600/40 text-red-400",
  },
  {
    id: "mitigation",
    name: "PINN Smart Sluice Closure",
    desc: "Automated Polder Sluice Isolation at >4.0 dS/m",
    discharge: -40,
    surge: 0.8,
    dispersion: 1.0,
    sluice: true,
    temp: 0.5,
    tag: "Mitigated",
    color: "border-primary/40 text-primary",
  },
  {
    id: "baseline",
    name: "Nominal Historical Baseline",
    desc: "Standard Seasonal Upstream Gorai Flow",
    discharge: 0,
    surge: 0.0,
    dispersion: 1.0,
    sluice: false,
    temp: 0.0,
    tag: "Control",
    color: "border-white/20 text-muted-foreground",
  },
];

// Calibrated Stations along the Passur-Rupsha Thalweg (Bay mouth to Khulna City)
const CALIBRATED_STATIONS = [
  { id: "SW244", name: "Mongla (Passur River)", km: 35.0, base: 7.9 },
  { id: "31241400601", name: "Passur Reach (Mongla)", km: 35.0, base: 8.1 },
  { id: "mongla-port", name: "Mongla Port Gauge", km: 35.5, base: 7.9 },
  { id: "SWOT_REACH_DEMO_001", name: "Pasur Reach A (Rampal)", km: 52.0, base: 4.2 },
  { id: "SWOT_REACH_DEMO_002", name: "Shibsa Core (Dacope)", km: 58.0, base: 3.5 },
  { id: "31241400561", name: "Shibsa Main Reach", km: 60.0, base: 3.1 },
  { id: "swot-node-84", name: "SWOT Node #84 (Paikgachha)", km: 62.0, base: 2.6 },
  { id: "swot-node-85", name: "SWOT Node #85 (Batiaghata)", km: 72.0, base: 1.8 },
  { id: "SW241", name: "Khulna (Pashure River)", km: 80.7, base: 1.1 },
  { id: "khulna-p14", name: "Khulna P-14 Intake", km: 82.0, base: 0.95 },
  { id: "31241400581", name: "Rupsha Reach (Khulna Core)", km: 82.5, base: 1.05 },
];

function calculateHydrodynamicSimulation(params: SimulationParams): SimulationData {
  const { scenarioName, dischargeChange, tidalSurge, dispersionMult, sluiceClosed, seaTempDelta } = params;

  const qScale = Math.max(0.15, 1.0 + dischargeChange / 100.0);
  const surgeScale = 1.0 + tidalSurge / 1.5;
  const dispersionFactor = dispersionMult * Math.pow(surgeScale, 1.3);
  const intrusionExp = (surgeScale / Math.pow(qScale, 0.65)) * dispersionFactor;
  const tempScale = 1.0 + seaTempDelta * 0.03;

  let criticalCount = 0;
  const reaches = CALIBRATED_STATIONS.map((s) => {
    const decay = Math.max(0.2, 1.0 - s.km / 110.0);
    let sim = s.base * Math.pow(intrusionExp, decay) * tempScale;
    if (sluiceClosed && s.km >= 50.0) sim *= 0.68;
    const simVal = Math.round(Math.min(24.0, Math.max(0.2, sim)) * 100) / 100;
    const delta = Math.round((simVal - s.base) * 100) / 100;

    let hazard = "NOMINAL";
    let advisory = "Safe for irrigation and municipal intake.";
    let safe = true;

    if (simVal >= 4.0) {
      hazard = "CRITICAL";
      criticalCount++;
      advisory = "Severe Boro Rice sterility risk. Preemptive sluice gate closure mandatory.";
      safe = false;
    } else if (simVal >= 2.5) {
      hazard = "WARNING";
      advisory = "Elevated salinity stress. Restrict field inundation during high tide.";
      safe = false;
    } else if (simVal > 1.0 && s.km >= 80.0) {
      safe = false;
      advisory = "Exceeds 1.0 dS/m municipal drinking limit. Desalination required.";
    }

    return {
      reach_id: s.id,
      name: s.name,
      distance_km: s.km,
      baseline_ec: s.base,
      simulated_ec: simVal,
      delta_ec: delta,
      hazard_level: hazard,
      crop_advisory: advisory,
      intake_safe: safe,
    };
  });

  const longitudinal: ProfilePoint[] = [];
  const mouthEc = 20.0;
  const baselineDecay = Math.log(mouthEc / 4.0) / 55.0; // ~0.02926 km^-1
  const simDecay = baselineDecay / Math.sqrt(intrusionExp);

  for (let km = 10; km <= 90; km += 5) {
    const base = Math.round(mouthEc * Math.exp(-baselineDecay * km) * 100) / 100;
    let sim = mouthEc * surgeScale * Math.exp(-simDecay * km);
    if (sluiceClosed && km >= 50) sim *= 0.72;
    const simVal = Math.round(Math.min(24.0, Math.max(0.2, sim)) * 100) / 100;

    longitudinal.push({
      distance_km: km,
      location_name:
        km <= 20
          ? "Sundarbans Mouth"
          : km <= 40
          ? "Mongla Port"
          : km <= 55
          ? "Rampal Polders"
          : km <= 75
          ? "Batiaghata"
          : "Khulna City",
      baseline_ec: base,
      simulated_ec: simVal,
    });
  }

  let simIntrusionKm = Math.round(
    Math.min(92.0, Math.max(30.0, -Math.log(4.0 / (mouthEc * surgeScale)) / simDecay)) * 10
  ) / 10;
  if (sluiceClosed) {
    simIntrusionKm = Math.max(35.0, Math.round((simIntrusionKm - 8.5) * 10) / 10);
  }
  const baselineIntrusion = 55.0;
  const deltaKm = Math.round((simIntrusionKm - baselineIntrusion) * 10) / 10;
  const threatenedHa = Math.round(Math.max(0, (simIntrusionKm - 45.0) * 480));

  const hydrograph: HydrographPoint[] = [];
  const monglaBase = 7.9;
  for (let i = 1; i <= 14; i++) {
    const tidalHarmonic = Math.sin((i * 2 * Math.PI) / 14.0) * (0.6 + tidalSurge * 0.4);
    const base = Math.round((monglaBase + Math.sin((i * 2 * Math.PI) / 14.0) * 0.8) * 100) / 100;

    let sim: number;
    if (Math.abs(intrusionExp - 1.0) < 0.01 && tidalSurge === 0) {
      sim = base;
    } else {
      sim = Math.round((base * Math.sqrt(intrusionExp) + tidalSurge * 1.2 + tidalHarmonic * 0.5) * 100) / 100;
    }

    hydrograph.push({
      day: i,
      date_str: `Day +${i}`,
      baseline_ec: base,
      simulated_ec: Math.max(0.5, sim),
      tidal_surge_m: Math.round((tidalSurge + tidalHarmonic * 0.5) * 100) / 100,
    });
  }

  let directionNarrative: string;
  if (deltaKm > 0.1) {
    directionNarrative = `advanced inland by ${deltaKm.toFixed(1)} km, reaching ${simIntrusionKm.toFixed(1)} km`;
  } else if (deltaKm < -0.1) {
    directionNarrative = `receded seaward by ${Math.abs(deltaKm).toFixed(1)} km, receding to ${simIntrusionKm.toFixed(1)} km`;
  } else {
    directionNarrative = `remains stationary at ${simIntrusionKm.toFixed(1)} km`;
  }

  const wasaBreached = reaches.some(
    (r) => (r.reach_id === "khulna-p14" || r.name.includes("P-14 Intake")) && r.simulated_ec > 1.0
  );

  return {
    scenario_name: scenarioName,
    salinity_intrusion_distance_km: simIntrusionKm,
    baseline_intrusion_distance_km: baselineIntrusion,
    delta_intrusion_km: deltaKm,
    critical_reaches_count: criticalCount,
    agricultural_hectares_threatened: threatenedHa,
    wasa_intake_threatened: wasaBreached,
    reaches,
    longitudinal_profile: longitudinal,
    hydrograph_14d: hydrograph,
    executive_summary: `Under ${scenarioName} (Gorai flow: ${dischargeChange > 0 ? "+" : ""}${dischargeChange}%, surge: +${tidalSurge.toFixed(1)}m${sluiceClosed ? ", Polder Sluices: LOCKED SHUT" : ""}), the 4.0 dS/m agricultural hazard front ${directionNarrative} from the Bay of Bengal, placing ${threatenedHa.toLocaleString()} hectares of Boro rice crops at risk. Khulna WASA raw drinking water intake is ${wasaBreached ? "COMPROMISED (>1.0 dS/m)" : "SECURED (<=1.0 dS/m)"}.`,
  };
}

export default function ScenariosPage() {
  // Simulator Controls
  const [scenarioName, setScenarioName] = useState("Severe Drought Shock");
  const [activePreset, setActivePreset] = useState<string>("drought");
  const [dischargeChange, setDischargeChange] = useState<number>(-55);
  const [tidalSurge, setTidalSurge] = useState<number>(0.2);
  const [dispersionMult, setDispersionMult] = useState<number>(1.0);
  const [sluiceClosed, setSluiceClosed] = useState<boolean>(false);
  const [seaTempDelta, setSeaTempDelta] = useState<number>(1.5);

  // Studio View State
  const [chartTab, setChartTab] = useState<"profile" | "hydrograph" | "matrix">("profile");
  const [loading, setLoading] = useState(false);
  const [simData, setSimData] = useState<SimulationData>(() =>
    calculateHydrodynamicSimulation({
      scenarioName: "Severe Drought Shock",
      dischargeChange: -55,
      tidalSurge: 0.2,
      dispersionMult: 1.0,
      sluiceClosed: false,
      seaTempDelta: 1.5,
    })
  );

  // Apply a Preset
  const handleApplyPreset = (preset: typeof SCENARIO_PRESETS[0]) => {
    setActivePreset(preset.id);
    setScenarioName(preset.name);
    setDischargeChange(preset.discharge);
    setTidalSurge(preset.surge);
    setDispersionMult(preset.dispersion);
    setSluiceClosed(preset.sluice);
    setSeaTempDelta(preset.temp);

    const calculated = calculateHydrodynamicSimulation({
      scenarioName: preset.name,
      dischargeChange: preset.discharge,
      tidalSurge: preset.surge,
      dispersionMult: preset.dispersion,
      sluiceClosed: preset.sluice,
      seaTempDelta: preset.temp,
    });
    setSimData(calculated);
  };

  // Run Simulation (calls /api/v1/predict/simulate with live ADE fallback)
  const runSimulation = useCallback(async () => {
    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

    const payload = {
      scenario_name: scenarioName,
      discharge_change_percent: dischargeChange,
      tidal_surge_meters: tidalSurge,
      dispersion_multiplier: dispersionMult,
      sluice_gate_closure: sluiceClosed,
      ambient_sea_temp_delta: seaTempDelta,
    };

    try {
      const endpoint = API_URL ? `${API_URL}/api/v1/predict/simulate` : "/api/v1/predict/simulate";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data: SimulationData = await res.json();
        setSimData(data);
      } else {
        throw new Error("Backend response error");
      }
    } catch {
      // Local ADE mathematical solver fallback
      const calculated = calculateHydrodynamicSimulation({
        scenarioName,
        dischargeChange,
        tidalSurge,
        dispersionMult,
        sluiceClosed,
        seaTempDelta,
      });
      setSimData(calculated);
    } finally {
      setLoading(false);
    }
  }, [scenarioName, dischargeChange, tidalSurge, dispersionMult, sluiceClosed, seaTempDelta]);

  // Handler for manual slider changes
  const handleSliderChange = (
    param: "discharge" | "surge" | "dispersion" | "sluice",
    val: number | boolean
  ) => {
    setActivePreset("custom");
    let newDischarge = dischargeChange;
    let newSurge = tidalSurge;
    let newDispersion = dispersionMult;
    let newSluice = sluiceClosed;

    if (param === "discharge") {
      newDischarge = val as number;
      setDischargeChange(newDischarge);
    } else if (param === "surge") {
      newSurge = val as number;
      setTidalSurge(newSurge);
    } else if (param === "dispersion") {
      newDispersion = val as number;
      setDispersionMult(newDispersion);
    } else if (param === "sluice") {
      newSluice = val as boolean;
      setSluiceClosed(newSluice);
    }

    const calculated = calculateHydrodynamicSimulation({
      scenarioName: "Custom Scenario",
      dischargeChange: newDischarge,
      tidalSurge: newSurge,
      dispersionMult: newDispersion,
      sluiceClosed: newSluice,
      seaTempDelta,
    });
    setSimData(calculated);
  };

  // Matrix bar chart dataset formatting
  const matrixData = useMemo(() => {
    if (!simData) return [];
    return simData.reaches.map((r) => ({
      name: r.name.replace(" (Passur River)", "").replace(" (Khulna Core)", "").replace(" Reach", ""),
      baseline: r.baseline_ec,
      simulated: r.simulated_ec,
      delta: r.delta_ec,
    }));
  }, [simData]);

  return (
    <div className="flex flex-col space-y-6 pb-12 select-none">
      {/* 0. RESEARCH PROTOTYPE & EXTRAPOLATION WARNING */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong>Extrapolation Notice:</strong> Scenario modifiers (Gorai discharge cuts, cyclone surge amplitudes) simulate hydrodynamic stress beyond historical calibration regimes. Results represent numerical sensitivity stress-tests rather than deterministic forecasts.
          </span>
        </div>
        <Badge variant="outline" className="border-amber-500/40 text-amber-300 font-mono text-[10px] shrink-0">
          NUMERICAL SENSITIVITY MODE
        </Badge>
      </div>

      {/* 1. TOP HEADER & PRESET SELECTOR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono text-[10px] tracking-wider uppercase">
              Hydrodynamic Simulation Studio
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">1D Advection-Dispersion Solver</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Khulna Estuarine Stress Simulator
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Simulate upstream Gorai discharge droughts, Bay of Bengal tidal storm surges, and automated polder sluice gate operations across the Passur-Rupsha delta.
          </p>
        </div>

        {/* Quick Action Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {SCENARIO_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                activePreset === p.id
                  ? "bg-white/15 text-white border-primary shadow-lg shadow-primary/10"
                  : "bg-white/5 text-muted-foreground hover:text-white border-white/10"
              }`}
              title={p.desc}
            >
              <span>{p.name}</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${p.color}`}>
                {p.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. LIVE DELTA IMPACT BENTO TELEMETRY */}
      {simData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Salinity Front Intrusion */}
          <div className="bg-[#08131f]/95 border border-white/10 p-4 rounded-2xl flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-mono uppercase tracking-wider">
              <span>4.0 dS/m Hazard Front</span>
              <Compass className="w-4 h-4 text-primary" />
            </div>
            <div className="my-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {simData.salinity_intrusion_distance_km.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-muted-foreground">km from Bay</span>
              </div>
              <span
                className={`text-xs font-mono font-bold mt-1 block ${
                  simData.delta_intrusion_km > 0
                    ? "text-rose-400"
                    : simData.delta_intrusion_km < 0
                    ? "text-emerald-400"
                    : "text-muted-foreground"
                }`}
              >
                {simData.delta_intrusion_km > 0
                  ? `+${simData.delta_intrusion_km.toFixed(1)} km inland advance`
                  : simData.delta_intrusion_km < 0
                  ? `${simData.delta_intrusion_km.toFixed(1)} km seaward retreat`
                  : "Stationary at baseline"}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Baseline limit: {simData.baseline_intrusion_distance_km.toFixed(0)} km (Mongla-Rampal boundary).
            </span>
          </div>

          {/* Card 2: Critical Hazard Reaches */}
          <div className="bg-[#08131f]/95 border border-white/10 p-4 rounded-2xl flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-mono uppercase tracking-wider">
              <span>Critical Breach Reaches</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="my-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-rose-400">
                  {simData.critical_reaches_count}
                </span>
                <span className="text-xs font-mono text-muted-foreground">/ {simData.reaches.length} Khulna sites</span>
              </div>
              <span className="text-xs font-mono text-rose-300 font-bold mt-1 block">
                {simData.critical_reaches_count > 4 ? "Widespread Crop Hazard" : "Localized Estuarine Threat"}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Exceeding the 4.0 dS/m Boro rice damage threshold.
            </span>
          </div>

          {/* Card 3: Agricultural Land Endangered */}
          <div className="bg-[#08131f]/95 border border-white/10 p-4 rounded-2xl flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-mono uppercase tracking-wider">
              <span>Boro Rice Area At Risk</span>
              <Droplets className="w-4 h-4 text-amber-400" />
            </div>
            <div className="my-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-amber-400">
                  {simData.agricultural_hectares_threatened.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-muted-foreground">Hectares</span>
              </div>
              <span className="text-xs font-mono text-amber-300 font-bold mt-1 block">
                Rampal, Dacope & Batiaghata Polders
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Estimated seasonal crop damage without irrigation cutoff.
            </span>
          </div>

          {/* Card 4: Municipal Drinking Intake Status */}
          <div className="bg-[#08131f]/95 border border-white/10 p-4 rounded-2xl flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-mono uppercase tracking-wider">
              <span>Khulna WASA Raw Intake</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="my-2">
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-xl font-extrabold font-mono px-2 py-0.5 rounded-lg ${
                    simData.wasa_intake_threatened
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {simData.wasa_intake_threatened ? "COMPROMISED" : "SECURED"}
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground mt-1 block">
                Intake Threshold: 1.0 dS/m Drinking Standard
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {simData.wasa_intake_threatened
                ? "Salinity exceeds municipal filtration limits."
                : "Safe drinking intake levels maintained."}
            </span>
          </div>
        </div>
      )}

      {/* 3. SIMULATION WORKBENCH (CONTROLS + VISUALIZATION STUDIO) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: INTERACTIVE CONTROL PANEL (5 cols) */}
        <div className="lg:col-span-4 bg-[#08131f]/95 border border-white/10 p-5 rounded-3xl shadow-2xl flex flex-col space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hydrodynamic Controls</h3>
            </div>
            <button
              onClick={() => {
                handleApplyPreset(SCENARIO_PRESETS[4]); // Baseline
              }}
              className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer"
              title="Reset to baseline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Control 1: Upstream Freshwater Inflow (Gorai Discharge) */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                Upstream Gorai River Flow
              </span>
              <span className={`font-mono font-bold ${dischargeChange < 0 ? "text-amber-400" : "text-sky-400"}`}>
                {dischargeChange > 0 ? `+${dischargeChange}%` : `${dischargeChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-80"
              max="50"
              step="5"
              value={dischargeChange}
              onChange={(e) => handleSliderChange("discharge", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>-80% (Severe Drought)</span>
              <span>0% (Avg)</span>
              <span>+50% (Monsoon Flush)</span>
            </div>
          </div>

          {/* Control 2: Bay of Bengal Tidal Surge Amplitude */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-rose-400" />
                Bay Tidal Storm Surge
              </span>
              <span className="font-mono font-bold text-rose-400">+{tidalSurge.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.5"
              step="0.1"
              value={tidalSurge}
              onChange={(e) => handleSliderChange("surge", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>0.0m (Nominal)</span>
              <span>+1.2m (Cyclone)</span>
              <span>+2.5m (Extreme Surge)</span>
            </div>
          </div>

          {/* Control 3: Estuarine Tidal Dispersion Rate */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                Estuarine Dispersion Rate (D<sub>x</sub>)
              </span>
              <span className="font-mono font-bold text-primary">{dispersionMult.toFixed(1)}&times;</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={dispersionMult}
              onChange={(e) => handleSliderChange("dispersion", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>0.5&times; (Low Mix)</span>
              <span>1.0&times; (Calibrated)</span>
              <span>2.0&times; (High Tidal Mixing)</span>
            </div>
          </div>

          {/* Control 4: Sluice Gate Automation Policy */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Polder Sluice Gate Defense
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sluiceClosed}
                  onChange={(e) => handleSliderChange("sluice", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {sluiceClosed
                ? "Active: Automated PINN logic locks polder sluices during tidal salinity peaks, shielding agricultural channels by up to 32%."
                : "Inactive: Sluices remain unmanaged. Tidal salinity flows freely into agricultural intake canals."}
            </p>
          </div>

          {/* Execute Button */}
          <button
            onClick={runSimulation}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Solving Hydrodynamic Equations...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Simulate Hydrodynamic Shock</span>
              </>
            )}
          </button>

          {/* Link to Map */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">View spatial front on GIS:</span>
            <Link href="/app/map" className="text-primary hover:underline font-semibold flex items-center gap-1">
              <span>Map Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: MULTI-VIEW CHART STUDIO (8 cols) */}
        <div className="lg:col-span-8 bg-[#08131f]/95 border border-white/10 p-5 rounded-3xl shadow-2xl flex flex-col space-y-4">
          {/* Chart Studio Header & Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setChartTab("profile")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  chartTab === "profile" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                Longitudinal Salinity Profile (x vs C)
              </button>
              <button
                onClick={() => setChartTab("hydrograph")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  chartTab === "hydrograph" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                14-Day Hydrograph Projection
              </button>
              <button
                onClick={() => setChartTab("matrix")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  chartTab === "matrix" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                Station Differential Matrix
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span className="text-muted-foreground">Baseline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-white font-bold">Simulated Shock</span>
              </div>
            </div>
          </div>

          {/* VIEW 1: LONGITUDINAL SALINITY PROFILE */}
          {chartTab === "profile" && simData && (
            <div className="w-full flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Longitudinal Distance: Bay of Bengal Mouth (0km) &rarr; Khulna City (85km)</span>
                <span className="text-amber-400 font-bold">Lethal Boro Threshold: 4.0 dS/m</span>
              </div>
              <div className="w-full h-80 bg-black/30 rounded-2xl p-2 border border-white/5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simData.longitudinal_profile} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                      dataKey="distance_km"
                      stroke="#718795"
                      fontSize={11}
                      tickFormatter={(val) => `${val}km`}
                      tickMargin={8}
                    />
                    <YAxis
                      stroke="#718795"
                      fontSize={11}
                      tickFormatter={(val) => `${val} dS/m`}
                      domain={[0, 22]}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#08131f", borderColor: "#ffffff20", borderRadius: "12px" }}
                      labelFormatter={(label) => `River Reach at ${label} km from Bay`}
                      formatter={(val: unknown, name?: unknown) => [
                        `${Number(val).toFixed(2)} dS/m`,
                        name === "simulated_ec" ? "Simulated Shock" : "Baseline",
                      ]}
                    />
                    {/* Agricultural 4.0 dS/m Threshold */}
                    <ReferenceLine
                      y={4.0}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{ value: "4.0 dS/m Boro Damage Line", fill: "#f59e0b", fontSize: 10, position: "top" }}
                    />
                    {/* Drinking Water 1.0 dS/m Threshold */}
                    <ReferenceLine
                      y={1.0}
                      stroke="#38bdf8"
                      strokeDasharray="4 4"
                      label={{ value: "1.0 dS/m Drinking Limit", fill: "#38bdf8", fontSize: 10, position: "insideBottomLeft" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="baseline_ec"
                      name="baseline_ec"
                      stroke="#718795"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="simulated_ec"
                      name="simulated_ec"
                      stroke="#57d6d0"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#57d6d0", strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* VIEW 2: 14-DAY HYDROGRAPH */}
          {chartTab === "hydrograph" && simData && (
            <div className="w-full flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Passur Estuary 14-Day Tidal Horizon at Mongla Port (SW244)</span>
                <span>Tidal Spring-Neap Harmonic Superposition</span>
              </div>
              <div className="w-full h-80 bg-black/30 rounded-2xl p-2 border border-white/5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simData.hydrograph_14d} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="date_str" stroke="#718795" fontSize={11} tickMargin={8} />
                    <YAxis stroke="#718795" fontSize={11} tickFormatter={(val) => `${val} dS/m`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#08131f", borderColor: "#ffffff20", borderRadius: "12px" }}
                      formatter={(val: unknown, name?: unknown) => [
                        `${Number(val).toFixed(2)} dS/m`,
                        name === "simulated_ec" ? "Simulated Peak" : "Baseline",
                      ]}
                    />
                    <ReferenceLine y={4.0} stroke="#f59e0b" strokeDasharray="4 4" />
                    <Line
                      type="monotone"
                      dataKey="baseline_ec"
                      name="baseline_ec"
                      stroke="#718795"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="simulated_ec"
                      name="simulated_ec"
                      stroke="#f43f5e"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#f43f5e" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* VIEW 3: REACH DIFFERENTIAL MATRIX */}
          {chartTab === "matrix" && (
            <div className="w-full flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Reach by Reach Salinity Elevation (Baseline vs Shock)</span>
                <span>Difference (&Delta; dS/m)</span>
              </div>
              <div className="w-full h-80 bg-black/30 rounded-2xl p-2 border border-white/5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={matrixData} margin={{ top: 20, right: 30, left: 10, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#718795"
                      fontSize={10}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis stroke="#718795" fontSize={11} tickFormatter={(val) => `${val} dS/m`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#08131f", borderColor: "#ffffff20", borderRadius: "12px" }}
                      formatter={(val: unknown) => [`${Number(val).toFixed(2)} dS/m`]}
                    />
                    <Bar dataKey="baseline" name="Baseline" fill="#718795" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="simulated" name="Simulated Shock" fill="#57d6d0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Executive Scenario Narrative */}
          {simData && (
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3 text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-white/80 font-mono text-[11px]">{simData.executive_summary}</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. COMPREHENSIVE REACH IMPACT MATRIX TABLE */}
      {simData && (
        <div className="bg-[#08131f]/95 border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Reach-by-Reach Vulnerability Assessment ({simData.reaches.length} Stations)
              </h3>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Thresholds: 1.0 dS/m (Drinking) &bull; 4.0 dS/m (Boro Rice Lethal)
            </span>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground uppercase font-mono text-[10px]">
                  <th className="py-2.5 px-3">Reach / Monitoring Station</th>
                  <th className="py-2.5 px-3">Distance</th>
                  <th className="py-2.5 px-3">Baseline</th>
                  <th className="py-2.5 px-3">Simulated Shock</th>
                  <th className="py-2.5 px-3">&Delta; Increase</th>
                  <th className="py-2.5 px-3">Hazard Status</th>
                  <th className="py-2.5 px-3">Agricultural / Polder Advisory</th>
                  <th className="py-2.5 px-3 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {simData.reaches.map((r) => {
                  const isCrit = r.hazard_level === "CRITICAL";
                  const isWarn = r.hazard_level === "WARNING";

                  return (
                    <tr key={r.reach_id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white flex items-center gap-2 font-sans">
                        <MapPin className="w-3 h-3 text-primary shrink-0" />
                        <span>{r.name}</span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground font-mono text-[11px]">
                        {r.distance_km.toFixed(1)} km
                      </td>
                      <td className="py-3 px-3 text-muted-foreground font-mono">
                        {r.baseline_ec.toFixed(1)} dS/m
                      </td>
                      <td
                        className={`py-3 px-3 font-bold font-mono text-sm ${
                          isCrit ? "text-rose-400" : isWarn ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {r.simulated_ec.toFixed(1)} dS/m
                      </td>
                      <td
                        className={`py-3 px-3 font-semibold font-mono text-xs ${
                          r.delta_ec > 0 ? "text-rose-300" : "text-emerald-300"
                        }`}
                      >
                        {r.delta_ec > 0 ? `+${r.delta_ec.toFixed(1)}` : `${r.delta_ec.toFixed(1)}`}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCrit
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : isWarn
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          }`}
                        >
                          {r.hazard_level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-muted-foreground font-sans max-w-md">
                        {r.crop_advisory}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/app/reaches/${r.reach_id}`}
                          className="text-primary hover:underline inline-flex items-center gap-1 font-sans text-xs font-semibold"
                        >
                          <span>Audit</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
