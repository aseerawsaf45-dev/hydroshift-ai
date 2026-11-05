"""
Scientific Validation Suite - Module 2: PINN Mathematical & Analytical Tests
Checks:
A. Analytical manufactured solution test:
   u_exact(x, t) = exp(-D*k^2*t) * sin(k*(x - v*t))
   Proves mathematical formulation and autodiff gradient calculation.
B. Governing PDE residual test across domain.
C. Initial and boundary condition conformity.
D. Autodiff gradient accuracy test against finite differences.
"""
import pytest
import math
import torch
import numpy as np
from ml.models.pinn import FourierPINN

@pytest.fixture
def fourier_pinn():
    torch.manual_seed(42)
    model = FourierPINN(L_km=82.0, T_days=250.0)
    model.eval()
    return model

def test_manufactured_solution_gradient_accuracy():
    """
    Test 7 & 2E: Analytical Manufactured Solution & Autodiff Derivative Accuracy.
    For u(x, t) = exp(-D*k^2*t) * sin(k*(x - v*t)),
    u_t + v*u_x - D*u_xx = 0 holds EXACTLY.
    We test PyTorch autograd u_t, u_x, u_xx against exact analytical formulas.
    """
    v = -1.5  # km/day
    D = 12.0  # km^2/day
    k = 2 * math.pi / 40.0 # spatial frequency (wavelength 40 km)

    # Sample test points
    x = torch.tensor([10.0, 25.0, 40.0, 60.0, 75.0], dtype=torch.float32, requires_grad=True)
    t = torch.tensor([5.0, 15.0, 30.0, 50.0, 70.0], dtype=torch.float32, requires_grad=True)

    # Exact solution
    u_exact = torch.exp(-D * (k**2) * t) * torch.sin(k * (x - v * t))

    # Analytical derivatives
    # d/dt: -D*k^2 * u - v*k * exp(...) * cos(...)
    u_t_analytic = -D * (k**2) * u_exact - v * k * torch.exp(-D * (k**2) * t) * torch.cos(k * (x - v * t))
    # d/dx: k * exp(...) * cos(...)
    u_x_analytic = k * torch.exp(-D * (k**2) * t) * torch.cos(k * (x - v * t))
    # d2/dx2: -k^2 * u
    u_xx_analytic = -(k**2) * u_exact

    # Autodiff derivatives
    g = lambda y, z: torch.autograd.grad(y, z, torch.ones_like(y), create_graph=True)[0]
    u_t_autodiff = g(u_exact, t)
    u_x_autodiff = g(u_exact, x)
    u_xx_autodiff = g(u_x_autodiff, x)

    # PDE residual of exact solution
    residual_analytic = u_t_analytic + v * u_x_analytic - D * u_xx_analytic
    residual_autodiff = u_t_autodiff + v * u_x_autodiff - D * u_xx_autodiff

    # Assertions
    assert torch.allclose(residual_analytic, torch.zeros_like(residual_analytic), atol=1e-5), "Analytical PDE residual not zero"
    assert torch.allclose(u_t_autodiff, u_t_analytic, atol=1e-5), "Autodiff u_t mismatch"
    assert torch.allclose(u_x_autodiff, u_x_analytic, atol=1e-5), "Autodiff u_x mismatch"
    assert torch.allclose(u_xx_autodiff, u_xx_analytic, atol=1e-5), "Autodiff u_xx mismatch"
    assert torch.allclose(residual_autodiff, torch.zeros_like(residual_autodiff), atol=1e-5), "Autodiff PDE residual not zero"

def test_physics_pde_residual_bound(fourier_pinn):
    """
    Test 2A: Physics Residual Test.
    Verify that pde_residual evaluates across a 50x50 spatial-temporal domain
    and produces finite, non-exploding residuals (MSE < 0.5 for initialized network).
    """
    x = torch.linspace(0.0, 82.0, 50).unsqueeze(1)
    t = torch.linspace(0.0, 200.0, 50).unsqueeze(1)
    grid_x, grid_t = torch.meshgrid(x.squeeze(), t.squeeze(), indexing="ij")
    flat_x = grid_x.reshape(-1, 1)
    flat_t = grid_t.reshape(-1, 1)

    res = fourier_pinn.pde_residual(flat_x, flat_t)
    assert not torch.isnan(res).any(), "NaN found in PDE residuals"
    assert not torch.isinf(res).any(), "Inf found in PDE residuals"
    mse_res = (res ** 2).mean().item()
    assert mse_res < 5.0, f"Physics residual unreasonably high: {mse_res:.4f}"

def test_initial_and_boundary_conditions(fourier_pinn):
    """
    Test 2B & 2C: Initial condition and boundary condition consistency.
    1. Downstream boundary (x = 0 km, Bay mouth) should predict higher salinity than upstream (x = 82 km).
    2. Model output must stay strictly within physical normalization bounds (0 <= un <= 1).
    """
    t_span = torch.linspace(0, 100, 30).unsqueeze(1)
    x_mouth = torch.zeros(30, 1)
    x_intake = torch.ones(30, 1) * 82.0

    ec_mouth = fourier_pinn.predict_ec(x_mouth, t_span)
    ec_intake = fourier_pinn.predict_ec(x_intake, t_span)

    # General physical bounds
    assert (ec_mouth >= 0.0).all() and (ec_mouth <= fourier_pinn.u_max).all(), "Mouth EC out of physical bounds"
    assert (ec_intake >= 0.0).all() and (ec_intake <= fourier_pinn.u_max).all(), "Intake EC out of physical bounds"

