"""
Unit test suite for Polder Hydraulics & Flap-Gate Drainage Service.
Verifies Phase 4 SWOT Reach Decoupling:
1. Gravity drainage head evaluation: Delta h = river_wse - canal_stage.
2. Operational regimes: Active Drainage, Marginal, and Locked Shut (Backflow Prevention).
3. SWORD reach geometric continuity and advective velocity constraint: v(x) = Q / A(x).
"""

import pytest
import math
from services.api.app.services.polder_hydraulics import (
    PolderHydraulicsEngine,
    FlapGateStatus,
    ReachHydraulicProfile,
    PASSUR_RUPSHA_REACH_GEOMETRY
)


def test_active_gravity_drainage():
    """When river low tide is below interior canal stage by > 0.3m, gate drains freely."""
    # River WSE = 0.80m, Canal Stage = 1.30m -> Delta h = -0.50m
    status = PolderHydraulicsEngine.evaluate_flap_gate(
        reach_id="SW244",
        river_wse=0.80,
        canal_stage=1.30,
        num_vents=2
    )

    assert status.gate_state == "ACTIVE_GRAVITY_DRAINAGE"
    assert status.is_draining is True
    assert status.backflow_prevented is False
    assert status.head_difference_m == -0.50
    assert status.discharge_capacity_m3s > 5.0
    assert "Sluice gates operating normally" in status.recommended_action


def test_marginal_drainage():
    """When delta_h is between -0.30m and 0.0m, gate is in marginal drainage."""
    # River WSE = 1.20m, Canal Stage = 1.30m -> Delta h = -0.10m
    status = PolderHydraulicsEngine.evaluate_flap_gate(
        reach_id="SW242",
        river_wse=1.20,
        canal_stage=1.30,
        num_vents=2
    )

    assert status.gate_state == "MARGINAL_DRAINAGE"
    assert status.is_draining is True
    assert status.backflow_prevented is False
    assert status.head_difference_m == -0.10
    assert status.discharge_capacity_m3s > 0.0
    assert "Marginal gravity drainage head" in status.recommended_action


def test_flap_gate_locked_shut():
    """When high tide raises river above canal stage, flap gate automatically locks shut."""
    # River WSE = 2.40m, Canal Stage = 1.30m -> Delta h = +1.10m
    status = PolderHydraulicsEngine.evaluate_flap_gate(
        reach_id="SW241",
        river_wse=2.40,
        canal_stage=1.30,
        num_vents=2
    )

    assert status.gate_state == "LOCKED_SHUT_PREVENTING_BACKFLOW"
    assert status.is_draining is False
    assert status.backflow_prevented is True
    assert status.head_difference_m == 1.10
    assert status.discharge_capacity_m3s == 0.0
    assert "Flap gates seated shut" in status.recommended_action


def test_vent_scaling():
    """Discharge capacity scales linearly with vent count."""
    status_2vents = PolderHydraulicsEngine.evaluate_flap_gate(
        reach_id="SW244", river_wse=0.50, canal_stage=1.50, num_vents=2
    )
    status_4vents = PolderHydraulicsEngine.evaluate_flap_gate(
        reach_id="SW244", river_wse=0.50, canal_stage=1.50, num_vents=4
    )

    # 4 vents should deliver double the discharge capacity of 2 vents
    ratio = status_4vents.discharge_capacity_m3s / status_2vents.discharge_capacity_m3s
    assert pytest.approx(ratio, rel=1e-2) == 2.0


def test_sword_reach_geometric_continuity():
    """Estuarine channel width expands seaward from Khulna (480m) to Mongla (1,280m)."""
    khulna = PolderHydraulicsEngine.get_reach_hydraulic_profile("SW241", upstream_q_m3s=300.0)
    mongla = PolderHydraulicsEngine.get_reach_hydraulic_profile("SW244", upstream_q_m3s=300.0)

    assert khulna.sword_width_m < mongla.sword_width_m
    assert khulna.cross_sectional_area_m2 < mongla.cross_sectional_area_m2
    # By mass continuity v = Q / A, net advection velocity must be higher in narrower upstream channel
    assert khulna.nominal_velocity_ms > mongla.nominal_velocity_ms
    assert khulna.distance_from_mouth_km > mongla.distance_from_mouth_km


def test_all_registered_reaches():
    """Ensure all SWORD reaches have valid physical parameters."""
    geometries = PolderHydraulicsEngine.list_all_reach_geometries()
    assert len(geometries) >= 7

    for g in geometries:
        assert g["sword_width_m"] > 100.0
        assert g["depth_m"] > 3.0
        assert g["slope"] > 0.0
        assert g["default_canal_stage"] > 0.5
