# How to build the HydroShift AI salinity PINN

Based on PROJECT_DOCUMENTATION.md. This build guide outlines the complete mathematical formulation, data engineering, model design, evaluation, and operational serving for the Physics-Informed Neural Network (PINN).

## 0. What you are building
A model u(x, t) = salinity (EC, dS/m) at distance x km from the sea at time t, trained on sparse
EC observations while being penalised for violating the 1D advection-dispersion equation (ADE):
    u_t + v u_x - D u_xx = 0
Satellite (SWOT) and gauge data supply forcing, validation and context; EC is the target.

## 1. Environment
    python -m venv .venv && source .venv/bin/activate
    pip install torch numpy pandas requests scikit-learn fastapi uvicorn
GPU is not required: the network is small (about 100k parameters) and trains in minutes on a CPU.

## 2. Smoke test (do this first)
    python ml/train.py --synthetic
This uses toy data. It only proves the code runs. Expect the data loss to fall and v, D to move.

## 3. Collect real data
| Need | Source | Notes |
|---|---|---|
| SWOT wse, width, slope2 | `scripts/fetch_hydrocron_sword.py` (PO.DAAC Hydrocron) | Verify reach IDs in the SWORD database and parameter names in the Hydrocron docs. Drop fill values and low-quality flags. |
| River stage | BWDB / FFWC | Public Works Datum (PWD). |
| Field EC (the target) | BWDB, IWM, SRDI, published studies, or your own sensors | **Hardest part.** No public real-time API exists. |
| Upstream flow proxy | Gorai / Ganges discharge or stage | Used as conditioning input `q_norm`. |

You need at least several stations spread along one river, covering a full dry season.
Fewer than ~5 stations or less than ~1 season will not give a trustworthy model.

## 4. Prepare the training table (`ml/data/prepare_training_data.py`)
1. Measure each station's distance from the river mouth along the centreline (QGIS or PostGIS) -> `x_km`.
2. Convert timestamps to UTC, then to `t_days` from a start date.
3. Convert EC units to dS/m; remove impossible values.
4. Convert stage from PWD to a common datum (doc: 0 m PWD ~ -0.46 m MSL). The MSL -> EGM2008 offset
   is local; estimate it by comparing gauge stage with SWOT wse on the same day.
5. Join SWOT passes to gauge records with an as-of join (12 h window, never future data).
6. Output `data/ec_training.csv` with columns `x_km, t_days, ec_dsm[, q_norm]`.

## 5. Model design (`ml/models/pinn.py` - FourierPINN)
- **Inputs:** x, t (and optional q_norm). **Output:** sigmoid-bounded salinity.
- **Random Fourier features** on (x, t) fight spectral bias. Important: the scale must match the physics.
  Tides are ~1.93 cycles/day, so t is kept in days and sigma_t ~ 2. A single sigma = 10 on a
  [0, 1]-normalised time axis would span only ~10 cycles over the whole season and could not see a
  12.4 h tide. Fixed M2, S2 and spring-neap sinusoids are added as extra inputs for the same reason.
- **tanh activations**, because the PDE needs smooth second derivatives (ReLU gives zero).
- **Learnable v and D** (D kept positive through exp). v < 0 means net seaward transport.

## 6. Loss and training (`ml/train.py`)
    L = L_data + warm * lambda_pde * L_pde + lambda_bc * L_bc
- `L_data`: MSE on observed EC.
- `L_pde`: squared ADE residual at random collocation points over the whole (x, t) domain, via `torch.autograd.grad`.
- `L_bc`: the sea boundary at x = 0. The documentation's loss has no boundary or initial-condition
  term, and without one the PDE alone admits trivial solutions (such as constant u).
- The physics weight is ramped in over the first 30% of epochs so the net first learns the data.
- Chronological 80/20 split. Never shuffle time series randomly.

## 7. Evaluate honestly
1. Forecast test: train on early dates, test on later ones (RMSE and MAE in dS/m).
2. Station hold-out: leave one station out entirely and predict it. This is the real test of the
   "works where there is no gauge" claim.
3. Baselines: compare with a plain MLP (no physics), an LSTM, and a seasonal-climatology predictor.
   If the PINN does not beat them, the physics term is not helping yet.
4. Event check: peak salinity error matters more than average error for WASA/Boro alerts.
5. Report prediction intervals (an ensemble of 5 seeds is the simplest option).

## 8. Serve it
Wrap `predict_ec` in a FastAPI endpoint taking (x_km, t_days, q_norm). Map EC to advice:
Boro rice risk above 2 dS/m (severe above 4), WASA intake limit about 1 to 1.5 dS/m.
Cache the model in memory and run inference under `torch.no_grad()`.
The dashboard (Next.js), PostGIS and Celery provide interactive Crop Rotation DSS and scenario simulations.

## 9. Scenario studio caveat
"Gorai flow -80%" or "+2 m surge" scenarios are only meaningful if the model was trained with flow
(`q_norm`) and surge-related inputs that varied in the training data. Otherwise the sliders extrapolate
and the outputs are not reliable.

## 10. Known weaknesses to fix next
- Constant v and D: make them functions of tidal velocity (from stage slope) and channel width.
- 1D depth-averaged: no salt wedge.
- Make sure the claims about guaranteed physical validity and <50 ms latency are measured, not assumed.
  A soft PDE penalty reduces violations but does not guarantee anything.
