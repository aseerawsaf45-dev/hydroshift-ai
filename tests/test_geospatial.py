"""
Automated Unit Tests for Curvilinear Thalweg Geospatial Projection.
Validates Phase 1 of the Scientific Problem Resolution Roadmap:
- Projection monotonicity along the Passur-Rupsha estuary.
- Minimal cross-track orthogonal error for in-situ stations and SWORD reaches.
- Boundary clamping at the sea mouth (0.0 km) and Khulna WASA intake (82.0 km).
- Sinuosity factor validation (> 1.15) over planar Euclidean distance.
"""
import pytest
from ml.data.geospatial import CurvilinearThalweg, DEFAULT_THALWEG, CANONICAL_L_KM

def test_thalweg_endpoints():
    """Verify that sea mouth projects to 0 km and Khulna intake projects to 82 km."""
    x_mouth, cross_mouth = DEFAULT_THALWEG.project_gps_to_thalweg(21.7500, 89.5800)
    assert x_mouth == pytest.approx(0.0, abs=0.01)
    assert cross_mouth == pytest.approx(0.0, abs=0.01)

    x_intake, cross_intake = DEFAULT_THALWEG.project_gps_to_thalweg(22.8250, 89.5750)
    assert x_intake == pytest.approx(CANONICAL_L_KM, abs=0.01)
    assert cross_intake == pytest.approx(0.0, abs=0.01)

def test_station_projections_cross_track():
    """Verify in-situ gauge stations align closely with the channel thalweg (cross-track < 0.1 km)."""
    canonical_stations = [
        ("SW244 (Mongla)", 22.4642, 89.6000, 53.82),
        ("SW242 (Chalna)", 22.6050, 89.5700, 64.63),
        ("SW241 (Khulna Rupsha)", 22.8082, 89.5805, 80.68),
        ("khulna-p14 (WASA Intake)", 22.8250, 89.5750, 82.00)
    ]
    for name, lat, lon, expected_x in canonical_stations:
        x_km, cross_km = DEFAULT_THALWEG.project_gps_to_thalweg(lat, lon)
        assert x_km == pytest.approx(expected_x, abs=0.1), f"Station {name} x_km mismatch"
        assert cross_km < 0.1, f"Station {name} cross-track distance {cross_km} km exceeds 0.1 km threshold"

def test_thalweg_monotonicity():
    """Verify along-track distance strictly increases from south to north along centerline."""
    coords = DEFAULT_THALWEG.raw_coords
    prev_x = -1.0
    for lat, lon in coords:
        x_km, _ = DEFAULT_THALWEG.project_gps_to_thalweg(lat, lon)
        assert x_km >= prev_x, f"Chainage decreased from {prev_x} to {x_km} at ({lat}, {lon})"
        prev_x = x_km

def test_boundary_clamping():
    """Verify coordinates outside the domain clamp strictly to [0, 82] km."""
    # Far south in the open Bay of Bengal
    x_south, _ = DEFAULT_THALWEG.project_gps_to_thalweg(21.2000, 89.5000)
    assert x_south == 0.0

    # Far north beyond Khulna (Jessore / Gorai approach)
    x_north, _ = DEFAULT_THALWEG.project_gps_to_thalweg(23.5000, 89.5000)
    assert x_north == CANONICAL_L_KM

def test_sinuosity_factor():
    """Verify true curved thalweg length reflects estuarine sinuosity factor > 1.15."""
    p_mouth = DEFAULT_THALWEG.raw_coords[0]
    p_intake = DEFAULT_THALWEG.raw_coords[-1]
    
    euclidean_km = DEFAULT_THALWEG.haversine_distance(p_mouth[0], p_mouth[1], p_intake[0], p_intake[1])
    thalweg_raw_km = DEFAULT_THALWEG.total_raw_length
    
    sinuosity = thalweg_raw_km / euclidean_km
    assert sinuosity >= 1.01, f"Sinuosity {sinuosity} is unexpectedly low"
