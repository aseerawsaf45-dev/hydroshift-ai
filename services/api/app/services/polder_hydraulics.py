"""
Polder Hydraulics & Flap-Gate Gravity Drainage Service.
Phase 4 Implementation: SWOT Reach Decoupling.

NASA SWOT satellite telemetry (KaRIn radar) measures Reach Water Surface Elevation (WSE),
surface water slope (S_0), and channel width (W) at 10-21 day revisit intervals.
Instead of misapplying satellite radar snapshots directly to 12.42-hour semi-diurnal point salinity,
SWOT data is decoupled into its true physical hydrodynamic roles:
1. Boundary gravity drainage head: Delta_h = WSE_river - H_canal
2. Flap gate operational status:
   - Delta_h < -0.3m: Active seaward gravity flushing (low-tide drainage window).
   - -0.3m <= Delta_h <= 0.0m: Marginal drainage window.
   - Delta_h > 0.0m: Flap gate locked shut to prevent tidal saline intrusion.
3. Cross-sectional advective continuity: A(x) = W(x) * d_mean(x), v(x) = Q / A(x).
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import math


class FlapGateStatus(BaseModel):
    reach_id: str
    reach_name: str
    river_wse_m_pwd: float = Field(..., description="River Water Surface Elevation from SWOT/BWDB (m PWD)")
    polder_canal_stage_m_pwd: float = Field(..., description="Interior polder drainage canal stage (m PWD)")
    head_difference_m: float = Field(..., description="Delta h = River WSE - Canal Stage (m)")
    gate_state: str = Field(..., description="ACTIVE_GRAVITY_DRAINAGE | MARGINAL_DRAINAGE | LOCKED_SHUT_PREVENTING_BACKFLOW")
    is_draining: bool = Field(..., description="True if freshwater drains outward to river")
    backflow_prevented: bool = Field(..., description="True if gate is shut against saline river water")
    discharge_capacity_m3s: float = Field(..., description="Estimated gravity drainage rate through sluice vent (m3/s)")
    recommended_action: str = Field(..., description="Actionable guideline for BWDB polder gate operators")


class ReachHydraulicProfile(BaseModel):
    reach_id: str
    reach_name: str
    distance_from_mouth_km: float
    sword_width_m: float
    estimated_depth_m: float
    cross_sectional_area_m2: float
    slope_m_per_km: float
    nominal_velocity_ms: float
    flushing_time_days: float


# Reach database along Passur-Rupsha with SWORD hydraulic geometry
PASSUR_RUPSHA_REACH_GEOMETRY = {
    "SW244": {
        "name": "Mongla (Passur River)",
        "dist_km": 53.82,
        "sword_width_m": 1280.0,
        "depth_m": 11.5,
        "slope": 0.025,
        "polder_ref": "Polder 33 (Mongla Upazila)",
        "default_canal_stage": 1.20
    },
    "31241400601": {
        "name": "Passur River Reach (Mongla)",
        "dist_km": 54.20,
        "sword_width_m": 1250.0,
        "depth_m": 11.2,
        "slope": 0.026,
        "polder_ref": "Polder 33",
        "default_canal_stage": 1.20
    },
    "SW242": {
        "name": "Chalna (Passur River)",
        "dist_km": 64.63,
        "sword_width_m": 820.0,
        "depth_m": 9.8,
        "slope": 0.030,
        "polder_ref": "Polder 31 (Dacope)",
        "default_canal_stage": 1.35
    },
    "31241400561": {
        "name": "Shibsa River Main Reach",
        "dist_km": 60.00,
        "sword_width_m": 950.0,
        "depth_m": 10.1,
        "slope": 0.028,
        "polder_ref": "Polder 32 (Dacope)",
        "default_canal_stage": 1.30
    },
    "SW241": {
        "name": "Khulna (Rupsha River)",
        "dist_km": 80.68,
        "sword_width_m": 480.0,
        "depth_m": 8.2,
        "slope": 0.035,
        "polder_ref": "Polder 28/1 (Batiaghata)",
        "default_canal_stage": 1.50
    },
    "khulna-p14": {
        "name": "Khulna WASA P-14 Intake",
        "dist_km": 82.00,
        "sword_width_m": 420.0,
        "depth_m": 7.8,
        "slope": 0.038,
        "polder_ref": "Khulna City Polder",
        "default_canal_stage": 1.50
    },
    "31241400581": {
        "name": "Rupsha River Reach (Khulna Core)",
        "dist_km": 82.50,
        "sword_width_m": 410.0,
        "depth_m": 7.5,
        "slope": 0.040,
        "polder_ref": "Khulna City Polder",
        "default_canal_stage": 1.50
    }
}


class PolderHydraulicsEngine:
    """
    Evaluates tidal polder flap-gate hydraulics and reach geometry constraints
    using satellite SWOT telemetry and BWDB canal stages.
    """

    DEFAULT_DISCHARGE_COEFF = 0.62  # Standard sharp-crested/sluice discharge coefficient C_d
    DEFAULT_VENT_WIDTH_M = 1.50     # Standard BWDB flap gate barrel width (m)
    DEFAULT_VENT_HEIGHT_M = 1.80    # Standard BWDB flap gate barrel height (m)
    GRAVITY_ACCEL = 9.80665

    @classmethod
    def evaluate_flap_gate(
        cls,
        reach_id: str,
        river_wse: float,
        canal_stage: Optional[float] = None,
        num_vents: int = 2
    ) -> FlapGateStatus:
        """
        Calculates hydraulic head difference and determines flap gate operational status.
        Delta h = river_wse - canal_stage
        """
        geom = PASSUR_RUPSHA_REACH_GEOMETRY.get(
            reach_id,
            {
                "name": f"Estuarine Reach {reach_id}",
                "dist_km": 60.0,
                "sword_width_m": 600.0,
                "depth_m": 9.0,
                "slope": 0.03,
                "polder_ref": "Coastal Polder",
                "default_canal_stage": 1.30
            }
        )

        if canal_stage is None:
            canal_stage = geom.get("default_canal_stage", 1.30)

        # Hydraulic head difference
        # Positive: River is higher than canal (reverse head)
        # Negative: Canal is higher than river (positive gravity drainage head)
        delta_h = river_wse - canal_stage

        vent_area = cls.DEFAULT_VENT_WIDTH_M * cls.DEFAULT_VENT_HEIGHT_M * num_vents

        if delta_h < -0.30:
            # Active outward gravity discharge
            state = "ACTIVE_GRAVITY_DRAINAGE"
            is_draining = True
            backflow_prevented = False
            effective_head = abs(delta_h)
            q_drain = cls.DEFAULT_DISCHARGE_COEFF * vent_area * math.sqrt(2 * cls.GRAVITY_ACCEL * effective_head)
            action = (
                f"Sluice gates operating normally. Outward drainage active at {q_drain:.1f} m³/s. "
                "Low-tide gravity flushing removes excess interior agricultural water without pumping."
            )
        elif delta_h <= 0.0:
            # Marginal drainage head
            state = "MARGINAL_DRAINAGE"
            is_draining = True
            backflow_prevented = False
            effective_head = max(0.02, abs(delta_h))
            q_drain = cls.DEFAULT_DISCHARGE_COEFF * vent_area * math.sqrt(2 * cls.GRAVITY_ACCEL * effective_head)
            action = (
                f"Marginal gravity drainage head ({delta_h:+.2f} m). Flushing velocity low ({q_drain:.1f} m³/s). "
                "Monitor tidal progression; prepare to secure flap-gates before flood tide reverse head."
            )
        else:
            # River higher than polder canal - flap gate locks shut automatically
            state = "LOCKED_SHUT_PREVENTING_BACKFLOW"
            is_draining = False
            backflow_prevented = True
            q_drain = 0.0
            action = (
                f"High-tide reverse hydraulic head ({delta_h:+.2f} m). Flap gates seated shut to block saline estuarine backflow. "
                "Polder drainage suspended until river water level falls below interior canal stage."
            )

        return FlapGateStatus(
            reach_id=reach_id,
            reach_name=geom["name"],
            river_wse_m_pwd=round(river_wse, 3),
            polder_canal_stage_m_pwd=round(canal_stage, 3),
            head_difference_m=round(delta_h, 3),
            gate_state=state,
            is_draining=is_draining,
            backflow_prevented=backflow_prevented,
            discharge_capacity_m3s=round(q_drain, 2),
            recommended_action=action
        )

    @classmethod
    def get_reach_hydraulic_profile(
        cls,
        reach_id: str,
        upstream_q_m3s: float = 250.0
    ) -> ReachHydraulicProfile:
        """
        Computes SWORD-derived reach geometric properties and 1D cross-sectional advective velocity.
        v(x) = Q / A(x), where A(x) = W_sword(x) * depth(x).
        """
        geom = PASSUR_RUPSHA_REACH_GEOMETRY.get(
            reach_id,
            {
                "name": f"Reach {reach_id}",
                "dist_km": 60.0,
                "sword_width_m": 600.0,
                "depth_m": 9.0,
                "slope": 0.03,
                "polder_ref": "Coastal Polder",
                "default_canal_stage": 1.30
            }
        )

        width = geom["sword_width_m"]
        depth = geom["depth_m"]
        area = width * depth
        velocity = upstream_q_m3s / max(100.0, area)
        
        # Approximate reach segment length as 10 km for flushing time calculation
        reach_length_m = 10000.0
        flushing_time_days = (reach_length_m / max(0.01, velocity)) / 86400.0

        return ReachHydraulicProfile(
            reach_id=reach_id,
            reach_name=geom["name"],
            distance_from_mouth_km=geom["dist_km"],
            sword_width_m=width,
            estimated_depth_m=depth,
            cross_sectional_area_m2=area,
            slope_m_per_km=geom["slope"],
            nominal_velocity_ms=round(velocity, 4),
            flushing_time_days=round(flushing_time_days, 2)
        )

    @classmethod
    def list_all_reach_geometries(cls) -> List[Dict[str, Any]]:
        """Returns all registered SWORD reach geometries with polder references."""
        out = []
        for rid, g in PASSUR_RUPSHA_REACH_GEOMETRY.items():
            entry = dict(g)
            entry["reach_id"] = rid
            out.append(entry)
        return out
