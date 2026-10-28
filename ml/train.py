"""
Train the Enhanced Fourier PINN for Khulna estuarine salinity.
Supports:
  python ml/train.py --synthetic               (fast smoke test)
  python ml/train.py --csv data/ec_training.csv (real fused dataset)
"""
import argparse
import os
import sys
import numpy as np
import pandas as pd
import torch

# Ensure root in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.models.pinn import FourierPINN

def generate_synthetic_estuary_data(n_days: int = 120, seed: int = 0) -> pd.DataFrame:
    """
    Generates synthetic estuarine salinity data along the Passur-Rupsha corridor
    spanning 0 to 82 km across 120 dry-season days with M2, S2, and spring-neap tidal modulation.
    """
    rng = np.random.default_rng(seed)
    xs = np.array([5.0, 25.0, 45.0, 60.0, 75.0, 82.0])
    t = np.arange(0, n_days, 0.125)
    X, Tt = np.meshgrid(xs, t)
    X, Tt = X.ravel(), Tt.ravel()
    season = 1.0 + 0.6 * Tt / n_days
    tide = 1.0 + 0.25 * np.sin(2 * np.pi * Tt / (12.4206 / 24.0)) * np.exp(-X / 60.0) \
             + 0.15 * np.sin(2 * np.pi * Tt / 14.765)
    ec = np.clip(30.0 * np.exp(-X / (22.0 / season)) * tide + rng.normal(0, 0.3, X.shape), 0.2, 35.0)
    return pd.DataFrame(dict(x_km=X, t_days=Tt, ec_dsm=ec))

def train(
    csv_path: str = None,
    synthetic: bool = False,
    epochs: int = 1000,
    lam_pde: float = 1.0,
    lam_bc: float = 1.0,
    out_path: str = "pinn.pt"
):
    torch.manual_seed(0)
    if synthetic or not csv_path:
        print("Training on synthetic estuarine tidal data...")
        df = generate_synthetic_estuary_data()
    else:
        print(f"Training on real observations from {csv_path}...")
        df = pd.read_csv(csv_path)

    df = df.sort_values("t_days").reset_index(drop=True)
    cut = int(0.8 * len(df))  # Chronological split: past 80% train, future 20% validation
    tr, va = df.iloc[:cut], df.iloc[cut:]

    cond_dim = 1 if ("q_norm" in df and df["q_norm"].notna().any()) else 0
    model = FourierPINN(
        L_km=float(df.x_km.max()),
        T_days=float(df.t_days.max()),
        cond_dim=cond_dim
    )

    to_tensor = lambda s: torch.tensor(s.values, dtype=torch.float32).unsqueeze(1)
    xt, tt, ut = to_tensor(tr.x_km), to_tensor(tr.t_days), to_tensor(tr.ec_dsm) / model.u_max
    ct = to_tensor(tr.q_norm) if cond_dim else None

    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, epochs)
    collocation_size = 4096

    for ep in range(epochs):
        optimizer.zero_grad()
        l_data = ((model(xt, tt, ct) - ut) ** 2).mean()

        # Random collocation points over the entire (x, t) spatial-temporal domain
        xc = torch.rand(collocation_size, 1) * model.L
        tc = torch.rand(collocation_size, 1) * model.T
        cc = ct[torch.randint(0, len(ct), (collocation_size,))] if cond_dim else None
        l_pde = (model.pde_residual(xc, tc, cc) ** 2).mean()

        # Sea-boundary condition: salinity at mouth (x=0) tracks marine baseline
        xb = torch.zeros(512, 1)
        tb = torch.rand(512, 1) * model.T
        cb = ct[torch.randint(0, len(ct), (512,))] if cond_dim else None
        l_bc = ((model(xb, tb, cb) - ut.max()) ** 2).mean()

        # Warm-up schedule: gradually ramp up physics weight over first 30% of epochs
        warm = min(1.0, ep / (0.3 * epochs))
        loss = l_data + warm * lam_pde * l_pde + lam_bc * l_bc

        loss.backward()
        optimizer.step()
        scheduler.step()

        if ep % 200 == 0 or ep == epochs - 1:
            print(f"Epoch {ep:5d} | Loss: {loss.item():.5f} | Data MSE: {l_data.item():.5f} | PDE Res: {l_pde.item():.6f} | v: {model.v0.item():.3f} km/d | D: {model.D.item():.2f} km2/d")

    model.eval()
    with torch.no_grad():
        cv = to_tensor(va.q_norm) if cond_dim else None
        pred = model.predict_ec(to_tensor(va.x_km), to_tensor(va.t_days), cv).squeeze().numpy()

    err = pred - va.ec_dsm.values
    rmse = np.sqrt((err ** 2).mean())
    mae = np.abs(err).mean()
    print(f"\nVALIDATION METRICS (Future 20% Unseen Time Horizon):")
    print(f"  -> RMSE: {rmse:.3f} dS/m")
    print(f"  -> MAE : {mae:.3f} dS/m")

    torch.save(dict(state=model.state_dict(), L=model.L, T=model.T, cond_dim=cond_dim), out_path)
    print(f"Model checkpoint saved successfully to {out_path}!")
    return rmse, mae

def main():
    parser = argparse.ArgumentParser(description="Train Fourier PINN for Khulna Salinity")
    parser.add_argument("--csv", help="Path to training CSV (x_km, t_days, ec_dsm, [q_norm])")
    parser.add_argument("--synthetic", action="store_true", help="Use synthetic dataset for smoke test")
    parser.add_argument("--epochs", type=int, default=1000, help="Number of training epochs")
    parser.add_argument("--lam_pde", type=float, default=1.0, help="Weight of PDE loss")
    parser.add_argument("--lam_bc", type=float, default=1.0, help="Weight of boundary condition loss")
    parser.add_argument("--out", default="pinn.pt", help="Path to save trained weights")
    args = parser.parse_args()

    train(
        csv_path=args.csv,
        synthetic=args.synthetic,
        epochs=args.epochs,
        lam_pde=args.lam_pde,
        lam_bc=args.lam_bc,
        out_path=args.out
    )

if __name__ == "__main__":
    main()
