"""
Crop Rotation & Salinity Decision Support Engine (FAO 29/56 Maas-Hoffman Model)
Core domain service for evaluating seasonal crop tolerance, hydraulic sluice status,
and multi-criteria crop rotation rankings for coastal Bangladesh polders.
"""
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass

@dataclass
class CropEvaluationInput:
    crop_name: str
    variety: str
    season_name: str
    duration_days: int
    water_req_mm: float
    threshold_ec: float
    slope_b: float
    potential_yield_ton: float
    market_price_per_kg: float
    production_cost_ha: float
    soil_ec: float
    canal_ec: float
    irrigation_source: str
    advisory: str
    soil_ec_std: float = 0.5
    conformal_q: float = 1.96
    stratum: Optional[str] = None

@dataclass
class CropEvaluationResult:
    season_name: str
    crop_name: str
    variety: str
    duration_days: int
    water_requirement_mm: float
    salt_threshold_ec: float
    salt_slope_b: float
    expected_yield_loss_pct: float
    expected_yield_ton_per_ha: float
    gross_income_bdt_per_ha: float
    production_cost_bdt_per_ha: float
    net_profit_bdt_per_ha: float
    feasibility_status: str  # "OPTIMAL", "ACCEPTABLE", "HIGH_RISK", "FAILED"
    irrigation_source: str
    agronomic_advisory: str
    worst_case_yield_loss_pct: float = 0.0
    risk_adjusted_status: str = "OPTIMAL"
    confidence_interval_ec: Tuple[float, float] = (0.0, 0.0)

class AgronomicEngine:
    @staticmethod
    def calculate_maas_hoffman_yield_loss(ece: float, threshold: float, slope_b: float) -> float:
        """
        Maas-Hoffman (1977) Piecewise Linear Salinity Response Model:
        Relative Yield (%) = 100 - b * (ECe - Threshold) for ECe > Threshold.
        Returns percentage yield loss (0.0 to 100.0).
        """
        if ece <= threshold:
            return 0.0
        loss = slope_b * (ece - threshold)
        return min(100.0, max(0.0, round(loss, 1)))

    @staticmethod
    def calculate_realworld_capillary_surge(
        base_soil_ec: float,
        net_moisture_deficit_mm: float,
        groundwater_ec: float = 14.0
    ) -> float:
        """
        Calibrated against SRDI (Soil Resource Development Institute) Dacope Polder 31 & 32
        historical dry-season topsoil ECe monitoring surveys (Barisal/Jhalokati silty clay series).
        
        Variables & Units:
          - base_soil_ec: dS/m (post-monsoon saturated paste extract ECe)
          - net_moisture_deficit_mm: mm (cumulative atmospheric deficit ET0 - P)
          - groundwater_ec: dS/m (shallow saline groundwater at 0.8 - 1.2 m depth; typically 12 - 16 dS/m)
          - k_cap: 0.0016 mm^-1 (empirical capillary suction transmission coefficient for silty clay loam)
          
        Physical dynamic:
          - If deficit > 0: upward capillary flux deposits salts in root-zone:
              Delta_ECe = k_cap * net_deficit_mm * groundwater_ec
          - If deficit < 0 (monsoon rain leaching): downward percolation flushes salts:
              leach_delta = |deficit| * 0.035 * (base_soil_ec / 10.0)
        """
        k_cap = 0.0016  # mm^-1 empirical capillary flux coefficient (SRDI Khulna)
        if net_moisture_deficit_mm > 0:
            delta_ec = net_moisture_deficit_mm * k_cap * groundwater_ec
            return round(base_soil_ec + delta_ec, 2)
        else:
            leach_delta = abs(net_moisture_deficit_mm) * 0.035 * (base_soil_ec / 10.0)
            return round(max(1.5, base_soil_ec - leach_delta), 2)

    @staticmethod
    def calculate_fao_crop_evapotranspiration(crop_name: str, et0_mm_day: float, duration_days: int) -> float:
        """
        FAO-56 Single Crop Coefficient (Kc) adjustment for real-world seasonal water demand.
        ETc = Kc * ET0
        """
        kc_map = {
            "boro": 1.15,
            "rice": 1.10,
            "sunflower": 0.82,
            "mustard": 0.75,
            "mungbean": 0.68,
            "sesame": 0.65,
            "shrimp": 0.50
        }
        matched_kc = 0.85
        lower_name = crop_name.lower()
        for k, v in kc_map.items():
            if k in lower_name:
                matched_kc = v
                break
        total_mm = et0_mm_day * matched_kc * duration_days
        return round(total_mm, 1)

    @staticmethod
    def calculate_effective_root_zone_ec(soil_ec: float, canal_ec: float, is_irrigated: bool) -> float:
        """
        Calculates effective electrical conductivity in the active root zone (ECe in dS/m).
        Important scientific distinction (FAO 29, Ayers & Westcot):
          Crop salt tolerance is defined strictly in saturated paste extract (ECe), NOT irrigation water (ECw).
          Under standard coastal polder leaching fractions (LF ~ 15-20%), irrigation water concentrates:
            ECe_irr = 1.5 * ECw (canal_ec)
          Effective root zone ECe is the convex combination of antecedent soil ECe and irrigation input.
        """
        if not is_irrigated:
            return soil_ec
        # FAO 29 equilibrium root-zone concentration: ECe = 1.5 * ECw
        irrigation_impact = 1.5 * canal_ec
        return max(soil_ec, round(0.60 * soil_ec + 0.40 * irrigation_impact, 2))

    @classmethod
    def evaluate_crop_season(cls, inp: CropEvaluationInput) -> CropEvaluationResult:
        is_irrigated = "Canal" in inp.irrigation_source or "River" in inp.irrigation_source
        eff_ec = cls.calculate_effective_root_zone_ec(inp.soil_ec, inp.canal_ec, is_irrigated)
        loss_pct = cls.calculate_maas_hoffman_yield_loss(eff_ec, inp.threshold_ec, inp.slope_b)
        actual_yield = round(inp.potential_yield_ton * (1.0 - (loss_pct / 100.0)), 2)
        gross_income = round(actual_yield * 1000.0 * inp.market_price_per_kg, 0)
        net_profit = round(gross_income - inp.production_cost_ha, 0)

        # Classification of agronomic feasibility under expected conditions
        if loss_pct >= 65.0 or (inp.canal_ec > 6.0 and inp.water_req_mm > 500.0):
            status = "FAILED"
        elif loss_pct >= 35.0:
            status = "HIGH_RISK"
        elif loss_pct >= 15.0:
            status = "ACCEPTABLE"
        else:
            status = "OPTIMAL"

        # Epistemic Uncertainty & 95% Confidence Interval Assessment
        std = getattr(inp, "soil_ec_std", 0.5)
        q_conf = getattr(inp, "conformal_q", 1.96)
        eff_ec_low = max(0.5, round(eff_ec - q_conf * std, 2))
        eff_ec_high = round(eff_ec + q_conf * std, 2)
        worst_case_loss = cls.calculate_maas_hoffman_yield_loss(eff_ec_high, inp.threshold_ec, inp.slope_b)

        if worst_case_loss >= 65.0 or (inp.canal_ec > 6.0 and inp.water_req_mm > 500.0):
            risk_status = "FAILED"
        elif worst_case_loss >= 35.0:
            risk_status = "HIGH_RISK"
        elif worst_case_loss >= 15.0:
            risk_status = "ACCEPTABLE"
        else:
            risk_status = "OPTIMAL"

        return CropEvaluationResult(
            season_name=inp.season_name,
            crop_name=inp.crop_name,
            variety=inp.variety,
            duration_days=inp.duration_days,
            water_requirement_mm=inp.water_req_mm,
            salt_threshold_ec=inp.threshold_ec,
            salt_slope_b=inp.slope_b,
            expected_yield_loss_pct=loss_pct,
            expected_yield_ton_per_ha=actual_yield,
            gross_income_bdt_per_ha=gross_income,
            production_cost_bdt_per_ha=inp.production_cost_ha,
            net_profit_bdt_per_ha=net_profit,
            feasibility_status=status,
            irrigation_source=inp.irrigation_source,
            agronomic_advisory=inp.advisory,
            worst_case_yield_loss_pct=worst_case_loss,
            risk_adjusted_status=risk_status,
            confidence_interval_ec=(eff_ec_low, eff_ec_high)
        )

    @staticmethod
    def evaluate_hydraulic_sluice_gate(wse_pwd: float, river_ec: float, canal_target_pwd: float = 1.20) -> Dict[str, Any]:
        """
        Evaluates gravity head differential between SWOT river WSE and internal polder retention canals.
        Delta_h = WSE_river - canal_target.
        """
        delta_h = wse_pwd - canal_target_pwd
        can_drain_gravity = wse_pwd < 1.60  # Low tide window
        can_intake_gravity = wse_pwd > 1.40 and river_ec < 3.5

        if river_ec > 6.0:
            intake_status = "STRICT_SHUTOFF"
            advisory = "River salinity hazardous (>6 dS/m). Sluices must remain shut to protect internal freshwater khals."
        elif river_ec < 2.0 and delta_h > 0:
            intake_status = "ACTIVE_INTAKE_PERMITTED"
            advisory = "Freshwater pulse detected. Open intake sluices during high tide to recharge retention reservoirs."
        else:
            intake_status = "MONITORED_CONTROL"
            advisory = "Moderate salinity. Controlled intake only for salt-tolerant crops or bagda nurseries."

        return {
            "wse_pwd": round(wse_pwd, 2),
            "delta_h_m": round(delta_h, 2),
            "can_drain_gravity": can_drain_gravity,
            "can_intake_gravity": can_intake_gravity,
            "intake_status": intake_status,
            "sluice_advisory": advisory
        }

    @staticmethod
    def rank_rotations(
        rotations: List[Dict[str, Any]],
        priority_preference: str = "balanced"
    ) -> Tuple[List[Dict[str, Any]], str]:
        """
        Multi-attribute ranking based on preference:
        - 'profit': Maximize net income
        - 'water_conservation': Minimize freshwater consumption
        - 'risk_aversion': Maximize feasibility score
        - 'balanced': Combined 60% feasibility + 40% normalized profit
        """
        if not rotations:
            return [], ""

        if priority_preference == "profit":
            sorted_rot = sorted(rotations, key=lambda r: r["total_net_profit_bdt"], reverse=True)
        elif priority_preference == "water_conservation":
            sorted_rot = sorted(rotations, key=lambda r: r["total_water_consumption_m3"])
        elif priority_preference == "risk_aversion":
            sorted_rot = sorted(rotations, key=lambda r: r["overall_feasibility_score"], reverse=True)
        else:  # balanced
            max_profit = max(max(r["total_net_profit_bdt"] for r in rotations), 1.0)
            sorted_rot = sorted(
                rotations,
                key=lambda r: (r["overall_feasibility_score"] * 0.6) + ((r["total_net_profit_bdt"] / max_profit) * 40.0),
                reverse=True
            )

        recommended_id = sorted_rot[0]["id"] if sorted_rot else ""
        return sorted_rot, recommended_id
