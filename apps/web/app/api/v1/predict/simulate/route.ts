import { NextRequest, NextResponse } from "next/server";

interface SimulationRequest {
  scenario_name?: string;
  discharge_change_percent?: number;
  tidal_surge_meters?: number;
  dispersion_multiplier?: number;
  sluice_gate_closure?: boolean;
  ambient_sea_temp_delta?: number;
}

interface ReachSimulationResult {
  reach_id: string;
  name: string;
  distance_km: number;
  baseline_ec: number;
  simulated_ec: number;
  delta_ec: number;
  hazard_level: "CRITICAL" | "WARNING" | "NOMINAL";
  crop_advisory: string;
  intake_safe: boolean;
}

interface LongitudinalProfilePoint {
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

interface SimulationResponse {
  scenario_name: string;
  salinity_intrusion_distance_km: number;
  baseline_intrusion_distance_km: number;
  delta_intrusion_km: number;
  critical_reaches_count: number;
  agricultural_hectares_threatened: number;
  wasa_intake_threatened: boolean;
  reaches: ReachSimulationResult[];
  longitudinal_profile: LongitudinalProfilePoint[];
  hydrograph_14d: HydrographPoint[];
  executive_summary: string;
}

// Hydrologically calibrated Khulna estuarine reaches along Passur-Rupsha gradient
const KHULNA_REACHES = [
  { id: "SW244", name: "Mongla (Passur River)", distance_km: 35.0, baseline_ec: 7.9 },
  { id: "31241400601", name: "Passur River Reach (Mongla)", distance_km: 35.0, baseline_ec: 8.1 },
  { id: "mongla-port", name: "Mongla Port Gauge", distance_km: 35.5, baseline_ec: 7.9 },
  { id: "SWOT_REACH_DEMO_001", name: "Pasur River Segment A (Rampal)", distance_km: 52.0, baseline_ec: 4.2 },
  { id: "SWOT_REACH_DEMO_002", name: "Shibsa River Core (Dacope)", distance_km: 58.0, baseline_ec: 3.5 },
  { id: "31241400561", name: "Shibsa River Main Reach", distance_km: 60.0, baseline_ec: 3.1 },
  { id: "swot-node-84", name: "SWOT Node #84 (Paikgachha)", distance_km: 62.0, baseline_ec: 2.6 },
  { id: "swot-node-85", name: "SWOT Node #85 (Batiaghata)", distance_km: 72.0, baseline_ec: 1.8 },
  { id: "SW241", name: "Khulna (Pashure River)", distance_km: 80.7, baseline_ec: 1.1 },
  { id: "khulna-p14", name: "Khulna P-14 Intake", distance_km: 82.0, baseline_ec: 0.95 },
  { id: "31241400581", name: "Rupsha River Reach (Khulna Core)", distance_km: 82.5, baseline_ec: 1.05 },
];

export async function POST(req: NextRequest) {
  try {
    const body: SimulationRequest = await req.json();

    const scenarioName = body.scenario_name || "Custom Scenario";
    const dischargeChange = body.discharge_change_percent ?? -40.0;
    const tidalSurge = body.tidal_surge_meters ?? 0.5;
    const dispersionMult = body.dispersion_multiplier ?? 1.0;
    const sluiceClosed = body.sluice_gate_closure ?? false;
    const seaTempDelta = body.ambient_sea_temp_delta ?? 0.0;

    // 1. Hydrodynamic scaling factors
    const qScale = Math.max(0.15, 1.0 + dischargeChange / 100.0);
    const surgeScale = 1.0 + tidalSurge / 1.5;
    const dispersionFactor = dispersionMult * Math.pow(surgeScale, 1.3);
    const intrusionExp = (surgeScale / Math.pow(qScale, 0.65)) * dispersionFactor;
    const tempEffect = 1.0 + seaTempDelta * 0.03;

    // 2. Passur-Rupsha longitudinal decay formulation
    // Base 4.0 dS/m front is at 55.0 km inland under baseline conditions (Mongla-Rampal agricultural transition)
    // C(x) = C_mouth * exp(-lambda * x)
    const mouthEc = 20.0;
    const baselineDecay = Math.log(mouthEc / 4.0) / 55.0; // ~0.02926 km^-1
    const currentDecay = baselineDecay / Math.sqrt(intrusionExp);

    let criticalCount = 0;
    const reachResults: ReachSimulationResult[] = KHULNA_REACHES.map((r) => {
      const dist = r.distance_km;
      const baseEc = r.baseline_ec;

      // Spatial decay weighting: seaward reaches are tide-dominated, inland reaches are discharge-dominated
      const decayWeight = Math.max(0.2, 1.0 - dist / 110.0);
      let simulatedRaw = baseEc * Math.pow(intrusionExp, decayWeight) * tempEffect;

      // Sluice gate mitigation: automated flap-gate closure protects interior agricultural canals
      if (sluiceClosed && dist >= 50.0) {
        simulatedRaw *= 0.68; // 32% reduction
      }

      const simulatedEc = Math.round(Math.min(24.0, Math.max(0.2, simulatedRaw)) * 100) / 100;
      const deltaEc = Math.round((simulatedEc - baseEc) * 100) / 100;

      let hazard: "CRITICAL" | "WARNING" | "NOMINAL" = "NOMINAL";
      let advisory = "Safe for irrigation and domestic raw intake.";
      let intakeSafe = true;

      if (simulatedEc >= 4.0) {
        hazard = "CRITICAL";
        criticalCount++;
        advisory = "Severe Boro Rice sterilization risk. Sluice closure mandatory during high tide.";
        intakeSafe = false;
      } else if (simulatedEc >= 2.5) {
        hazard = "WARNING";
        advisory = "Moderate salinity stress. Restrict field inundation during high tide.";
        intakeSafe = false;
      } else if (simulatedEc > 1.0 && dist >= 80.0) {
        // Municipal drinking threshold (1.0 dS/m) breached at WASA intake
        intakeSafe = false;
        advisory = "Exceeds 1.0 dS/m municipal drinking limit. Desalination required.";
      }

      return {
        reach_id: r.id,
        name: r.name,
        distance_km: dist,
        baseline_ec: baseEc,
        simulated_ec: simulatedEc,
        delta_ec: deltaEc,
        hazard_level: hazard,
        crop_advisory: advisory,
        intake_safe: intakeSafe,
      };
    });

    // 3. Longitudinal Profile (x vs C)
    const longitudinalPoints: LongitudinalProfilePoint[] = [];
    for (let km = 10; km <= 90; km += 5) {
      const loc =
        km <= 20
          ? "Sundarbans Mouth"
          : km <= 40
          ? "Mongla Port"
          : km <= 55
          ? "Rampal Polders"
          : km <= 65
          ? "Dacope Channel"
          : km <= 75
          ? "Batiaghata"
          : "Khulna City (Rupsha)";

      const baseCurve = Math.round(mouthEc * Math.exp(-baselineDecay * km) * 100) / 100;
      let simCurve = mouthEc * surgeScale * Math.exp(-currentDecay * km);
      if (sluiceClosed && km >= 50) {
        simCurve *= 0.72;
      }
      const simVal = Math.round(Math.min(24.0, Math.max(0.2, simCurve)) * 100) / 100;

      longitudinalPoints.push({
        distance_km: km,
        location_name: loc,
        baseline_ec: baseCurve,
        simulated_ec: simVal,
      });
    }

    // 4. Salinity Front Penetration (4.0 dS/m distance from Bay)
    let simIntrusionKm = Math.round(
      Math.min(92.0, Math.max(30.0, -Math.log(4.0 / (mouthEc * surgeScale)) / currentDecay)) * 10
    ) / 10;
    if (sluiceClosed) {
      simIntrusionKm = Math.max(35.0, Math.round((simIntrusionKm - 8.5) * 10) / 10);
    }
    const baselineIntrusion = 55.0;
    const deltaKm = Math.round((simIntrusionKm - baselineIntrusion) * 10) / 10;

    // 5. 14-Day Hydrograph Projection (Mongla Port SW244)
    const hydrographPoints: HydrographPoint[] = [];
    const monglaBase = 7.9;
    for (let day = 1; day <= 14; day++) {
      const tidalHarmonic = Math.sin((day * 2 * Math.PI) / 14.0) * (0.6 + tidalSurge * 0.4);
      const hBase = Math.round((monglaBase + Math.sin((day * 2 * Math.PI) / 14.0) * 0.8) * 100) / 100;
      
      let hSim: number;
      if (Math.abs(intrusionExp - 1.0) < 0.01 && tidalSurge === 0) {
        hSim = hBase;
      } else {
        hSim = Math.round((hBase * Math.sqrt(intrusionExp) + tidalSurge * 1.2 + tidalHarmonic * 0.5) * 100) / 100;
      }

      hydrographPoints.push({
        day,
        date_str: `Day +${day}`,
        baseline_ec: hBase,
        simulated_ec: Math.max(0.5, hSim),
        tidal_surge_m: Math.round((tidalSurge + tidalHarmonic * 0.5) * 100) / 100,
      });
    }

    // 6. Impact Indicators & Executive Narrative
    const threatenedHa = Math.round(Math.max(0, (simIntrusionKm - 45.0) * 480));
    const wasaBreached = reachResults.some(
      (r) => (r.reach_id === "khulna-p14" || r.name.includes("P-14 Intake")) && r.simulated_ec > 1.0
    );

    let directionNarrative: string;
    if (deltaKm > 0.1) {
      directionNarrative = `expanded inland by ${deltaKm.toFixed(1)} km, reaching ${simIntrusionKm.toFixed(1)} km`;
    } else if (deltaKm < -0.1) {
      directionNarrative = `receded seaward by ${Math.abs(deltaKm).toFixed(1)} km, receding to ${simIntrusionKm.toFixed(1)} km`;
    } else {
      directionNarrative = `remains stationary at ${simIntrusionKm.toFixed(1)} km`;
    }

    const executiveSummary =
      `Under ${scenarioName} (Gorai flow: ${dischargeChange > 0 ? "+" : ""}${dischargeChange}%, ` +
      `surge: +${tidalSurge.toFixed(1)}m${sluiceClosed ? ", Polder Sluices: LOCKED SHUT" : ""}), ` +
      `the 4.0 dS/m agricultural hazard front ${directionNarrative} from the Bay of Bengal. ` +
      `${criticalCount} reaches breached critical crop tolerances, placing ${threatenedHa.toLocaleString()} hectares ` +
      `of Boro rice polders at risk. Khulna WASA raw drinking water intake is ${wasaBreached ? "COMPROMISED (>1.0 dS/m)" : "SECURED (<=1.0 dS/m)"}.`;

    const response: SimulationResponse = {
      scenario_name: scenarioName,
      salinity_intrusion_distance_km: simIntrusionKm,
      baseline_intrusion_distance_km: baselineIntrusion,
      delta_intrusion_km: deltaKm,
      critical_reaches_count: criticalCount,
      agricultural_hectares_threatened: threatenedHa,
      wasa_intake_threatened: wasaBreached,
      reaches: reachResults,
      longitudinal_profile: longitudinalPoints,
      hydrograph_14d: hydrographPoints,
      executive_summary: executiveSummary,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Simulation solver error:", error);
    return NextResponse.json(
      { error: "Internal simulation calculation failed" },
      { status: 500 }
    );
  }
}
